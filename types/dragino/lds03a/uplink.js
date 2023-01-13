function getzf(cNum) {
  if (parseInt(cNum) < 10) {
    cNum = `0${cNum}`;
  }

  return cNum;
}

function getMyDate(str) {
  let cDate;
  if (str > 9999999999) {
    cDate = new Date(parseInt(str));
  } else {
    cDate = new Date(parseInt(str) * 1000);
  }

  const cYear = cDate.getFullYear();
  const cMonth = cDate.getMonth() + 1;
  const cDay = cDate.getDate();
  const cHour = cDate.getHours();
  const cMin = cDate.getMinutes();
  const cSen = cDate.getSeconds();
  const cTime = `${cYear}-${getzf(cMonth)}-${getzf(cDay)} ${getzf(
    cHour,
  )}:${getzf(cMin)}:${getzf(cSen)}`;

  return cTime;
}

function datalog(i, bytes) {
  const aa = bytes[0 + i] & 0x02;
  const bb = bytes[0 + i] & 0x01;
  const cc = (
    (bytes[1 + i] << 16) |
    (bytes[2 + i] << 8) |
    bytes[3 + i]
  ).toString(10);
  const dd = (
    (bytes[4 + i] << 16) |
    (bytes[5 + i] << 8) |
    bytes[6 + i]
  ).toString(10);
  const ee = getMyDate(
    (
      (bytes[7 + i] << 24) |
      (bytes[8 + i] << 16) |
      (bytes[9 + i] << 8) |
      bytes[10 + i]
    ).toString(10),
  );
  const string = [aa, bb, cc, dd, ee];

  return string;
}

function consume(event) {
  const payload = event.data.payloadHex;
  const { port } = event.data;
  const bytes = Hex.hexToBytes(payload);
  const data = {};
  const lifecycle = {};

  if (port === 0x02) {
    data.alarm = !!(bytes[0] & 0x02);
    data.open = !!(bytes[0] & 0x01);
    data.openTimes = (bytes[1] << 16) | (bytes[2] << 8) | bytes[3];
    data.openDuration = (bytes[4] << 16) | (bytes[5] << 8) | bytes[6];

    if (bytes.length === 11) {
      emit("sample", { data, topic: "default" });
    }
  } else if (port === 0x03) {
    let dataSum = [];
    for (let i = 0; i < bytes.length; i += 11) {
      const log = datalog(i, bytes);
      if (i === "0") {
        dataSum.push(log);
      } else {
        dataSum += log;
      }
    }
    emit("sample", { data: { datalog: dataSum }, topic: "datalog" });
  } else if (port === 0x04) {
    data.tdc = (bytes[0] << 16) | (bytes[1] << 8) | bytes[2];
    data.disalarm = !!(bytes[3] & 0x01);
    data.keepStatus = !!(bytes[4] & 0x01);
    data.keepTime = (bytes[5] << 8) | bytes[6];
    emit("sample", { data, topic: "info" });
  } else if (port === 0x05) {
    data.firmwareVersion = `${bytes[1] & 0x0f}.${(bytes[2] >> 4) & 0x0f}.${
      bytes[2] & 0x0f
    }`;
    data.batteryVoltage = ((bytes[5] << 8) | bytes[6]) / 1000;
    let batteryLevel =
      Math.round((data.batteryVoltage - 2.45) / 0.0115 / 10) * 10;

    if (batteryLevel > 100) {
      batteryLevel = 100;
    } else if (batteryLevel < 0) {
      batteryLevel = 0;
    }
    data.batteryLevel = batteryLevel;

    emit("sample", { data, topic: "lifecycle" });
  }
}
