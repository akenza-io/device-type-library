function consume(event) {
  const payload = event.data.payloadHex;
  const bits = Bits.hexToBits(payload);
  const data = {};

  // Reserved 8
  data.temperature = (Bits.bitsToUnsigned(bits.substring(8, 24)) - 400) / 10;
  data.humidity = Math.round(
    (Bits.bitsToUnsigned(bits.substring(24, 32)) * 100) / 256,
  );
  data.batteryVoltage =
    (Bits.bitsToUnsigned(bits.substring(32, 40)) * 8 + 1600) / 1000;
  data.thermistorOperational = !Bits.bitsToUnsigned(bits.substring(45, 46));

  if (data.thermistorOperational) {
    data.extTemperature =
      Bits.bitsToUnsigned(bits.substring(46, 48) + bits.substring(48, 56)) / 10;
  }

  emit("sample", { data, topic: "default" });
}
