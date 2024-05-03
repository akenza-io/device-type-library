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

function readAlertType(type) {
  switch (type) {
    case 0:
      return "NORMAL";
    case 1:
      return "THRESHOLD";
    case 2:
      return "MUTATION";
    default:
      return "UNKNOWN";
  }
}

function isEmpty(obj) {
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

    // Battery
    if (channelId === 0x01 && channelType === 0x75) {
      lifecycle.batteryLevel = bytes[i];
      i += 1;
    }
    // Temperature
    else if (channelId === 0x03 && channelType === 0x67) {
      decoded.temperature = readInt16LE(bytes.slice(i, i + 2)) / 10;
      decoded.temperatureAlert = "NORMAL";
      i += 2;
    }
    // Temperature threshold alert
    else if (channelId === 0x83 && channelType === 0x67) {
      decoded.temperature = readInt16LE(bytes.slice(i, i + 2)) / 10;
      decoded.temperatureAlert = readAlertType(bytes[i + 2]);
      i += 3;
    }
    // Temperature mutation alert
    else if (channelId === 0x93 && channelType === 0xd7) {
      decoded.temperature = readInt16LE(bytes.slice(i, i + 2)) / 10;
      decoded.temperatureDegreesCelsiushange =
        readInt16LE(bytes.slice(i + 2, i + 4)) / 100;
      decoded.temperatureAlert = readAlertType(bytes[i + 4]);
      i += 5;
    }
    // Temperature history
    else if (channelId === 0x20 && channelType === 0xce) {
      const item = {};
      const timestamp = new Date(readUInt32LE(bytes.slice(i, i + 4)));
      item.temperature = readInt16LE(bytes.slice(i + 4, i + 6)) / 10;
      item.temperatureAlert = "NORMAL";
      i += 6;

      emit("sample", { data: item, topic: "default", timestamp });
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
