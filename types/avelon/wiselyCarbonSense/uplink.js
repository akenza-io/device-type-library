function consume(event) {
  const payload = event.data.payloadHex;
  const bits = Bits.hexToBits(payload);
  let data = {};
  const date = new Date();

  const batteryLevel = (100.0 * Bits.bitsToUnsigned(bits.substr(0, 8))) / 254.0;
  emit("sample", { data: { batteryLevel: batteryLevel }, topic: "lifecycle" });

  let pointer = 8;
  for (let i = 0; pointer < bits.length - 8; i++) {
    const a = Bits.bitsToUnsigned(bits.substr(pointer, 8)) << 8;
    pointer += 8;
    const b = Bits.bitsToUnsigned(bits.substr(pointer, 8));
    pointer += 8;
    data.pressure = (a | b) / 10.0;

    const c = Bits.bitsToUnsigned(bits.substr(pointer, 8)) << 8;
    pointer += 8;
    const d = Bits.bitsToUnsigned(bits.substr(pointer, 8));
    pointer += 8;
    data.temperature = (c | d) / 10.0;

    data.humidity = Bits.bitsToUnsigned(bits.substr(pointer, 8)) / 2;
    pointer += 8;

    const e = Bits.bitsToUnsigned(bits.substr(pointer, 8)) << 8;
    pointer += 8;
    const f = Bits.bitsToUnsigned(bits.substr(pointer, 8));
    pointer += 8;

    data.co2 = e | f;

    if (i == 0) {
      emit("sample", { data: data });
    } else {
      const outTime = new Date(date.setMinutes(date.getMinutes() - 10));
      emit("sample", { data: data, timestamp: outTime });
    }
    data = {};
  }
}
