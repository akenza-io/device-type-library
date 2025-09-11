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

// --- Main function ---
function consume(event) {
  const payload = event.data.payloadHex;
  const bytes = parseHexString(payload);
  const decoded = {};
  const lifecycle = {};

  const len = bytes.length;

  if (len === 30) {
    // === Classic Frame ===

    decoded.id = readUInt24BE(bytes.slice(0, 3));
    decoded.type = bytes[3];
    decoded.seq_counter = bytes[4];
    decoded.fw_version = bytes[5] & 0x3F;

    decoded.temperature = readInt16BE(bytes.slice(6, 8)) / 10;
    decoded.humidity = readUInt16BE(bytes.slice(10, 12)) / 10;

    const alarm = readUInt16LE(bytes.slice(26, 28));
    decoded.alarm_status = {
      temperature_high: Boolean(alarm & 0x0001),
      temperature_low: Boolean(alarm & 0x0002),
      humidity_high: Boolean(alarm & 0x0004),
      humidity_low: Boolean(alarm & 0x0008),
      motion_guard: Boolean(alarm & 0x0100)  // Bit 9 = 0x0200 en hex
    };

    const status = readUInt16LE(bytes.slice(28, 30));
    const batteryBits = (status >> 2) & 0x03;
    const batteryLevels = ["100%", "75%", "50%", "25%"];
    lifecycle.batteryLevel = batteryLevels[batteryBits] || "unknown";
    decoded.msg_type = (status & 0x01) ? "alarm" : "normal";
    decoded.rbe = Boolean((status >> 9) & 0x01);

  } else if (len === 34) {
    // === Datalogging Frame ===

    decoded.id = readUInt24BE(bytes.slice(0, 3));
    decoded.type = bytes[3];
    decoded.seq_counter = bytes[4];
    decoded.fw_version = bytes[5] & 0x3F;

    for (let i = 0; i < 12; i++) {
      const offset = 6 + i * 2;
      const temp = bytes[offset];
      const hum = bytes[offset + 1];
      decoded[`temperature_t-${i * 5}`] = temp;
      decoded[`humidity_t-${i * 5}`] = hum;
    }

    const alarm = readUInt16LE(bytes.slice(30, 32));
    decoded.alarm_status = {
      temperature_high: Boolean(alarm & 0x0001),
      temperature_low: Boolean(alarm & 0x0002),
      humidity_high: Boolean(alarm & 0x0004),
      humidity_low: Boolean(alarm & 0x0008),
      motion_guard: Boolean(alarm & 0x0100)  // Bit 9 = 0x0200 en hex
    };

    const status = readUInt16LE(bytes.slice(32, 34));
    const batteryBits = (status >> 2) & 0x03;
    const batteryLevels = ["100%", "75%", "50%", "25%"];
    lifecycle.batteryLevel = batteryLevels[batteryBits] || "unknown";
    decoded.msg_type = (status & 0x01) ? "alarm" : "normal";
    decoded.rbe = Boolean((status >> 9) & 0x01);

  } else {
    throw new Error(`Unsupported payload length: ${len} bytes. Expected 30 or 34.`);
  }

  emit("sample", { data: lifecycle, topic: "lifecycle" });
  emit("sample", { data: decoded, topic: "default" });
}
