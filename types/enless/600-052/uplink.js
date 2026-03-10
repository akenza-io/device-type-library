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

function readUInt16LE(bytes) {
  return bytes[0] + (bytes[1] << 8);
}

function readUInt24BE(bytes) {
  return (bytes[0] << 16) + (bytes[1] << 8) + bytes[2];
}

// --- Main function ---
function consume(event) {
  const payload = event.data.payloadHex;
  const bytes = parseHexString(payload);

  const len = bytes.length;

  if (len !== 30) {
    throw new Error(`Unsupported payload length: ${len} bytes. Expected 30.`);
  }

  // --- Lifecycle ---
  const lifecycle = {};
  lifecycle.id = readUInt24BE(bytes.slice(0, 3));
  lifecycle.type = bytes[3];
  lifecycle.seqCounter = bytes[4];
  lifecycle.fwVersion = bytes[5] & 0x3F;

  const status = readUInt16LE(bytes.slice(28, 30));
  const batteryBits = (status >> 2) & 0x03;
  const batteryLevels = [100, 75, 50, 25];
  lifecycle.batteryLevel = batteryLevels[batteryBits] || null;

  emit("sample", { data: lifecycle, topic: "lifecycle" });

  // --- Default ---
  const decoded = {};
  decoded.temperature = readInt16BE(bytes.slice(6, 8)) / 10;
  decoded.humidity = readUInt16BE(bytes.slice(10, 12)) / 10;

  decoded.msgType = (status & 0x01) ? "ALARM" : "NORMAL";
  decoded.rbe = Boolean((status >> 9) & 0x01);

  emit("sample", { data: decoded, topic: "default" });

  // --- Alarm ---
  const alarmVal = readUInt16LE(bytes.slice(26, 28));
  const alarm = {
    temperatureHigh: Boolean(alarmVal & 0x0001),
    temperatureLow: Boolean(alarmVal & 0x0002),
    humidityHigh: Boolean(alarmVal & 0x0004),
    humidityLow: Boolean(alarmVal & 0x0008),
    motionGuard: Boolean(alarmVal & 0x0100),
  };

  emit("sample", { data: alarm, topic: "alarm" });
}
