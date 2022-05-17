function consume(event) {
  const payload = event.data.payloadHex;
  const bits = Bits.hexToBits(payload);
  const data = {};

  // Reserved 8
  data.baterryVoltage =
    (Bits.bitsToUnsigned(bits.substr(8, 8)) * 8 + 1600) / 1000;
  data.thermistorOperational = !Bits.bitsToUnsigned(bits.substr(21, 1));
  data.temperature =
    Bits.bitsToUnsigned(bits.substr(22, 2) + bits.substr(24, 8)) / 10;

  const button = Bits.bitsToUnsigned(bits.substr(32, 8));

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
