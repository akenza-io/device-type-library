function getValue(bits, pointer) {
  let value = Bits.bitsToUnsigned(bits.substr(pointer, 8)) << 8;
  value |= Bits.bitsToUnsigned(bits.substr(pointer + 8, 8));
  value = (value >> 6) & 0x03ff;
  value = value / 10 + 30;

  return value;
}

function consume(event) {
  const payload = event.data.payloadHex;
  const bits = Bits.hexToBits(payload);
  const data = {};
  const lifecycle = {};
  const gps = {};
  let pointer = 16;

  // 2 bits reserved for messagetype

  if (Number(bits.substr(2, 1)) === 1) {
    data.dBAfast = getValue(bits, pointer);
    pointer += 10;
  }
  if (Number(bits.substr(3, 1)) === 1) {
    data.dBAslow = getValue(bits, pointer);
    pointer += 10;
  }
  if (Number(bits.substr(4, 1)) === 1) {
    data.dBCfast = getValue(bits, pointer);
    pointer += 10;
  }
  if (Number(bits.substr(5, 1)) === 1) {
    data.dBCslow = getValue(bits, pointer);
    pointer += 10;
  }
  if (Number(bits.substr(6, 1)) === 1) {
    data.leqA = getValue(bits, pointer);
    pointer += 10;
  }
  if (Number(bits.substr(7, 1)) === 1) {
    data.leqC = getValue(bits, pointer);
    pointer += 10;
  }
  if (Number(bits.substr(8, 1)) === 1) {
    data.positivePeakHoldA = getValue(bits, pointer);
    pointer += 10;
  }
  if (Number(bits.substr(9, 1)) === 1) {
    data.positivePeakHoldC = getValue(bits, pointer);
    pointer += 10;
  }
  if (Number(bits.substr(10, 1)) === 1) {
    data.negativePeakHoldA = getValue(bits, pointer);
    pointer += 10;
  }
  if (Number(bits.substr(11, 1)) === 1) {
    data.negativePeakHoldC = getValue(bits, pointer);
    pointer += 10;
  }
  if (Number(bits.substr(12, 1)) === 1) {
    lifecycle.voltage = Bits.bitsToUnsigned(bits.substr(pointer + 4, 8)) / 10;
    pointer += 12;
    emit("sample", { data: lifecycle, topic: "lifecycle" });
  }
  if (Number(bits.substr(13, 1)) === 1) {
    gps.latitude = Bits.bitsToSigned(bits.substr(pointer, 32)) / 10000000;
    pointer += 32;
    gps.longitude = Bits.bitsToSigned(bits.substr(pointer, 32)) / 10000000;
    emit("sample", { data: gps, topic: "gps" });
  }

  emit("sample", { data, topic: "default" });
}
