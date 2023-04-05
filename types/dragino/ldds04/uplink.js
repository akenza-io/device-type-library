function consume(event) {
  const payload = event.data.payloadHex;
  const bytes = Hex.hexToBytes(payload);
  const data = {};
  const lifecycle = {};

  lifecycle.batteryVoltage = (((bytes[0] << 8) | bytes[1]) & 0x3fff) / 1000;

  let batteryLevel =
    Math.round((lifecycle.batteryVoltage - 2.45) / 0.0115 / 10) * 10;

  if (batteryLevel > 100) {
    batteryLevel = 100;
  } else if (batteryLevel < 0) {
    batteryLevel = 0;
  }
  lifecycle.batteryLevel = batteryLevel;

  data.extTrigger = !!(bytes[0] & 0x80);
  data.distance1 = ((bytes[2] << 8) | bytes[3]) / 10;
  data.distance2 = ((bytes[4] << 8) | bytes[5]) / 10;
  data.distance3 = ((bytes[6] << 8) | bytes[7]) / 10;
  data.distance4 = ((bytes[8] << 8) | bytes[9]) / 10;

  emit("sample", { data, topic: "default" });
  emit("sample", { data: lifecycle, topic: "lifecycle" });
}
