var Bits = require('bits');

function swap16(val) {
  return ((val & 0xFF) << 8)
    | ((val >> 8) & 0xFF);
}

function consume(event) {
  var payload = event.data.payload_hex;
  var bits = Bits.hexToBitString(payload);
  var data = {};
  var lifecycle = {};

  if (Bits.bitsToUnsigned(bits.substr(7, 1))) {
    data.status = true;
  } else {
    data.status = false;
  }

  lifecycle.voltage = Bits.bitsToUnsigned(bits.substr(8, 4));
  lifecycle.voltage = (25 + lifecycle.voltage) / 10;
  lifecycle.voltage = Math.round(lifecycle.voltage * 10) / 10;

  lifecycle.statusPercent = Bits.bitsToUnsigned(bits.substr(12, 4));
  lifecycle.statusPercent = 100 * (lifecycle.statusPercent / 15);
  lifecycle.statusPercent = Math.round(lifecycle.statusPercent);

  data.temperature = Bits.bitsToUnsigned(bits.substr(17, 7));
  data.temperature = data.temperature - 32;

  data.time = Bits.bitsToUnsigned(bits.substr(24, 16));
  data.time = swap16(data.time);

  data.count = Bits.bitsToUnsigned(bits.substr(40, 24) + "00");
  data.count = swap16(data.count);

  emit('sample', { "data": lifecycle, "topic": "lifecycle" });
  emit('sample', { "data": data, "topic": "default" });
}