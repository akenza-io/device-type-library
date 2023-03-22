function binaryToFloat(binaryString) {
  const sign = binaryString[0] === "1" ? -1 : 1;

  const exponent = Math.pow(2, parseInt(binaryString.substr(1, 8), 2) - 127);

  const mantissaBits = binaryString.substr(9, 23);
  let bitval = 0.5;
  let mantissa = 1.0;
  for (let i = 0; i < mantissaBits.length; i++) {
    if (mantissaBits.charAt(i) === "1") {
      mantissa += bitval;
    }
    bitval /= 2;
  }

  return sign * exponent * mantissa;
}

function emitDefaultPayload(bitString) {
  // in the datasheet proximity is called proxx_cm, but proximity is more readable
  let proximity = parseInt(bitString.substr(24, 16), 2);
  let fillinglvlPercent = parseInt(bitString.substr(64, 8), 2);
  // in the datasheet temperature is called temp_celsius, but temperature is more readable
  const temperature =
    Math.round(binaryToFloat(bitString.substr(96, 32)) * 100) / 100;
  // in the datasheet voltage is called battery_vol, but voltage is more readable
  const batteryVoltage = parseInt(bitString.substr(152, 8), 2) / 10;

  if (proximity === 65535) {
    proximity = null;
    fillinglvlPercent = null;
  }

  emit("sample", {
    topic: "default",
    data: {
      proximity,
      fillinglvlPercent,
      temperature,
    },
  });

  updateLifeCycle(batteryVoltage);
}

function emitLocationPayload(bitString) {
  const longitude = parseInt(bitString.substr(184, 32), 2) / 1000000;
  const latitude = parseInt(bitString.substr(240, 32), 2) / 1000000;

  emit("sample", {
    topic: "location",
    data: {
      latitude,
      longitude,
    },
  });
}

function emitLifeCycle(bitString) {
  const serialNumber = parseInt(bitString.substr(24, 112), 2);
  const loraCount = parseInt(bitString.substr(160, 16), 2);
  const gpsCount = parseInt(bitString.substr(200, 16), 2);
  const usSensorCount = parseInt(bitString.substr(240, 32), 2);
  const batteryVoltage = parseInt(bitString.substr(296, 8), 2) / 10;

  emit("sample", {
    topic: "lifecycle",
    data: {
      serialNumber,
      loraCount,
      gpsCount,
      usSensorCount,
      batteryVoltage,
    },
  });
}

function updateLifeCycle(batteryVoltage) {
  emit("sample", {
    topic: "lifecycle",
    data: {
      batteryVoltage,
    },
  });
}

function consume(event) {
  const hexString = event.data.payloadHex;
  const bitString = Bits.hexToBits(hexString);
  if (hexString.length === 40) {
    emitDefaultPayload(bitString);
  } else if (hexString.length === 68) {
    emitDefaultPayload(bitString);
    emitLocationPayload(bitString);
  } else if (hexString.length === 76) {
    emitLifeCycle(bitString);
  }
}
