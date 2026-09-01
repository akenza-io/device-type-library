function consume(event) {
  const payload = event.data.payloadHex;
  const bits = Bits.hexToBits(payload);
  const data = {};
  const lifecycle = {};

  lifecycle.dataType = Bits.bitsToUnsigned(bits.substring(8, 16));
  data.key1 = !!Bits.bitsToUnsigned(bits.substring(16, 24));
  data.key2 = !!Bits.bitsToUnsigned(bits.substring(24, 32));
  data.key3 = !!Bits.bitsToSigned(bits.substring(32, 40));
  data.key4 = !!Bits.bitsToSigned(bits.substring(40, 48));
  lifecycle.batteryVoltage = Bits.bitsToSigned(bits.substring(48, 56));
  lifecycle.batteryLevel = Bits.bitsToSigned(bits.substring(56, 64));

  emit("sample", { data, topic: "default" });
  emit("sample", { data: lifecycle, topic: "lifecycle" });
}
