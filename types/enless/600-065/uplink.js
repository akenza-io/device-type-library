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

function readUInt16LE(bytes) {
  return bytes[0] + (bytes[1] << 8);
}

function readUInt24BE(bytes) {
  return (bytes[0] << 16) + (bytes[1] << 8) + bytes[2];
}

// --- Main function ---
function consume(event) {
  const payload = event.data?.payloadHex;
  if (!payload || typeof payload !== "string") {
    throw new Error("No payloadHex found in event.data");
  }

  if (payload.length !== 60) {
    throw new Error(
      `Invalid payload length. Received payload length: ${payload.length}. Expected 60 hex characters (30 bytes).`
    );
  }

  if (!/^[0-9a-fA-F]+$/.test(payload)) {
    throw new Error("Invalid payload. Only hexadecimal digits are allowed.");
  }

  const bytes = parseHexString(payload);
  if (bytes.length !== 30) {
    throw new Error(
      `Unsupported payload length: ${bytes.length} bytes. Expected 30.`
    );
  }

  const decoded = {};
  const lifecycle = {};

  // --- Identification ---
  decoded.id = readUInt24BE(bytes.slice(0, 3));
  decoded.type = bytes[3];
  decoded.seq_counter = bytes[4];
  decoded.fw_version = bytes[5] & 0x3F;

  // --- Measurements ---
  decoded.window_count = readUInt16BE(bytes.slice(16, 18));

  // --- Device status (octets 28–29) ---
  const status = readUInt16LE(bytes.slice(28, 30));
  const batteryBits = (status >> 2) & 0x03;
  const batteryLevels = ["100%", "75%", "50%", "25%"];
  lifecycle.batteryLevel = batteryLevels[batteryBits] || "unknown";

  decoded.msg_type = (status & 0x01) ? "alarm" : "normal";
  decoded.rbe = Boolean((status >> 9) & 0x01);         // Bit 9
  decoded.window_opened = Boolean((status >> 5) & 0x01); // Bit 5

  // --- Emit to Akenza topics ---
  emit("sample", { data: lifecycle, topic: "lifecycle" });
  emit("sample", { data: decoded, topic: "default" });
}
