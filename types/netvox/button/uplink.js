var Bits = require('bits')

function consume(event) {
  var payload = event.data.payload_hex;
  var bits = Bits.hexToBits(payload);
  var data = {};
  var topic = 'default';

  data.version = Bits.bitsToUnsigned(bits.substr(0, 8));
  data.devType = Bits.bitsToUnsigned(bits.substr(8, 8));
  var repType = Bits.bitsToUnsigned(bits.substr(16, 8));

  if (repType == 1) {
    data.voltage = Bits.bitsToUnsigned(bits.substr(24, 8)) / 10;
    var click = Bits.bitsToUnsigned(bits.substr(32, 8));
    // 6 Bytes reserved
    if (click == 1) {
      emit('sample', { data: {}, topic: "button_pressed" });
    }
  } else if (repType == 0) {
    emit('sample', { data: {}, topic: "config" });
  }

  emit('sample', { data: data, topic: "lifecycle" });
}