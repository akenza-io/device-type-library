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
  const bytes = parseHexString(payload);

  const data = {};

  for (let i = 0; i < bytes.length; ) {
    const channelId = bytes[i++];
    const channelType = bytes[i++];

    // VOLTAGE
    if (channelId === 0x03 && channelType === 0x74) {
      data.voltage = readUInt16LE(Array.from(bytes).slice(i, i + 2)) / 10;
      i += 2;
    }
    // ACTIVE POWER
    else if (channelId === 0x04 && channelType === 0x80) {
      data.power = readUInt32LE(Array.from(bytes).slice(i, i + 4));
      i += 4;
    }
    // POWER FACTOR
    else if (channelId === 0x05 && channelType === 0x81) {
      data.factor = bytes[i];
      i += 1;
    }
    // POWER CONSUMPTION
    else if (channelId === 0x06 && channelType === 0x83) {
      data.powerConsumption = readUInt32LE(Array.from(bytes).slice(i, i + 4));
      i += 4;
    }
    // CURRENT
    else if (channelId === 0x07 && channelType === 0xc9) {
      data.current = readUInt16LE(Array.from(bytes).slice(i, i + 2));
      i += 2;
    }
    // STATE
    else if (channelId === 0x08 && channelType === 0x70) {
      data.state = bytes[i] === 1 || bytes[i] === 0x11 ? "OPEN" : "CLOSED";
      i += 1;
    } else if (channelId === 0xff && channelType === 0x3f) {
      data.outage = bytes[i] === 0xff ? 1 : 0;
    } else {
      break;
    }
  }

  if (!isEmpty(data)) {
    emit("sample", { data, topic: "default" });
  }
}
