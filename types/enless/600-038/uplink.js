// --- HEX TO BYTE ARRAY ---
function parseHexString(str) {
  const result = [];
  for (let i = 0; i < str.length; i += 2) {
    result.push(parseInt(str.substr(i, 2), 16));
  }
  return result;
}

// --- READ HELPERS ---
function readUInt16LE(bytes) {
  return bytes[0] + (bytes[1] << 8);
}

function readUInt32BE(bytes) {
  return (
    (bytes[0] * 0x1000000) +
    (bytes[1] << 16) +
    (bytes[2] << 8) +
    bytes[3]
  );
}

// --- MAIN FUNCTION ---
function consume(event) {
  const payload = event.data.payloadHex;
  const bytes = parseHexString(payload);

  if (bytes.length !== 22) {
    throw new Error(
      "Invalid payload length: " +
        bytes.length +
        " bytes, expected 22 bytes (44 hex chars)."
    );
  }

  const lifecycle = {};
  const decoded = {};

  // --- ID (3 bytes) ---
  lifecycle.id = parseInt(payload.substring(0, 6), 16);

  // --- Type ---
  lifecycle.type = bytes[3];

  // --- Sequence Counter ---
  lifecycle.seqCounter = bytes[4];

  // --- Firmware Version ---
  lifecycle.fwVersion = bytes[5] & 0x3F;

  // --- Pulse counter OC ---
  decoded.pulseOc = readUInt32BE(bytes.slice(14, 18));

  // --- Status: Battery & Msg Type (bytes 20-21) ---
  const status = readUInt16LE(bytes.slice(20, 22));
  const batteryBits = (status >> 2) & 0x03;
  const batteryLevels = [100, 75, 50, 25]; // %
  lifecycle.batteryLevel = batteryLevels[batteryBits] || null;

  decoded.msgType = (status & 0x01) ? "alarm" : "normal";

  // --- Emit results ---
  emit("sample", { data: lifecycle, topic: "lifecycle" });
  emit("sample", { data: decoded, topic: "default" });
}
