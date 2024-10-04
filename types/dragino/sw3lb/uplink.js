function datalog(i, bytes) {
  const aa = bytes[0 + i] & 0x01 ? "YES" : "NO";
  const bb = bytes[0 + i] & 0x02 ? "TRUE" : "FALSE";
  const cc = (bytes[0 + i] & 0x3c) >> 2;
  const dd = bytes[1 + i] & 0x80 ? "H" : "L";
  const ee = bytes[1 + i] & 0x40 ? "H" : "L";
  const ff = bytes[1 + i] & 0x3f;
  const gg =
    ((bytes[3 + i] << 24) |
      (bytes[4 + i] << 16) |
      (bytes[5 + i] << 8) |
      bytes[6 + i]) >>>
    0;
  let hh;

  if (cc === 0x02) {
    hh = (gg / 64).toFixed(1);
  } else if (cc === 0x01) {
    hh = (gg / 390).toFixed(1);
  } else {
    hh = (gg / 450).toFixed(1);
  }

  const string = `[${aa},${bb},${cc},${dd},${ee},${ff},${gg},${hh},],`;

  return string;
}

function calculateIncrement(lastValue, currentValue) {
  // Check if current value exists
  if (currentValue === undefined || Number.isNaN(currentValue)) {
    return 0;
  }

  // Init state && Check for the case the counter reseted
  if (lastValue === undefined || lastValue > currentValue) {
    lastValue = currentValue;
  }
  // Calculate increment
  return currentValue - lastValue;
}

function consume(event) {
  const payload = event.data.payloadHex;
  const { port } = event.data;
  const bytes = Hex.hexToBytes(payload);

  if (port === 3) {
    const pnack = !!((bytes[0] >> 7) & 0x01);
    let dataSum;
    for (let i = 0; i < bytes.length; i += 11) {
      const data = datalog(i, bytes);
      if (i === 0) {
        dataSum = data;
      } else {
        dataSum += data;
      }
    }

    emit("sample", { data: { datalog: dataSum, pnack }, topic: "datalog" });
  } else if (port === 4) {
    const data = {};
    data.transmitDutyCycle = (bytes[0] << 16) | (bytes[1] << 8) | bytes[2];
    data.stopTimer = bytes[4];
    data.alarmTimer = (bytes[5] << 8) | bytes[6];

    emit("sample", { data, topic: "timer" });
  } else if (port === 5) {
    const data = {};
    data.firmwareVersion = `${bytes[1] & 0x0f}.${(bytes[2] >> 4) & 0x0f}.${
      bytes[2] & 0x0f
    }`;
    data.batteryVoltage = ((bytes[5] << 8) | bytes[6]) / 1000;

    emit("sample", { data, topic: "lifecycle" });
  } else {
    const decode = {};
    decode.calculateFlag = (bytes[0] & 0x3c) >> 2;
    decode.alarm = !!(bytes[0] & 0x02);

    const pulse = parseFloat(
      ((bytes[1] << 24) | (bytes[2] << 16) | (bytes[3] << 8) | bytes[4]) >>> 0,
    );
    let transformation = 450;

    if (
      event.device !== undefined &&
      event.device.customFields !== undefined &&
      event.device.customFields.transformation !== undefined
    ) {
      transformation = event.device.customFields.transformation;
    } else if (decode.calculateFlag === 3) {
      transformation = 12;
    } else if (decode.calculateFlag === 2) {
      transformation = 64;
    } else if (decode.calculateFlag === 1) {
      transformation = 390;
    }

    if (bytes[5] === 0x01) {
      decode.relativePulse = pulse;
      decode.currentWaterConsumption =
        Math.round((decode.relativePulse / transformation) * 10) / 10;
    } else {
      decode.totalPulse = pulse;
      const state = event.state || {};

      // Calculate increment
      decode.relativePulse = calculateIncrement(
        state.lastPulse,
        decode.totalPulse,
      );
      state.lastPulse = decode.totalPulse;

      decode.currentWaterConsumption =
        Math.round((decode.relativePulse / transformation) * 10) / 10;
      decode.totalWaterConsumption =
        Math.round((decode.totalPulse / transformation) * 10) / 10;

      emit("state", state);
    }

    emit("sample", { data: decode, topic: "default" });
  }
}
