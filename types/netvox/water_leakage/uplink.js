var Bits = require('bits');

function consume(event) {
  var payload = event.data.payload_hex;
  var bits = Bits.hexToBits(payload);

  var data = {};
  if (Bits.bitsToUnsigned(bits.substr(32, 8)) == 1 || Bits.bitsToUnsigned(bits.substr(40, 8)) == 1) {
    data.leak = true;
  } else {
    data.leak = false;
  }

  emit('sample', { data: { "voltage": Bits.bitsToUnsigned(bits.substr(24, 8)) / 10.0 }, "topic": "lifecycle" });
  emit('sample', { data: data });

}