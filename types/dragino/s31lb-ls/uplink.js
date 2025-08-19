function readUInt16BE(bytes, offset) {
    return (bytes[offset] << 8) | bytes[offset + 1];
}

function readInt16BE(bytes, offset) {
    return ((bytes[offset] << 24) >> 16) | bytes[offset + 1];
}

function readUInt32BE(bytes, offset) {
    return (bytes[offset] << 24) | (bytes[offset + 1] << 16) | (bytes[offset + 2] << 8) | bytes[offset + 3];
}

function toOneDecimal(value) {
    return Math.round(value * 10) / 10;
}
// only assumtion, based on dataSheet
function getBatteryLevel(voltage) {
    if (voltage < 2.7) return 0;
    if (voltage < 3.3) return 25;
    if (voltage < 3.6) return 50;
    if (voltage < 3.9) return 75;
    return 100;
}

const FREQ_BANDS = {
    0x01: "EU868", 0x02: "US915", 0x03: "IN865", 0x04: "AU915",
    0x05: "KZ865", 0x06: "RU864", 0x07: "AS923", 0x08: "AS923-1",
    0x09: "AS923-2", 0x0a: "AS923-3", 0x0b: "CN470", 0x0c: "EU433",
    0x0d: "KR920", 0x0e: "MA869",
};

function decodeSensorPort2(bytes) {
    if (bytes.length < 11) return null;

    const batteryVoltage = readUInt16BE(bytes, 0) / 1000;
    const batteryLevel = getBatteryLevel(batteryVoltage);

    const timestamp = new Date(readUInt32BE(bytes, 2) * 1000);

    const statusByte = bytes[6];
    // Port 2: bit0 alarm, bit7 PA8 level, bits[7:2] MOD
    const alarmFlag = (statusByte & 0x01) !== 0;
    const pa8 = ((statusByte & 0x80) >>> 7) === 1 ? "Low" : "High";

    // Extract MOD as 6 bits from bits[7:2]
    const modShift = (statusByte >>> 2) & 0x3F;
    // Spec examples:
    // (statusByte >> 2) === 0x00 -> MOD=1 (sampling) => modStatus "true"
    // (statusByte >> 2) === 0x31 -> MOD=31 (poll reply) => modStatus "false"
    const modStatus = (modShift === 0x00) ? 1 : (modShift === 0x31 ? 31 : undefined);

    const temperature = toOneDecimal(readInt16BE(bytes, 7) / 10);
    const humidity = toOneDecimal(readUInt16BE(bytes, 9) / 10);

    return {
        dataDefault: { alarmFlag, pa8, temperature, humidity, modStatus, pollMessage: null },
        dataLifecycle: { batteryVoltage, batteryLevel },
        timestamp,
    };
}

// decode port 3
function decodeSensorPort3(bytes) {
    if (bytes.length < 11) return null;

    const statusByte = bytes[6];
    // Port 3: bit0 alarm, bit1 PA8 level, bit6 poll flag
    const alarmFlag = (statusByte & 0x01) !== 0;
    const pa8 = ((statusByte & 0x02) >>> 1) === 1 ? "Low" : "High";
    const pollMessage = (statusByte & 0x40) !== 0 ? "true" : "false";

    const temperature = toOneDecimal(readInt16BE(bytes, 4) / 10);
    const humidity = toOneDecimal(readUInt16BE(bytes, 2) / 10);
    const timestamp = new Date(readUInt32BE(bytes, 7) * 1000);

    return {
        dataDefault: { alarmFlag, pa8, temperature, humidity, modStatus: null, pollMessage },
        timestamp,
    };
}

// decode port 5 (status/config)
function decodeSensorPort5(bytes) {
    if (bytes.length < 7) return null;

    const sensorModel = bytes[0] === 0x0a ? "S31-LB/LS" : "Unknown";
    const firmwareVersion = `${bytes[1] & 0x0f}.${(bytes[2] >> 4) & 0x0f}.${bytes[2] & 0x0f}`;
    const frequencyBand = FREQ_BANDS[bytes[3]] || `Unknown (${bytes[3]})`; // keep key name as in schema
    const subBand = bytes[4] === 0xff ? "NULL" : String(bytes[4]);
    const batteryVoltage = readUInt16BE(bytes, 5) / 1000;
    const batteryLevel = getBatteryLevel(batteryVoltage);

    return {
        dataConfig: { sensorModel, firmwareVersion, frequencyBand, subBand },
        dataLifecycle: { batteryVoltage, batteryLevel },
    };
}

function consume(event) {
    const { port, payloadHex } = event.data;
    const bytes = Hex.hexToBytes(payloadHex);

    switch (port) {
        case 2: {
            const res = decodeSensorPort2(bytes);
            if (!res) return;
            emit("sample", { data: res.dataDefault, topic: "default", timestamp: res.timestamp });
            emit("sample", { data: res.dataLifecycle, topic: "lifecycle" });
            break;
        }
        case 3: {
            const res = decodeSensorPort3(bytes);
            if (!res) return;
            emit("sample", { data: res.dataDefault, topic: "default", timestamp: res.timestamp });
            break;
        }
        case 5: {
            const res = decodeSensorPort5(bytes);
            if (!res) return;
            emit("sample", { data: res.dataLifecycle, topic: "lifecycle" });
            emit("sample", { data: res.dataConfig, topic: "config" });
            break;
        }
        default:
            // ignore unknown ports
            break;
    }
}