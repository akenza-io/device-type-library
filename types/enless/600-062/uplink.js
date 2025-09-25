function cToF(celsius) {
  return Math.round(((celsius * 9) / 5 + 32) * 10) / 10;
}

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

function readUInt32BE(bytes) {
  return (
    (bytes[0] << 24) |
    (bytes[1] << 16) |
    (bytes[2] << 8) |
    bytes[3]
  ) >>> 0; // force unsigned
}

// --- Main function ---
function consume(event) {
  const payload = event.data.payloadHex;
  const bytes = parseHexString(payload);

  if (bytes.length !== 30) {
    throw new Error(`Unsupported payload length: ${bytes.length} bytes. Expected 30.`);
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
  lifecycle.batteryLevel = batteryLevels[batteryBits] ?? null;

  // --- Default ---
  const decoded = {};
  decoded.temperature = readInt16BE(bytes.slice(6, 8)) / 10;
  decoded.temperatureF = cToF(decoded.temperature);
  decoded.humidity = readUInt16BE(bytes.slice(10, 12)) / 10;
  decoded.pirCount = readUInt16BE(bytes.slice(16, 18));
  decoded.luminosity = readUInt32BE(bytes.slice(22, 26));

  decoded.msgType = (status & 0x01) ? "ALARM" : "NORMAL";
  decoded.rbe = Boolean((status >> 9) & 0x01);               // Bit 9
  decoded.movementDetected = Boolean((status >> 5) & 0x01);  // Bit 5

  // --- Alarm ---
  const alarmWord = readUInt16LE(bytes.slice(26, 28));
  const alarm = {
    temperatureHigh: Boolean(alarmWord & 0x0001),
    temperatureLow: Boolean(alarmWord & 0x0002),
    humidityHigh: Boolean(alarmWord & 0x0004),
    humidityLow: Boolean(alarmWord & 0x0008),
    motionGuard: Boolean(alarmWord & 0x0100),
  };

  // --- Emit ---
  emit("sample", { data: lifecycle, topic: "lifecycle" });
  emit("sample", { data: decoded, topic: "default" });
  emit("sample", { data: alarm, topic: "alarm" });
}
