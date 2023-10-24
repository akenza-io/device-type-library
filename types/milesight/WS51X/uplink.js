function readUInt16LE(bytes) {
  const value = (bytes[1] << 8) + bytes[0];
  return value & 0xffff;
}

function readUInt32LE(bytes) {
  const value =
    (bytes[3] << 24) + (bytes[2] << 16) + (bytes[1] << 8) + bytes[0];
  return (value & 0xffffffff) >>> 0;
}

function consume(event) {
  const payload = event.data.payloadHex;
  const bytes = Hex.hexToBytes(payload);

  const decoded = {};

  for (let i = 0; i < bytes.length; ) {
    const channelId = bytes[i++];
    const channelType = bytes[i++];

    // VOLTAGE
    if (channelId === 0x03 && channelType === 0x74) {
      decoded.voltage = readUInt16LE(bytes.slice(i, i + 2)) / 10;
      i += 2;
    }
    // ACTIVE POWER
    else if (channelId === 0x04 && channelType === 0x80) {
      decoded.power = readUInt32LE(bytes.slice(i, i + 4));
      i += 4;
    }
    // POWER FACTOR
    else if (channelId === 0x05 && channelType === 0x81) {
      decoded.factor = bytes[i];
      i += 1;
    }
    // POWER CONSUMPTION
    else if (channelId === 0x06 && channelType === 0x83) {
      decoded.powerConsumption = readUInt32LE(bytes.slice(i, i + 4));
      i += 4;
    }
    // CURRENT
    else if (channelId === 0x07 && channelType === 0xc9) {
      decoded.current = readUInt16LE(bytes.slice(i, i + 2));
      i += 2;
    }
    // STATE
    else if (channelId === 0x08 && channelType === 0x70) {
      decoded.powerOn = bytes[i] === 1;
      i += 1;
    } else {
      break;
    }
  }
}
