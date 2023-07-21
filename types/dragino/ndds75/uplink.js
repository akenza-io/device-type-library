function consume(event) {
  const payload = event.data.payloadHex;
  const bits = Bits.hexToBits(payload);
  const data = {};
  const lifecycle = {};

  lifecycle.deviceId = payload.substr(0, 16);
  lifecycle.version = Bits.bitsToUnsigned(bits.substr(64, 16));
  lifecycle.batteryVoltage = Bits.bitsToUnsigned(bits.substr(80, 16)) / 1000;
  lifecycle.signalStrength = Bits.bitsToUnsigned(bits.substr(96, 8));
  lifecycle.mod = Bits.bitsToUnsigned(bits.substr(104, 8));
  lifecycle.interrupt = Bits.bitsToUnsigned(bits.substr(112, 8));

  for (let pointer = 120; pointer < bits.length; pointer++) {
    data.distance = Bits.bitsToUnsigned(bits.substr(pointer, 16));
    pointer += 16;
    const timestamp = new Date(
      Bits.bitsToUnsigned(bits.substr(pointer, 32)) * 1000,
    );
    emit("sample", { data, topic: "default", timestamp });
    pointer += 32;
  }

  let batteryLevel =
    Math.round((lifecycle.batteryVoltage - 2.5) / 0.011 / 10) * 10;

  if (batteryLevel > 100) {
    batteryLevel = 100;
  } else if (batteryLevel < 0) {
    batteryLevel = 0;
  }
  lifecycle.batteryLevel = batteryLevel;

  emit("sample", { data: lifecycle, topic: "lifecycle" });
}
