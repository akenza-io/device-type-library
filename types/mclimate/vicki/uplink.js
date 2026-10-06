// Byte layouts follow the MClimate Vicki LoRaWAN communication protocol
// https://docs.mclimate.eu/mclimate-lorawan-devices/devices/mclimate-vicki-lorawan
const KEEPALIVE_LENGTH = 9;
const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
const ALGORITHMS = ["proportional", "equal", "proportionalIntegral"];

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

function decodeHeatingEvents(p) {
  const group = p[0];
  const eventsInGroup = group === 2 ? 4 : 8;
  const heatingEvents = [];

  for (let n = 0; n < eventsInGroup; n += 1) {
    const offset = 1 + n * 5;
    const hour = p[offset];
    const minute = p[offset + 1];
    const temperature = uint16(p[offset + 2], p[offset + 3]);
    const weekdays = p[offset + 4];

    if (hour || minute || temperature || weekdays) {
      heatingEvents.push({
        index: group * 8 + n,
        start: `${hour < 10 ? "0" : ""}${hour}:${minute < 10 ? "0" : ""}${minute}`,
        targetTemperature: temperature / 10,
        weekdays: {
          monday: !!(weekdays & 0x01),
          tuesday: !!(weekdays & 0x02),
          wednesday: !!(weekdays & 0x04),
          thursday: !!(weekdays & 0x08),
          friday: !!(weekdays & 0x10),
          saturday: !!(weekdays & 0x20),
          sunday: !!(weekdays & 0x40),
        },
      });
    }
  }

  return {
    heatingEventGroup: ["0-7", "8-15", "16-19"][group],
    heatingEvents,
  };
}

function decodeHeatingEventStates(p) {
  const states = {};
  const bits = uint24(p[1], p[2], p[3]);
  for (let n = 0; n < 20; n += 1) {
    states[n] = !!(bits & (1 << n));
  }
  return { heatingEventStates: states };
}

function decodeDeviceTime(p) {
  const date = new Date((p[0] * 16777216 + uint24(p[1], p[2], p[3])) * 1000);
  const minutes = date.getUTCMinutes();
  return {
    deviceTime: `${date.getUTCDate()}/${date.getUTCMonth() + 1}/${date.getUTCFullYear()} ${date.getUTCHours()}:${minutes < 10 ? "0" : ""}${minutes}`,
  };
}

function decodeTemperatureLevels(p) {
  const levels = {};
  for (let n = 0; n < 6; n += 1) {
    levels[`level${n}`] = uint16(p[n * 2], p[n * 2 + 1]) / 10;
  }
  return { temperatureLevels: levels };
}

// Command id -> [number of parameter bytes, decoder]
const RESPONSES = {
  0x04: [
    2,
    (p) => ({
      deviceVersions: {
        hardware: Number(toHex(p[0])),
        software: Number(toHex(p[1])),
      },
    }),
  ],
  0x12: [1, (p) => ({ keepAliveTime: p[0] })],
  0x13: [
    4,
    (p) => ({
      openWindowParams: {
        enabled: p[0] !== 0,
        duration: p[1] * 5,
        motorPosition: ((p[3] >> 4) << 8) | p[2],
        delta: p[3] & 0x0f,
      },
    }),
  ],
  0x14: [1, (p) => ({ childLock: p[0] !== 0 })],
  0x15: [2, (p) => ({ temperatureRangeSettings: { min: p[0], max: p[1] } })],
  0x16: [
    3,
    (p) => ({
      internalAlgoParams: { period: p[0], pFirstLast: p[1], pNext: p[2] },
    }),
  ],
  0x17: [2, (p) => ({ internalAlgoTdiffParams: { warm: p[0], cold: p[1] } })],
  0x18: [1, (p) => ({ operationalMode: p[0] })],
  0x19: [1, (p) => ({ joinRetryPeriod: (p[0] * 5) / 60 })],
  0x1b: [1, (p) => ({ uplinkType: p[0] })],
  0x1d: [
    2,
    (p) => ({
      watchDogParams: {
        wdpC: p[0] === 0 ? false : p[0],
        wdpUc: p[1] === 0 ? false : p[1],
      },
    }),
  ],
  0x1f: [1, (p) => ({ primaryOperationalMode: p[0] })],
  0x21: [
    6,
    (p) => ({
      batteryRangesBoundaries: {
        Boundary1: uint16(p[0], p[1]),
        Boundary2: uint16(p[2], p[3]),
        Boundary3: uint16(p[4], p[5]),
      },
    }),
  ],
  0x23: [
    4,
    (p) => ({
      batteryRangesOverVoltage: { Range1: p[1], Range2: p[2], Range3: p[3] },
    }),
  ],
  0x25: [
    31,
    (p) => ({
      debug: {
        batterySubrange: p[0],
        motorCurrentConsumption: p[1] * 4,
        powerSupplyVoltageMeasured: p[2] * 16,
        daysSinceLastDeviceReset: p[3],
        detectedMotorOverVoltages: p[4],
        motorHardwareDriverType: p[5] >> 4,
        temperatureSensorModel: p[5] & 0x0f,
        motorTotalTravelSteps: p[6] * 16777216 + uint24(p[7], p[8], p[9]),
        packetsSentOnSF7: uint24(p[10], p[11], p[12]),
        packetsSentOnSF8: uint24(p[13], p[14], p[15]),
        packetsSentOnSF9: uint24(p[16], p[17], p[18]),
        packetsSentOnSF10: uint24(p[19], p[20], p[21]),
        packetsSentOnSF11: uint24(p[22], p[23], p[24]),
        packetsSentOnSF12: uint24(p[25], p[26], p[27]),
        totalSentPackets: uint24(p[28], p[29], p[30]),
      },
    }),
  ],
  0x27: [1, (p) => ({ OVAC: p[0] })],
  0x28: [1, (p) => ({ manualTargetTemperatureUpdate: p[0] })],
  0x29: [
    2,
    (p) => ({
      proportionalAlgorithmParameters: { coefficient: p[0], period: p[1] },
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
  0x46: [
    3,
    (p) => ({
      openWindowPrecisely: {
        enabled: p[0] !== 0,
        duration: p[1] * 5,
        delta: p[2] / 10,
      },
    }),
  ],
  0x48: [1, (p) => ({ forceAttach: p[0] !== 0 })],
  0x4a: [
    3,
    (p) => ({
      antiFreezeParams: {
        activatedTemperature: p[0] / 10,
        deactivatedTemperature: p[1] / 10,
        targetTemperature: p[2],
      },
    }),
  ],
  0x4b: [1, (p) => ({ patchVersion: p[0] })],
  0x4d: [2, (p) => ({ maxAllowedIntegralValue: uint16(p[0], p[1]) / 10 })],
  0x50: [
    2,
    (p) => ({
      valveOpennessRangeInPercentage: { max: 100 - p[0], min: 100 - p[1] },
    }),
  ],
  0x52: [2, (p) => ({ targetTemperatureFloat: uint16(p[0], p[1]) / 10 })],
  0x54: [1, (p) => ({ temperatureOffset: round((p[0] - 28) * 0.176, 3) })],
  0x56: [1, (p) => ({ ledDisplayTempUnits: p[0] })],
  0x58: [
    2,
    (p) => ({
      notifications: {
        temperatureRestoredAfterManualBoost: !!(p[0] & 0x01),
        temperatureChangedByHeatingSchedule: !!(p[0] & 0x02),
      },
    }),
  ],
  0x5a: [41, decodeHeatingEvents],
  0x5c: [
    4,
    (p) => ({
      heatingSchedule: {
        start: `${p[1]} ${MONTHS[p[0]]}`,
        end: `${p[3]} ${MONTHS[p[2]]}`,
      },
    }),
  ],
  0x5e: [4, decodeDeviceTime],
  0x60: [1, (p) => ({ deviceTimeZone: p[0] & 0x80 ? p[0] - 256 : p[0] })],
  0x62: [1, (p) => ({ autoSetpointRestoreStatus: p[0] * 10 })],
  0x64: [1, (p) => ({ ledIndicationDuration: p[0] / 2 })],
  0x66: [2, (p) => ({ offlineTargetTemperature: uint16(p[0], p[1]) / 10 })],
  0x68: [1, (p) => ({ internalAlgoTemporaryState: p[0] === 0 })],
  0x6a: [12, decodeTemperatureLevels],
  0x6c: [4, decodeHeatingEventStates],
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
      fuota: {
        fuotaAddress: p[0] * 16777216 + uint24(p[1], p[2], p[3]),
        fuotaAddressRaw: p.map(toHex).join(""),
      },
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
  const metrics = event.uplinkMetrics || {};

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

  // Raw uplink for the MClimate integration, forwarded to the MClimate broker.
  // Emitted even when decoding fails so the broker still receives the payload.
  emit("sample", {
    data: {
      deviceId: event.device.deviceId,
      payloadHex: payload,
      timestamp: metrics.timestamp,
      port: metrics.port,
      frameCountUp: metrics.frameCountUp,
      rssi: metrics.rssi,
      snr: metrics.snr,
      spreadingFactor: metrics.sf,
    },
    topic: "raw_payload",
  });
}
