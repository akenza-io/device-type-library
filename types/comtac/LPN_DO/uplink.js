function consume(event) {
  const payload = event.data.payloadHex;
  const bits = Bits.hexToBits(payload);
  const data = {};

  data.deviceType = Bits.bitsToUnsigned(bits.substring(0, 8));
  data.version = Bits.bitsToUnsigned(bits.substring(8, 24));
  data.rssi = Bits.bitsToUnsigned(bits.substring(24, 32)) * -1;
  data.snr = Bits.bitsToUnsigned(bits.substring(32, 40));
  data.manually = Bits.bitsToUnsigned(bits.substring(41, 42));
  data.do2Lora = Bits.bitsToUnsigned(bits.substring(42, 43));
  data.do1Lora = Bits.bitsToUnsigned(bits.substring(43, 44));
  data.do2Error = Bits.bitsToUnsigned(bits.substring(44, 45));
  data.do1Error = Bits.bitsToUnsigned(bits.substring(45, 46));
  data.do2 = Bits.bitsToUnsigned(bits.substring(46, 47));
  data.do1 = Bits.bitsToUnsigned(bits.substring(47, 48));

  emit("sample", { data, topic: "default" });
}
