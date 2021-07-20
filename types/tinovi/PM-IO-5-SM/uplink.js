const bytesToInt = function (byteArray, dev) {
  let value = 0;
  for (let i = 0; i < byteArray.length; i++) {
    value = value * 256 + byteArray[i];
  }
  return value / dev;
};
const bytesToSignedInt = function (bytes, dev) {
  const sign = bytes[0] & (1 << 7);
  let x = ((bytes[0] & 0xff) << 8) | (bytes[1] & 0xff);
  if (sign) {
    x = 0xffff0000 | x;
  }
  return x / dev;
};

function parseHexString(str) {
  let tempStr = str;
  const result = [];
  while (tempStr.length >= 2) {
    result.push(parseInt(tempStr.substring(0, 2), 16));
    tempStr = tempStr.substring(2, tempStr.length);
  }

  return result;
}

function consume(event) {
  const bytes = parseHexString(event.data.payloadHex);
  const decoded = {};
  const lifecycle = {};

  let pos = 1;
  decoded.valve = !!((bytes[0] >> 7) & 1);
  decoded.leakDetected = !!((bytes[0] >> 6) & 1);
  lifecycle.batteryLevel = bytes[pos++];
  if (((bytes[0] >> 0) & 1) === 1) {
    // 1st SOIL sensor
    decoded.e25 = bytesToInt(bytes.slice(pos, pos + 2), 100);
    pos += 2;
    decoded.soilConductivity = bytesToInt(bytes.slice(pos, pos + 2), 10);
    pos += 2;
    decoded.temperature = bytesToSignedInt(bytes.slice(pos, pos + 2), 100);
    pos += 2;
    decoded.waterContent = bytesToInt(bytes.slice(pos, pos + 2), 1);
    pos += 2;
  }
  if (((bytes[0] >> 1) & 1) === 1) {
    // BME280
    decoded.airTemperature = bytesToSignedInt(bytes.slice(pos, pos + 2), 100);
    pos += 2;
    decoded.airHumidity = bytesToInt(bytes.slice(pos, pos + 2), 100);
    pos += 2;
    decoded.airPressure = bytesToInt(bytes.slice(pos, pos + 2), 1) + 50000;
    pos += 2;
  }
  if (((bytes[0] >> 2) & 1) === 1) {
    // OPT3001
    decoded.lux = bytesToInt(bytes.slice(pos, pos + 4), 100);
    pos += 4;
  }
  if (((bytes[0] >> 4) & 1) === 1) {
    // PULSE
    decoded.pulse = bytesToInt(bytes.slice(pos, pos + 4), 1);
    pos += 4;
  }
  if (((bytes[0] >> 3) & 1) === 1) {
    // 2nd soil sensor
    decoded.e251 = bytesToInt(bytes.slice(pos, pos + 2), 100);
    pos += 2;
    decoded.soilConductivity1 = bytesToInt(bytes.slice(pos, pos + 2), 10);
    pos += 2;
    decoded.temperature1 = bytesToSignedInt(bytes.slice(pos, pos + 2), 100);
    pos += 2;
    decoded.waterContent1 = bytesToInt(bytes.slice(pos, pos + 2), 1);
    pos += 2;
  }

  emit("sample", { data: decoded, topic: "default" });
  emit("sample", { data: lifecycle, topic: "lifecycle" });
}
