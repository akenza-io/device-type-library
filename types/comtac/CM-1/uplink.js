function consume(event) {
  var payload = event.data.payload_hex;
  var bits = Bits.hexToBits(payload);
  var data = {};
  var defaultData = {};

  data.booster = !!(Bits.bitsToUnsigned(bits.substr(0, 1)));
  // reserved
  data.minHumOn = !!(Bits.bitsToUnsigned(bits.substr(2, 1)));
  data.maxHumOn = !!(Bits.bitsToUnsigned(bits.substr(3, 1)));
  data.txOnEvent = !!(Bits.bitsToUnsigned(bits.substr(4, 1)));
  // reserved
  data.minTempOn = !!(Bits.bitsToUnsigned(bits.substr(6, 1)));
  data.maxTempOn = !!(Bits.bitsToUnsigned(bits.substr(7, 1)));

  data.minTempThreshold = Bits.bitsToSigned(bits.substr(8, 8));
  data.maxTempThreshold = Bits.bitsToSigned(bits.substr(16, 8));
  data.minHumThreshold = Bits.bitsToSigned(bits.substr(24, 8));
  data.maxHumThreshold = Bits.bitsToSigned(bits.substr(32, 8));
  data.sendInterval = Bits.bitsToUnsigned(bits.substr(40, 16));
  data.voltage = parseFloat((Bits.bitsToUnsigned(bits.substr(56, 16)) / 1000).toFixed(2));
  emit('sample', { data: data, topic: "lifecycle" });

  defaultData.temperature = (Bits.bitsToSigned(bits.substr(72, 16)) / 100).toFixed(1);
  defaultData.humidity = (Bits.bitsToSigned(bits.substr(88, 16)) / 100).toFixed(0);
  emit('sample', { data: defaultData, topic: "default" });

  if (data.txOnEvent == true) {
    emit('sample', { data: { "buttonPressed": true }, topic: "button_pressed" });
  }
}