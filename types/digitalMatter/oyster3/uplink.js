function MakeBitParser(bytes, offset, length) {
  return {
    bits: bytes.slice(offset, offset + length),
    offset: 0,
    bitLength: length * 8,
    U32LE: function U32LE(bits) {
      let out = 0;
      let total = 0;
      while (bits > 0) {
        const byteNum = Math.floor(this.offset / 8);
        const discardLSbs = this.offset & 7;
        const avail = Math.min(8 - discardLSbs, bits);
        const extracted = this.bits[byteNum] >>> discardLSbs;
        const masked = (extracted << (32 - avail)) >>> (32 - avail);
        out |= (masked << total) >>> 0;
        total += avail;
        bits -= avail;
        this.offset += avail;
      }
      return out;
    },
    S32LE: function S32LE(bits) {
      return (this.U32LE(bits) << (32 - bits)) >> (32 - bits);
    },
  };
}

function decoder(bytes, port) {
  const p = port;
  const b = MakeBitParser(bytes, 0, bytes.length);
  let d = {};
  const w = [];
  if (p === 1) {
    d.type = "position";
    const l = {};
    l.latitude = Number((b.S32LE(32) / 1e7).toFixed(7)); // decimal scaling
    l.longitude = Number((b.S32LE(32) / 1e7).toFixed(7));
    d.inTrip = b.U32LE(1) !== 0;
    d.fixFailed = b.U32LE(1) !== 0;
    l.headingDeg = Number((b.U32LE(6) * 5.625).toFixed(2));
    l.speedKmph = b.U32LE(8);
    d.voltage = Number((b.U32LE(8) * 0.025).toFixed(3));
    d = Object.assign(d, l);
  } else if (p === 2) {
    d.type = "downlink_ack";
    d.sequence = b.U32LE(7);
    d.accepted = b.U32LE(1) !== 0;
    d.firmware = `${b.U32LE(8)}.${b.U32LE(8)}`;
    if (bytes.length < 6) {
      d.prodId = null;
      d.hwRev = null;
      d.port = null;
    } else {
      d.prodId = b.U32LE(8);
      d.hwRev = b.U32LE(8);
      d.port = b.U32LE(8);
    }
  } else if (p === 3) {
    d.type = "stats";
    d.initialvoltage = Number((4.0 + 0.1 * b.U32LE(4)).toFixed(2));
    d.txCount = 32 * b.U32LE(11);
    d.tripCount = 32 * b.U32LE(13);
    d.gnssSuccesses = 32 * b.U32LE(10);
    d.gnssFails = 32 * b.U32LE(8);
    d.aveGnssFixS = b.U32LE(9);
    d.aveGnssFailS = b.U32LE(9);
    d.aveGnssFreshenS = b.U32LE(8);
    d.wakeupsPerTrip = b.U32LE(7);
    d.uptimeWeeks = b.U32LE(9);
  } else if (p === 4) {
    d.type = "position";
    const l = {};
    // decimal scaling, truncated integer
    l.latitude = Number(((256 * b.S32LE(24)) / 1e7).toFixed(7));
    l.longitude = Number(((256 * b.S32LE(24)) / 1e7).toFixed(7));
    l.headingDeg = 45 * b.U32LE(3);
    l.speedKmph = 5 * b.U32LE(5);
    d.voltage = b.U32LE(8);
    d.inTrip = b.U32LE(1) !== 0;
    d.fixFailed = b.U32LE(1) !== 0;
    d.inactivityAlarm = b.U32LE(1) !== 0;
    if (b.U32LE(1) === 0) {
      d.voltage = Number((0.025 * d.voltage).toFixed(3));
    } else {
      d.voltage = Number((3.5 + 0.032 * d.voltage).toFixed(3));
    }
    const crit = b.U32LE(2);
    if (crit === 1) {
      d.batCritical = false;
    } else {
      d.batCritical = true;
    }
    d = Object.assign(d, l);
  } else if (p === 30) {
    d.type = "watchdog";
    const reserved = b.U32LE(32);
    /*
    d.firmware = `${b.U32LE(8)}.${b.U32LE(8)}`;
    d.prodId = b.U32LE(8);
    d.hwRev = b.U32LE(8);
    */
    d.resetPowerOn = b.U32LE(1) !== 0;
    d.resetWatchdog = b.U32LE(1) !== 0;
    d.resetExternal = b.U32LE(1) !== 0;
    d.resetSoftware = b.U32LE(1) !== 0;
    b.U32LE(4);
    d.watchdogReason = b.U32LE(16);
  } else if (p === 31) {
    d.type = "stats_v3";
    d.ttff = b.U32LE(8);
    d.wakeupsPerTrip = b.U32LE(8);
    d.initialvoltage = Number((3.5 + 0.032 * b.U32LE(8)).toFixed(3));
    d.currentvoltage = Number((3.5 + 0.032 * b.U32LE(8)).toFixed(3));
    d.batCritical = b.U32LE(1) !== 0;
    d.batLow = b.U32LE(1) !== 0;
    d.tripCount = 32 * b.U32LE(14);
    d.uptimeWeeks = b.U32LE(10);
    d.mWhUsed = 10 * b.U32LE(10);
    d.percentLora = (100 / 32) * b.U32LE(5);
    d.percentGnssSucc = (100 / 32) * b.U32LE(5);
    d.percentGnssFail = (100 / 32) * b.U32LE(5);
    d.percentSleepDis = (100 / 32) * b.U32LE(5);
    d.percentOther =
      100 -
      d.percentLora -
      d.percentGnssSucc -
      d.percentGnssFail -
      d.percentSleepDis;
  } else if (p === 33) {
    d.type = "position";
    const l = {};
    d.fixFailed = b.U32LE(1) !== 0;
    l.latitude = Number(((180 * b.S32LE(23)) / (1 << 23)).toFixed(7)); // binary scaling
    l.longitude = Number(((360 * b.S32LE(24)) / (1 << 24)).toFixed(7));
    d.inTrip = b.U32LE(1) !== 0;
    const batCritical = b.U32LE(1) !== 0;
    d.inactivityAlarm = b.U32LE(1) !== 0;
    const mins = 2 * b.U32LE(14); // lower bound
    d.inactiveDuration = `${Math.floor(mins / 1440)}d${Math.floor(
      (mins % 1440) / 60,
    )}h${mins % 60}m`;
    d.voltage = Number((3.5 + 0.032 * b.U32LE(8)).toFixed(3));
    l.headingDeg = 45 * b.U32LE(3);
    l.speedKmph = 5 * b.U32LE(5);
    d = Object.assign(d, l);
  } else {
    return {
      warnings: ["unknown FPort"],
    };
  }
  return {
    data: d,
    warnings: w,
  };
}

function consume(event) {
  const payload = event.data.payloadHex;
  const { port } = event.data;
  const { data } = decoder(Hex.hexToBytes(payload), port);
  const topic = data.type;
  delete data.type;

  emit("sample", { data, topic });
}
