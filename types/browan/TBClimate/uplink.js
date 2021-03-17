var Bits = require('bits');

function swap16(val) {
  return ((val & 0xFF) << 8)
    | ((val >> 8) & 0xFF);
}

function consume(event) {
  var payload = event.data.payload_hex;
  var bits = Bits.hexToBits(payload);
  var data = {};
  var lifecycle = {};

  data.open = !!Bits.bitsToUnsigned(bits.substr(0, 8));

  lifecycle.voltage = Bits.bitsToUnsigned(bits.substr(8, 4));
  lifecycle.voltage = (25 + lifecycle.voltage) / 10;
  lifecycle.voltage = Math.round(lifecycle.voltage * 10) / 10;

  lifecycle.statusPercent = Bits.bitsToUnsigned(bits.substr(12, 4));
  lifecycle.statusPercent = 100 * (lifecycle.statusPercent / 15);
  lifecycle.statusPercent = Math.round(lifecycle.statusPercent);

  data.temperature = Bits.bitsToUnsigned(bits.substr(17, 7));
  data.temperature = data.temperature - 32;

  data.humidity = Bits.bitsToUnsigned(bits.substr(25, 7));

  data.co2 = Bits.bitsToUnsigned(bits.substr(32, 16));
  data.co2 = swap16(data.co2);

  data.voc = Bits.bitsToUnsigned(bits.substr(48, 16));
  data.voc = swap16(data.voc);

  emit('sample', { "data": data, "topic": "default" });
  emit('sample', { "data": lifecycle, "topic": "lifecycle" });
}