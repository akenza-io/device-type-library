function hexToLittleBigEndian(hex) {
  const hexArray = [];
  let tempHex = hex;
  while (tempHex.length >= 2) {
    hexArray.push(tempHex.substring(0, 2));
    tempHex = tempHex.substring(2, tempHex.length);
  }
  hexArray.reverse();
  return hexArray.join("");
}

function consume(event) {
  const payload = event.data.payloadHex;
  const { port } = event.data;
  const bits = Bits.hexToBits(payload);
  const data = {};
  const lifecycle = {};

  if (port === 106 && payload.length === 8) {
    data.waterleak = !!Bits.bitsToUnsigned(bits.substring(7, 8));

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

    emit("sample", { data: lifecycle, topic: "lifecycle" });
    emit("sample", { data, topic: "default" });
  } else if (port === 204 && payload.length === 20) {
    data.keepaliveInterval = Hex.hexLittleEndianToBigEndian(payload.substring(2, 6), false);
    data.temperatureDelta = Hex.hexLittleEndianToBigEndian(payload.substring(8, 10), true);
    data.humidityDelta = Hex.hexLittleEndianToBigEndian(payload.substring(12, 14), false);
    data.sensorDetectionInterval = Hex.hexLittleEndianToBigEndian(payload.substring(16, 20), false);

    emit("sample", { data, topic: "config" });
  } else if (port === 222 && payload.length === 34) { // Frame count 0
    data.commandId = payload.substring(0, 2);
    data.bootloader = hexToLittleBigEndian(payload.substring(2, 10));
    data.hwId = hexToLittleBigEndian(payload.substring(10, 18));
    data.crc = hexToLittleBigEndian(payload.substring(18, 26));
    data.pupKeyId = hexToLittleBigEndian(payload.substring(26, 34));

    emit("sample", { data, topic: "system" });
  }
}