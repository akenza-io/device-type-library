function cToF(celsius) {
  return Math.round(((celsius * 9) / 5 + 32) * 10) / 10;
}

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
        (Bits.bitsToUnsigned(bits.substr(0, 8) + bits.substr(16, 4)) / 10 -
          80) *
          10,
      ) / 10;
    data.temperatureF = cToF(data.temperature);
    data.humidity =
      Math.round(
        (Bits.bitsToUnsigned(bits.substr(8, 8) + bits.substr(20, 4)) / 10 -
          25) *
          10,
      ) / 10;
    data.co2 = Bits.bitsToUnsigned(bits.substr(24, 16));
  }
  emit("sample", { data, topic });
}
