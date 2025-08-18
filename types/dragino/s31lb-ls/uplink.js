function decodeSensorPort2(bytes) {
    let dataDefault = {
        alarmFlag: "",
        pa8: "",
        temperature: "",
        humidity: "",

    };

    let dataLifecycle = {
        batteryVoltage: "",
    };

    // battery voltage
    dataLifecycle.batteryVoltage = (bytes[0] << 8 | bytes[1]) / 1000;

    // Bit 0: true if alarm, false if normal
    dataDefault.alarmFlag = (bytes[6] & 0x01) === 0x01;
    // Bit 7: "Low" if 1, "High" if 0;
    dataDefault.pa8 = ((bytes[6] & 0x80) >> 7) === 1 ? "Low" : "High";

    // Temperature: bytes 7-8 (divide by 10 to get Celsius)
    dataDefault.temperature = parseFloat(((bytes[7] << 24 >> 16 | bytes[8]) / 10).toFixed(1));
    // Humidity: bytes 9-10 (divide by 10 to get percentage)
    dataDefault.humidity = parseFloat(((bytes[9] << 8 | bytes[10]) / 10).toFixed(1));

    // Timestamp: bytes 2-5 (32-bit Unix timestamp)
    const timestamp = new Date(
        (bytes[2] << 24 | bytes[3] << 16 | bytes[4] << 8 | bytes[5]) * 1000,
    );


    return { dataDefault, dataLifecycle, timestamp };
}

function decodeSensorPort3(bytes) {
    let dataDefault = {
        alarmFlag: "",
        pa8: "",
        temperature: "",
        humidity: "",

    };

    // Bit 0: true if alarm, false if normal
    dataDefault.alarmFlag = (bytes[6] & 0x01) === 0x01;
    // Bit 7: "Low" if 1, "High" if 0;
    dataDefault.pa8 = ((bytes[6] & 0x80) >> 7) === 1 ? "Low" : "High";

    // Temperature: bytes 7-8 (divide by 10 to get Celsius)
    dataDefault.temperature = parseFloat(((bytes[4] << 24 >> 16 | bytes[5]) / 10).toFixed(1));
    // Humidity: bytes 9-10 (divide by 10 to get percentage)
    dataDefault.humidity = parseFloat(((bytes[2] << 8 | bytes[3]) / 10).toFixed(1));

    // Timestamp: bytes 2-5 (32-bit Unix timestamp)
    const timestamp = new Date(
        (bytes[7] << 24 | bytes[8] << 16 | bytes[9] << 8 | bytes[10]) * 1000,
    );

    return { dataDefault, timestamp };
}

//lifecycle
function decodeSensorPort5(bytes) {

    let dataConfig = {
        sensorModel: "",
        firmwareVersion: "",
        freqencyBand: "",
        subBand: "",
    };

    let dataLifecycle = {
        batteryVoltage: "",
    };

    //sensor model
    if (bytes[0] === 0x0A) {
        dataConfig.sensorModel = "S31-LB/LS";
    } else {
        dataConfig.sensorModel = "Unknown";
    }

    //firmware version Firmware Version: 0x0100, Means: v1.0.0 version
    dataConfig.firmwareVersion = (bytes[1] & 0x0f) + '.' + (bytes[2] >> 4 & 0x0f) + '.' + (bytes[2] & 0x0f);

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
    dataConfig.freqencyBand = freqBands[freqBandCode] || `Unknown (${freqBandCode})`;

    // sub band
    if (bytes[4] == 0xff) {
        dataConfig.subBand = "NULL";
    } else {
        dataConfig.subBand = bytes[4];
    }
    dataConfig.subBand = dataConfig.subBand.toString();

    //battery voltage
    dataLifecycle.batteryVoltage = (bytes[5] << 8 | bytes[6]) / 1000;

    return { dataConfig, dataLifecycle };
}

function consume(event) {
    let port = event.data.port;
    let payloadHex = event.data.payloadHex;
    let bytes = Hex.hexToBytes(payloadHex);

    // Default, Lifecycle
    if (port === 2 && bytes.length === 11) {
        // Standard sensor uplink
        let { dataDefault, dataLifecycle, timestamp } = decodeSensorPort2(bytes);
        emit("sample", {
            data: dataDefault,
            topic: "default",
            timestamp,
        });
        emit("sample", {
            data: dataLifecycle,
            topic: "lifecycle",
        });
    }

    // Config, Lifecycle
    if (port === 5 && bytes.length >= 7) {
        // Device status/config
        let { dataConfig, dataLifecycle } = decodeSensorPort5(bytes);
        // Lifecycle
        emit("sample", {
            data: dataLifecycle,
            topic: "lifecycle",
        });
        emit("sample", {
            data: dataConfig,
            topic: "config",
        });

    }

    // Default
    if (port === 3 && bytes.length === 11) {
        let { dataDefault, timestamp } = decodeSensorPort3(bytes);
        emit("sample", {
            data: dataDefault,
            topic: "default",
            timestamp,
        });
    }
}