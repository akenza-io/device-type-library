function consume(event) {
  const payload = event.data.payloadHex;
  const bits = Bits.hexToBits(payload);
  const data = {};

  // Reserved 8
  data.batteryVoltage =
    (Bits.bitsToUnsigned(bits.substring(8, 16)) * 8 + 1600) / 1000;
  data.thermistorOperational = !Bits.bitsToUnsigned(bits.substring(21, 22));
  data.temperature =
    Bits.bitsToUnsigned(bits.substring(22, 24) + bits.substring(24, 32)) / 10;

  const button = Bits.bitsToUnsigned(bits.substring(32, 40));

  if (button === 0) {
    data.buttonPressed = "NO_PRESS";
  } else if (button === 1) {
    data.buttonPressed = "SINGLE_PRESS";
  } else if (button === 2) {
    data.buttonPressed = "DOUBLE_PRESS";
  } else if (button === 3) {
    data.buttonPressed = "TRIPLE_PRESS";
  }

  emit("sample", { data, topic: "default" });
}
