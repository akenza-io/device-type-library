function binaryToFloat(binaryString) {
    let sign = binaryString[0] === "1"?-1:1;

    let exponent = Math.pow(2, parseInt(binaryString.substr(1, 8), 2) - 127);

    let mantissaBits = binaryString.substr(9, 23);
    let bitval = 0.5;
    let mantissa = 1.0;
    for (let i = 0; i < mantissaBits.length; i++) {
        if (mantissaBits.charAt(i) === "1") {
            mantissa += bitval
        }
        bitval = bitval/2
    }

	return sign * exponent * mantissa;
}

function emitDefaultPayload(bitString) {
    // in the datasheet proximity is called proxx_cm, but proximity is more readable
    let proximity = parseInt(bitString.substr(24, 16), 2);
    let fillinglvlPercent = parseInt(bitString.substr(64, 8), 2);
    // in the datasheet temperature is called temp_celsius, but temperature is more readable
    let temperature = Math.round(binaryToFloat(bitString.substr(96, 32))*100)/100;
    // in the datasheet voltage is called battery_vol, but voltage is more readable
    let voltage = parseInt(bitString.substr(152, 8), 2)/10;

    updateLifeCycle(voltage);

    emit("sample", { topic: "default", data: {
            proximity,
            fillinglvlPercent,
            temperature
    }});
}

function emitLocationPayload(bitString) {
    let longitude = parseInt(bitString.substr(184, 32), 2)/1000000;
    let latitude = parseInt(bitString.substr(240, 32), 2)/1000000;

    emit("sample", { topic: "location", data: {
        latitude,
        longitude
    }});
}

function emitLifeCycle(bitString) {
    let serialNumber = parseInt(bitString.substr(24, 112), 2);
    let loraCount = parseInt(bitString.substr(160, 16), 2);
    let gpsCount = parseInt(bitString.substr(200, 16), 2);
    let usSensorCount = parseInt(bitString.substr(240, 32), 2);
    let voltage = parseInt(bitString.substr(296, 8), 2)/10;

    emit("sample", { topic: "lifecycle", data: {
        serialNumber,
        loraCount,
        gpsCount,
        usSensorCount,
        voltage
    }})
}

function updateLifeCycle(voltage) {
    emit("sample", { topic: "lifecycle", data: {
        voltage
    }})
}

function consume(event) {
    let hexString = event.data.payloadHex
    let bitString = Bits.hexToBits(hexString);
    if (hexString.length === 40 || hexString.length === 68) {
        emitDefaultPayload(bitString);
    } else if (hexString.length === 68) {
        emitLocationPayload(bitString);
    } else if (hexString.length === 76) {
        emitLifeCycle(bitString);
    }
}