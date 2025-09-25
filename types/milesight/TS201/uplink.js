function cToF(celsius) { 
 return Math.round(((celsius * 9) / 5 + 32) * 10) / 10; 
 } 

function readUInt16LE(bytes) {
  const value = (bytes[1] << 8) + bytes[0];
  return value & 0xffff;
}

function readInt16LE(bytes) {
  const ref = readUInt16LE(bytes);
  return ref > 0x7fff ? ref - 0x10000 : ref;
}

function readUInt32LE(bytes) {
  const value = (bytes[3] << 24) + (bytes[2] << 16) + (bytes[1] << 8) + bytes[0];
  return (value & 0xffffffff) >>> 0;
}

function readProtocolVersion(bytes) {
  const major = (bytes & 0xf0) >> 4;
  const minor = bytes & 0x0f;
  return `v${major}.${minor}`;
}

function readHardwareVersion(bytes) {
  const major = bytes[0] & 0xff;
  const minor = (bytes[1] & 0xff) >> 4;
  return `v${major}.${minor}`;
}

function readFirmwareVersion(bytes) {
  const major = bytes[0] & 0xff;
  const minor = bytes[1] & 0xff;
  return `v${major}.${minor}`;
}

function readTslVersion(bytes) {
  const major = bytes[0] & 0xff;
  const minor = bytes[1] & 0xff;
  return `v${major}.${minor}`;
}

function readSerialNumber(bytes) {
  const temp = [];
  for (let idx = 0; idx < bytes.length; idx++) {
    temp.push((`0${(bytes[idx] & 0xff).toString(16)}`).slice(-2));
  }
  return temp.join("");
}

function readAlarmType(type) {
  switch (type) {
    case 0x00:
      return "ALARM";
    case 0x01:
      return "THRESHOLD";
    case 0x02:
      return "MUTATION";
    default:
      return "UNKNOWN";
  }
}

function readErrorType(type) {
  switch (type) {
    case 0x00:
      return "READ_ERROR";
    case 0x01:
      return "OVERLOAD";
    default:
      return "UNKNOWN";
  }
}

function readStatus(type) {
  switch (type) {
    case 0x00:
      return "SUCCESS";
    case 0x01:
      return "READ_ERROR";
    case 0x02:
      return "OVERLOAD";
    default:
      return "UNKNOWN";
  }
}

function readType(type) {
  switch (type) {
    case 0x00:
      return "";
    case 0x01:
      return "PERIODIC";
    case 0x02:
      return "ALARM";
    case 0x03:
      return "ALARM_RELEASE";
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

  for (let i = 0; i < bytes.length;) {
    const channelId = bytes[i++];
    const channelType = bytes[i++];

    // IPSO VERSION
    if (channelId === 0xff && channelType === 0x01) {
      lifecycle.ipsoVersion = readProtocolVersion(bytes[i]);
      i += 1;
    }
    // HARDWARE VERSION
    else if (channelId === 0xff && channelType === 0x09) {
      lifecycle.hardwareVersion = readHardwareVersion(bytes.slice(i, i + 2));
      i += 2;
    }
    // FIRMWARE VERSION
    else if (channelId === 0xff && channelType === 0x0a) {
      lifecycle.firmwareVersion = readFirmwareVersion(bytes.slice(i, i + 2));
      i += 2;
    }
    // DEVICE STATUS
    else if (channelId === 0xff && channelType === 0x0b) {
      i += 1;
    }
    // LORAWAN CLASS TYPE
    else if (channelId === 0xff && channelType === 0x0f) {
      i += 1;
    }
    // SERIAL NUMBER
    else if (channelId === 0xff && channelType === 0x16) {
      lifecycle.sn = readSerialNumber(bytes.slice(i, i + 8));
      i += 8;
    }
    // TSL VERSION
    else if (channelId === 0xff && channelType === 0xff) {
      lifecycle.tslVersion = readTslVersion(bytes.slice(i, i + 2));
      i += 2;
    }
    // BATTERY
    else if (channelId === 0x01 && channelType === 0x75) {
      lifecycle.batteryLevel = bytes[i];
      i += 1;
    }
    // TEMPERATURE
    else if (channelId === 0x03 && channelType === 0x67) {
      decoded.temperature = readInt16LE(bytes.slice(i, i + 2)) / 10;
 decoded.temperatureF = cToF(decoded.temperature);
      i += 2;
    }
    // TEMPERATURE THRESHOLD ALARM
    else if (channelId === 0x83 && channelType === 0x67) {
      decoded.temperature = readInt16LE(bytes.slice(i, i + 2)) / 10;
 decoded.temperatureF = cToF(decoded.temperature);
      decoded.temperatureAlarm = readAlarmType(bytes[i + 2]);
 decoded.temperatureF = cToF(decoded.temperature);
      i += 3;
    }
    // TEMPERATURE MUTATION ALARM
    else if (channelId === 0x93 && channelType === 0x67) {
      decoded.temperature = readInt16LE(bytes.slice(i, i + 2)) / 10;
 decoded.temperatureF = cToF(decoded.temperature);
      decoded.temperatureMutation = readInt16LE(bytes.slice(i + 2, i + 4)) / 10;
 decoded.temperatureMutationF = cToF(decoded.temperatureMutation);
 decoded.temperatureF = cToF(decoded.temperature);
      decoded.temperatureAlarm = readAlarmType(bytes[i + 4]);
 decoded.temperatureF = cToF(decoded.temperature);
      i += 5;
    }
    // TEMPERATURE ERROR
    else if (channelId === 0xb3 && channelType === 0x67) {
      const temperatureError = readErrorType(bytes[i]);
      emit("sample", { data: { temperatureError }, topic: "error" });
      i += 1;
    }
    // HISTORY DATA
    else if (channelId === 0x20 && channelType === 0xce) {
      const timestamp = new Date(readUInt32LE(bytes.slice(i, i + 4)) * 1000);
      const eventType = bytes[i + 4];
      const data = {};

      data.temperature = readInt16LE(bytes.slice(i + 5, i + 7)) / 10;
 data.temperatureF = cToF(data.temperature);
      data.readStatus = readStatus((eventType >>> 4) & 0x0f);
      data.eventType = readType(eventType & 0x0f);

      emit("sample", { data, topic: "default", timestamp });
      i += 7;
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
