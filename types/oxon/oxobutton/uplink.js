var Bits = require('bits');

function consume(event) {
  var payload = event.data.payload_hex;
  var bits = Bits.hexToBits(payload);
  var data = {};

  data.msgType = Bits.bitsToUnsigned(bits.substr(0, 8));
  data.imageID = Bits.bitsToUnsigned(bits.substr(8, 16));
  data.inverse = !!Bits.bitsToUnsigned(bits.substr(24, 8));

  emit('sample', { data: { "statusPercent": Bits.bitsToUnsigned(bits.substr(32, 8)) }, topic: "lifecycle" });

  emit('sample', { data: data, topic: "default" });
}