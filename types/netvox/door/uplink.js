var Bits = require('bits')

function consume(event) {
  var payload = event.data.payload_hex;
  var bits = Bits.hexToBits(payload);
  var data = {};
  emit('sample', { data: { "voltage": Bits.bitsToUnsigned(bits.substr(24, 8)) / 10.0 }, "topic": "lifecycle" });
  if (Bits.bitsToUnsigned(bits.substr(32, 8)) == 1) {
    data.open = true;
  } else {
    data.open = false;
  }
  emit('sample', { data: data });
}