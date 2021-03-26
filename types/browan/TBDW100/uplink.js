function swap16(val) {
  return ((val & 0xFF) << 8)
    | ((val >> 8) & 0xFF);
}

function consume(event) {
  var payload = event.data.payload_hex;
  var bits = Bits.hexToBits(payload);
  var data = {};
  var lifecycle = {};

  data.open = !!Bits.bitsToUnsigned(bits.substr(7, 1));

  lifecycle.voltage = Bits.bitsToUnsigned(bits.substr(8, 4));
  lifecycle.voltage = (25 + lifecycle.voltage) / 10;
  lifecycle.voltage = Math.round(lifecycle.voltage * 10) / 10;

  lifecycle.statusPercent = Bits.bitsToUnsigned(bits.substr(12, 4));
  lifecycle.statusPercent = 100 * (lifecycle.statusPercent / 15);
  lifecycle.statusPercent = Math.round(lifecycle.statusPercent);

  data.temperature = Bits.bitsToUnsigned(bits.substr(17, 7));
  data.temperature = data.temperature - 32;

  emit('sample', { "data": lifecycle, "topic": "lifecycle" });
  emit('sample', { "data": data, "topic": "default" });
}