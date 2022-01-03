function consume(event) {
  const payload = event.data.payloadHex;
  const { port } = event.data;
  const bits = Bits.hexToBits(payload);
  const data = {};
  const particle = {};
  let topic = "default";

  // Boot
  if (port === 1) {
    if (Bits.bitsToUnsigned(bits.substr(16, 8)) !== 0) {
      data.message = "STARTUP_FAIL";
    } else {
      data.message = "STARTUP_OK";
    }
    topic = "startup";

    //  Measurement
  } else if (port === 2) {
    data.temperature =
      (Bits.bitsToUnsigned(bits.substr(0, 8) + bits.substr(16, 4)) - 800) / 10;
    data.humidity =
      (Bits.bitsToUnsigned(bits.substr(8, 8) + bits.substr(20, 4)) - 250) / 10;

    data.pm1 = Math.round(Bits.bitsToUnsigned(bits.substr(24, 16)));
    data.pm2_5 = Math.round(Bits.bitsToUnsigned(bits.substr(40, 16)));
    data.pm10 = Math.round(Bits.bitsToUnsigned(bits.substr(56, 16)));

    if (bits.length > 72) {
      particle.particleCount0_3 = Math.round(
        Bits.bitsToUnsigned(bits.substr(72, 16)),
      );
      particle.particleCount0_5 = Math.round(
        Bits.bitsToUnsigned(bits.substr(88, 16)),
      );
      particle.particleCount1 = Math.round(
        Bits.bitsToUnsigned(bits.substr(104, 16)),
      );
      particle.particleCount2_5 = Math.round(
        Bits.bitsToUnsigned(bits.substr(120, 16)),
      );
      particle.particleCount5 = Math.round(
        Bits.bitsToUnsigned(bits.substr(136, 16)),
      );
      particle.particleCount5Bigger = Math.round(
        Bits.bitsToUnsigned(bits.substr(152, 16)),
      );
      emit("sample", { data: particle, topic: "particle" });
    }
  }

  emit("sample", { data, topic });
}
