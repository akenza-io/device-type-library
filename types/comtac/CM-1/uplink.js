function consume(event) {
  const payload = event.data.payloadHex;
  const bits = Bits.hexToBits(payload);
  const data = {};
  const defaultData = {};

  data.maxTempOn = !!Bits.bitsToUnsigned(bits.substr(0, 1));
  data.minTempOn = !!Bits.bitsToUnsigned(bits.substr(1, 1));
  // reserved
  data.txOnEvent = !!Bits.bitsToUnsigned(bits.substr(3, 1));
  data.maxHumOn = !!Bits.bitsToUnsigned(bits.substr(4, 1));
  data.minHumOn = !!Bits.bitsToUnsigned(bits.substr(5, 1));
  // reserved
  data.booster = !!Bits.bitsToUnsigned(bits.substr(7, 1));

  data.minTempThreshold = Bits.bitsToSigned(bits.substr(8, 8));
  data.maxTempThreshold = Bits.bitsToSigned(bits.substr(16, 8));
  data.minHumThreshold = Bits.bitsToSigned(bits.substr(24, 8));
  data.maxHumThreshold = Bits.bitsToSigned(bits.substr(32, 8));
  data.sendInterval = Bits.bitsToUnsigned(bits.substr(40, 16));
  data.voltage = parseFloat(
    (Bits.bitsToUnsigned(bits.substr(56, 16)) / 1000).toFixed(2),
  );
  emit("sample", { data, topic: "lifecycle" });

  defaultData.temperature = Number(
    (Bits.bitsToSigned(bits.substr(72, 16)) / 100).toFixed(1),
  );
  defaultData.humidity = Number(
    (Bits.bitsToSigned(bits.substr(88, 16)) / 100).toFixed(0),
  );
  emit("sample", { data: defaultData, topic: "default" });

  if (data.txOnEvent === true) {
    emit("sample", { data: { buttonPressed: true }, topic: "button_pressed" });
  }
}
