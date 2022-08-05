function consume(event) {
  const payload = event.data.payloadHex;
  const { port } = event.data;
  const bits = Bits.hexToBits(payload);
  const data = {};
  let topic = "default";

  if (port === 4) {
    topic = "startup";

    data.version = `${Bits.bitsToUnsigned(
      bits.substr(80, 8),
    )}.${Bits.bitsToUnsigned(bits.substr(88, 8))}.${Bits.bitsToUnsigned(
      bits.substr(96, 8),
    )}`;

    data.openDuration = Bits.bitsToUnsigned(bits.substr(152, 8));
    data.closeDuration = Bits.bitsToUnsigned(bits.substr(160, 8));
  } else if (port === 3) {
    data.batteryLevel = Math.round(
      (Bits.bitsToUnsigned(bits.substr(8, 8)) / 254) * 100,
    );

    if (Bits.bitsToUnsigned(bits.substr(16, 8)) > 0x80) {
      data.open = true;
    } else {
      data.open = false;
    }
  }

  emit("sample", { data, topic });
}
