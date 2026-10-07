// Byte layouts follow the MClimate CO2 Display LoRaWAN communication protocol
// https://docs.mclimate.eu/mclimate-lorawan-devices/devices/mclimate-co2-display
const KEEPALIVE_LENGTH = 11;
const POWER_SOURCES = ["PHOTOVOLTAIC", "BATTERY", "USB"];

// Round like the MClimate payload helper (toFixed)
function round(value, decimals) {
  return Number(value.toFixed(decimals));
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
    default: {
      temperature: round((uint16(bytes[1], bytes[2]) - 400) / 10, 2),
      humidity: round((bytes[3] * 100) / 256, 2),
      co2: ((bytes[7] >> 3) << 8) | bytes[6],
      light: uint16(bytes[8], bytes[9]),
      motionDetected: bytes[10] === 1,
    },
    lifecycle: {
      batteryVoltage: round(uint16(bytes[4], bytes[5]) / 1000, 2),
      powerSource: POWER_SOURCES[bytes[7] & 0x07] || "UNKNOWN",
    },
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
  0x14: [1, (p) => ({ childLock: p[0] !== 0 })],
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
  0x25: [
    3,
    (p) => ({
      measurementPeriodGoodZone: p[0],
      measurementPeriodMediumZone: p[1],
      measurementPeriodBadZone: p[2],
    }),
  ],
  0x2b: [1, (p) => ({ autoZeroPeriod: p[0] })],
  0x34: [1, (p) => ({ displayRefreshPeriod: p[0] })],
  0x3d: [1, (p) => ({ pirSensorStatus: p[0] })],
  0x3f: [1, (p) => ({ pirSensorSensitivity: p[0] })],
  0x41: [1, (p) => ({ currentTemperatureVisibility: p[0] })],
  0x43: [1, (p) => ({ humidityVisibility: p[0] })],
  0x45: [1, (p) => ({ lightIntensityVisibility: p[0] })],
  0x47: [1, (p) => ({ pirInitPeriod: p[0] })],
  0x49: [1, (p) => ({ pirMeasurementPeriod: p[0] })],
  0x4b: [2, (p) => ({ pirCheckPeriod: uint16(p[0], p[1]) })],
  0x4d: [2, (p) => ({ pirBlindPeriod: uint16(p[0], p[1]) })],
  0x80: [1, (p) => ({ measurementBlindTime: p[0] })],
  0x83: [
    1,
    (p) => ({
      co2ChartVisibility: (p[0] >> 2) & 1,
      co2DigitalValueVisibility: (p[0] >> 1) & 1,
      co2EmojiVisibility: p[0] & 1,
    }),
  ],
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
      emit("sample", { data: result.keepalive.default, topic: "default" });
      emit("sample", { data: result.keepalive.lifecycle, topic: "lifecycle" });
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
