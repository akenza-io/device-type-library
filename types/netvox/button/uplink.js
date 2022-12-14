function consume(event) {
  const payload = event.data.payloadHex;
  const bits = Bits.hexToBits(payload);
  const data = {};

  data.version = Bits.bitsToUnsigned(bits.substr(0, 8));
  data.devType = Bits.bitsToUnsigned(bits.substr(8, 8));
  const repType = Bits.bitsToUnsigned(bits.substr(16, 8));

  if (repType === 1) {
    data.batteryVoltage = Bits.bitsToUnsigned(bits.substr(24, 8)) / 10;
    const click = Bits.bitsToUnsigned(bits.substr(32, 8));
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
