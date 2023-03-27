function consume(event) {
  const payload = event.data.payloadHex;
  const bytes = Hex.hexToBytes(payload);
  const data = {};
  const lifecycle = {};

  lifecycle.batteryVoltage = (((bytes[0] << 8) | bytes[1]) & 0x3fff) / 1000;

  let batteryLevel =
    Math.round((data.batteryVoltage - 2.45) / 0.0115 / 10) * 10;

  if (batteryLevel > 100) {
    batteryLevel = 100;
  } else if (batteryLevel < 0) {
    batteryLevel = 0;
  }
  lifecycle.batteryLevel = batteryLevel;

  if (bytes.length >= 5) {
    const distance = (bytes[2] << 8) | bytes[3];
    data.distance = distance;
  }

  if (bytes.length > 5) {
    let value = (bytes[5] << 8) | bytes[6];
    if (bytes[5] & 0x80) {
      value |= 0xffff0000;
    }
    data.temperature = (value / 10).toFixed(2);
  }

  emit("sample", { data, topic: "default" });
  emit("sample", { data: lifecycle, topic: "lifecycle" });
}
