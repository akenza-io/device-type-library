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

function readUInt64BE(bytes) {
  const high = readUInt32BE(bytes.slice(0, 4));
  const low = readUInt32BE(bytes.slice(4, 8));
  return (BigInt(high) << 32n) + BigInt(low);
}

// --- Main function ---
function consume(event) {
  const payload = event.data.payloadHex;
  const bytes = parseHexString(payload);
  const decoded = {};
  const lifecycle = {};

  const len = bytes.length;

  if (len !== 30) {
    throw new Error(`Unsupported payload length: ${len} bytes. Expected 30.`);
  }

  // --- Identification ---
  decoded.id = readUInt24BE(bytes.slice(0, 3));
  decoded.type = bytes[3];
  decoded.seq_counter = bytes[4];
  decoded.fw_version = bytes[5] & 0x3F;

  // --- Measurements ---
  decoded.temperature = readInt16BE(bytes.slice(6, 8)) / 10;
  decoded.humidity = readUInt16BE(bytes.slice(10, 12)) / 10;

  // PIR Count: octets 33–36 → index 32–35
  decoded.pir_count = readUInt16BE(bytes.slice(16, 18));

  // Luminosity: 8 octets à partir de l’index 44
  decoded.luminosity = readUInt32BE(bytes.slice(22, 26)).toString(); 

  // --- Alarm status ---
  const alarm = readUInt16LE(bytes.slice(26, 28));
  decoded.alarm_status = {
    temperature_high: Boolean(alarm & 0x0001),
    temperature_low: Boolean(alarm & 0x0002),
    humidity_high: Boolean(alarm & 0x0004),
    humidity_low: Boolean(alarm & 0x0008),
    motion_guard: Boolean(alarm & 0x0100),
  };

  // --- Device status ---
  const status = readUInt16LE(bytes.slice(28, 30));
  const batteryBits = (status >> 2) & 0x03;
  const batteryLevels = ["100%", "75%", "50%", "25%"];
  lifecycle.batteryLevel = batteryLevels[batteryBits] || "unknown";

  decoded.msg_type = (status & 0x01) ? "alarm" : "normal";
  decoded.rbe = Boolean((status >> 9) & 0x01);                // Bit 9
  decoded.movement_detected = Boolean((status >> 5) & 0x01);  // Bit 5

  // --- Emit to Akenza topics ---
  emit("sample", { data: lifecycle, topic: "lifecycle" });
  emit("sample", { data: decoded, topic: "default" });
}
