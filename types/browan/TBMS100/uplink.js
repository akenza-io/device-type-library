function consume(event) {
  const payload = event.data.payloadHex;
  const bits = Bits.hexToBits(payload);
  const data = {};
  const lifecycle = {};

  data.motion = !!Number(bits.substr(7, 1));

  lifecycle.voltage = Bits.bitsToUnsigned(bits.substr(12, 4));
  lifecycle.voltage = (25 + lifecycle.voltage) / 10;
  lifecycle.voltage = Math.round(lifecycle.voltage * 10) / 10;

  let batteryLevel = Math.round((lifecycle.voltage - 3.1) / 0.005 / 10) * 10; // 3.1V - 3.6V
  if (batteryLevel > 100) {
    batteryLevel = 100;
  } else if (batteryLevel < 0) {
    batteryLevel = 0;
  }
  lifecycle.batteryLevel = batteryLevel;

  data.temperature = Bits.bitsToUnsigned(bits.substr(17, 7));
  data.temperature -= 32;

  data.time = Hex.hexLittleEndianToBigEndian(payload.substr(6, 4), false);
  data.count = Hex.hexLittleEndianToBigEndian(payload.substr(10, 6), false);

  emit("sample", { data: lifecycle, topic: "lifecycle" });
  emit("sample", { data, topic: "default" });
}
