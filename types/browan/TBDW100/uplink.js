function incrementValue(lastPulse, pulse) {
  // Init state && Check for the case the counter reseted
  if (lastPulse === undefined || lastPulse > pulse) {
    lastPulse = pulse;
  }
  // Calculate increment
  return pulse - lastPulse;
}

function consume(event) {
  const payload = event.data.payloadHex;
  const bits = Bits.hexToBits(payload);
  const data = {};
  const lifecycle = {};

  data.open = !!Bits.bitsToUnsigned(bits.substr(7, 1));

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
  data.time = Hex.hexLittleEndianToBigEndian(payload.substr(6, 4), false);

  data.absoluteCount = Hex.hexLittleEndianToBigEndian(
    payload.substr(10, 6),
    false,
  );
  data.count = incrementValue(event.state.lastCount, data.absoluteCount);
  event.state.lastCount = data.absoluteCount;

  emit("state", event.state);
  emit("sample", { data: lifecycle, topic: "lifecycle" });
  emit("sample", { data, topic: "default" });
}
