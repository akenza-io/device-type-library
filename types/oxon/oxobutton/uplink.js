function consume(event) {
  const payload = event.data.payloadHex;
  const bits = Bits.hexToBits(payload);
  const data = {};
  const lifecycle = {};

  if (Bits.bitsToUnsigned(bits.substring(0, 8)) === 48) {
    data.buttonId = Bits.bitsToUnsigned(bits.substring(8, 16));
    lifecycle.hbIRQ = !!Bits.bitsToUnsigned(bits.substring(16, 24));
    lifecycle.accIRQ = !!Bits.bitsToUnsigned(bits.substring(24, 32));
    data.imageID =
      Bits.bitsToUnsigned(bits.substring(32, 40)) * 256 +
      Bits.bitsToUnsigned(bits.substring(40, 48));
    lifecycle.batteryLevel = Bits.bitsToUnsigned(bits.substring(48, 56));
    data.temperature = Bits.bitsToUnsigned(bits.substring(56, 64));
    let accX =
      Bits.bitsToUnsigned(bits.substring(64, 72)) * 256 +
      Bits.bitsToUnsigned(bits.substring(72, 80));
    let accY =
      Bits.bitsToUnsigned(bits.substring(80, 88)) * 256 +
      Bits.bitsToUnsigned(bits.substring(88, 96));
    let accZ =
      Bits.bitsToUnsigned(bits.substring(96, 104)) * 256 +
      Bits.bitsToUnsigned(bits.substring(104, 112));
    accX = accX < 32767 ? (2 / 8191) * accX : (-2 / 8192) * (65536 - accX);
    accY = accY < 32767 ? (2 / 8191) * accY : (-2 / 8192) * (65536 - accY);
    accZ = accZ < 32767 ? (2 / 8191) * accZ : (-2 / 8192) * (65536 - accZ);
    data.accX = Math.round((accX + 2.7755575615628914e-17) * 1000) / 1000;
    data.accY = Math.round((accY + 2.7755575615628914e-17) * 1000) / 1000;
    data.accZ = Math.round((accZ + 2.7755575615628914e-17) * 1000) / 1000;

    emit("sample", { data: lifecycle, topic: "lifecycle" });
    emit("sample", { data, topic: "default" });
  }
}
