function consume(event) {
  const payload = event.data.payloadHex;
  const bits = Bits.hexToBits(payload);
  const data = {};
  const lifecycle = {};

  lifecycle.dataType = Bits.bitsToUnsigned(bits.substr(8, 8));
  data.key1 = !!Bits.bitsToUnsigned(bits.substr(16, 8));
  data.key2 = !!Bits.bitsToUnsigned(bits.substr(24, 8));
  data.key3 = !!Bits.bitsToSigned(bits.substr(32, 8));
  data.key4 = !!Bits.bitsToSigned(bits.substr(40, 8));
  lifecycle.batteryVoltage = Bits.bitsToSigned(bits.substr(48, 8));
  lifecycle.batteryLevel = Bits.bitsToSigned(bits.substr(56, 8));

  emit("sample", { data, topic: "default" });
  emit("sample", { data: lifecycle, topic: "lifecycle" });
}
