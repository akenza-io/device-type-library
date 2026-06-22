// Creating little endian hex DCBA
exports.hexLittleEndianToBigEndian = (hex, signed = true) => {
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
};

// Returns a byte array
exports.hexToBytes = (hex) => {
  const bytes = [];
  let c = 0;
  while (c < hex.length) {
    bytes.push(parseInt(hex.substr(c, 2), 16));
    c += 2;
  }
  return bytes;
};

// Convert a byte array to a hex string
exports.bytesToHex = (bytes) => {
  const hex = [];
  for (let i = 0; i < bytes.length; i += 1) {
    const current = bytes[i] < 0 ? bytes[i] + 256 : bytes[i];
    hex.push((current >>> 4).toString(16));
    hex.push((current & 0xf).toString(16));
  }
  return hex.join("");
};