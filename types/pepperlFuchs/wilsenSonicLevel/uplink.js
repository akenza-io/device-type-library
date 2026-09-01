function binaryToFloat(binaryString) {
  const sign = binaryString[0] === 1 ? -1 : 1;

  const exponent = Math.pow(2, parseInt(binaryString.substring(1, 9), 2) - 127);

  const mantissaBits = binaryString.substring(9, 32);
  let bitval = 0.5;
  let mantissa = 1.0;
  for (let i = 0; i < mantissaBits.length; i++) {
    if (mantissaBits.charAt(i) === 1) {
      mantissa += bitval;
    }
    bitval /= 2;
  }

  return sign * exponent * mantissa;
}

function emitDefaultPayload(bitString) {
  // in the datasheet proximity is called proxx_cm, but proximity is more readable
  const proximity = parseInt(bitString.substring(24, 40), 2);
  const fillinglvlPercent = parseInt(bitString.substring(64, 72), 2);
  // in the datasheet temperature is called temp_celsius, but temperature is more readable
  const temperature =
    Math.round(binaryToFloat(bitString.substring(96, 128)) * 100) / 100;
  // in the datasheet voltage is called battery_vol, but voltage is more readable
  const batteryVoltage = parseInt(bitString.substring(152, 160), 2) / 10;

  if (proximity !== 65535) {
    emit("sample", {
      topic: "default",
      data: {
        proximity,
        fillinglvlPercent,
        temperature,
      },
    });
  }

  updateLifeCycle(batteryVoltage);
}

function emitLocationPayload(bitString) {
  const longitude = parseInt(bitString.substring(184, 216), 2) / 1000000;
  const latitude = parseInt(bitString.substring(240, 272), 2) / 1000000;

  emit("sample", {
    topic: "location",
    data: {
      latitude,
      longitude,
    },
  });
}

function emitLifeCycle(bitString) {
  const serialNumber = parseInt(bitString.substring(24, 136), 2);
  const loraCount = parseInt(bitString.substring(160, 176), 2);
  const gpsCount = parseInt(bitString.substring(200, 216), 2);
  const usSensorCount = parseInt(bitString.substring(240, 272), 2);
  const batteryVoltage = parseInt(bitString.substring(296, 304), 2) / 10;

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
