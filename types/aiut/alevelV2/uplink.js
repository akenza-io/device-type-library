function consume(event) {
  const payload = event.data.payload_hex;
  const bits = Bits.hexToBits(payload);
  const data = {};
  const lifecycle = {};

  // Reserved 0-8
  data.sequenceNumber = Bits.bitsToUnsigned(bits.substr(8, 8));
  data.temperature = Bits.bitsToSigned(bits.substr(16, 8));
  // If
  lifecycle.batteryStatus = Bits.bitsToUnsigned(bits.substr(24, 2));
  data.buttonLatched = !!Bits.bitsToUnsigned(bits.substr(26, 1));
  data.buttonCurrent = !!Bits.bitsToUnsigned(bits.substr(27, 1));
  data.currentProfile = Bits.bitsToUnsigned(bits.substr(28, 4));

  data.sensorLevel = Bits.bitsToUnsigned(bits.substr(32, 10));
  data.removedFromDial = Bits.bitsToUnsigned(bits.substr(42, 1));
  data.refilling = Bits.bitsToUnsigned(bits.substr(43, 1));
  data.hi = Bits.bitsToUnsigned(bits.substr(44, 1));
  data.lo = Bits.bitsToUnsigned(bits.substr(45, 1));
  data.outOfRange = Bits.bitsToUnsigned(bits.substr(46, 1));
  data.notValidReadout = Bits.bitsToUnsigned(bits.substr(46, 1));

  emit("sample", { data: lifecycle, topic: "lifecycle" });
  emit("sample", { data, topic: "default" });
}
