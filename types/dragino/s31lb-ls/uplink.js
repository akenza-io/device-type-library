function decodeSensorFPort2(bytes) {
    let data = {
        batteryVoltage: "",
        temperature: "",
        humidity: "",
        mod: "",
        pa8: "",
        alarmFlag: "",

    };
    // Battery voltage: bytes 0-1 (divide by 1000 to get volts)
    data.batteryVoltage = (bytes[0] << 8 | bytes[1]) / 1000;

    // not sure if needed
    // Bit 0: true if alarm, false if normal
    data.alarmFlag = (bytes[6] & 0x01) === 0x01;
    // Bit 7: "Low" if 1, "High" if 0
    data.pa8 = ((bytes[6] & 0x80) >> 7) === 1 ? "Low" : "High";
    // Bits 2-6: MOD value
    data.mod = (bytes[6] & 0x7C) >> 2;

    // Temperature: bytes 7-8 (divide by 10 to get Celsius)
    data.temperature = parseFloat(((bytes[7] << 24 >> 16 | bytes[8]) / 10).toFixed(1));
    // Humidity: bytes 9-10 (divide by 10 to get percentage)
    data.humidity = parseFloat(((bytes[9] << 8 | bytes[10]) / 10).toFixed(1));

    // Timestamp: bytes 2-5 (32-bit Unix timestamp)
    const timestamp = {
        timestamp: luxon.DateTime.fromSeconds(bytes[2] << 24 | bytes[3] << 16 | bytes[4] << 8 | bytes[5]).toISO()
    };
    return { data, timestamp };
}

function decodeDatalogFPort3(bytes) {
    let data = {
        temperature: "",
        humidity: "",
        alarmFlag: "",
        poll: "",
        pa8: ""
    };

    // Bytes 0-1: ignore (not used)
    // Humidity: bytes 2-3 (divide by 10 to get percentage)
    data.humidity = parseFloat(((bytes[2] << 8 | bytes[3]) / 10).toFixed(1));

    // Temperature: bytes 4-5 (divide by 10 to get Celsius)
    data.temperature = parseFloat(((bytes[4] << 8 | bytes[5]) / 10).toFixed(1));

    // Extract flags from byte 6 (single byte contains multiple flags)
    // Poll message flag (bit 1): 1 if poll message reply, 0 if normal
    data.poll = (bytes[6] >> 1) & 0x01;

    // Alarm flag (bit 0): true if alarm, false if normal
    data.alarmFlag = (bytes[6] & 0x01) === 0x01;

    // PA8 level (bit 7): "Low" if 1, "High" if 0
    data.pa8 = ((bytes[6] >> 7) & 0x01) === 1 ? "Low" : "High";

    // Unix timestamp: bytes 7-10 (32-bit Unix timestamp)
    const timestamp = {
        timestamp: luxon.DateTime.fromSeconds(bytes[7] << 24 | bytes[8] << 16 | bytes[9] << 8 | bytes[10]).toISO()
    };

    return { data, timestamp };
}

//lifecycle
function decodeStatusFPort5(bytes) {

    let data = {
        sensorModel: "",
        firmwareVersion: "",
        freqencyBand: "",
        subBand: "",
        batteryVoltage: "",

    };
    //sensor model
    if (bytes[0] === 0x0A) {
        data.sensorModel = "S31LB-LS";
    } else {
        data.sensorModel = "Unknown";
    }

    //firmware version Firmware Version: 0x0100, Means: v1.0.0 version
    data.firmwareVersion = (bytes[1] & 0x0f) + '.' + (bytes[2] >> 4 & 0x0f) + '.' + (bytes[2] & 0x0f);

    //frequency band
    let freqBandCode = bytes[3];
    let freqBands = {
        0x01: "EU868",
        0x02: "US915",
        0x03: "IN865",
        0x04: "AU915",
        0x05: "KZ865",
        0x06: "RU864",
        0x07: "AS923",
        0x08: "AS923-1",
        0x09: "AS923-2",
        0x0a: "AS923-3",
        0x0b: "CN470",
        0x0c: "EU433",
        0x0d: "KR920",
        0x0e: "MA869",
    };
    data.freqencyBand = freqBands[freqBandCode] || `Unknown (${freqBandCode})`;

    // sub band
    if (bytes[4] == 0xff) {
        data.subBand = "NULL";
    } else {
        data.subBand = bytes[4];
    }

    //battery voltage
    data.batteryVoltage = (bytes[5] << 8 | bytes[6]) / 1000;

    return data;
}

function consume(event) {
    let port = event.data.port;
    let payloadHex = event.data.payloadHex;
    let bytes = Hex.hexToBytes(payloadHex);

    // Default
    if (port === 2 && bytes.length === 11) {
        // Standard sensor uplink
        let { data, timestamp } = decodeSensorFPort2(bytes);
        emit("sample", {
            data,
            topic: "default",
            timestamp,
        });

        return;
    }

    // Lifecycle
    if (port === 5 && bytes.length >= 7) {
        // Device status/config
        let data = decodeStatusFPort5(bytes);
        // Lifecycle
        emit("sample", {
            data,
            topic: "lifecycle",
        });

    }

    // Datalog
    if (port === 3 && bytes.length === 11) {
        let { data, timestamp } = decodeDatalogFPort3(bytes);
        emit("sample", {
            data,
            topic: "datalog",
            timestamp,
        });
    }
}