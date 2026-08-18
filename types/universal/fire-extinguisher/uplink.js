function consume(event) {
  const payload = event.data.payloadHex;
  const bits = Bits.hexToBits(payload);
  const data = {};
  const lifecycle = {};

  lifecycle.payloadVersion = Bits.bitsToUnsigned(bits.substring(0, 8));
  data.isTestMessage = !!parseInt(bits.substring(15, 16));
  data.isRemoved = !!parseInt(bits.substring(14, 15));
  data.isSecurityUnlocked = !!parseInt(bits.substring(13, 14));
  lifecycle.batteryLevel = Bits.bitsToUnsigned(bits.substring(16, 24)) * 0.5;

  if (event.data.port === 101) {
    lifecycle.swVersionMajor = Bits.bitsToUnsigned(bits.substring(24, 32));
    lifecycle.swVersionMinor = Bits.bitsToUnsigned(bits.substring(32, 40));
  }

  emit("sample", { data: lifecycle, topic: "lifecycle" });
  emit("sample", { data, topic: "default" });
}
