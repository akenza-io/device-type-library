function consume(event) {
  var payload = event.data.payload_hex;
  var bits = Bits.hexToBits(payload);
  var data = {};
  var lifecycle = {};

  lifecycle.version = Bits.bitsToUnsigned(bits.substr(0, 8));

  // Status
  lifecycle.digitalInputState = !!(Bits.bitsToUnsigned(bits.substr(8, 1)));
  lifecycle.deepSleepEvent = !!(Bits.bitsToUnsigned(bits.substr(9, 1)));
  lifecycle.digitalInputEvent = !!(Bits.bitsToUnsigned(bits.substr(10, 1)));
  lifecycle.buttonEvent = !!(Bits.bitsToUnsigned(bits.substr(11, 1)));
  lifecycle.txOnEvent = !!(Bits.bitsToUnsigned(bits.substr(12, 1)));
  lifecycle.txOnTimer = !!(Bits.bitsToUnsigned(bits.substr(13, 1)));
  // reserved
  lifecycle.booster = !!(Bits.bitsToUnsigned(bits.substr(15, 1)));

  // Event
  lifecycle.maxLemOn = !!(Bits.bitsToUnsigned(bits.substr(16, 1)));
  lifecycle.minLemOn = !!(Bits.bitsToUnsigned(bits.substr(17, 1)));
  lifecycle.maxPt100On = !!(Bits.bitsToUnsigned(bits.substr(18, 1)));
  lifecycle.minPt100On = !!(Bits.bitsToUnsigned(bits.substr(19, 1)));
  lifecycle.maxHumOn = !!(Bits.bitsToUnsigned(bits.substr(20, 1)));
  lifecycle.minHumOn = !!(Bits.bitsToUnsigned(bits.substr(21, 1)));
  lifecycle.maxTempOn = !!(Bits.bitsToUnsigned(bits.substr(22, 1)));
  lifecycle.minTempOn = !!(Bits.bitsToUnsigned(bits.substr(23, 1)));

  lifecycle.voltage = Bits.bitsToUnsigned(bits.substr(24, 16)) / 1000;
  emit('sample', { data: lifecycle, topic: "lifecycle" });

  // Data
  data.temperature = Bits.bitsToSigned(bits.substr(40, 16)) / 100;
  data.humidity = Bits.bitsToSigned(bits.substr(56, 16)) / 100;
  data.temperaturePT100 = Bits.bitsToSigned(bits.substr(72, 16)) / 100;
  data.adc1 = Bits.bitsToUnsigned(bits.substr(88, 16));
  data.adc2 = Bits.bitsToUnsigned(bits.substr(104, 16));
  data.lem = Bits.bitsToUnsigned(bits.substr(120, 16)) / 1000;
  data.brightness = Bits.bitsToUnsigned(bits.substr(136, 8));
  emit('sample', { data: data, topic: "default" });


  if (lifecycle.deepSleepEvent == true) {
    emit('sample', { data: {}, topic: "sleep" });
  }
  if (lifecycle.buttonEvent == true) {
    emit('sample', { data: {}, topic: "button_pressed" });
  }
  if (lifecycle.txOnEvent == true) {
    emit('sample', { data: {}, topic: "event" });
  }
  if (lifecycle.txOnTimer == true) {
    emit('sample', { data: {}, topic: "timer" });
  }
}