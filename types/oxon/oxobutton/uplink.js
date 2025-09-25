function cToF(celsius) {
  return Math.round(((celsius * 9) / 5 + 32) * 10) / 10;
}

function consume(event) {
  const payload = event.data.payloadHex;
  const bits = Bits.hexToBits(payload);
  const data = {};
  const lifecycle = {};

  if (Bits.bitsToUnsigned(bits.substr(0, 8)) === 48) {
    data.buttonId = Bits.bitsToUnsigned(bits.substr(8, 8));
    lifecycle.hbIRQ = !!Bits.bitsToUnsigned(bits.substr(16, 8));
    lifecycle.accIRQ = !!Bits.bitsToUnsigned(bits.substr(24, 8));
    data.imageID =
      Bits.bitsToUnsigned(bits.substr(32, 8)) * 256 +
      Bits.bitsToUnsigned(bits.substr(40, 8));
    lifecycle.batteryLevel = Bits.bitsToUnsigned(bits.substr(48, 8));
    data.temperature = Bits.bitsToUnsigned(bits.substr(56, 8));
    data.temperatureF = cToF(data.temperature);
    let accX =
      Bits.bitsToUnsigned(bits.substr(64, 8)) * 256 +
      Bits.bitsToUnsigned(bits.substr(72, 8));
    let accY =
      Bits.bitsToUnsigned(bits.substr(80, 8)) * 256 +
      Bits.bitsToUnsigned(bits.substr(88, 8));
    let accZ =
      Bits.bitsToUnsigned(bits.substr(96, 8)) * 256 +
      Bits.bitsToUnsigned(bits.substr(104, 8));
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
