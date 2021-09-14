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

function deleteUnusedKeys(data) {
  let keysRetained = false;
  Object.keys(data).forEach((key) => {
    if (data[key] === undefined) {
      delete data[key];
    } else {
      keysRetained = true;
    }
  });
  return keysRetained;
}

function consume(event) {
  const payload = event.data.payloadHex;
  const bytes = parseHexString(payload);

  const decoded = {};

  for (let i = 0; i < bytes.length; ) {
    const channelId = bytes[i++];
    const channelType = bytes[i++];
    // BATTERY
    if (channelId === 0x01 && channelType === 0x75) {
      decoded.batteryLevel = bytes[i];
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
    // PIR
    else if (channelId === 0x05 && channelType === 0x6a) {
      decoded.pir = readUInt16LE(bytes.slice(i, i + 2));
      i += 2;
    }
    // LIGHT
    else if (channelId === 0x06 && channelType === 0x65) {
      decoded.light = readUInt16LE(bytes.slice(i, i + 2));
      decoded.visibleInfrared = readUInt16LE(bytes.slice(i + 2, i + 4));
      decoded.infrared = readUInt16LE(bytes.slice(i + 4, i + 6));
      i += 6;
    }
    // CO2
    else if (channelId === 0x07 && channelType === 0x7d) {
      decoded.co2 = readUInt16LE(bytes.slice(i, i + 2));
      i += 2;
    }
    // TVOC
    else if (channelId === 0x08 && channelType === 0x7d) {
      decoded.tvoc = readUInt16LE(bytes.slice(i, i + 2));
      i += 2;
    }
    // PRESSURE
    else if (channelId === 0x09 && channelType === 0x73) {
      decoded.pressure = readUInt16LE(bytes.slice(i, i + 2)) / 10;
      i += 2;
    } else {
      break;
    }
  }

  emit("sample", { data: decoded, topic: "default" });
}
