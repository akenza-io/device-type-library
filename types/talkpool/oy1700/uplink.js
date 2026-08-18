function consume(event) {
  const payload = event.data.payloadHex;
  const { port } = event.data;
  const bits = Bits.hexToBits(payload);
  const data = {};
  const particle = {};
  let topic = "default";

  // Boot
  if (port === 1) {
    if (Bits.bitsToUnsigned(bits.substring(16, 24)) !== 0) {
      data.message = "STARTUP_FAIL";
    } else {
      data.message = "STARTUP_OK";
    }
    topic = "startup";

    //  Measurement
  } else if (port === 2) {
    data.temperature =
      (Bits.bitsToUnsigned(bits.substring(0, 8) + bits.substring(16, 20)) - 800) / 10;
    data.humidity =
      (Bits.bitsToUnsigned(bits.substring(8, 16) + bits.substring(20, 24)) - 250) / 10;

    data.pm1 = Math.round(Bits.bitsToUnsigned(bits.substring(24, 40)));
    data.pm2_5 = Math.round(Bits.bitsToUnsigned(bits.substring(40, 56)));
    data.pm10 = Math.round(Bits.bitsToUnsigned(bits.substring(56, 72)));

    if (bits.length > 72) {
      particle.pm0_3 = Math.round(
        Bits.bitsToUnsigned(bits.substring(72, 88)),
      );
      particle.pm0_5 = Math.round(
        Bits.bitsToUnsigned(bits.substring(88, 104)),
      );
      particle.pm1 = Math.round(
        Bits.bitsToUnsigned(bits.substring(104, 120)),
      );
      particle.pm2_5 = Math.round(
        Bits.bitsToUnsigned(bits.substring(120, 136)),
      );
      particle.pm5 = Math.round(
        Bits.bitsToUnsigned(bits.substring(136, 152)),
      );
      particle.pm5Larger = Math.round(
        Bits.bitsToUnsigned(bits.substring(152, 168)),
      );
      emit("sample", { data: particle, topic: "particle" });
    }
  }

  emit("sample", { data, topic });
}
