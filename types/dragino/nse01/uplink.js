function consume(event) {
  const payload = event.data.payloadHex;
  const bits = Bits.hexToBits(payload);
  const lifecycle = {};
  let data = {};

  lifecycle.deviceId = payload.substring(0, 16);
  lifecycle.version = Bits.bitsToUnsigned(bits.substring(64, 80));
  lifecycle.batteryVoltage = Bits.bitsToUnsigned(bits.substring(80, 96)) / 1000;
  lifecycle.signalStrength = Bits.bitsToUnsigned(bits.substring(96, 104));
  lifecycle.mod = Bits.bitsToUnsigned(bits.substring(104, 112));
  lifecycle.interrupt = Bits.bitsToUnsigned(bits.substring(112, 120));

  for (let pointer = 120; pointer < bits.length; pointer++) {
    data.soilMoisture = Bits.bitsToUnsigned(bits.substring(120, 136));
    pointer += 16;
    data.soilTemperature = Bits.bitsToSigned(bits.substring(pointer, pointer + 16)) / 100;

    if (bits.substring(pointer, pointer + 16) === "1111111111111111") {
      data.soilTemperature = null;
    }

    pointer += 16;
    data.soilConductivity = Bits.bitsToUnsigned(bits.substring(pointer, pointer + 16));
    pointer += 16;
    data.soilDialecticConstant = Bits.bitsToUnsigned(bits.substring(pointer, pointer + 16));
    pointer += 16;
    const timestamp = new Date(
      Bits.bitsToUnsigned(bits.substring(pointer, pointer + 32)) * 1000,
    );
    pointer += 32;
    emit("sample", { data, topic: "default", timestamp });
    data = {};
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
