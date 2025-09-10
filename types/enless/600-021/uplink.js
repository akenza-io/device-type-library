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

  if (bytes.length !== 18) {
    throw new Error("Invalid payload length: " + bytes.length + ", expected 18 bytes.");
  }

  const decoded = {};
  const lifecycle = {};

  // --- ID (3 bytes) ---
  decoded.id = parseInt(payload.substring(0, 6), 16);

  // --- Type ---
  decoded.type = bytes[3];

  // --- Sequence Counter ---
  decoded.seq_counter = bytes[4];

  // --- Firmware Version (bits 5‑0) ---
  decoded.fw_version = bytes[5] & 0x3F;

  // --- Temperature (Big Endian / 10) ---
  decoded.temperature = readInt16BE(bytes.slice(6, 8)) / 10;

  // --- Humidity (Big Endian / 10) ---
  decoded.humidity = readUInt16BE(bytes.slice(8, 10)) / 10;

  // --- Alarm Status (Little Endian) ---
  const alarmStatus = readUInt16LE(bytes.slice(14, 16));
  decoded.alarm_status = {
    humidity_low: Boolean(alarmStatus & 0x0008),
    humidity_high: Boolean(alarmStatus & 0x0004),
    temperature_low: Boolean(alarmStatus & 0x0002),
    temperature_high: Boolean(alarmStatus & 0x0001)
  };

  // --- Battery & Message Type (Little Endian) ---
  const status = readUInt16LE(bytes.slice(16, 18));
  const batteryBits = (status >> 2) & 0x03;
  const batteryLevels = ["100%", "75%", "50%", "25%"];
  lifecycle.batteryLevel = batteryLevels[batteryBits] || "unknown";
  decoded.msg_type = (status & 0x01) ? "alarm" : "normal";

  // --- Emit ---
  emit("sample", { data: lifecycle, topic: "lifecycle" });
  emit("sample", { data: decoded, topic: "default" });
}
