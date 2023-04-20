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
    }
    // TEMPERATURE
    else if (channelId === 0x03 && channelType === 0x67) {
      decoded.temperature = readInt16LE(Array.from(bytes).slice(i, i + 2)) / 10;
      i += 2;
    }
    // HUMIDITY
    else if (channelId === 0x04 && channelType === 0x68) {
      decoded.humidity = bytes[i] / 2;
      i += 1;
    }
    // PIR
    else if (channelId === 0x05 && channelType === 0x00) {
      decoded.pir = bytes[i] === 1 ? "TRIGGER" : "IDLE";
      i += 1;
    }
    // LIGHT
    else if (channelId === 0x06 && channelType === 0xcb) {
      decoded.light = bytes[i];
      i += 1;
    }
    // CO2
    else if (channelId === 0x07 && channelType === 0x7d) {
      decoded.co2 = readUInt16LE(Array.from(bytes).slice(i, i + 2));
      i += 2;
    }
    // TVOC
    else if (channelId === 0x08 && channelType === 0x7d) {
      decoded.tvoc = readUInt16LE(Array.from(bytes).slice(i, i + 2));
      i += 2;
    }
    // PRESSURE
    else if (channelId === 0x09 && channelType === 0x73) {
      decoded.pressure = readUInt16LE(Array.from(bytes).slice(i, i + 2)) / 10;
      i += 2;
    }
    // HCHO
    else if (channelId === 0x0a && channelType === 0x7d) {
      decoded.hcho = readUInt16LE(Array.from(bytes).slice(i, i + 2)) / 100;
      i += 2;
    }
    // PM2.5
    else if (channelId === 0x0b && channelType === 0x7d) {
      decoded.pm2_5 = readUInt16LE(Array.from(bytes).slice(i, i + 2));
      i += 2;
    }
    // PM10
    else if (channelId === 0x0c && channelType === 0x7d) {
      decoded.pm10 = readUInt16LE(Array.from(bytes).slice(i, i + 2));
      i += 2;
    }
    // O3
    else if (channelId === 0x0d && channelType === 0x7d) {
      decoded.o3 = readUInt16LE(Array.from(bytes).slice(i, i + 2)) / 100;
      i += 2;
    }
    // BEEP
    else if (channelId === 0x0e && channelType === 0x01) {
      decoded.beep = bytes[i] === 1 ? "yes" : "no";
      i += 1;
    } else {
      break;
    }
  }

  if (!isEmpty(lifecycle)) {
    emit("sample", { data: lifecycle, topic: "lifecycle" });
  }

  if (!isEmpty(decoded)) {
    emit("sample", { data: decoded, topic: "default" });
  }
}
