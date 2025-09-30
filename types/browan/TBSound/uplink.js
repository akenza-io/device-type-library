function cToF(celsius) {
  return Math.round(((celsius * 9) / 5 + 32) * 10) / 10;
}

function consume(event) {
  const payload = event.data.payloadHex;
  const bits = Bits.hexToBits(payload);
  const data = {};
  const lifecycle = {};
  const topic = "default";

  let batteryVoltage = Bits.bitsToUnsigned(bits.substr(12, 4));
  batteryVoltage = (25 + batteryVoltage) / 10;
  lifecycle.batteryVoltage = Math.round(batteryVoltage * 10) / 10;

  let batteryLevel =
    Math.round((lifecycle.batteryVoltage - 3.1) / 0.005 / 10) * 10; // 3.1V - 3.6V
  if (batteryLevel > 100) {
    batteryLevel = 100;
  } else if (batteryLevel < 0) {
    batteryLevel = 0;
  }
  lifecycle.batteryLevel = batteryLevel;

  data.temperature = Bits.bitsToUnsigned(bits.substr(17, 7));
  data.temperature -= 32;
  data.temperatureF = cToF(data.temperature);

  data.soundAvg = Bits.bitsToUnsigned(bits.substr(24, 8));

  emit("sample", { data: lifecycle, topic: "lifecycle" });
  emit("sample", { data, topic });
}
