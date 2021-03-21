var Bits = require('bits');

function consume(event) {
  var payload = event.data.payload_hex;
  var bits = Bits.hexToBits(payload);
  var data = {};
  var lifecycle = {};

  data.msgType = Bits.bitsToUnsigned(bits.substr(0, 8));
  data.buttonClicked = Bits.bitsToUnsigned(bits.substr(8, 8));
  lifecycle.heartbeat = !!Bits.bitsToUnsigned(bits.substr(16, 8));
  // accelerometer
  data.imageH = Bits.bitsToUnsigned(bits.substr(32, 8));
  data.imageID = Bits.bitsToUnsigned(bits.substr(40, 8)); // imageL
  lifecycle.statusPercent = Bits.bitsToSigned(bits.substr(48, 8));
  data.temperature = Bits.bitsToUnsigned(bits.substr(56, 8));

  emit('sample', { data: lifecycle, topic: "lifecycle" });
  emit('sample', { data: data, topic: "default" });
}