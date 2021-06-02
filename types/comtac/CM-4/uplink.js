function consume(event) {
  const payload = event.data.payload_hex;
  const { port } = event.data;
  const bits = Bits.hexToBits(payload);
  const data = {};
  const lifecycle = {};
  let topic = "default";

  lifecycle.version = Bits.bitsToUnsigned(bits.substr(0, 8));

  // Status
  // reserved x2
  lifecycle.batLow = !!Bits.bitsToUnsigned(bits.substr(10, 1));
  lifecycle.lastTempValid = !!Bits.bitsToUnsigned(bits.substr(11, 1));
  lifecycle.extMEM = !!Bits.bitsToUnsigned(bits.substr(12, 1));
  lifecycle.acc = !!Bits.bitsToUnsigned(bits.substr(13, 1));
  lifecycle.tempI2C = !!Bits.bitsToUnsigned(bits.substr(14, 1));
  lifecycle.tempPt100 = !!Bits.bitsToUnsigned(bits.substr(15, 1));

  // Event
  // reserved x2
  lifecycle.infoReq = !!Bits.bitsToUnsigned(bits.substr(18, 1));
  lifecycle.configRX = !!Bits.bitsToUnsigned(bits.substr(19, 1));
  lifecycle.button = !!Bits.bitsToUnsigned(bits.substr(20, 1));
  lifecycle.alarming = !!Bits.bitsToUnsigned(bits.substr(21, 1));
  lifecycle.history = !!Bits.bitsToUnsigned(bits.substr(22, 1));
  lifecycle.async = !!Bits.bitsToUnsigned(bits.substr(23, 1));

  lifecycle.batteryLevel = Bits.bitsToUnsigned(bits.substr(24, 8)) / 2;

  if (port === 3) {
    const payloadId = Bits.bitsToUnsigned(bits.substr(32, 8));
    data.temperature = Bits.bitsToSigned(bits.substr(40, 16)) / 100;
    data.humidity = Bits.bitsToUnsigned(bits.substr(56, 8));

    if (payloadId === 4) {
      data.tempHistory1 = Bits.bitsToSigned(bits.substr(64, 16)) / 100;
      data.humHistory1 = Bits.bitsToSigned(bits.substr(80, 8));

      data.tempHistory2 = Bits.bitsToSigned(bits.substr(88, 16)) / 100;
      data.humHistory2 = Bits.bitsToSigned(bits.substr(104, 8));

      data.tempHistory3 = Bits.bitsToSigned(bits.substr(112, 16)) / 100;
      data.humHistory3 = Bits.bitsToSigned(bits.substr(128, 8));

      data.tempHistory4 = Bits.bitsToSigned(bits.substr(136, 16)) / 100;
      data.humHistory4 = Bits.bitsToSigned(bits.substr(152, 8));

      data.tempHistory5 = Bits.bitsToSigned(bits.substr(160, 16)) / 100;
      data.humHistory5 = Bits.bitsToSigned(bits.substr(176, 8));

      data.tempHistory6 = Bits.bitsToSigned(bits.substr(184, 16)) / 100;
      data.humHistory6 = Bits.bitsToSigned(bits.substr(200, 8));

      data.tempHistory7 = Bits.bitsToSigned(bits.substr(208, 16)) / 100;
      data.humHistory7 = Bits.bitsToSigned(bits.substr(224, 8));
      topic = "history";
    }
  } else if (port === 100) {
    data.measurementRate = Bits.bitsToUnsigned(bits.substr(32, 16));
    data.historyTrigger = Bits.bitsToUnsigned(bits.substr(48, 8));
    data.tempOffset = Bits.bitsToSigned(bits.substr(56, 16)) / 100;
    data.tempMax = Bits.bitsToSigned(bits.substr(72, 8));
    data.tempMin = Bits.bitsToSigned(bits.substr(80, 8));
    data.humOffset = Bits.bitsToUnsigned(bits.substr(88, 8));
    data.humMax = Bits.bitsToUnsigned(bits.substr(96, 8));
    data.humMin = Bits.bitsToUnsigned(bits.substr(104, 8));

    topic = "config";
  } else if (port === 101) {
    data.appMainVersion = Bits.bitsToUnsigned(bits.substr(40, 8));
    data.appMinorVersion = Bits.bitsToUnsigned(bits.substr(48, 8));
    topic = "info";
  }

  emit("sample", { data, topic });
  emit("sample", { data: lifecycle, topic: "lifecycle" });
}
