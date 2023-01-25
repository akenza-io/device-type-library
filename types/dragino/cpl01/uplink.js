function datalog(i, bytes) {
  const ff = (bytes[0 + i] & 0xfc) >> 2;
  const aa = bytes[0 + i] & 0x02 ? "TRUE" : "FALSE";
  const bb = bytes[0 + i] & 0x01 ? "OPEN" : "CLOSE";
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
  const string = `[${aa},${bb},${cc},${ff},${dd},${ee}]`;

  return string;
}

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

function consume(event) {
  const payload = event.data.payloadHex;
  const { port } = event.data;
  const bytes = Hex.hexToBytes(payload);
  let topic = "default";

  const data = {};

  if (port === 0x02) {
    const alarm = bytes[0] & 0x02 ? "TRUE" : "FALSE";
    const pinStatus = bytes[0] & 0x01 ? "DISCONNECTED" : "CONNECTED";
    const calculateFlag = (bytes[0] & 0xfc) >> 2;
    const totalPulse = (bytes[1] << 16) | (bytes[2] << 8) | bytes[3];
    const disconnectDuration = (bytes[4] << 16) | (bytes[5] << 8) | bytes[6];

    if (bytes.length === 11) {
      return {
        ALARM: alarm,
        PIN_STATUS: pinStatus,
        CALCULATE_FLAG: calculateFlag,
        TOTAL_PULSE: totalPulse,
        LAST_DISCONNECT_DURATION: disconnectDuration,
      };
    }
  } else if (port === 0x03) {
    topic = "datalog";
    for (let i = 0; i < bytes.length; i += 11) {
      const data = datalog(i, bytes);
      if (i === "0") {
        dataSum = data;
      } else {
        dataSum += data;
      }
    }
    return {
      DATALOG: dataSum,
    };
  } else if (port === 0x04) {
    topic = "status";
    const tdc = (bytes[0] << 16) | (bytes[1] << 8) | bytes[2];
    const disalarm = bytes[3] & 0x01;
    const keepStatus = bytes[4] & 0x01;
    const keepTime = (bytes[5] << 8) | bytes[6];
    const triggerMode = bytes[7] & 0x01;

    return {
      TDC: tdc,
      DISALARM: disalarm,
      KEEP_STATUS: keepStatus,
      KEEP_TIME: keepTime,
      TRIGGER_MODE: triggerMode,
    };
  } else if (port === 0x05) {
    topic = "lifecycle";
    const firmwareVersion = `${bytes[1] & 0x0f}.${(bytes[2] >> 4) & 0x0f}.${
      bytes[2] & 0x0f
    }`;
    const batteryVoltage = ((bytes[5] << 8) | bytes[6]) / 1000;

    return {
      FIRMWARE_VERSION: firm_ver,
      BAT: bat,
    };
  }

  emit;
}
