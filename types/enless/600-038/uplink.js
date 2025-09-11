// --- HEX TO BYTE ARRAY ---
function parseHexString(str) {
  const result = [];
  for (let i = 0; i < str.length; i += 2) {
    result.push(parseInt(str.substr(i, 2), 16));
  }
  return result;
}

// --- INT/UINT HELPERS ---
function readUInt16LE(bytes) {
  return bytes[0] + (bytes[1] << 8);
}

function readUInt32BE(bytes) {
  return (bytes[0] * 0x1000000) + (bytes[1] << 16) + (bytes[2] << 8) + bytes[3];
}

// --- MAIN FUNCTION ---
function consume(event) {
  const payload = event.data.payloadHex;
  const bytes = parseHexString(payload);

  if (bytes.length !== 22) {
    throw new Error("Invalid payload length: " + bytes.length + " bytes. Expected 22 bytes (44 hex chars).");
  }

  const decoded = {};
  const lifecycle = {};

  // Transmitter ID (3 bytes)
  decoded.id = parseInt(payload.substring(0, 6), 16);

  // Type (1 byte)
  decoded.type = bytes[3];

  // Sequence counter (1 byte)
  decoded.seq_counter = bytes[4];

  // Firmware version (1 byte, last 6 bits)
  decoded.fw_version = bytes[5] & 0x3F;


  // pulse_oc (bytes 14–17)
  decoded.pulse_oc = readUInt32BE(bytes.slice(14, 18));

  // Status (bytes 20–21)
  const status = readUInt16LE(bytes.slice(20, 22));

  // Battery Level (bits 3–2)
  const batteryBits = (status >> 2) & 0x03;
  const batteryLevels = ["100%", "75%", "50%", "25%"];
  lifecycle.batteryLevel = batteryLevels[batteryBits] || "unknown";

  // Msg Type (bit 0)
  decoded.msg_type = (status & 0x01) ? "alarm" : "normal";

  // Emit
  emit("sample", { data: lifecycle, topic: "lifecycle" });
  emit("sample", { data: decoded, topic: "default" });
}
