function consume(event) {
  const payload = event.data.payloadHex;
  const bytes = Hex.hexToBytes(payload);
  const data = {};
  const lifecycle = {};

  const ext = bytes[2] & 0x0f;
  lifecycle.batteryVoltage = (((bytes[0] << 8) | bytes[1]) & 0x3fff) / 1000;
  let batteryLevel =
    Math.round((lifecycle.batteryVoltage - 2.45) / 0.0115 / 10) * 10;

  if (batteryLevel > 100) {
    batteryLevel = 100;
  } else if (batteryLevel < 0) {
    batteryLevel = 0;
  }
  lifecycle.batteryLevel = batteryLevel;

  if (ext === 0x01) {
    data.channel1temp = parseFloat(
      ((((bytes[3] << 24) >> 16) | bytes[4]) / 100).toFixed(2),
    );
    data.channel2temp = parseFloat(
      ((((bytes[5] << 24) >> 16) | bytes[6]) / 100).toFixed(2),
    );
  } else if (ext === 0x02) {
    data.channel1temp = parseFloat(
      ((((bytes[3] << 24) >> 16) | bytes[4]) / 10).toFixed(1),
    );
    data.channel2temp = parseFloat(
      ((((bytes[5] << 24) >> 16) | bytes[6]) / 10).toFixed(1),
    );
  } else if (ext === 0x03) {
    data.channel1res = parseFloat(
      (((bytes[3] << 8) | bytes[4]) / 100).toFixed(2),
    );
    data.channel2res = parseFloat(
      (((bytes[5] << 8) | bytes[6]) / 100).toFixed(2),
    );
  }

  emit("sample", { data, topic: "default" });
  emit("sample", { data: lifecycle, topic: "lifecycle" });
}
