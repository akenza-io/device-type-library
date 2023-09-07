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

  let temperature = (bytes[2] << 8) | bytes[3];
  if (bytes[2] & 0x80) {
    temperature |= 0xffff0000;
  }
  data.temperature = (temperature / 10).toFixed(2);

  const soilMoisture = (bytes[4] << 8) | bytes[5];
  data.soilMoisture = (soilMoisture / 100).toFixed(2);

  const soilTemperature = (bytes[6] << 8) | bytes[7];
  if ((soilTemperature & 0x8000) >> 15 === 0) {
    data.soilTemperature = (soilTemperature / 10).toFixed(2);
  } else if ((soilTemperature & 0x8000) >> 15 === 1) {
    data.soilTemperature = ((soilTemperature - 0xffff) / 10).toFixed(2);
  }
  emit("sample", { data, topic: "default" });
  emit("sample", { data: lifecycle, topic: "lifecycle" });
}
