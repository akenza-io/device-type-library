function consume(event) {
  const payload = event.data.payloadHex;
  const bits = Bits.hexToBits(payload);
  const data = {};

  data.deviceType = Bits.bitsToUnsigned(bits.substr(0, 8));
  data.version = Bits.bitsToUnsigned(bits.substr(8, 16));
  data.rssi = Bits.bitsToUnsigned(bits.substr(24, 8)) * -1;
  data.snr = Bits.bitsToUnsigned(bits.substr(32, 8));
  data.manually = Bits.bitsToUnsigned(bits.substr(41, 1));
  data.do_2_lora = Bits.bitsToUnsigned(bits.substr(42, 1));
  data.do_1_lora = Bits.bitsToUnsigned(bits.substr(43, 1));
  data.do_2_error = Bits.bitsToUnsigned(bits.substr(44, 1));
  data.do_1_error = Bits.bitsToUnsigned(bits.substr(45, 1));
  data.do_2 = Bits.bitsToUnsigned(bits.substr(46, 1));
  data.do_1 = Bits.bitsToUnsigned(bits.substr(47, 1));

  emit("sample", { data, topic: "default" });
}
