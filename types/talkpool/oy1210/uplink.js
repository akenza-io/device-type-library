function consume(event) {
  const payload = event.data.payloadHex;
  const { port } = event.data;
  const bits = Bits.hexToBits(payload);
  const data = {};
  let topic = "default";

  if (port === 1) {
    if (payload === "012000") {
      data.message = "STARTUP_OK";
    } else {
      data.message = "STARTUP_FAIL";
    }
    topic = "startup";
  } else if (port === 2) {
    // Taking the temperature from different positions in the payload and converting it through the defined offsets (same for humidity)
    data.temperature =
      Math.round(
        (Bits.bitsToUnsigned(bits.substring(0, 8) + bits.substring(16, 20)) / 10 -
          80) *
          10,
      ) / 10;
    data.humidity =
      Math.round(
        (Bits.bitsToUnsigned(bits.substring(8, 16) + bits.substring(20, 24)) / 10 -
          25) *
          10,
      ) / 10;
    data.co2 = Bits.bitsToUnsigned(bits.substring(24, 40));
  }
  emit("sample", { data, topic });
}
