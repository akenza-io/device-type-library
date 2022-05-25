function consume(event) {
  const payload = event.data.payloadHex;
  const bits = Bits.hexToBits(payload);
  const data = {};

  // Reserved 8
  data.temperature = (Bits.bitsToUnsigned(bits.substr(8, 16)) - 400) / 10;
  data.humidity = Math.round(
    (Bits.bitsToUnsigned(bits.substr(24, 8)) * 100) / 256,
  );
  data.batteryVoltage =
    (Bits.bitsToUnsigned(bits.substr(32, 8)) * 8 + 1600) / 1000;
  data.thermistorOperational = !Bits.bitsToUnsigned(bits.substr(45, 1));

  if (data.thermistorOperational) {
    data.extTemperature =
      Bits.bitsToUnsigned(bits.substr(46, 2) + bits.substr(48, 8)) / 10;
  }

  emit("sample", { data, topic: "default" });
}
