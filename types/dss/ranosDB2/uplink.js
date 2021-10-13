const Bits = require("bits");

function getValues(bits, pointer) {
  let value = Bits.bitsToUnsigned(bits.substr(pointer, 8)) << 8;
  value |= Bits.bitsToUnsigned(bits.substr(pointer + 8, 8));
  value = (value >> 6) & 0x03ff;
  value = value / 10 + 30;

  return value;
}

function consume(event) {
  const payload = event.data.payload_hex;
  const bits = Bits.hexToBits(payload);
  const data = {};
  const lifecycle = {};
  const gps = {};
  let pointer = 16;

  // const messageType = Bits.bitsToUnsigned(bits.substr(0, 2));

  if (Number(bits.substr(2, 1)) === 1) {
    data.dBAfast = getValues(bits, pointer);
    pointer += 10;
  }
  if (Number(bits.substr(3, 1)) === 1) {
    data.dBAslow = getValues(bits, pointer);
    pointer += 10;
  }
  if (Number(bits.substr(4, 1)) === 1) {
    data.dBCfast = getValues(bits, pointer);
    pointer += 10;
  }
  if (Number(bits.substr(5, 1)) === 1) {
    data.dBCslow = getValues(bits, pointer);
    pointer += 10;
  }
  if (Number(bits.substr(6, 1)) === 1) {
    data.leqA = getValues(bits, pointer);
    pointer += 10;
  }
  if (Number(bits.substr(7, 1)) === 1) {
    data.leqC = getValues(bits, pointer);
    pointer += 10;
  }
  if (Number(bits.substr(8, 1)) === 1) {
    data.positivePeakHoldA = getValues(bits, pointer);
    pointer += 10;
  }
  if (Number(bits.substr(9, 1)) === 1) {
    data.positivePeakHoldC = getValues(bits, pointer);
    pointer += 10;
  }
  if (Number(bits.substr(10, 1)) === 1) {
    data.negativePeakHoldA = getValues(bits, pointer);
    pointer += 10;
  }
  if (Number(bits.substr(11, 1)) === 1) {
    data.negativePeakHoldC = getValues(bits, pointer);
    pointer += 10;
  }

  if (Number(bits.substr(12, 1)) === 1) {
    lifecycle.battery = Bits.bitsToUnsigned(bits.substr(pointer + 4, 8)) / 10;
    pointer += 12;
    emit("sample", { data: gps, topic: "gps" });
  }

  if (Number(bits.substr(13, 1)) === 1) {
    gps.lat = Bits.bitsToSigned(bits.substr(pointer, 32)) / 10000000;
    pointer += 32;
    gps.long = Bits.bitsToUnsigned(bits.substr(pointer, 32)) / 10000000;
    emit("sample", { data: gps, topic: "gps" });
  }

  // Rework this so its more generic e.g only use the values if theyre writen
  data.soundAvg =
    (data.negativePeakHoldC +
      data.positivePeakHoldC +
      data.positivePeakHoldA +
      data.negativePeakHoldA) /
    4;

  emit("sample", { data });
}
