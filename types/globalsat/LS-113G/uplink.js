function cToF(celsius) {
  return Math.round(((celsius * 9) / 5 + 32) * 10) / 10;
}

function consume(event) {
  const payload = event.data.payloadHex;
  const bits = Bits.hexToBits(payload);
  const data = {};
  const type = Bits.bitsToUnsigned(bits.substr(0, 8));

  if (type === 1) {
    data.co2 = Bits.bitsToUnsigned(bits.substr(40, 16));
  } else if (type === 2) {
    data.co = Bits.bitsToUnsigned(bits.substr(40, 16));
  } else if (type === 3) {
    data.pm2_5 = Bits.bitsToUnsigned(bits.substr(40, 16));
  }

  data.temperature = Bits.bitsToUnsigned(bits.substr(8, 16)) / 100;
  data.temperatureF = cToF(data.temperature);
  data.humidity = Bits.bitsToUnsigned(bits.substr(24, 16)) / 100;

  emit("sample", { data });
}
