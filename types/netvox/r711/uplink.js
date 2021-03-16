var Bits = require('bits')

function consume(event) {
  var payload = event.data.payload_hex;
  var bits = Bits.hexToBits(payload);
  var data = {};

  //Header
  data.version = Bits.bitsToUnsigned(bits.substr(0, 8));
  data.deviceType = Bits.bitsToUnsigned(bits.substr(8, 8));
  data.voltage = Bits.bitsToUnsigned(bits.substr(24, 8)) / 10;

  emit('sample', { data: { "temperature": Bits.bitsToSigned(bits.substr(32, 16)) / 100, "humidity": Bits.bitsToUnsigned(bits.substr(48, 16)) / 100 }, topic: "default" });

  // Last 3 Bytes are reserved
  emit('sample', { data: data, topic: "lifecycle" });
}