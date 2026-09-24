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

  if (port === 102 && payload.length === 16) {
    data.motion = !!Number(bits.substring(7, 8));

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

    data.time = Hex.hexLittleEndianToBigEndian(payload.substring(6, 10), false);
    data.count = Hex.hexLittleEndianToBigEndian(payload.substring(10, 16), false);

    emit("sample", { data: lifecycle, topic: "lifecycle" });
    emit("sample", { data, topic: "default" });
  } else if (port === 204 && payload.length === 32) {
    data.reportInterval = Hex.hexLittleEndianToBigEndian(payload.substring(2, 6), false);
    data.occupiedOverride = Hex.hexLittleEndianToBigEndian(payload.substring(8, 12), false);
    data.freeDetection = Hex.hexLittleEndianToBigEndian(payload.substring(14, 16), false);
    data.triggerCount = Hex.hexLittleEndianToBigEndian(payload.substring(18, 22), false);
    data.pirParameter = hexToLittleBigEndian(payload.substring(24, 32));

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
