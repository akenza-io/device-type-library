function getTimestamp(bytes) {
    return new Date(
        (((bytes[4] << 24) >> 16) | bytes[5]) * 1000,
    );
}

function decodeSensorFPort2(bytes) {
    let data = {
        temperature: parseFloat(
            ((((bytes[0] << 24) >> 16) | bytes[1]) / 100).toFixed(2),
        ),
        humidity: parseFloat(
            ((((bytes[2] << 24) >> 16) | bytes[3]) / 10).toFixed(1),
        ),
        mod: bytes[4],
        pa8: bytes[5],
        alarmFlag: bytes[6],
    };
    let timestamp = {
        timestamp: getTimestamp(bytes[7]),
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
    let fw = (bytes[1] << 8) | bytes[2];
    data.firmwareVersion = `${(fw >> 8) & 0xff}.${(fw >> 4) & 0x0f}.${fw & 0x0f}`;

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
    let subBandCode = bytes[4];
    if (subBandCode >= 0x00 && subBandCode <= 0x08) {
        data.subBand = "AU915 and US915";
    } else if (subBandCode >= 0x0B && subBandCode <= 0x0C) {
        data.subBand = "CN470";
    } else {
        data.subBand = "Other Bands";

    }

    //battery voltage
    //Battery Info:

    // Check the battery voltage.

    //  Ex1: 0x0B45 = 2885mV

    //Ex2: 0x0B49 = 2889mV 
    //
    data.batteryVoltage = (((bytes[5] << 8) | bytes[6]) / 1000).toFixed(2);


    return data;
}

function decodeDatalogFPort3(bytes) {
    let data = {
        temperature: parseFloat(
            ((((bytes[0] << 24) >> 16) | bytes[1]) / 100).toFixed(2),
        ),
        humidity: parseFloat(
            ((((bytes[2] << 24) >> 16) | bytes[3]) / 10).toFixed(1),
        ),
        alarmFlag: bytes[4],
        poll: bytes[5],
        pa8: bytes[6],

    };
    let timestamp = {
        timestamp: getTimestamp(bytes[7]),
    };

    return data, timestamp;
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