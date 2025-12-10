function readLiquidStatus(type) {
  switch (type) {
    case 0:
      return "UNCALIBRATED";
    case 1:
      return "FULL";
    case 2:
      return "EMPTY";
    case 0xff:
      return "ERROR";
    default:
      return "UNKOWN";
  }
}

function readAlarmType(type) {
  switch (type) {
    case 0:
      return "EMPTY_ALARM_RELEASE";
    case 1:
      return "EMPTY_ALARM";
    default:
      return "UNKNOWN";
  }
}

function isEmpty(obj) {
  if (obj === undefined) {
    return true;
  }
  return Object.keys(obj).length === 0;
}

function consume(event) {
  const payload = event.data.payloadHex;
  const bytes = Hex.hexToBytes(payload);

  const decoded = {};
  const lifecycle = {};

  for (let i = 0; i < bytes.length; ) {
    const channelId = bytes[i++];
    const channelType = bytes[i++];
    // BATTERY
    if (channelId === 0x01 && channelType === 0x75) {
      lifecycle.batteryLevel = bytes[i];
      i += 1;
    }
    // LIQUID
    else if (channelId === 0x03 && channelType === 0xed) {
      decoded.liquid = readLiquidStatus(bytes[i]);
      i += 1;
    }
    // CALIBRATION RESULT
    else if (channelId === 0x04 && channelType === 0xee) {
      lifecycle.calibrationResult = bytes[i] === 0 ? "FAILED" : "SUCCESS";
      i += 1;
    }
    // LIQUID ALARM
    else if (channelId === 0x83 && channelType === 0xed) {
      decoded.liquid = readLiquidStatus(bytes[i]);
      decoded.liquidAlarm = readAlarmType(bytes[i + 1]);
      i += 2;
    } else {
      break;
    }
  }

  if (!isEmpty(decoded)) {
    emit("sample", { data: decoded, topic: "default" });
  }

  if (!isEmpty(lifecycle)) {
    emit("sample", { data: lifecycle, topic: "lifecycle" });
  }
}
