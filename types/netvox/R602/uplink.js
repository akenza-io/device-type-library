function consume(event) {
  const payload = event.data.payloadHex;
  const { port } = event.data;
  const bits = Bits.hexToBits(payload);
  const data = {};

  const version = Bits.bitsToUnsigned(bits.substr(0, 8));
  // Devicetype 8

  // Report data
  if (port === 6) {
    // Report type 8
    data.heartbeat = Bits.bitsToUnsigned(bits.substr(24, 16));
    data.warning = !Bits.bitsToUnsigned(bits.substr(32, 8));

    emit("sample", { data, topic: "default" });
  } else if (port === 7) {
    const configurationSuccess = !Bits.bitsToUnsigned(bits.substr(16, 8));
    emit("sample", {
      data: { configurationSuccess },
      topic: "downlink_response",
    });
  }
}
