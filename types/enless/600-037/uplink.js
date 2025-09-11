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

// Ajout helper pour UInt32 BE (4 octets)
function readUInt32BE(bytes) {
  return (bytes[0] * 0x1000000) + (bytes[1] << 16) + (bytes[2] << 8) + bytes[3];
}

// --- PARSE ALARM STATUS ---
function parseAlarmStatus(bytes) {
  const alarmStatus = readUInt16LE(bytes);
  return {
    pulse_ch1_flow_high: Boolean(alarmStatus & 0x0001),
    pulse_ch2_flow_high: Boolean(alarmStatus & 0x0002),
    pulse_oc_flow_high: Boolean(alarmStatus & 0x0004),
    pulse_ch1_flow_low: Boolean(alarmStatus & 0x0010),
    pulse_ch2_flow_low: Boolean(alarmStatus & 0x0020),
    pulse_oc_flow_low: Boolean(alarmStatus & 0x0040),
    pulse_ch1_leak: Boolean(alarmStatus & 0x0100),
    pulse_ch2_leak: Boolean(alarmStatus & 0x0200),
    pulse_oc_leak: Boolean(alarmStatus & 0x0400),
  };
}

// --- PARSE STATE ---
function parseState(bytes) {
  const state = readUInt16LE(bytes);
  return {
    pulse_ch1: (state & 0x0020) ? "closed" : "open",
    pulse_ch2: (state & 0x0040) ? "closed" : "open",
    pulse_oc: (state & 0x0080) ? "closed" : "open",
    debounce_1: Boolean(state & 0x0100),
    debounce_2: Boolean(state & 0x0200),
    debounce_3: Boolean(state & 0x0400),
  };
}

// --- MAIN FUNCTION ---
function consume(event) {
  const payload = event.data.payloadHex;
  const bytes = parseHexString(payload);

  if (bytes.length !== 44 / 2) {
    throw new Error("Invalid payload length: " + bytes.length + " bytes. Expected 22 bytes (44 hex chars).");
  }

  const decoded = {};
  const lifecycle = {};

  // ID (3 bytes)
  decoded.id = parseInt(payload.substring(0, 6), 16);

  // Type (1 byte)
  decoded.type = bytes[3];

  // Sequence Counter (1 byte)
  decoded.seq_counter = bytes[4];

  // Firmware Version (1 byte, last 6 bits)
  decoded.fw_version = bytes[5] & 0x3F;

  // Pulse counters (4 bytes each, UInt32 BE)
  decoded.pulse_ch1 = readUInt32BE(bytes.slice(6, 10));
  decoded.pulse_ch2 = readUInt32BE(bytes.slice(10, 14));
  decoded.pulse_oc = readUInt32BE(bytes.slice(14, 18));

  // Alarm status (2 bytes LE)
  decoded.alarm_status = parseAlarmStatus(bytes.slice(18, 20));

  // States (2 bytes LE)
  decoded.states = parseState(bytes.slice(20, 22));

  // Battery & Msg Type (2 bytes LE)
  const status = readUInt16LE(bytes.slice(20, 22)); // même que pour states (offset 20-21)
  const batteryBits = (status >> 2) & 0x03;
  const batteryLevels = ["100%", "75%", "50%", "25%"];
  lifecycle.batteryLevel = batteryLevels[batteryBits] || "unknown";

  decoded.msg_type = (status & 0x01) ? "alarm" : "normal";

  // Emit
  emit("sample", { data: lifecycle, topic: "lifecycle" });
  emit("sample", { data: decoded, topic: "default" });
}
