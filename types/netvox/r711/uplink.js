function cToF(celsius) {
  return Math.round(((celsius * 9) / 5 + 32) * 10) / 10;
}

function consume(event) {
  const payload = event.data.payloadHex;
  const bits = Bits.hexToBits(payload);
  const data = {};

  // Header
  data.version = Bits.bitsToUnsigned(bits.substr(0, 8));
  data.deviceType = Bits.bitsToUnsigned(bits.substr(8, 8));
  data.batteryVoltage = Bits.bitsToUnsigned(bits.substr(24, 8)) / 10;

  emit("sample", {
    data: {
      temperature: Bits.bitsToSigned(bits.substr(32, 16)) / 100,
      temperatureF: cToF(Bits.bitsToSigned(bits.substr(32, 16)) / 100),
      humidity: Bits.bitsToUnsigned(bits.substr(48, 16)) / 100,
    },
    topic: "default",
  });

  // Last 3 Bytes are reserved
  emit("sample", { data, topic: "lifecycle" });
}
