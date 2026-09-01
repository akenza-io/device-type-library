function consume(event) {
  const payload = event.data.payloadHex;
  const bits = Bits.hexToBits(payload);
  const data = {};
  const lifecycle = {};

  data.currentLevel = Bits.bitsToUnsigned(bits.substring(0, 10)) / 10;
  data.isTanking = !!Bits.bitsToUnsigned(bits.substring(10, 11));
  data.isEmptying = !!Bits.bitsToUnsigned(bits.substring(11, 12));
  data.hasMeasurementError = !!Bits.bitsToUnsigned(bits.substring(12, 13));
  data.hasOutOfRangeError = !!Bits.bitsToUnsigned(bits.substring(13, 14));
  data.sequenceNumber = Bits.bitsToUnsigned(bits.substring(14, 16));

  lifecycle.batteryVoltage =
    (Bits.bitsToUnsigned(bits.substring(16, 24)) + 150) / 100;
  lifecycle.batteryLevel = Bits.bitsToUnsigned(bits.substring(24, 32));
  data.temperature = Bits.bitsToSigned(bits.substring(32, 40));
  lifecycle.deviceStatusFlag = Bits.bitsToUnsigned(bits.substring(40, 48));

  emit("sample", { data: lifecycle, topic: "lifecycle" });
  emit("sample", { data, topic: "default" });
}
