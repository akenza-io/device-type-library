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
    if (payloadId === 1) {
      data.temperature = Bits.bitsToSigned(bits.substring(40, 56)) / 100;
    } else if (payloadId === 2) {
      emit("sample", {
        data: { temperature: Bits.bitsToSigned(bits.substring(40, 56)) / 100 },
        topic: "default",
      });
      data.tempHistory1 = Bits.bitsToSigned(bits.substring(56, 72)) / 100;
      data.tempHistory2 = Bits.bitsToSigned(bits.substring(72, 88)) / 100;
      data.tempHistory3 = Bits.bitsToSigned(bits.substring(88, 104)) / 100;
      data.tempHistory4 = Bits.bitsToSigned(bits.substring(104, 120)) / 100;
      data.tempHistory5 = Bits.bitsToSigned(bits.substring(120, 136)) / 100;
      data.tempHistory6 = Bits.bitsToSigned(bits.substring(136, 152)) / 100;
      data.tempHistory7 = Bits.bitsToSigned(bits.substring(152, 168)) / 100;
      topic = "history";
    }
  } else if (port === 100) {
    data.tempMeasurementRate = Bits.bitsToUnsigned(bits.substring(40, 56));
    data.historyTrigger = Bits.bitsToUnsigned(bits.substring(56, 64));
    data.tempThreshold = Bits.bitsToUnsigned(bits.substring(64, 72));
    data.tempOffset = Bits.bitsToSigned(bits.substring(72, 88)) / 100;
    topic = "config";
  } else if (port === 101) {
    data.appMainVersion = Bits.bitsToUnsigned(bits.substring(40, 48));
    data.appMinorVersion = Bits.bitsToUnsigned(bits.substring(48, 56));
    topic = "info";
  }

  if (port === 3 || port === 100 || port === 101) {
    emit("sample", { data, topic });
  }

  emit("sample", { data: lifecycle, topic: "lifecycle" });
}
