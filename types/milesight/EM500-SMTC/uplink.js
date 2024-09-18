// Parse Hex Byte Array
function parseHexString(str) {
  const result = [];
  while (str.length >= 2) {
    result.push(parseInt(str.substring(0, 2), 16));
    str = str.substring(2, str.length);
  }
  return result;
}

function readUInt16LE(bytes) {
  const value = (bytes[1] << 8) + bytes[0];
  return value & 0xffff;
}

function readInt16LE(bytes) {
  const ref = readUInt16LE(bytes);
  return ref > 0x7fff ? ref - 0x10000 : ref;
}
function isEmpty(obj) {
  if (obj === undefined) {
    return true;
  }
  return Object.keys(obj).length === 0;
}

function consume(event) {
  const payload = event.data.payloadHex;
  const bytes = parseHexString(payload);

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
      decoded.temperature = readInt16LE(Array.from(bytes).slice(i, i + 2)) / 10;
      i += 2;
    }
    // HUMIDITY
    else if (channelId === 0x04 && channelType === 0x68) {
      decoded.moisture = bytes[i] / 2;
      i += 1;
    }
    // HUMIDITY new resolution 0.01
    else if (channelId === 0x04 && channelType === 0xca) {
      decoded.moisture = readUInt16LE(Array.from(bytes).slice(i, i + 2)) / 100;
      i += 2;
    }
    // EC
    else if (channelId === 0x05 && channelType === 0x7f) {
      decoded.soilConductivity = readUInt16LE(
        Array.from(bytes).slice(i, i + 2),
      );
      i += 2;
    } else {
      break;
    }
  }

  if (!isEmpty(decoded)) {
    emit("sample", { data: decoded, topic: "default" });
  }
}
