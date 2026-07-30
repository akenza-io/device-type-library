function consume(event) {
  const payload = event.data.payloadHex;
  const bits = Bits.hexToBits(payload);
  const data = {};
  const lifecycle = {};

  lifecycle.maxTempOn = !!Bits.bitsToUnsigned(bits.substring(0, 1));
  lifecycle.minTempOn = !!Bits.bitsToUnsigned(bits.substring(1, 2));
  // reserved
  lifecycle.txOnEvent = !!Bits.bitsToUnsigned(bits.substring(3, 4));
  lifecycle.maxHumOn = !!Bits.bitsToUnsigned(bits.substring(4, 5));
  lifecycle.minHumOn = !!Bits.bitsToUnsigned(bits.substring(5, 6));
  // reserved
  lifecycle.booster = !!Bits.bitsToUnsigned(bits.substring(7, 8));

  lifecycle.minTempThreshold = Bits.bitsToSigned(bits.substring(8, 16));
  lifecycle.maxTempThreshold = Bits.bitsToSigned(bits.substring(16, 24));
  lifecycle.minHumThreshold = Bits.bitsToSigned(bits.substring(24, 32));
  lifecycle.maxHumThreshold = Bits.bitsToSigned(bits.substring(32, 40));
  lifecycle.sendInterval = Bits.bitsToUnsigned(bits.substring(40, 56));
  lifecycle.batteryVoltage = parseFloat(
    (Bits.bitsToUnsigned(bits.substring(56, 72)) / 1000).toFixed(2),
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
    (Bits.bitsToSigned(bits.substring(72, 88)) / 100).toFixed(1),
  );
  data.humidity = Number(
    (Bits.bitsToSigned(bits.substring(88, 104)) / 100).toFixed(0),
  );
  emit("sample", { data, topic: "default" });

  if (lifecycle.txOnEvent === true) {
    emit("sample", { data: { buttonPressed: true }, topic: "button_pressed" });
  }
}
