function consume(event) {
  const payload = event.data.payloadHex;
  const bytes = Hex.hexToBytes(payload);
  const data = {};
  const lifecycle = {};

  const value = ((bytes[0] << 8) | bytes[1]) & 0x3fff;
  lifecycle.batteryVoltage = Math.round(value / 100) / 10;
  let batteryLevel =
    Math.round((lifecycle.batteryVoltage - 2.1) / 0.009 / 10) * 10;

  if (batteryLevel > 100) {
    batteryLevel = 100;
  } else if (batteryLevel < 0) {
    batteryLevel = 0;
  }
  lifecycle.batteryLevel = batteryLevel;

  // data.open = bytes[0] & 0x80;
  data.waterLeak = !!(bytes[0] & 0x40);

  const mode = bytes[2];
  data.alarm = !!(bytes[9] & 0x01);

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
