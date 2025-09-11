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

function readUInt32BE(bytes) {
  return (
    ((bytes[0] << 24) >>> 0) |
    ((bytes[1] << 16) >>> 0) |
    ((bytes[2] << 8) >>> 0) |
    (bytes[3] >>> 0)
  ) >>> 0;
}


function consume(event) {
  const payload = event.data && event.data.payloadHex;
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

  // --- Values ---
  decoded.window_count = readUInt16BE(bytes.slice(16, 18));

  // --- States ---
  const status = readUInt16BE(bytes.slice(28, 30));

  const batteryBits = (status >> 2) & 0x03;
  const batteryLevels = ["100%", "75%", "50%", "25%"];
  lifecycle.batteryLevel = batteryLevels[batteryBits] || "unknown";
  decoded.battery = lifecycle.batteryLevel;

  decoded.msg_type = (status & 0x01) ? "alarm" : "normal";
  decoded.rbe = Boolean((status >> 9) & 0x01);
  decoded.window_opened = Boolean((status >> 5) & 0x01);

  // --- Emit to Akenza topics ---
  emit("sample", { data: lifecycle, topic: "lifecycle" });
  emit("sample", { data: decoded, topic: "default" });
}
