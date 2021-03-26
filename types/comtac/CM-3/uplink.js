function consume(event) {
  var payload = event.data.payload_hex;
  var port = event.data.port;
  var bits = Bits.hexToBits(payload);
  var data = {};
  var lifecycle = {};
  var topic = "topic";

  lifecycle.version = Bits.bitsToUnsigned(bits.substr(0, 8));

  // Status
  // reserved x2
  lifecycle.tempPt100 = !!(Bits.bitsToUnsigned(bits.substr(10, 1)));
  lifecycle.tempI2C = !!(Bits.bitsToUnsigned(bits.substr(11, 1)));
  lifecycle.acc = !!(Bits.bitsToUnsigned(bits.substr(12, 1)));
  lifecycle.extMEM = !!(Bits.bitsToUnsigned(bits.substr(13, 1)));
  lifecycle.lastTempValid = !!(Bits.bitsToUnsigned(bits.substr(14, 1)));
  lifecycle.batLow = !!(Bits.bitsToUnsigned(bits.substr(15, 1)));

  // Event
  // reserved x2
  lifecycle.async = !!(Bits.bitsToUnsigned(bits.substr(18, 1)));
  lifecycle.history = !!(Bits.bitsToUnsigned(bits.substr(19, 1)));
  lifecycle.alarming = !!(Bits.bitsToUnsigned(bits.substr(20, 1)));
  lifecycle.button = !!(Bits.bitsToUnsigned(bits.substr(21, 1)));
  lifecycle.configRX = !!(Bits.bitsToUnsigned(bits.substr(22, 1)));
  lifecycle.infoReq = !!(Bits.bitsToUnsigned(bits.substr(23, 1)));

  lifecycle.statusPercent = Bits.bitsToUnsigned(bits.substr(24, 8)) / 2;

  if (port = 3) {
    var payloadId = data.battery = Bits.bitsToUnsigned(bits.substr(32, 8));
    if (payloadId == 1) {
      data.temperature = Bits.bitsToSigned(bits.substr(40, 16)) / 100;
    } else if (payloadId == 2) {
      data.temperature = Bits.bitsToSigned(bits.substr(40, 16)) / 100;
      data.tempHistory1 = Bits.bitsToSigned(bits.substr(56, 16)) / 100;
      data.tempHistory2 = Bits.bitsToSigned(bits.substr(72, 16)) / 100;
      data.tempHistory3 = Bits.bitsToSigned(bits.substr(88, 16)) / 100;
      data.tempHistory4 = Bits.bitsToSigned(bits.substr(104, 16)) / 100;
      data.tempHistory5 = Bits.bitsToSigned(bits.substr(120, 16)) / 100;
      data.tempHistory6 = Bits.bitsToSigned(bits.substr(136, 16)) / 100;
      data.tempHistory7 = Bits.bitsToSigned(bits.substr(152, 16)) / 100;
      topic = "history";
    }
  } else if (port = 100) {
    data.tempMeasurementRate = Bits.bitsToUnsigned(bits.substr(40, 16));
    data.historyTrigger = Bits.bitsToUnsigned(bits.substr(56, 8));
    data.tempThreshold = Bits.bitsToUnsigned(bits.substr(64, 8));
    data.tempOffset = Bits.bitsToSigned(bits.substr(72, 16)) / 100;
    topic = "config";
  } else if (port = 101) {
    data.appMainVersion = Bits.bitsToUnsigned(bits.substr(40, 8));
    data.appMinorVersion = Bits.bitsToUnsigned(bits.substr(48, 8));
    topic = "info";
  }

  emit('sample', { data: lifecycle, "topic": topic });
  emit('sample', { data: lifecycle, "topic": "lifecycle" });
}