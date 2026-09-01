function consume(event) {
  const payload = event.data.payloadHex;
  const { port } = event.data;
  const bits = Bits.hexToBits(payload);
  const data = {};
  const lifecycle = {};
  let topic = "default";

  // Version 8

  // Status
  // reserved x2
  lifecycle.batLow = !!Bits.bitsToUnsigned(bits.substring(10, 11));
  lifecycle.lastTempValid = !!Bits.bitsToUnsigned(bits.substring(11, 12));
  lifecycle.extMEM = !!Bits.bitsToUnsigned(bits.substring(12, 13));
  lifecycle.acc = !!Bits.bitsToUnsigned(bits.substring(13, 14));
  lifecycle.tempI2C = !!Bits.bitsToUnsigned(bits.substring(14, 15));
  lifecycle.tempPt100 = !!Bits.bitsToUnsigned(bits.substring(15, 16));

  // Event
  // reserved x2
  lifecycle.infoReq = !!Bits.bitsToUnsigned(bits.substring(18, 19));
  lifecycle.configRX = !!Bits.bitsToUnsigned(bits.substring(19, 20));
  lifecycle.button = !!Bits.bitsToUnsigned(bits.substring(20, 21));
  lifecycle.alarming = !!Bits.bitsToUnsigned(bits.substring(21, 22));
  lifecycle.history = !!Bits.bitsToUnsigned(bits.substring(22, 23));
  lifecycle.async = !!Bits.bitsToUnsigned(bits.substring(23, 24));

  lifecycle.batteryLevel = Bits.bitsToUnsigned(bits.substring(24, 32)) / 2;

  if (port === 3) {
    const payloadId = Bits.bitsToUnsigned(bits.substring(32, 40));
    data.temperature = Bits.bitsToSigned(bits.substring(40, 56)) / 100;
    data.humidity = Bits.bitsToUnsigned(bits.substring(56, 64));

    if (payloadId === 4) {
      data.tempHistory1 = Bits.bitsToSigned(bits.substring(64, 80)) / 100;
      data.humHistory1 = Bits.bitsToSigned(bits.substring(80, 88));

      data.tempHistory2 = Bits.bitsToSigned(bits.substring(88, 104)) / 100;
      data.humHistory2 = Bits.bitsToSigned(bits.substring(104, 112));

      data.tempHistory3 = Bits.bitsToSigned(bits.substring(112, 128)) / 100;
      data.humHistory3 = Bits.bitsToSigned(bits.substring(128, 136));

      data.tempHistory4 = Bits.bitsToSigned(bits.substring(136, 152)) / 100;
      data.humHistory4 = Bits.bitsToSigned(bits.substring(152, 160));

      data.tempHistory5 = Bits.bitsToSigned(bits.substring(160, 176)) / 100;
      data.humHistory5 = Bits.bitsToSigned(bits.substring(176, 184));

      data.tempHistory6 = Bits.bitsToSigned(bits.substring(184, 200)) / 100;
      data.humHistory6 = Bits.bitsToSigned(bits.substring(200, 208));

      data.tempHistory7 = Bits.bitsToSigned(bits.substring(208, 224)) / 100;
      data.humHistory7 = Bits.bitsToSigned(bits.substring(224, 232));
      topic = "history";
    }
  } else if (port === 100) {
    data.measurementRate = Bits.bitsToUnsigned(bits.substring(32, 48));
    data.historyTrigger = Bits.bitsToUnsigned(bits.substring(48, 56));
    data.tempOffset = Bits.bitsToSigned(bits.substring(56, 72)) / 100;
    data.tempMax = Bits.bitsToSigned(bits.substring(72, 80));
    data.tempMin = Bits.bitsToSigned(bits.substring(80, 88));
    data.humOffset = Bits.bitsToUnsigned(bits.substring(88, 96));
    data.humMax = Bits.bitsToUnsigned(bits.substring(96, 104));
    data.humMin = Bits.bitsToUnsigned(bits.substring(104, 112));

    topic = "config";
  } else if (port === 101) {
    data.appMainVersion = Bits.bitsToUnsigned(bits.substring(40, 48));
    data.appMinorVersion = Bits.bitsToUnsigned(bits.substring(48, 56));
    topic = "info";
  }

  emit("sample", { data, topic });
  emit("sample", { data: lifecycle, topic: "lifecycle" });
}
