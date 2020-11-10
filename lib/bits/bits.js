// Convert a hex string to a byte array
exports.hexToBits = (hex) => {
  for (var bytes = [], c = 0; c < hex.length; c += 2) {
    bytes.push(parseInt(hex.substr(c, 2), 16));
  }
  return String(bytes);
};

// Convert a byte array to a hex string
exports.bitsToHex = (bytes) => {
  for (var hex = [], i = 0; i < bytes.length; i++) {
    var current = bytes[i] < 0 ? bytes[i] + 256 : bytes[i];
    hex.push((current >>> 4).toString(16));
    hex.push((current & 0xf).toString(16));
  }
  return hex.join("");
};

exports.bitsToUnsigned = (bits) => {
  return parseInt(bits, 2);
};

exports.bitsToSigned = (bits) => {
  var bits = "0b" + bits;
  var [value] = new Int16Array([bits]);
  return value;
};