function consume(event) {
  const payload = event.data.payloadHex;
  const bytes = Hex.hexToBytes(payload);
  const data = {};
  const lifecycle = {};

  const value = ((bytes[0] << 8) | bytes[1]) & 0x3fff;
  lifecycle.batteryVoltage = value / 1000;

  data.open = bytes[0] & 0x80 ? 1 : 0;
  data.waterLeak = bytes[0] & 0x40 ? 1 : 0;

  const mode = bytes[2];
  data.alarm = bytes[9] & 0x01;

  if (mode === 1) {
    data.openTimes = (bytes[3] << 16) | (bytes[4] << 8) | bytes[5];
    data.openDuration = (bytes[6] << 16) | (bytes[7] << 8) | bytes[8];
    if (bytes.length === 10 && bytes[0] < 0x07 < 0x0f) {
      emit("sample", { data, topic: "default" });
    }
  } else if (mode === 2) {
    data.leakTimes = (bytes[3] << 16) | (bytes[4] << 8) | bytes[5];
    data.leakDuration = (bytes[6] << 16) | (bytes[7] << 8) | bytes[8];
    if (bytes.length === 10 && bytes[0] < 0x07 < 0x0f) {
      emit("sample", { data, topic: "default" });
    }
  }

  emit("sample", { data: lifecycle, topic: "lifecycle" });
}
