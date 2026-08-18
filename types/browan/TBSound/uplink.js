function consume(event) {
  const payload = event.data.payloadHex;
  const { port } = event.data;
  const bits = Bits.hexToBits(payload);
  const data = {};
  const lifecycle = {};
  const topic = "default";
  
  if (port == 105 && payload.length === 8) {
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

    data.soundAvg = Bits.bitsToUnsigned(bits.substring(24, 32));

    emit("sample", { data: lifecycle, topic: "lifecycle" });
    emit("sample", { data, topic });
  }
}
