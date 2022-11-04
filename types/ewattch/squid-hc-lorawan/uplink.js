function consume(event) {
  const payload = event.data.payloadHex;
  const bits = Bits.hexToBits(payload);
  const data = {};
  let topic = "default";

  const frameType = Bits.bitsToUnsigned(bits.substr(0, 8));
  // 16 Reserved

  if (frameType === 1) {
    topic = "event";
  } else if (frameType === 16) {
    topic = "status";
  }

  let pointer = 6;
  let i = 1;
  if (topic === "default") {
    while (pointer < payload.length) {
      data[`channel${i}`] =
        Hex.hexLittleEndianToBigEndian(payload.substr(pointer, 6), false) /
        100000;
      pointer += 6;
      i++;
    }
  } else if (topic === "status") {
    // 16 Reserved
    data.firmware = `${Bits.bitsToUnsigned(
      bits.substr(48, 8),
    )}.${Bits.bitsToUnsigned(bits.substr(40, 8))}`;
    let battery = Bits.bitsToUnsigned(bits.substr(64, 8));

    switch (battery) {
      case 0:
        battery = "CRITICAL";
        break;
      case 1:
        battery = "LOW";
        break;
      default:
        battery = "NORMAL";
        break;
    }
    data.batteryStatus = battery;
    // Reserved 8
    data.periodicity = Hex.hexLittleEndianToBigEndian(
      payload.substr(20, 4),
      false,
    );
  }

  emit("sample", { data, topic });
}
