// --- HEX TO BYTE ARRAY ---
function parseHexString(str) {
  const result = [];
  for (let i = 0; i < str.length; i += 2) {
    result.push(parseInt(str.substr(i, 2), 16));
  }
  return result;
}

// --- READ HELPERS ---
function readUInt16BE(bytes) {
  return (bytes[0] << 8) + bytes[1];
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

  lifecycle.id = parseInt(payload.substring(0, 6), 16);
  lifecycle.type = bytes[3];
  lifecycle.seqCounter = bytes[4];
  lifecycle.fwVersion = bytes[5] & 0x3F;

  decoded.pulseOc = readUInt32BE(bytes.slice(14, 18));

  // --- Status: Battery & Msg Type (Big Endian) ---
  const status = readUInt16BE(bytes.slice(20, 22));

  const batteryBits = (status >> 2) & 0x03;
  const batteryLevels = [100, 75, 50, 25];
  lifecycle.batteryLevel = batteryLevels[batteryBits] || null;

  decoded.msgType = (status & 0x01) ? "ALARM" : "NORMAL";

  emit("sample", { data: lifecycle, topic: "lifecycle" });
  emit("sample", { data: decoded, topic: "default" });
}