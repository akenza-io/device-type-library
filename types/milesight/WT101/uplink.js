function readUInt8LE(bytes) {
  return bytes & 0xff;
}

function readUInt16LE(bytes) {
  const value = (bytes[1] << 8) + bytes[0];
  return value & 0xffff;
}

function readInt16LE(bytes) {
  const ref = readUInt16LE(bytes);
  return ref > 0x7fff ? ref - 0x10000 : ref;
}

function readMotorCalibration(type) {
  switch (type) {
    case 0x00:
      return "SUCCESS";
    case 0x01:
      return "OUT_OF_RANGE";
    case 0x02:
      return "UNINSTALLED";
    case 0x03:
      return "CALIBRATION_CLEARED";
    case 0x04:
      return "TEMPERATURE_CONTROL_DISABLED";
    default:
      return "UNKOWN";
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
    // TEMPERATURE
    else if (channelId === 0x03 && channelType === 0x67) {
      decoded.temperature = readInt16LE(bytes.slice(i, i + 2)) / 10;
      i += 2;
    }
    // TEMPERATURE TARGET
    else if (channelId === 0x04 && channelType === 0x67) {
      decoded.targetTemperature = readInt16LE(bytes.slice(i, i + 2)) / 10;
      i += 2;
    }
    // VALVE OPENING
    else if (channelId === 0x05 && channelType === 0x92) {
      decoded.valveOpening = readUInt8LE(bytes[i]);
      i += 1;
    }
    // INSTALLATION STATUS
    else if (channelId === 0x06 && channelType === 0x00) {
      lifecycle.installed = bytes[i] === 0;
      i += 1;
    }
    // FENESTRATION STATUS
    else if (channelId === 0x07 && channelType === 0x00) {
      lifecycle.fenestration = bytes[i] === 0 ? "NORMAL" : "OPEN";
      i += 1;
    }
    // MOTOR STORKE CALIBRATION STATUS
    else if (channelId === 0x08 && channelType === 0xe5) {
      lifecycle.motorCalibration = readMotorCalibration(bytes[i]);
      i += 1;
    }
    // MOTOR STROKE
    else if (channelId === 0x09 && channelType === 0x90) {
      decoded.motorStroke = readUInt16LE(bytes.slice(i, i + 2));
      i += 2;
    }
    // FROST PROTECTION
    else if (channelId === 0x0a && channelType === 0x00) {
      lifecycle.freezeProtection = bytes[i] === 0 ? "NORMAL" : "TRIGGERED";
      i += 1;
    }
    // MOTOR CURRENT POSTION
    else if (channelId === 0x0b && channelType === 0x90) {
      decoded.motorPosition = readUInt16LE(bytes.slice(i, i + 2));
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
