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

function readUInt32BE(bytes) {
  return (bytes[0] << 24) + (bytes[1] << 16) + (bytes[2] << 8) + bytes[3];
}

function readUInt16LE(bytes) {
  return bytes[0] + (bytes[1] << 8);
}

// --- MAIN FUNCTION ---
function consume(event) {
  const payload = event.data.payloadHex;
  const bytes = parseHexString(payload);

  if (bytes.length !== 22) {
    throw new Error(
      "Invalid payload length: " +
        bytes.length +
        " bytes, expected 22 bytes."
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
  lifecycle.fwVersion = bytes[5] & 0x3F;

  // --- Pulse Counters (UInt32 BE) ---
  decoded.pulseCh1 = readUInt32BE(bytes.slice(6, 10));
  decoded.pulseCh2 = readUInt32BE(bytes.slice(10, 14));
  decoded.pulseOC  = readUInt32BE(bytes.slice(14, 18));

  // --- Alarm Status (Little Endian) ---
  const alarmStatus = readUInt16LE(bytes.slice(18, 20));
  alarm.pulseCh1FlowHigh = Boolean(alarmStatus & 0x0001);
  alarm.pulseCh2FlowHigh = Boolean(alarmStatus & 0x0002);
  alarm.pulseOCFlowHigh  = Boolean(alarmStatus & 0x0004);
  alarm.pulseCh1FlowLow  = Boolean(alarmStatus & 0x0010);
  alarm.pulseCh2FlowLow  = Boolean(alarmStatus & 0x0020);
  alarm.pulseOCFlowLow   = Boolean(alarmStatus & 0x0040);
  alarm.pulseCh1Leak     = Boolean(alarmStatus & 0x0100);
  alarm.pulseCh2Leak     = Boolean(alarmStatus & 0x0200);
  alarm.pulseOCLeak      = Boolean(alarmStatus & 0x0400);

  // --- States (Little Endian) ---
  const state = readUInt16LE(bytes.slice(20, 22));
  decoded.pulseCh1 = (state & 0x0020) ? "closed" : "open";
  decoded.pulseCh2 = (state & 0x0040) ? "closed" : "open";
  decoded.pulseOC  = (state & 0x0080) ? "closed" : "open";
  decoded.debounce1 = Boolean(state & 0x0100);
  decoded.debounce2 = Boolean(state & 0x0200);
  decoded.debounce3 = Boolean(state & 0x0400);

  // --- Status: Battery & Msg Type ---
  const batteryBits = (state >> 2) & 0x03;
  const batteryLevels = [100, 75, 50, 25]; // %
  lifecycle.batteryLevel = batteryLevels[batteryBits] || null;

  decoded.msgType = (state & 0x01) ? "alarm" : "normal";

  // --- Emit Results ---
  emit("sample", { data: lifecycle, topic: "lifecycle" });
  emit("sample", { data: decoded, topic: "default" });
  emit("sample", { data: alarm, topic: "alarm" });
}
