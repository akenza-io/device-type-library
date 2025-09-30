function cToF(celsius) {
  return Math.round(((celsius * 9) / 5 + 32) * 10) / 10;
}

// --- HEX TO BYTE ARRAY ---
function parseHexString(str) {
  const result = [];
  for (let i = 0; i < str.length; i += 2) {
    result.push(parseInt(str.substr(i, 2), 16));
  }
  return result;
}

// --- READ INT/UINT HELPERS ---
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

// --- MAIN FUNCTION ---
function consume(event) {
  const payload = event.data.payloadHex;
  const bytes = parseHexString(payload);

  if (bytes.length !== 14) {
    throw new Error(
      `Invalid payload length: ${bytes.length}, expected 14 bytes.`,
    );
  }

  const lifecycle = {};
  const decoded = {};
  const alarm = {};

  // --- ID (3 bytes → décimal) ---
  lifecycle.id = parseInt(payload.substring(0, 6), 16);

  // --- Type ---
  lifecycle.type = bytes[3];

  // --- Sequence Counter ---
  lifecycle.seqCounter = bytes[4];

  // --- Firmware Version (bits 5-0) ---
  lifecycle.fwVersion = bytes[5] & 0x3f;

  // --- Temperature (°C, Int16BE / 10) ---
  decoded.temperature = readInt16BE(bytes.slice(6, 8)) / 10;
  decoded.temperatureF = cToF(decoded.temperature);

  // --- Alarm Status (Little Endian) ---
  const alarmStatus = readUInt16LE(bytes.slice(10, 12));
  alarm.temperatureHigh = Boolean(alarmStatus & 0x0001);
  alarm.temperatureLow = Boolean(alarmStatus & 0x0002);

  // --- Status: Battery & Msg Type (Little Endian) ---
  const status = readUInt16LE(bytes.slice(12, 14));
  const batteryBits = (status >> 2) & 0x03;
  const batteryLevels = [100, 75, 50, 25]; // in percent
  lifecycle.batteryLevel = batteryLevels[batteryBits] || null;

  decoded.msgType = status & 0x01 ? "ALARM" : "NORMAL";

  // --- Emit Results ---
  emit("sample", { data: lifecycle, topic: "lifecycle" });
  emit("sample", { data: decoded, topic: "default" });
  emit("sample", { data: alarm, topic: "alarm" });
}
