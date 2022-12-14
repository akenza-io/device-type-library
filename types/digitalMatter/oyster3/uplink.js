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

function consume(event) {
  const payload = event.data.payloadHex;
  const { port } = event.data;
  const bytes = Hex.hexToBytes(payload);
  const bits = MakeBitParser(bytes, 0, bytes.length);
  let topic = "default";
  const lifecycle = {};
  let data = {};
  const stats = {};

  if (port === 1) {
    topic = "position";
    const l = {};
    l.latitude = Number((bits.S32LE(32) / 1e7).toFixed(7)); // decimal scaling
    l.longitude = Number((bits.S32LE(32) / 1e7).toFixed(7));
    data.inTrip = bits.U32LE(1) !== 0;
    data.fixFailed = bits.U32LE(1) !== 0;
    l.headingDeg = Number((bits.U32LE(6) * 5.625).toFixed(2));
    l.speedKmph = bits.U32LE(8);
    lifecycle.batteryVoltage = Number((bits.U32LE(8) * 0.025).toFixed(3));
    data = Object.assign(data, l);
  } else if (port === 2) {
    topic = "downlink_ack";
    data.sequence = bits.U32LE(7);
    data.accepted = bits.U32LE(1) !== 0;
    data.firmware = `${bits.U32LE(8)}.${bits.U32LE(8)}`;
    if (bytes.length < 6) {
      data.productId = null;
      data.hwRev = null;
      data.port = null;
    } else {
      data.productId = bits.U32LE(8);
      data.hwRev = bits.U32LE(8);
      data.port = bits.U32LE(8);
    }
  } else if (port === 3) {
    topic = "stats";
    data.initialvoltage = Number((4.0 + 0.1 * bits.U32LE(4)).toFixed(2));
    data.txCount = 32 * bits.U32LE(11);
    data.tripCount = 32 * bits.U32LE(13);
    data.gnssSuccesses = 32 * bits.U32LE(10);
    data.gnssFails = 32 * bits.U32LE(8);
    data.aveGnssFixS = bits.U32LE(9);
    data.aveGnssFailS = bits.U32LE(9);
    data.aveGnssFreshenS = bits.U32LE(8);
    data.wakeupsPerTrip = bits.U32LE(7);
    data.uptimeWeeks = bits.U32LE(9);
  } else if (port === 4) {
    topic = "position";
    const l = {};
    // decimal scaling, truncated integer
    l.latitude = Number(((256 * bits.S32LE(24)) / 1e7).toFixed(7));
    l.longitude = Number(((256 * bits.S32LE(24)) / 1e7).toFixed(7));
    l.headingDeg = 45 * bits.U32LE(3);
    l.speedKmph = 5 * bits.U32LE(5);
    lifecycle.batteryVoltage = bits.U32LE(8);
    data.inTrip = bits.U32LE(1) !== 0;
    data.fixFailed = bits.U32LE(1) !== 0;
    data.inactivityAlarm = bits.U32LE(1) !== 0;
    if (bits.U32LE(1) === 0) {
      lifecycle.batteryVoltage = Number(
        (0.025 * lifecycle.batteryVoltage).toFixed(3),
      );
    } else {
      lifecycle.batteryVoltage = Number(
        (3.5 + 0.032 * lifecycle.batteryVoltage).toFixed(3),
      );
    }
    const crit = bits.U32LE(2);
    data = Object.assign(data, l);
  } else if (port === 30) {
    topic = "watchdog";
    const reserved = bits.U32LE(32);
    /*
    data.firmware = `${bits.U32LE(8)}.${bits.U32LE(8)}`;
    data.productId = bits.U32LE(8);
    data.hwRev = bits.U32LE(8);
    */
    data.resetPowerOn = bits.U32LE(1) !== 0;
    data.resetWatchdog = bits.U32LE(1) !== 0;
    data.resetExternal = bits.U32LE(1) !== 0;
    data.resetSoftware = bits.U32LE(1) !== 0;
    bits.U32LE(4);
    data.watchdogReason = bits.U32LE(16);
  } else if (port === 31) {
    topic = "stats_v3";
    data.ttff = bits.U32LE(8);
    stats.wakeupsPerTrip = bits.U32LE(8);
    stats.initialvoltage = Number((3.5 + 0.032 * bits.U32LE(8)).toFixed(3));
    data.currentvoltage = Number((3.5 + 0.032 * bits.U32LE(8)).toFixed(3));
    data.batCritical = bits.U32LE(1) !== 0;
    data.batLow = bits.U32LE(1) !== 0;
    stats.tripCount = 32 * bits.U32LE(14);
    stats.uptimeWeeks = bits.U32LE(10);
    data.mWhUsed = 10 * bits.U32LE(10);
    data.percentLora = (100 / 32) * bits.U32LE(5);
    data.percentGnssSucc = (100 / 32) * bits.U32LE(5);
    data.percentGnssFail = (100 / 32) * bits.U32LE(5);
    data.percentSleepDis = (100 / 32) * bits.U32LE(5);
    data.percentOther =
      100 -
      data.percentLora -
      data.percentGnssSucc -
      data.percentGnssFail -
      data.percentSleepDis;
  } else if (port === 33) {
    topic = "position";
    const l = {};
    data.fixFailed = bits.U32LE(1) !== 0;
    l.latitude = Number(((180 * bits.S32LE(23)) / (1 << 23)).toFixed(7)); // binary scaling
    l.longitude = Number(((360 * bits.S32LE(24)) / (1 << 24)).toFixed(7));
    data.inTrip = bits.U32LE(1) !== 0;
    const batCritical = bits.U32LE(1) !== 0;
    data.inactivityAlarm = bits.U32LE(1) !== 0;
    const mins = 2 * bits.U32LE(14); // lower bound
    data.inactiveDuration = `${Math.floor(mins / 1440)}d${Math.floor(
      (mins % 1440) / 60,
    )}h${mins % 60}m`;
    lifecycle.batteryVoltage = Number((3.5 + 0.032 * bits.U32LE(8)).toFixed(3));
    l.headingDeg = 45 * bits.U32LE(3);
    l.speedKmph = 5 * bits.U32LE(5);
    data = Object.assign(data, l);
  } else {
    return {
      warnings: ["unknown FPort"],
    };
  }

  // Lifecycle
  if (Object.keys(lifecycle).length !== 0) {
    // 5 Volt - 3.5 Volt
    const { batteryVoltage } = lifecycle;
    let batteryLevel = Math.round((batteryVoltage - 3.5) / 0.015 / 10) * 10;

    if (batteryLevel > 100) {
      batteryLevel = 100;
    } else if (batteryLevel < 0) {
      batteryLevel = 0;
    }
    lifecycle.batteryLevel = batteryLevel;
    emit("sample", { data: lifecycle, topic: "lifecycle" });
  }

  // Stats
  if (Object.keys(stats).length !== 0) {
    emit("sample", { data: stats, topic: "stats" });
  }

  emit("sample", { data, topic });
}
