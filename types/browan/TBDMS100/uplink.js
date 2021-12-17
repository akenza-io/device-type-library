function toLittleEndian(hex, signed) {
  // Creating little endian hex DCBA
  const hexArray = [];
  let tempHex = hex;
  while (tempHex.length >= 2) {
    hexArray.push(tempHex.substring(0, 2));
    tempHex = tempHex.substring(2, tempHex.length);
  }
  hexArray.reverse();

  if (signed) {
    return Bits.bitsToSigned(Bits.hexToBits(hexArray.join("")));
  }
  return Bits.bitsToUnsigned(Bits.hexToBits(hexArray.join("")));
}

function consume(event) {
  const payload = event.data.payloadHex;
  const bits = Bits.hexToBits(payload);
  const data = {};
  const lifecycle = {};

  data.motion = !!Number(bits.substr(7, 1));

  lifecycle.voltage = Bits.bitsToUnsigned(bits.substr(8, 4));
  lifecycle.voltage = (25 + lifecycle.voltage) / 10;
  lifecycle.voltage = Math.round(lifecycle.voltage * 10) / 10;

  lifecycle.batteryLevel = Bits.bitsToUnsigned(bits.substr(12, 4));
  lifecycle.batteryLevel = 100 * (lifecycle.batteryLevel / 15);
  lifecycle.batteryLevel = Math.round(lifecycle.batteryLevel);

  data.temperature = Bits.bitsToUnsigned(bits.substr(17, 7));
  data.temperature -= 32;

  data.time = toLittleEndian(payload.substr(6, 4), false);
  data.count = toLittleEndian(payload.substr(10, 6), false);

  emit("sample", { data: lifecycle, topic: "lifecycle" });
  emit("sample", { data, topic: "default" });
}
