function consume(event) {
  const payload = event.data.payloadHex;
  const bits = Bits.hexToBits(payload);
  const data = {};
  const lifecycle = {};

  lifecycle.payloadVersion = Bits.bitsToUnsigned(bits.substr(0, 8));
  data.isTestMessage = !!parseInt(bits.substr(15, 1));
  data.isRemoved = !!parseInt(bits.substr(14, 1));
  data.isSecurityUnlocked = !!parseInt(bits.substr(13, 1));
  lifecycle.batteryLevel = Bits.bitsToUnsigned(bits.substr(16, 8)) * 0.5;

  if (event.data.port === 101) {
    lifecycle.swVersionMajor = Bits.bitsToUnsigned(bits.substr(24, 8));
    lifecycle.swVersionMinor = Bits.bitsToUnsigned(bits.substr(32, 8));
  }

  emit("sample", { data: lifecycle, topic: "lifecycle" });
  emit("sample", { data, topic: "default" });
}
