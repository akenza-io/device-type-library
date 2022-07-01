function consume(event) {
  const payload = event.data.payloadHex;
  const data = {};
  // 0-2 Channel Number
  // 2-4 Measurement ID
  data.temperature =
    Hex.hexLittleEndianToBigEndian(payload.substr(6, 8), true) / 1000;
  // 14-16 Channel Number
  // 16-20 Measurement ID
  data.soilHumidity =
    Hex.hexLittleEndianToBigEndian(payload.substr(20, 8), true) / 1000;

  emit("sample", { data, topic: "default" });
}
