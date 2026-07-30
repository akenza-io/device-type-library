function consume(event) {
  const payload = event.data.payloadHex;
  const bits = Bits.hexToBits(payload);
  const data = {};
  const lifecycle = {};

  data.open = !!Bits.bitsToUnsigned(bits.substring(0, 8));

  let batteryVoltage = Bits.bitsToUnsigned(bits.substring(12, 16));
  batteryVoltage = (25 + batteryVoltage) / 10;
  lifecycle.batteryVoltage = Math.round(batteryVoltage * 10) / 10;

  let batteryLevel =
    Math.round((lifecycle.batteryVoltage - 3.1) / 0.005 / 10) * 10; // 3.1V - 3.6V
  if (batteryLevel > 100) {
    batteryLevel = 100;
  } else if (batteryLevel < 0) {
    batteryLevel = 0;
  }
  lifecycle.batteryLevel = batteryLevel;

  data.temperature = Bits.bitsToUnsigned(bits.substring(17, 24));
  data.temperature -= 32;

  data.humidity = Bits.bitsToUnsigned(bits.substring(25, 32));

  data.co2 = Hex.hexLittleEndianToBigEndian(payload.substring(8, 12), false);
  data.voc = Hex.hexLittleEndianToBigEndian(payload.substring(12, 16), false);

  emit("sample", { data, topic: "default" });
  emit("sample", { data: lifecycle, topic: "lifecycle" });
}
