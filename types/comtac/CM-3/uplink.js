function cToF(celsius) {
  return Math.round(((celsius * 9) / 5 + 32) * 10) / 10;
}

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
    if (payloadId === 1) {
      data.temperature = Bits.bitsToSigned(bits.substr(40, 16)) / 100;
      data.temperatureF = cToF(data.temperature);
    } else if (payloadId === 2) {
      emit("sample", {
        data: { temperature: Bits.bitsToSigned(bits.substr(40, 16)) / 100 },
        topic: "default",
      });
      data.tempHistory1 = Bits.bitsToSigned(bits.substr(56, 16)) / 100;
      data.tempHistory1F = cToF(data.tempHistory1);
      data.tempHistory2 = Bits.bitsToSigned(bits.substr(72, 16)) / 100;
      data.tempHistory2F = cToF(data.tempHistory2);
      data.tempHistory3 = Bits.bitsToSigned(bits.substr(88, 16)) / 100;
      data.tempHistory3F = cToF(data.tempHistory3);
      data.tempHistory4 = Bits.bitsToSigned(bits.substr(104, 16)) / 100;
      data.tempHistory4F = cToF(data.tempHistory4);
      data.tempHistory5 = Bits.bitsToSigned(bits.substr(120, 16)) / 100;
      data.tempHistory5F = cToF(data.tempHistory5);
      data.tempHistory6 = Bits.bitsToSigned(bits.substr(136, 16)) / 100;
      data.tempHistory6F = cToF(data.tempHistory6);
      data.tempHistory7 = Bits.bitsToSigned(bits.substr(152, 16)) / 100;
      data.tempHistory7F = cToF(data.tempHistory7);
      topic = "history";
    }
  } else if (port === 100) {
    data.tempMeasurementRate = Bits.bitsToUnsigned(bits.substr(40, 16));
    data.historyTrigger = Bits.bitsToUnsigned(bits.substr(56, 8));
    data.tempThreshold = Bits.bitsToUnsigned(bits.substr(64, 8));
    data.tempThresholdF = cToF(data.tempThreshold);
    data.tempOffset = Bits.bitsToSigned(bits.substr(72, 16)) / 100;
    data.tempOffsetF = cToF(data.tempOffset);
    topic = "config";
  } else if (port === 101) {
    data.appMainVersion = Bits.bitsToUnsigned(bits.substr(40, 8));
    data.appMinorVersion = Bits.bitsToUnsigned(bits.substr(48, 8));
    topic = "info";
  }

  if (port === 3 || port === 100 || port === 101) {
    emit("sample", { data, topic });
  }

  emit("sample", { data: lifecycle, topic: "lifecycle" });
}
