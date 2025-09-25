function cToF(celsius) {
  return Math.round(((celsius * 9) / 5 + 32) * 10) / 10;
}

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

// --- MAIN FUNCTION ---
function consume(event) {
  const payload = event.data.payloadHex;
  const bytes = parseHexString(payload);
  const len = bytes.length;

  const decoded = {};
  const lifecycle = {};
  const alarm = {};
  const datalog = {};

  // --- Common header ---
  lifecycle.id = readUInt24BE(bytes.slice(0, 3));
  lifecycle.type = bytes[3];
  lifecycle.seqCounter = bytes[4];
  lifecycle.fwVersion = bytes[5] & 0x3F;

  if (len === 30) {
    // === Classic Frame ===

    decoded.temperature = readInt16BE(bytes.slice(6, 8)) / 10;
    decoded.temperatureF = cToF(decoded.temperature);
    decoded.humidity = readUInt16BE(bytes.slice(10, 12)) / 10;

    // --- Alarm Status ---
    const alarmStatus = readUInt16LE(bytes.slice(26, 28));
    alarm.temperatureHigh = Boolean(alarmStatus & 0x0001);
    alarm.temperatureLow = Boolean(alarmStatus & 0x0002);
    alarm.humidityHigh = Boolean(alarmStatus & 0x0004);
    alarm.humidityLow = Boolean(alarmStatus & 0x0008);

    // --- Status (battery + msg type) ---
    const status = readUInt16LE(bytes.slice(28, 30));
    const batteryBits = (status >> 2) & 0x03;
    const batteryLevels = [100, 75, 50, 25];
    lifecycle.batteryLevel = batteryLevels[batteryBits] || null;

    decoded.msgType = (status & 0x01) ? "ALARM" : "NORMAL";
    decoded.rbe = Boolean((status >> 9) & 0x01);

  } else if (len === 34) {
    // === Datalogging Frame ===
    datalog.tempeartureDatalog = [];
    datalog.humidityDatalog = [];
    for (let i = 0; i < 12; i++) {
      const offset = 6 + i * 2;
      datalog.tempeartureDatalog.push(bytes[offset]);
      datalog.humidityDatalog.push(bytes[offset + 1]);
    }

    // --- Alarm Status ---
    const alarmStatus = readUInt16LE(bytes.slice(30, 32));
    alarm.temperatureHigh = Boolean(alarmStatus & 0x0001);
    alarm.temperatureLow = Boolean(alarmStatus & 0x0002);
    alarm.humidityHigh = Boolean(alarmStatus & 0x0004);
    alarm.humidityLow = Boolean(alarmStatus & 0x0008);

    // --- Status (battery + msg type) ---
    const status = readUInt16LE(bytes.slice(32, 34));
    const batteryBits = (status >> 2) & 0x03;
    const batteryLevels = [100, 75, 50, 25];
    lifecycle.batteryLevel = batteryLevels[batteryBits] || null;

    decoded.msgType = (status & 0x01) ? "ALARM" : "NORMAL";
    decoded.rbe = Boolean((status >> 9) & 0x01);

    emit("sample", { data: datalog, topic: "datalog" });
  } else {
    throw new Error(`Unsupported payload length: ${len} bytes. Expected 30 or 34.`);
  }

  emit("sample", { data: lifecycle, topic: "lifecycle" });
  emit("sample", { data: alarm, topic: "alarm" });
  emit("sample", { data: decoded, topic: "default" });
}
