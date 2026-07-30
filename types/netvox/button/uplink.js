function consume(event) {
  const payload = event.data.payloadHex;
  const bits = Bits.hexToBits(payload);
  const data = {};

  data.version = Bits.bitsToUnsigned(bits.substring(0, 8));
  data.devType = Bits.bitsToUnsigned(bits.substring(8, 16));
  const repType = Bits.bitsToUnsigned(bits.substring(16, 24));

  if (repType === 1) {
    data.batteryVoltage = Bits.bitsToUnsigned(bits.substring(24, 32)) / 10;
    const click = Bits.bitsToUnsigned(bits.substring(32, 40));
    // 6 Bytes reserved
    if (click === 1) {
      emit("sample", {
        data: { buttonPressed: true },
        topic: "button_pressed",
      });
    }
    emit("sample", { data, topic: "lifecycle" });
  } else if (repType === 0) {
    emit("sample", { data: { config: true }, topic: "config" });
  }
}
