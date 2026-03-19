function cToF(celsius) {
  return Math.round(((celsius * 9) / 5 + 32) * 10) / 10;
}

function consume(event) {
  const payload = event.data.payloadHex;
  const bytes = Hex.hexToBytes(payload);
  const data = {};
  const lifecycle = {};

  lifecycle.batteryVoltage = (((bytes[0] << 8) | bytes[1]) & 0x3fff) / 1000;
  let batteryLevel =
    Math.round((lifecycle.batteryVoltage - 2.1) / 0.009 / 10) * 10;

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
  data.temperature = Number((temperature / 10).toFixed(2));
  data.temperatureF = cToF(data.temperature);

  if (((bytes[2] << 8) | bytes[3]) === 0xffff) {
    data.temperature = null;
    data.temperatureF = null;
  }

  const soilHumidity = (bytes[4] << 8) | bytes[5];
  data.soilHumidity = Number((soilHumidity / 100).toFixed(2));

  let soilTemperature = (bytes[6] << 8) | bytes[7];
  if ((soilTemperature & 0x8000) >> 15 === 0) {
    soilTemperature = (soilTemperature / 100).toFixed(2);
  } else if ((soilTemperature & 0x8000) >> 15 === 1) {
    soilTemperature = ((soilTemperature - 0xffff) / 100).toFixed(2);
  }
  data.soilTemperature = Number(soilTemperature);
  data.soilTemperatureF = cToF(data.soilTemperature);

  if (((bytes[6] << 8) | bytes[8]) === 0xffff) {
    data.soilTemperature = null;
    data.soilTemperatureF = null;
  }

  data.soilConductivity = (bytes[8] << 8) | bytes[9];

  emit("sample", { data, topic: "default" });
  emit("sample", { data: lifecycle, topic: "lifecycle" });
}
