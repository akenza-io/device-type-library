function consume(event) {
  const payload = event.data.payloadHex;
  const bits = Bits.hexToBits(payload);
  const data = {};
  emit("sample", {
    data: { batteryVoltage: Bits.bitsToUnsigned(bits.substring(24, 32)) / 10.0 },
    topic: "lifecycle",
  });
  if (Bits.bitsToUnsigned(bits.substring(32, 40)) === 1) {
    data.open = true;
  } else {
    data.open = false;
  }
  emit("sample", { data });
}
