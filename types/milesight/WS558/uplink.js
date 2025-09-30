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
  const bytes = Hex.hexToBytes(payload);

  const data = {};
  const status = {};

  for (let i = 0; i < bytes.length; ) {
    const channelId = bytes[i++];
    const channelType = bytes[i++];
    // VOLTAGE
    if (channelId === 0x03 && channelType === 0x74) {
      data.voltage = readUInt16LE(bytes.slice(i, i + 2)) / 10;
      i += 2;
    }
    // ACTIVE POWER
    else if (channelId === 0x04 && channelType === 0x80) {
      data.activePower = readUInt32LE(bytes.slice(i, i + 4));
      i += 4;
    }
    // POWER FACTOR
    else if (channelId === 0x05 && channelType === 0x81) {
      data.powerFactor = bytes[i];
      i += 1;
    }
    // POWER CONSUMPTION
    else if (channelId === 0x06 && channelType === 0x83) {
      data.powerConsumption = readUInt32LE(bytes.slice(i, i + 4));
      i += 4;
    }
    // TOTAL CURRENT
    else if (channelId === 0x07 && channelType === 0xc9) {
      data.totalCurrent = readUInt16LE(bytes.slice(i, i + 2));
      i += 2;
    }
    // SWITCH STATUS
    else if (channelId === 0x08 && channelType === 0x31) {
      const switchFlags = bytes[i + 1];

      // output all switch status
      for (let idx = 0; idx < 8; idx++) {
        const switchTag = `switch${idx + 1}`;
        status[switchTag] = !!((switchFlags >> idx) & true);
      }

      i += 2;
    } else {
      break;
    }
  }

  if (!isEmpty(status)) {
    emit("sample", { data: status, topic: "switch" });
  }

  if (!isEmpty(data)) {
    emit("sample", { data, topic: "default" });
  }
}
