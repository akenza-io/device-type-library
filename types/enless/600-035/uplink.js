// --- HEX TO BYTE ARRAY ---
function parseHexString(str) {
  const result = [];
  for (let i = 0; i < str.length; i += 2) {
    result.push(parseInt(str.substr(i, 2), 16));
  }
  return result;
}

// --- INT/UINT HELPERS ---
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

// --- PARSE ALARM STATUS (2 bytes LE) ---
function parseAlarmStatus(bytes) {
  const alarmStatus = readUInt16LE(bytes);
  return {
    current_high: Boolean(alarmStatus & 0x0001),
    current_low: Boolean(alarmStatus & 0x0002),
  };
}

// --- PARSE BATTERY LEVEL (bits 3-2) ---
function parseBatteryLevel(bytes) {
  const status = readUInt16LE(bytes);
  const batteryBits = (status >> 2) & 0x03;
  const batteryLevels = ["100%", "75%", "50%", "25%"];
  return batteryLevels[batteryBits] || "unknown";
}

// --- PARSE MESSAGE TYPE (bit 0) ---
function parseMsgType(bytes) {
  const status = readUInt16LE(bytes);
  return (status & 0x01) ? "alarm" : "normal";
}

// --- PARSE FIRMWARE VERSION (last 6 bits of 1 byte) ---
function parseFwVersion(byte) {
  return byte & 0x3F;
}

// --- MAIN DECODER FUNCTION ---
function consume(event) {
  const payload = event.data.payloadHex;
  const bytes = parseHexString(payload);

  if (bytes.length !== 12) { // 24 hex chars = 12 bytes
    throw new Error("Invalid payload length: " + bytes.length + " bytes. Expected 12 bytes.");
  }

  const decoded = {};
  const lifecycle = {};

  // ID (3 bytes, first 6 hex chars)
  decoded.id = parseInt(payload.substring(0, 6), 16);

  // Type (1 byte)
  decoded.type = bytes[3];

  // Sequence Counter (1 byte)
  decoded.seq_counter = bytes[4];

  // Firmware Version (1 byte, last 6 bits)
  decoded.fw_version = parseFwVersion(bytes[5]);

  // Current (2 bytes UInt16 BE, divided by 1000)
  decoded.current_mA = readUInt16BE(bytes.slice(6, 8)) / 1000;

  // Alarm Status (2 bytes LE)
  decoded.alarm_status = parseAlarmStatus(bytes.slice(8, 10));

  // Battery Level & Message Type (2 bytes LE)
  lifecycle.batteryLevel = parseBatteryLevel(bytes.slice(10, 12));
  decoded.msg_type = parseMsgType(bytes.slice(10, 12));

  // Emit samples
  emit("sample", { data: lifecycle, topic: "lifecycle" });
  emit("sample", { data: decoded, topic: "default" });
}
