function consume(event) {
  const payload = event.data.payloadHex;
  const { port } = event.data;
  const bits = Bits.hexToBits(payload);
  const data = {};
  let topic = "default";

  // Boot
  if (port == 1) {
    if (Bits.bitsToUnsigned(bits.substr(16, 8)) != 0) {
      data.message = "Something went wrong while startup";
    } else {
      data.message = "Standard startup";
    }
    topic = "startup";

    //  Measurement
  } else if (port == 2) {
    data.temperature =
      (Bits.bitsToUnsigned(bits.substr(0, 8) + bits.substr(16, 4)) - 800) / 10;
    data.humidity =
      (Bits.bitsToUnsigned(bits.substr(8, 8) + bits.substr(20, 4)) - 250) / 10;

    data.pm1 = Bits.bitsToUnsigned(bits.substr(24, 16));
    data.pm2_5 = Bits.bitsToUnsigned(bits.substr(40, 16));
    data.pm10 = Bits.bitsToUnsigned(bits.substr(56, 16));

    if (bits.length > 72) {
      data.particleCount0_3 = Bits.bitsToUnsigned(bits.substr(72, 16));
      data.particleCount0_5 = Bits.bitsToUnsigned(bits.substr(88, 16));
      data.particleCount1 = Bits.bitsToUnsigned(bits.substr(104, 16));
      data.particleCount2_5 = Bits.bitsToUnsigned(bits.substr(120, 16));
      data.particleCount5 = Bits.bitsToUnsigned(bits.substr(136, 16));
      data.particleCount5Bigger = Bits.bitsToUnsigned(bits.substr(152, 16));
    }
  }

  emit("sample", { data, topic });
}
