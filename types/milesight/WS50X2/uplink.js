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
  return Object.keys(obj).length === 0;
}

function consume(event) {
  const payload = event.data.payloadHex;
  const bytes = parseHexString(payload);

  const decoded = {};

  for (let i = 0; i < bytes.length; ) {
    const channelId = bytes[i++];
    const channelType = bytes[i++];

    // SWITCH STATE
    if (channelId === 0x08 && channelType === 0x29) {
      decoded.switch1 = (bytes[i] & 1) === 1 ? "OPEN" : "CLOSE";
      decoded.switch1change = ((bytes[i] >> 4) & 1) === 1;

      decoded.switch2 = ((bytes[i] >> 1) & 1) === 1 ? "OPEN" : "CLOSE";
      decoded.switch2change = ((bytes[i] >> 5) & 1) === 1;

      decoded.switch3 = ((bytes[i] >> 2) & 1) === 1 ? "OPEN" : "CLOSE";
      decoded.switch3change = ((bytes[i] >> 6) & 1) === 1;
      i += 1;
    }
    // VOLTAGE
    else if (channelId === 0x03 && channelType === 0x74) {
      decoded.voltage = readUInt16LE(Array.from(bytes).slice(i, i + 2)) / 10;
      i += 2;
    }
    // ACTIVE POWER
    else if (channelId === 0x04 && channelType === 0x80) {
      decoded.power = readUInt32LE(Array.from(bytes).slice(i, i + 4));
      i += 4;
    }
    // POWER FACTOR
    else if (channelId === 0x05 && channelType === 0x81) {
      decoded.factor = bytes[i];
      i += 1;
    }
    // POWER CONSUMPTION
    else if (channelId === 0x06 && channelType === 0x83) {
      decoded.powerConsumption = readUInt32LE(
        Array.from(bytes).slice(i, i + 4),
      );
      i += 4;
    }
    // CURRENT
    else if (channelId === 0x07 && channelType === 0xc9) {
      decoded.current = readUInt16LE(Array.from(bytes).slice(i, i + 2));
      i += 2;
    } else {
      break;
    }
  }

  if (!isEmpty(decoded)) {
    emit("sample", { decoded, topic: "default" });
  }
}
