function consume(event) {
  var payload = event.data.payload_hex;
  var bits = Bits.hexToBits(payload);
  var data = {};


  data.msgtype = Bits.bitsToUnsigned(bits.substr(8, 8))
  data.count = Bits.bitsToUnsigned(bits.substr(16, 32))

  if (data.msgtype === 0) {
    emit('sample', { data: { "buttonPressed": true }, topic: "button_pressed" });
  } else if (data.msgtype === 1) {
    var batteryLevel = Math.round(100.0 * Bits.bitsToUnsigned(bits.substr(0, 8)) / 254.0);
    emit('sample', { data: { "batteryLevel": batteryLevel }, topic: "lifecycle" });
  } else if (data.msgtype === 4) {
    emit('sample', { data: { "buttonPressedLong": true }, topic: 'button_pressed_long' });
  }

  emit('sample', { data: data, topic: "default" });
}