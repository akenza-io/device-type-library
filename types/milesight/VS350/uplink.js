function cToF(celsius) {
  return Math.round(((celsius * 9) / 5 + 32) * 10) / 10;
}

function isEmpty(obj) {
  return Object.keys(obj).length === 0;
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
  const value =
    (bytes[3] << 24) + (bytes[2] << 16) + (bytes[1] << 8) + bytes[0];
  return (value & 0xffffffff) >>> 0;
}

function readAlarmType(type) {
  switch (type) {
    case 0:
      return "THRESHOLD_ALARM_RELEASE";
    case 1:
      return "THRESHOLD_ALARM";
    case 3:
      return "HIGH_TEMPERATURE_ALARM";
    case 4:
      return "HIGH_TEMPERATURE_ALARM_RELEASE";
    default:
      return "UNKNOWN";
  }
}

function consume(event) {
  const payload = event.data.payloadHex;
  const bytes = Hex.hexToBytes(payload);
  const decoded = {};
  const climate = {};
  const lifecycle = {};

  for (let i = 0; i < bytes.length;) {
    const channelId = bytes[i++];
    const channelType = bytes[i++];

    // BATTERY
    if (channelId === 0x01 && channelType === 0x75) {
      lifecycle.batteryLevel = bytes[i];
      i += 1;
    }
    // TEMPERATURE
    else if (channelId === 0x03 && channelType === 0x67) {
      climate.temperature = readInt16LE(bytes.slice(i, i + 2)) / 10;
      climate.temperatureF = cToF(climate.temperature);
      i += 2;
    }
    // TOTAL IN / OUT
    else if (channelId === 0x04 && channelType === 0xcc) {
      decoded.totalCountIn = readUInt16LE(bytes.slice(i, i + 2));
      decoded.totalCountOut = readUInt16LE(bytes.slice(i + 2, i + 4));
      i += 4;
    }
    // PERIOD IN / OUT
    else if (channelId === 0x05 && channelType === 0xcc) {
      decoded.periodicCountIn = readUInt16LE(bytes.slice(i, i + 2));
      decoded.periodicCountOut = readUInt16LE(bytes.slice(i + 2, i + 4));
      i += 4;
    }
    // TEMPERATURE ALARM
    else if (channelId === 0x83 && channelType === 0x67) {
      climate.temperature = readInt16LE(bytes.slice(i, i + 2)) / 10;
      climate.temperatureF = cToF(climate.temperature);
      climate.temperatureAlarm = readAlarmType(bytes[i + 2]);
      i += 3;
    }
    // TOTAL IN / OUT ALARM
    else if (channelId === 0x84 && channelType === 0xcc) {
      decoded.totalCountIn = readUInt16LE(bytes.slice(i, i + 2));
      decoded.totalCountOut = readUInt16LE(bytes.slice(i + 2, i + 4));
      decoded.totalCountAlarm = readAlarmType(bytes[i + 4]);
      i += 5;
    }
    // PERIOD IN / OUT ALARM
    else if (channelId === 0x85 && channelType === 0xcc) {
      decoded.periodicCountIn = readUInt16LE(bytes.slice(i, i + 2));
      decoded.periodicCountOut = readUInt16LE(bytes.slice(i + 2, i + 4));
      decoded.periodicCountAlarm = readAlarmType(bytes[i + 4]);
      i += 5;
    }
    // HISTORICAL DATA
    else if (channelId === 0x20 && channelType === 0xce) {
      const data = {};
      const timestamp = new Date(readUInt32LE(bytes.slice(i, i + 4)) * 1000);
      const type = bytes[i + 4];
      // historical data without total in/out
      if (type === 0) {
        data.periodicCountIn = readUInt16LE(bytes.slice(i + 5, i + 7));
        data.periodicCountOut = readUInt16LE(bytes.slice(i + 7, i + 9));
        i += 9;
      }
      // historical data with total in/out
      else if (type === 1) {
        data.periodicCountIn = readUInt16LE(bytes.slice(i + 5, i + 7));
        data.periodicCountOut = readUInt16LE(bytes.slice(i + 7, i + 9));
        data.totalCountIn = readUInt16LE(bytes.slice(i + 9, i + 11));
        data.totalCountOut = readUInt16LE(bytes.slice(i + 11, i + 13));
        i += 13;
      }

      emit("sample", { data, topic: "people_flow", timestamp });
    } else {
      break;
    }
  }

  if (!isEmpty(climate)) {
    emit("sample", { data: climate, topic: "climate" });
  }

  if (!isEmpty(decoded)) {
    emit("sample", { data: decoded, topic: "people_flow" });
  }

  if (!isEmpty(lifecycle)) {
    emit("sample", { data: lifecycle, topic: "lifecycle" });
  }
}
