// --- Helpers ---
function parseHexString(str) {
  const result = [];
  for (let i = 0; i < str.length; i += 2) {
    result.push(parseInt(str.substr(i, 2), 16));
  }
  return result;
}

function readUInt16BE(bytes) {
  return (bytes[0] << 8) + bytes[1];
}

function readInt16BE(bytes) {
  const val = readUInt16BE(bytes);
  return val > 0x7fff ? val - 0x10000 : val;
}

function readUInt24BE(bytes) {
  return (bytes[0] << 16) + (bytes[1] << 8) + bytes[2];
}

// --- Main function ---
function consume(event) {
  const payload = event.data.payloadHex;
  const bytes = parseHexString(payload);

  const decoded = {};
  const lifecycle = {};
  const alarmStatus = {};

  const len = bytes.length;

  if (len === 30) {
    lifecycle.id = readUInt24BE(bytes.slice(0, 3));
    lifecycle.type = bytes[3];
    lifecycle.seqCounter = bytes[4];
    lifecycle.fwVersion = bytes[5] & 0x3F;

    decoded.temperature = readInt16BE(bytes.slice(6, 8)) / 10;
    decoded.humidity = readUInt16BE(bytes.slice(10, 12)) / 10;
    decoded.co2 = readUInt16BE(bytes.slice(12, 14));

    // Alarm status
    const alarm = readUInt16BE(bytes.slice(26, 28));

    alarmStatus.temperatureHigh = Boolean(alarm & 0x0001);
    alarmStatus.temperatureLow = Boolean(alarm & 0x0002);
    alarmStatus.humidityHigh = Boolean(alarm & 0x0004);
    alarmStatus.humidityLow = Boolean(alarm & 0x0008);
    alarmStatus.co2High = Boolean(alarm & 0x0010);
    alarmStatus.co2Low = Boolean(alarm & 0x0020);
    alarmStatus.motionGuard = Boolean(alarm & 0x0100);

    // Status
    const status = readUInt16BE(bytes.slice(28, 30));

    const batteryBits = (status >> 2) & 0x03;
    const batteryLevels = [100, 75, 50, 25];

    lifecycle.batteryLevel = batteryLevels[batteryBits] || null;

    decoded.msgType = (status & 0x01) ? "ALARM" : "NORMAL";
    decoded.co2Sampled = Boolean((status >> 6) & 0x01);
    decoded.ledOn = Boolean((status >> 9) & 0x01);
  } else {
    throw new Error(`Unsupported payload length: ${len} bytes. Expected 30.`);
  }

  emit("sample", { data: lifecycle, topic: "lifecycle" });
  emit("sample", { data: decoded, topic: "default" });
  emit("sample", { data: alarmStatus, topic: "alarm" });
}