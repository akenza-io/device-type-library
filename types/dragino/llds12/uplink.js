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

  data.temperature = ((((bytes[2] << 24) >> 16) | bytes[3]) / 10).toFixed(2);
  data.distance = ((bytes[4] << 8) | bytes[5]) / 10;
  data.distanceSignalStrength = (bytes[6] << 8) | bytes[7];
  data.lidarTemperature = (bytes[9] << 24) >> 24;

  emit("sample", { data, topic: "default" });
  emit("sample", { data: lifecycle, topic: "lifecycle" });
}
