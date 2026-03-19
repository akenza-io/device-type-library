function cToF(celsius) {
  return Math.round(((celsius * 9) / 5 + 32) * 10) / 10;
}

function consume(event) {
  const payload = event.data.payloadHex;
  const bits = Bits.hexToBits(payload);
  const data = {};
  const lifecycle = {};

  lifecycle.maxTempOn = !!Bits.bitsToUnsigned(bits.substr(0, 1));
  lifecycle.minTempOn = !!Bits.bitsToUnsigned(bits.substr(1, 1));
  // reserved
  lifecycle.txOnEvent = !!Bits.bitsToUnsigned(bits.substr(3, 1));
  lifecycle.maxHumOn = !!Bits.bitsToUnsigned(bits.substr(4, 1));
  lifecycle.minHumOn = !!Bits.bitsToUnsigned(bits.substr(5, 1));
  // reserved
  lifecycle.booster = !!Bits.bitsToUnsigned(bits.substr(7, 1));

  lifecycle.minTempThreshold = Bits.bitsToSigned(bits.substr(8, 8));
  lifecycle.minTempThresholdF = cToF(lifecycle.minTempThreshold);
  lifecycle.maxTempThreshold = Bits.bitsToSigned(bits.substr(16, 8));
  lifecycle.maxTempThresholdF = cToF(lifecycle.maxTempThreshold);
  lifecycle.minHumThreshold = Bits.bitsToSigned(bits.substr(24, 8));
  lifecycle.maxHumThreshold = Bits.bitsToSigned(bits.substr(32, 8));
  lifecycle.sendInterval = Bits.bitsToUnsigned(bits.substr(40, 16));
  lifecycle.batteryVoltage = parseFloat(
    (Bits.bitsToUnsigned(bits.substr(56, 16)) / 1000).toFixed(2),
  );

  let batteryLevel =
    Math.round((lifecycle.batteryVoltage - 2.2) / 0.008 / 10) * 10; // 2.2V - 3V
  if (batteryLevel > 100) {
    batteryLevel = 100;
  } else if (batteryLevel < 0) {
    batteryLevel = 0;
  }
  lifecycle.batteryLevel = batteryLevel;

  emit("sample", { data: lifecycle, topic: "lifecycle" });

  data.temperature = Number(
    (Bits.bitsToSigned(bits.substr(72, 16)) / 100).toFixed(1),
  );
  data.temperatureF = cToF(data.temperature);
  data.humidity = Number(
    (Bits.bitsToSigned(bits.substr(88, 16)) / 100).toFixed(0),
  );
  emit("sample", { data, topic: "default" });

  if (lifecycle.txOnEvent === true) {
    emit("sample", { data: { buttonPressed: true }, topic: "button_pressed" });
  }
}
