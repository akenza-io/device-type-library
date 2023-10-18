function readUInt16LE(bytes) {
  const value = (bytes[1] << 8) + bytes[0];
  return value & 0xffff;
}

function readUInt32LE(bytes) {
  const value =
    (bytes[3] << 24) + (bytes[2] << 16) + (bytes[1] << 8) + bytes[0];
  return value & 0xffffffff;
}

function consume(event) {
  const payload = event.data.payloadHex;
  const bytes = Hex.hexToBytes(payload);

  for (let i = 0; i < bytes.length; ) {
    const channelId = bytes[i++];
    const channelType = bytes[i++];

    // BATTERY
    if (channelId === 0x01 && channelType === 0x75) {
      const batteryLevel = bytes[i];
      i += 1;
      emit("sample", { data: { batteryLevel }, topic: "lifecycle" });
    }
    // WATER LEVEL
    else if (channelId === 0x03 && channelType === 0x77) {
      const waterLevel = readUInt16LE(bytes.slice(i, i + 2));
      i += 2;
      emit("sample", { data: { waterLevel }, topic: "default" });
    }
    // HISTROY DATA
    else if (channelId === 0x20 && channelType === 0xce) {
      const timestamp = new Date(readUInt32LE(bytes.slice(i, i + 4)));
      const waterLevel = readUInt16LE(bytes.slice(i + 4, i + 6));

      emit("sample", { data: { waterLevel }, topic: "default", timestamp });
      i += 6;
    } else {
      break;
    }
  }
}
