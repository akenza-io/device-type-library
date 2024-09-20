function datalog(i, bytes) {
  const aa = bytes[0 + i] & 0x02 ? "TRUE" : "FALSE";
  const bb = (bytes[0 + i] & 0xfc) >> 2;
  const cc = bytes[1 + i];
  const dd =
    ((bytes[3 + i] << 24) |
      (bytes[4 + i] << 16) |
      (bytes[5 + i] << 8) |
      bytes[6 + i]) >>>
    0;
  let ee;

  if (bb === 0x02) {
    ee = (dd / 64).toFixed(1);
  } else if (bb === 0x01) {
    ee = (dd / 390).toFixed(1);
  } else {
    ee = (dd / 450).toFixed(1);
  }

  const string = `[${aa},${bb},${cc},${dd},${ee}],`;

  return string;
}

function consume(event) {
  const payload = event.data.payloadHex;
  const { port } = event.data;
  const bytes = Hex.hexToBytes(payload);

  if (port === 3) {
    let dataSum;
    for (let i = 0; i < bytes.length; i += 11) {
      const data = datalog(i, bytes);
      if (i === 0) {
        dataSum = data;
      } else {
        dataSum += data;
      }
    }

    emit("sample", { data: { datalog: dataSum }, topic: "datalog" });
  } else if (port === 4) {
    const data = {};
    data.tdc = (bytes[0] << 16) | (bytes[1] << 8) | bytes[2];
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
    const flag = (bytes[0] & 0xfc) >> 2;
    const decode = {};

    decode.calculateFlag = flag;
    decode.alarm = !!(bytes[0] & 0x02);

    if (flag === 3) {
      decode.waterFlow = parseFloat(
        (
          (((bytes[1] << 24) |
            (bytes[2] << 16) |
            (bytes[3] << 8) |
            bytes[4]) >>>
            0) /
          12
        ).toFixed(1),
      );
    }
    if (flag === 2) {
      decode.waterFlow = parseFloat(
        (
          (((bytes[1] << 24) |
            (bytes[2] << 16) |
            (bytes[3] << 8) |
            bytes[4]) >>>
            0) /
          64
        ).toFixed(1),
      );
    } else if (flag === 1) {
      decode.waterFlow = parseFloat(
        (
          (((bytes[1] << 24) |
            (bytes[2] << 16) |
            (bytes[3] << 8) |
            bytes[4]) >>>
            0) /
          390
        ).toFixed(1),
      );
    } else {
      decode.waterFlow = parseFloat(
        (
          (((bytes[1] << 24) |
            (bytes[2] << 16) |
            (bytes[3] << 8) |
            bytes[4]) >>>
            0) /
          450
        ).toFixed(1),
      );
    }

    if (bytes[5] === 0x01) {
      decode.lastPulse =
        ((bytes[1] << 24) | (bytes[2] << 16) | (bytes[3] << 8) | bytes[4]) >>>
        0;
    } else {
      decode.totalPulse =
        ((bytes[1] << 24) | (bytes[2] << 16) | (bytes[3] << 8) | bytes[4]) >>>
        0;
    }

    emit("sample", { data: decode, topic: "default" });
  }
}
