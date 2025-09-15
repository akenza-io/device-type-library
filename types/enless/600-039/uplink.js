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
  return (
    bytes[0] * 0x1000000 +
    (bytes[1] << 16) +
    (bytes[2] << 8) +
    bytes[3]
  );
}

// --- PARSE ALARM STATUS ---
function parseAlarmStatus(bytes) {
  const alarmStatus = readUInt16LE(bytes);
  return {
    ch1Alarm: Boolean(alarmStatus & 0x0001),
    ch2Alarm: Boolean(alarmStatus & 0x0002),
    ocAlarm:  Boolean(alarmStatus & 0x0004),
  };
}

// --- PARSE STATES (open/closed) ---
function parseStates(bytes) {
  const state = readUInt16LE(bytes);
  return {
    ch1State: (state & 0x0020) ? "closed" : "open",
    ch2State: (state & 0x0040) ? "closed" : "open",
    ocState:  (state & 0x0080) ? "closed" : "open"
  };
}

// --- MAIN FUNCTION ---
function consume(event) {
  const payload = event.data.payloadHex;
  const bytes = parseHexString(payload);

  if (bytes.length !== 22) {
    throw new Error(
      "Invalid payload length: " +
        bytes.length +
        " bytes. Expected 22 bytes (44 hex chars)."
    );
  }

  const lifecycle = {};
  const decoded = {};
  const alarm = {};

  // --- Lifecycle ---
  lifecycle.id = parseInt(payload.substring(0, 6), 16);
  lifecycle.type = bytes[3];
  lifecycle.seqCounter = bytes[4];
  lifecycle.fwVersion = bytes[5] & 0x3f;

  const status = readUInt16LE(bytes.slice(20, 22));
  const batteryBits = (status >> 2) & 0x03;
  const batteryLevels = [100, 75, 50, 25];
  lifecycle.batteryLevel = batteryLevels[batteryBits] || null;

  // --- Default (counters + states + msg type) ---
  decoded.ch1StateCounter = readUInt32BE(bytes.slice(6, 10));
  decoded.ch2StateCounter = readUInt32BE(bytes.slice(10, 14));
  decoded.ocStateCounter  = readUInt32BE(bytes.slice(14, 18));

  decoded.msgType = status & 0x01 ? "alarm" : "normal";

  // États des entrées
  Object.assign(decoded, parseStates(bytes.slice(20, 22)));

  // --- Alarm Status ---
  Object.assign(alarm, parseAlarmStatus(bytes.slice(18, 20)));

  // --- Emit ---
  emit("sample", { data: lifecycle, topic: "lifecycle" });
  emit("sample", { data: decoded, topic: "default" });
  emit("sample", { data: alarm, topic: "alarm" });
}
