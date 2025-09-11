// --- HEX TO BYTE ARRAY ---
function parseHexString(str) {
  const result = [];
  for (let i = 0; i < str.length; i += 2) {
    result.push(parseInt(str.substr(i, 2), 16));
  }
  return result;
}

// --- READ INT/UINT HELPERS (Big Endian) ---
function readUInt16BE(bytes) {
  return (bytes[0] << 8) + bytes[1];
}

function readInt16BE(bytes) {
  const val = readUInt16BE(bytes);
  return val > 0x7fff ? val - 0x10000 : val;
}

// --- READ UINT16 LITTLE ENDIAN (pour alarm & status) ---
function readUInt16LE(bytes) {
  return bytes[0] + (bytes[1] << 8);
}

// --- PARSE ALARM STATUS ---
function parseAlarmStatus(bytes) {
  const alarmStatus = readUInt16LE(bytes);
  return {
    temperature_high: Boolean(alarmStatus & 0x0001),
    temperature_low: Boolean(alarmStatus & 0x0002),
  };
}

// --- MAIN FUNCTION ---
function consume(event) {
  const payload = event.data.payloadHex;
  const bytes = parseHexString(payload);

  if (bytes.length !== 14) {
    throw new Error("Invalid payload length: " + bytes.length + ", expected 14 bytes.");
  }

  const decoded = {};
  const lifecycle = {};

  // ID (3 bytes)
  decoded.id = parseInt(payload.substring(0, 6), 16);

  // Type (1 byte)
  decoded.type = bytes[3];

  // Sequence Counter (1 byte)
  decoded.seq_counter = bytes[4];

  // Firmware Version (bits 5-0)
  decoded.fw_version = bytes[5] & 0x3F;

  // Temperature (2 bytes Int16 BE / 10)
  decoded.temperature = readInt16BE(bytes.slice(6, 8)) / 10;

  // Alarm Status (2 bytes LITTLE ENDIAN)
  decoded.alarm_status = parseAlarmStatus(bytes.slice(10, 12));

  // Battery & Msg Type (2 bytes LITTLE ENDIAN)
  const status = readUInt16LE(bytes.slice(12, 14));
  const batteryBits = (status >> 2) & 0x03;
  const batteryLevels = ["100%", "75%", "50%", "25%"];
  lifecycle.batteryLevel = batteryLevels[batteryBits] || "unknown";

  decoded.msg_type = (status & 0x01) ? "alarm" : "normal";

  // Emit
  emit("sample", { data: lifecycle, topic: "lifecycle" });
  emit("sample", { data: decoded, topic: "default" });
}
