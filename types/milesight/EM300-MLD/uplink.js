function readUInt32LE(bytes) {
  const value =
    (bytes[3] << 24) + (bytes[2] << 16) + (bytes[1] << 8) + bytes[0];
  return (value & 0xffffffff) >>> 0;
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
    // LEAKAGE STATUS
    else if (channelId === 0x05 && channelType === 0x00) {
      const leakage = bytes[i] !== 0;
      i += 1;
      emit("sample", { data: { leakage }, topic: "default" });
    }
    // LEAKAGE STATUS HISTROY
    else if (channelId === 0x20 && channelType === 0xce) {
      const timestamp = new Date(readUInt32LE(bytes.slice(i, i + 4)) * 1000);
      const leakage = bytes[i + 7] !== 0;

      emit("sample", { data: { leakage }, topic: "default", timestamp });
      i += 8;
    } else {
      break;
    }
  }
}
