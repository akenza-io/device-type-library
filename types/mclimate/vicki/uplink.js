// Byte layouts follow the MClimate Vicki LoRaWAN communication protocol
// https://docs.mclimate.eu/mclimate-lorawan-devices/devices/mclimate-vicki-lorawan
const KEEPALIVE_LENGTH = 9;

const ALGORITHMS = ["proportional", "equal", "proportionalIntegral"];

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

function uint24(high, mid, low) {
  return (high << 16) | (mid << 8) | low;
}

function isKeepalive(bytes, index) {
  return (
    (bytes[index] === 0x01 || bytes[index] === 0x81) &&
    bytes.length - index >= KEEPALIVE_LENGTH
  );
}

function decodeKeepalive(bytes) {
  if (bytes.length < KEEPALIVE_LENGTH) {
    throw new Error(`Keepalive needs ${KEEPALIVE_LENGTH} bytes`);
  }

  const motorRange = ((bytes[6] & 0x0f) << 8) | bytes[5];
  const motorPosition = ((bytes[6] >> 4) << 8) | bytes[4];

  let sensorTemperature = (bytes[2] * 165) / 256 - 40;
  if (bytes[0] === 0x81) {
    sensorTemperature = (bytes[2] - 28.33333) / 5.66666;
  }

  return {
    default: {
      targetTemperature: bytes[1],
      sensorTemperature: round(sensorTemperature, 2),
      relativeHumidity: round((bytes[3] * 100) / 256, 2),
      motorRange,
      motorPosition,
      valveOpenness:
        motorRange !== 0
          ? Math.round((1 - motorPosition / motorRange) * 100)
          : 0,
      openWindow: !!(bytes[7] & 0x08),
      childLock: !!(bytes[8] & 0x80),
    },
    lifecycle: {
      batteryVoltage: round(2 + (bytes[7] >> 4) * 0.1, 2),
      highMotorConsumption: !!(bytes[7] & 0x04),
      lowMotorConsumption: !!(bytes[7] & 0x02),
      brokenSensor: !!(bytes[7] & 0x01),
      calibrationFailed: !!(bytes[8] & 0x40),
      attachedBackplate: !!(bytes[8] & 0x20),
      perceiveAsOnline: !!(bytes[8] & 0x10),
      antiFreezeProtection: !!(bytes[8] & 0x08),
      d2dCommunicationReliable: !!(bytes[8] & 0x04),
      batteryTooLow: !!(bytes[8] & 0x02),
    },
  };
}

function decodeDeviceTime(p) {
  const date = new Date((p[0] * 16777216 + uint24(p[1], p[2], p[3])) * 1000);
  const minutes = date.getUTCMinutes();
  return {
    deviceTime: `${date.getUTCDate()}/${date.getUTCMonth() + 1}/${date.getUTCFullYear()} ${date.getUTCHours()}:${minutes < 10 ? "0" : ""}${minutes}`,
  };
}

// The heating schedule (0x5A, 0x5C, 0x6C) and debug (0x25) answers are not decoded:
// they do not map to flat datapoints. Their bytes stop the walk like any unknown answer.
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
  0x13: [
    4,
    (p) => ({
      openWindowEnabled: p[0] !== 0,
      openWindowDuration: p[1] * 5,
      openWindowMotorPosition: ((p[3] >> 4) << 8) | p[2],
      openWindowDelta: p[3] & 0x0f,
    }),
  ],
  0x14: [1, (p) => ({ childLock: p[0] !== 0 })],
  0x15: [2, (p) => ({ temperatureRangeMin: p[0], temperatureRangeMax: p[1] })],
  0x16: [
    3,
    (p) => ({
      internalAlgoPeriod: p[0],
      internalAlgoPFirstLast: p[1],
      internalAlgoPNext: p[2],
    }),
  ],
  0x17: [
    2,
    (p) => ({ internalAlgoTdiffWarm: p[0], internalAlgoTdiffCold: p[1] }),
  ],
  0x18: [1, (p) => ({ operationalMode: p[0] })],
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
  0x1f: [1, (p) => ({ primaryOperationalMode: p[0] })],
  0x21: [
    6,
    (p) => ({
      batteryRangeBoundary1: uint16(p[0], p[1]),
      batteryRangeBoundary2: uint16(p[2], p[3]),
      batteryRangeBoundary3: uint16(p[4], p[5]),
    }),
  ],
  0x23: [
    4,
    (p) => ({
      batteryRangeOverVoltage1: p[1],
      batteryRangeOverVoltage2: p[2],
      batteryRangeOverVoltage3: p[3],
    }),
  ],
  0x27: [1, (p) => ({ OVAC: p[0] })],
  0x28: [1, (p) => ({ manualTargetTemperatureUpdate: p[0] })],
  0x29: [
    2,
    (p) => ({
      proportionalAlgorithmCoefficient: p[0],
      proportionalAlgorithmPeriod: p[1],
    }),
  ],
  0x2b: [
    1,
    (p) => ({ temperatureControlAlgorithm: ALGORITHMS[p[0]] || "equal" }),
  ],
  0x34: [1, (p) => ({ childLockBehavior: p[0] })],
  0x36: [
    3,
    (p) => ({ proportionalGain: round(uint24(p[0], p[1], p[2]) / 131072, 5) }),
  ],
  0x3d: [
    3,
    (p) => ({ integralGain: round(uint24(p[0], p[1], p[2]) / 131072, 5) }),
  ],
  0x3f: [2, (p) => ({ integralValue: uint16(p[0], p[1]) / 10 })],
  0x40: [1, (p) => ({ piRunPeriod: p[0] })],
  0x42: [1, (p) => ({ tempHysteresis: p[0] / 10 })],
  0x44: [2, (p) => ({ extSensorTemperature: uint16(p[0], p[1]) / 10 })],
  // Same open window settings as 0x13, with a 0.1 °C delta
  0x46: [
    3,
    (p) => ({
      openWindowEnabled: p[0] !== 0,
      openWindowDuration: p[1] * 5,
      openWindowDelta: p[2] / 10,
    }),
  ],
  0x48: [1, (p) => ({ forceAttach: p[0] !== 0 })],
  0x4a: [
    3,
    (p) => ({
      antiFreezeActivatedTemperature: p[0] / 10,
      antiFreezeDeactivatedTemperature: p[1] / 10,
      antiFreezeTargetTemperature: p[2],
    }),
  ],
  0x4b: [1, (p) => ({ patchVersion: p[0] })],
  0x4d: [2, (p) => ({ maxAllowedIntegralValue: uint16(p[0], p[1]) / 10 })],
  0x50: [
    2,
    (p) => ({
      valveOpennessRangeMax: 100 - p[0],
      valveOpennessRangeMin: 100 - p[1],
    }),
  ],
  0x52: [2, (p) => ({ targetTemperatureFloat: uint16(p[0], p[1]) / 10 })],
  0x54: [1, (p) => ({ temperatureOffset: round((p[0] - 28) * 0.176, 3) })],
  0x56: [1, (p) => ({ ledDisplayTempUnits: p[0] })],
  0x58: [
    2,
    (p) => ({
      temperatureRestoredAfterManualBoost: !!(p[0] & 0x01),
      temperatureChangedByHeatingSchedule: !!(p[0] & 0x02),
    }),
  ],
  0x5e: [4, decodeDeviceTime],
  0x60: [1, (p) => ({ deviceTimeZone: p[0] & 0x80 ? p[0] - 256 : p[0] })],
  0x62: [1, (p) => ({ autoSetpointRestoreStatus: p[0] * 10 })],
  0x64: [1, (p) => ({ ledIndicationDuration: p[0] / 2 })],
  0x66: [2, (p) => ({ offlineTargetTemperature: uint16(p[0], p[1]) / 10 })],
  0x68: [1, (p) => ({ internalAlgoTemporaryState: p[0] === 0 })],
  0x6a: [
    12,
    (p) => ({
      temperatureLevel0: uint16(p[0], p[1]) / 10,
      temperatureLevel1: uint16(p[2], p[3]) / 10,
      temperatureLevel2: uint16(p[4], p[5]) / 10,
      temperatureLevel3: uint16(p[6], p[7]) / 10,
      temperatureLevel4: uint16(p[8], p[9]) / 10,
      temperatureLevel5: uint16(p[10], p[11]) / 10,
    }),
  ],
  0x6e: [1, (p) => ({ timeRequestByMACcommand: p[0] })],
  0x70: [
    16,
    (p) => ({
      d2dNotificationDeviceAppKey: p.map(toHex).join("").toUpperCase(),
    }),
  ],
  0x72: [2, (p) => ({ htSensorTemperature: uint16(p[0], p[1]) / 10 })],
  0xa0: [
    4,
    (p) => ({
      fuotaAddress: p[0] * 16777216 + uint24(p[1], p[2], p[3]),
      fuotaAddressRaw: p.map(toHex).join(""),
    }),
  ],
  0xa4: [1, (p) => ({ region: p[0] })],
  0xa6: [0, () => ({ crystalOscillatorError: true })],
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
