function consume(event) {
  var payload = event.data.payload_hex;
  var port = event.data.port;
  var bits = Bits.hexToBits(payload);
  var data = {};
  var topic = "default";

  // Boot
  if (port == 1) {
    if (Bits.bitsToUnsigned(bits.substr(16, 8)) != 0) {
      data.message = "something went wrong while startup";
    }
    topic = "startup";

    //  Measurement
  } else if (port == 2) {
    data.temperature = (Bits.bitsToUnsigned(bits.substr(0, 8) + bits.substr(16, 4)) - 800) / 10;
    data.humidity = (Bits.bitsToUnsigned(bits.substr(8, 8) + bits.substr(20, 4)) - 250) / 10;

    data.pm1 = Bits.bitsToUnsigned(bits.substr(24, 16));
    data.pm2_5 = Bits.bitsToUnsigned(bits.substr(40, 16));
    data.pm10 = Bits.bitsToUnsigned(bits.substr(56, 16));

    if (bits.length > 72) {
      data.particleCount0_3 = Bits.bitsToUnsigned(bits.substr(72, 16));
      data.particleCount0_5 = Bits.bitsToUnsigned(bits.substr(88, 16));
      data.particleCount1 = Bits.bitsToUnsigned(bits.substr(104, 16));
      data.particleCount2_5 = Bits.bitsToUnsigned(bits.substr(120, 16));
      data.particleCount5 = Bits.bitsToUnsigned(bits.substr(136, 16));
      data.particleCount5_ = Bits.bitsToUnsigned(bits.substr(152, 16));
    }
  }

  emit('sample', { data: data, topic: topic });
}