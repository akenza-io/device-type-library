function consume(event) {
  const payload = event.data.payloadHex;
  const { port } = event.data;
  const bits = Bits.hexToBits(payload);
  const data = {};
  let topic = "default";

  if (port === 4) {
    topic = "startup";

    data.version = `${Bits.bitsToUnsigned(
      bits.substring(80, 88),
    )}.${Bits.bitsToUnsigned(bits.substring(88, 96))}.${Bits.bitsToUnsigned(
      bits.substring(96, 104),
    )}`;

    data.openDuration = Bits.bitsToUnsigned(bits.substring(152, 160));
    data.closeDuration = Bits.bitsToUnsigned(bits.substring(160, 168));
  } else if (port === 3) {
    data.batteryLevel = Math.round(
      (Bits.bitsToUnsigned(bits.substring(8, 16)) / 254) * 100,
    );

    if (Bits.bitsToUnsigned(bits.substring(16, 24)) > 0x80) {
      data.open = true;
    } else {
      data.open = false;
    }
  }

  emit("sample", { data, topic });
}
