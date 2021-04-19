function consume(event) {
  var port = event.data.port;
  var payload = event.data.payload_hex;
  var bits = Bits.hexToBits(payload);
  var data = {};
  var lifecycle = {};

  lifecycle.payloadVersion = Bits.bitsToUnsigned(bits.substr(0, 8));
  data.test = !!parseInt(bits.substr(15, 1));
  data.removed = !!parseInt(bits.substr(14, 1));
  data.unlocked = !!parseInt(bits.substr(13, 1));
  lifecycle.battery = Bits.bitsToUnsigned(bits.substr(16, 8)) * 0.5;

  if (event.data.port == 101) {
    lifecycle.swVersionMajor = Bits.bitsToUnsigned(bits.substr(24, 8));
    lifecycle.swVersionMinor = Bits.bitsToUnsigned(bits.substr(32, 8));
  }

  emit('sample', { data: lifecycle, topic: "lifecycle" });
  emit('sample', { data: data, topic: "default" });
}