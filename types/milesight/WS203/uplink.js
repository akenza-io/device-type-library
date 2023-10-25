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
    // HUMIDITY
    else if (channelId === 0x04 && channelType === 0x68) {
      decoded.humidity = bytes[i] / 2;
      i += 1;
    }
    // OCCUPANCY
    else if (channelId === 0x05 && channelType === 0x00) {
      decoded.occupied = bytes[i] !== 0;
      decoded.occupancy = Number(decoded.occupied);
      i += 1;
    }
    // TEMPERATURE WITH ABNORMAL
    else if (channelId === 0x83 && channelType === 0x67) {
      decoded.temperature = readInt16LE(bytes.slice(i, i + 2)) / 10;
      decoded.temperatureAbnormal = bytes[i + 2] !== 0;
      i += 3;
    }
    // HISTORICAL DATA
    else if (channelId === 0x20 && channelType === 0xce) {
      const data = {};
      const timestamp = new Date(readUInt32LE(bytes.slice(i, i + 4)) * 1000);
      const reportType = bytes[i + 4];

      switch (reportType & 0x07) {
        case 0:
          data.reportType = "TEMPERATURE_RESUME";
          break;
        case 1:
          data.reportType = "TEMPERATURE_THRESHOLD";
          break;
        case 2:
          data.reportType = "PIR_IDLE";
          break;
        case 3:
          data.reportType = "PIR_OCCUPANCY";
          break;
        case 4:
          data.reportType = "PERIOD";
          break;

        default:
          break;
      }

      data.occupied = bytes[i + 5] !== 0;
      data.occupancy = Number(data.occupied);
      data.temperature = readInt16LE(bytes.slice(i + 6, i + 8)) / 10;
      data.humidity = bytes[i + 8] / 2;
      i += 9;

      emit("sample", { data, topic: "default", timestamp });
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
