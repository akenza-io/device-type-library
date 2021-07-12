function consume(event) {
  const payload = event.data.payloadHex;
  const bits = Bits.hexToBits(payload);
  const data = {};
  emit("sample", {
    data: { voltage: Bits.bitsToUnsigned(bits.substr(24, 8)) / 10.0 },
    topic: "lifecycle",
  });
  if (Bits.bitsToUnsigned(bits.substr(32, 8)) == 1) {
    data.open = true;
  } else {
    data.open = false;
  }
  emit("sample", { data });
}
