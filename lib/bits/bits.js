// Convert a hex string to a byte array
exports.hexToBytes = (hex) => {
  for (var bytes = [], c = 0; c < hex.length; c += 2) {
    bytes.push(parseInt(hex.substr(c, 2), 16));
  }
  return bytes;
};

exports.hexToBitString = (hex) => {
  return (parseInt(hex, 16).toString(2)).padStart(8, '0');
};

exports.hexToBits = (hex) => {
  var out = "";
  for (var c of hex) {
    switch (c) {
      case '0': out += "0000"; break;
      case '1': out += "0001"; break;
      case '2': out += "0010"; break;
      case '3': out += "0011"; break;
      case '4': out += "0100"; break;
      case '5': out += "0101"; break;
      case '6': out += "0110"; break;
      case '7': out += "0111"; break;
      case '8': out += "1000"; break;
      case '9': out += "1001"; break;
      case 'a': out += "1010"; break;
      case 'b': out += "1011"; break;
      case 'c': out += "1100"; break;
      case 'd': out += "1101"; break;
      case 'e': out += "1110"; break;
      case 'f': out += "1111"; break;
      default: return "";
    }
  }

  return out;
};

// Convert a byte array to a hex string
exports.bytesToHex = (bytes) => {
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
  let value = parseInt(bits, 2);
  let limit = 1 << (bits.length - 1);
  if (value >= limit) {
    // Value is negative; calculate two's complement.
    value = value - limit - limit;
  }
  return value;
};