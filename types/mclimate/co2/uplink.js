// Byte layouts follow the MClimate CO2 Sensor and Notifier LoRaWAN communication protocol
// https://docs.mclimate.eu/mclimate-lorawan-devices/devices/mclimate-co2-sensor-and-notifier-lorawan
const KEEPALIVE_LENGTH = 7;

function round(value, decimals) {
  const factor = Math.pow(10, decimals);
  return Math.round(value * factor) / factor;
}

function toHex(byte) {
  return `0${byte.toString(16)}`.slice(-2);
}

function uint16(high, low) {
  return (high << 8) | low;
}

function isKeepalive(bytes, index) {
  return bytes[index] === 0x01 && bytes.length - index >= KEEPALIVE_LENGTH;
}

function decodeKeepalive(bytes) {
  return {
    co2: uint16(bytes[1], bytes[2]),
    temperature: (uint16(bytes[3], bytes[4]) - 400) / 10,
    humidity: round((bytes[5] * 100) / 256, 2),
    batteryVoltage: round((bytes[6] * 8 + 1600) / 1000, 2),
  };
}

// Good, medium and bad CO2 zone values as <prefix>GoodZone, <prefix>MediumZone, <prefix>BadZone
function zones(prefix, p) {
  return {
    [`${prefix}GoodZone`]: p[0],
    [`${prefix}MediumZone`]: p[1],
    [`${prefix}BadZone`]: p[2],
  };
}

// Command id -> [number of parameter bytes, decoder]
const RESPONSES = {
  0x04: [
    2,
    (p) => ({
      hardwareVersion: Number(toHex(p[0])),
      softwareVersion: Number(toHex(p[1])),
    }),
  ],
  0x12: [1, (p) => ({ keepAliveTime: p[0] })],
  0x19: [1, (p) => ({ joinRetryPeriod: (p[0] * 5) / 60 })],
  0x1b: [1, (p) => ({ uplinkType: p[0] })],
  // 0 = watchdog disabled
  0x1d: [
    2,
    (p) => ({
      watchDogConfirmedUplinks: p[0],
      watchDogUnconfirmedUplinks: p[1],
    }),
  ],
  0x1f: [
    4,
    (p) => ({
      boundaryLevelGoodMedium: uint16(p[0], p[1]),
      boundaryLevelMediumBad: uint16(p[2], p[3]),
    }),
  ],
  0x21: [2, (p) => ({ autoZeroValue: uint16(p[0], p[1]) })],
  0x23: [3, (p) => zones("notifyPeriod", p)],
  0x25: [3, (p) => zones("measurementPeriod", p)],
  0x27: [
    9,
    (p) => ({
      buzzerDurationGoodBeeping: p[0],
      buzzerDurationGoodLoud: p[1] * 10,
      buzzerDurationGoodSilent: p[2] * 10,
      buzzerDurationMediumBeeping: p[3],
      buzzerDurationMediumLoud: p[4] * 10,
      buzzerDurationMediumSilent: p[5] * 10,
      buzzerDurationBadBeeping: p[6],
      buzzerDurationBadLoud: p[7] * 10,
      buzzerDurationBadSilent: p[8] * 10,
    }),
  ],
  0x29: [
    15,
    (p) => ({
      ledRedGood: p[0],
      ledGreenGood: p[1],
      ledBlueGood: p[2],
      ledDurationGood: uint16(p[3], p[4]) * 10,
      ledRedMedium: p[5],
      ledGreenMedium: p[6],
      ledBlueMedium: p[7],
      ledDurationMedium: uint16(p[8], p[9]) * 10,
      ledRedBad: p[10],
      ledGreenBad: p[11],
      ledBlueBad: p[12],
      ledDurationBad: uint16(p[13], p[14]) * 10,
    }),
  ],
  0x2b: [1, (p) => ({ autoZeroPeriod: p[0] })],
  0xa4: [1, (p) => ({ region: p[0] })],
};

// Walks the command answers in an uplink. Answers can be followed by a keepalive.
function decodeUplink(bytes) {
  const configuration = {};
  let keepalive = null;
  let i = 0;

  while (i < bytes.length) {
    if (isKeepalive(bytes, i)) {
      keepalive = decodeKeepalive(bytes.slice(i, i + KEEPALIVE_LENGTH));
      i += KEEPALIVE_LENGTH;
    } else {
      const response = RESPONSES[bytes[i]];
      if (response === undefined || i + response[0] >= bytes.length) {
        // Unknown or truncated answer: its length is unknown, so stop here
        // but still use a trailing keepalive if there is one
        const tail = bytes.length - KEEPALIVE_LENGTH;
        if (tail > i && isKeepalive(bytes, tail)) {
          keepalive = decodeKeepalive(bytes.slice(tail));
        }
        break;
      }
      Object.assign(
        configuration,
        response[1](bytes.slice(i + 1, i + 1 + response[0])),
      );
      i += 1 + response[0];
    }
  }

  return { keepalive, configuration };
}

function consume(event) {
  const payload = event.data.payloadHex;

  try {
    const result = decodeUplink(Hex.hexToBytes(payload));
    if (result.keepalive !== null) {
      emit("sample", { data: result.keepalive, topic: "default" });
    }
    if (Object.keys(result.configuration).length > 0) {
      emit("sample", { data: result.configuration, topic: "configuration" });
    } else if (result.keepalive === null) {
      emit("log", { error: `Unknown payload ${payload}` });
    }
  } catch (error) {
    emit("log", { error: `Could not decode ${payload}: ${error.message}` });
  }
}
