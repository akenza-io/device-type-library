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
  const value =
    (bytes[3] << 24) + (bytes[2] << 16) + (bytes[1] << 8) + bytes[0];
  return value & 0xffffffff;
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
      emit("sample", { data: lifecycle, topic: "lifecycle" });
      i += 1;
    }
    // TEMPERATURE
    else if (channelId === 0x03 && channelType === 0x67) {
      decoded.temperature = readInt16LE(bytes.slice(i, i + 2)) / 10;
 decoded.temperatureF = cToF(decoded.temperature);
      i += 2;
    }
    // HUMIDITY
    else if (channelId === 0x04 && channelType === 0x68) {
      decoded.humidity = bytes[i] / 2;
      i += 1;
    }
    // GPIO
    else if (channelId === 0x05 && channelType === 0x00) {
      decoded.gpio = bytes[i];
      i += 1;
    }
    // PULSE COUNTER
    else if (channelId === 0x05 && channelType === 0xc8) {
      decoded.pulse = readUInt32LE(bytes.slice(i, i + 4));
      i += 4;
    }
    // HISTROY
    else if (channelId === 0x20 && channelType === 0xce) {
      // maybe not historical raw data
      if (bytes.slice(i).length < 12) {
        break;
      }
      const point = {};
      const timestamp = new Date(readUInt32LE(bytes.slice(i, i + 4)) * 1000);
      point.temperature = readInt16LE(bytes.slice(i + 4, i + 6)) / 10;
 point.temperatureF = cToF(point.temperature);
      point.humidity = bytes[i + 6] / 2;
      const mode = bytes[i + 7];

      if (mode === 1) {
        point.gpio = bytes[i + 8];
      } else if (mode === 2) {
        point.pulse = readUInt32LE(bytes.slice(i + 9, i + 13));
      }

      emit("sample", { data: point, topic: "default", timestamp });
      i += 13;
    } else {
      break;
    }
  }

  if (!isEmpty(decoded)) {
    emit("sample", { data: decoded, topic: "default" });
  }
}
