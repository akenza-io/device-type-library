function consume(event) {
  const payload = event.data.payloadHex;
  const bits = Bits.hexToBits(payload);
  const data = {};

  // Header
  data.version = Bits.bitsToUnsigned(bits.substring(0, 8));
  data.deviceType = Bits.bitsToUnsigned(bits.substring(8, 16));
  data.batteryVoltage = Bits.bitsToUnsigned(bits.substring(24, 32)) / 10;

  emit("sample", {
    data: {
      temperature: Bits.bitsToSigned(bits.substring(32, 48)) / 100,
      humidity: Bits.bitsToUnsigned(bits.substring(48, 64)) / 100,
    },
    topic: "default",
  });

  // Last 3 Bytes are reserved
  emit("sample", { data, topic: "lifecycle" });
}
