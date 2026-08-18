function consume(event) {
  const payload = event.data.payloadHex;
  const bits = Bits.hexToBits(payload);
  const data = {};
  const type = Bits.bitsToUnsigned(bits.substring(0, 8));

  if (type === 1) {
    data.co2 = Bits.bitsToUnsigned(bits.substring(40, 56));
  } else if (type === 2) {
    data.co = Bits.bitsToUnsigned(bits.substring(40, 56));
  } else if (type === 3) {
    data.pm2_5 = Bits.bitsToUnsigned(bits.substring(40, 56));
  }

  data.temperature = Bits.bitsToUnsigned(bits.substring(8, 24)) / 100;
  data.humidity = Bits.bitsToUnsigned(bits.substring(24, 40)) / 100;

  emit("sample", { data });
}
