var Bits = require('bits');

function consume(event) {
  var payload = event.data.payload_hex;
  var bits = Bits.hexToBits(payload);
  var data = {};

  data.bat = 100.0 * Bits.bitsToUnsigned(bits.substr(0, 8)) / 254.0;
  data.msgtype = Bits.bitsToUnsigned(bits.substr(8, 8))
  data.count = Bits.bitsToUnsigned(bits.substr(16, 32))

  var topic = 'default';
  if (data.msgtype === 0) {
    topic = 'button_pressed';
  } else if (data.msgtype === 1) {
    topic = 'hearbeat';
  } else if (data.msgtype === 4) {
    topic = 'button_pressed_long';
  }

  emit('sample', { data: data, topic: topic });
}