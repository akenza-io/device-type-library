function toLittleEndianSigned(hex) {
  // Creating little endian hex DCBA
  const hexArray = [];
  let tempHex = hex;
  while (tempHex.length >= 2) {
    hexArray.push(tempHex.substring(0, 2));
    tempHex = tempHex.substring(2, tempHex.length);
  }
  hexArray.reverse();
  // To signed
  return Bits.bitsToSigned(Bits.hexToBits(hexArray.join("")));
}

function consume(event) {
  const payload = event.data.payload_hex;
  const data = {};
  // 0-2 Channel Number
  // 2-4 Measurement ID
  data.temperature = toLittleEndianSigned(payload.substr(6, 8)) / 1000;
  // 14-16 Channel Number
  // 16-20 Measurement ID
  data.soilHumidity = toLittleEndianSigned(payload.substr(20, 8)) / 1000;

  emit("sample", { data, topic: "default" });
}
