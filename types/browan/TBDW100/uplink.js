var Bits = require('bits');

function swap16(val) {
  return ((val & 0xFF) << 8)
    | ((val >> 8) & 0xFF);
}

function consume(event) {
  var payload = event.data.payload_hex;
  var bits = Bits.hexToBitString(payload);
  var data = {};

  if (Bits.bitsToUnsigned(bits.substr(7, 1))) {
    topic = "opened";
  } else {
    topic = "closed";
  }

  data.batV = Bits.bitsToUnsigned(bits.substr(8, 4));
  data.batV = (25 + data.batV) / 10;
  data.batV = Math.round(data.batV * 10) / 10;

  data.bat = Bits.bitsToUnsigned(bits.substr(12, 4));
  data.bat = 100 * (data.bat / 15);
  data.bat = Math.round(data.bat);

  data.temperature = Bits.bitsToUnsigned(bits.substr(17, 7));
  data.temperature = data.temperature - 32;

  data.time = Bits.bitsToUnsigned(bits.substr(24, 16));
  data.time = swap16(data.time);

  data.count = Bits.bitsToUnsigned(bits.substr(40, 24) + "00");
  data.count = swap16(data.count);

  emit('sample', { "data": data, "topic": topic });
}