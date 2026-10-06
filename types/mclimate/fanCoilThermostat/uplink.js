// Byte layouts follow the MClimate Fan Coil Thermostat (FCT) LoRaWAN communication protocol
// https://docs.mclimate.eu/mclimate-lorawan-devices/devices/mclimate-fan-coil-thermostat-fct
const KEEPALIVE_LENGTH = 11;
const OPERATIONAL_MODES = ["VENTILATION", "HEATING", "COOLING"];

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
    temperature: round((uint16(bytes[1], bytes[2]) - 400) / 10, 2),
    humidity: round((bytes[3] * 100) / 256, 2),
    targetTemperature: uint16(bytes[4], bytes[5]) / 10,
    operationalMode: OPERATIONAL_MODES[bytes[6]] || "UNKNOWN",
    displayedFanSpeed: bytes[7],
    actualFanSpeed: bytes[8],
    valveOpen: bytes[9] === 1,
    deviceOn: bytes[10] === 1,
  };
}

// Commands that return a single byte as is
const SINGLE_BYTE = {
  0x14: "keysLock",
  0x32: "valveOpenCloseTime",
  0x34: "displayRefreshPeriod",
  0x36: "extAutomaticTemperatureControl",
  0x41: "currentTemperatureVisibility",
  0x43: "humidityVisibility",
  0x45: "fanSpeed",
  0x47: "fanSpeedLimit",
  0x4b: "ecmStartUpTime",
  0x4d: "ecmRelay",
  0x4f: "frostProtection",
  0x53: "fctOperationalMode",
  0x55: "allowedOperationalModes",
  0x57: "coolingSetpointNotOccupied",
  0x59: "heatingSetpointNotOccupied",
  0x5d: "fanSpeedNotOccupied",
  0x5f: "automaticChangeover",
  0x61: "wiringDiagram",
  0x63: "occFunction",
  0x67: "deviceStatus",
  0x69: "returnOfPowerOperation",
  0x6e: "frostProtectionStatus",
  0x70: "occupancySensorStatusSetPoint",
  0x71: "occupancySensorStatus",
  0x72: "dewPointSensorStatus",
  0x73: "filterAlarm",
  0x75: "powerModuleStatus",
  0x79: "fanOffDelayTime",
  0x7b: "additionalFanMode",
  0x7c: "internalTemperatureSensorError",
  0x7d: "externalTemperatureSensorError",
  0x7f: "displayColorMode",
  0x9b: "userInterfaceLanguage",
  0xa4: "region",
};

function targetTempRanges(p) {
  return {
    heatingTempMin: p[0],
    heatingTempMax: p[1],
    coolingTempMin: p[2],
    coolingTempMax: p[3],
  };
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
  0x05: [1, (p) => ({ targetTemperatureStep: p[0] / 10 })],
  0x12: [1, (p) => ({ keepAliveTime: p[0] })],
  0x15: [2, (p) => ({ temperatureRangeSettings: { min: p[0], max: p[1] } })],
  0x17: [4, (p) => ({ heatingCoolingTargetTempRanges: targetTempRanges(p) })],
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
  0x2f: [2, (p) => ({ targetTemperature: uint16(p[0], p[1]) / 10 })],
  // Sent by the device when the target temperature is changed on the device
  0x30: [
    2,
    (p) => ({ manualTargetTemperatureUpdate: uint16(p[0], p[1]) / 10 }),
  ],
  0x3e: [2, (p) => ({ extSensorTemperature: uint16(p[0], p[1]) / 10 })],
  0x49: [2, (p) => ({ ecmVoltageRange: { min: p[0] / 10, max: p[1] / 10 } })],
  0x51: [
    2,
    (p) => ({ frostProtectionSettings: { threshold: p[0], setpoint: p[1] } }),
  ],
  0x5b: [
    2,
    (p) => ({
      tempSensorCompensation: { compensation: p[0], temperature: p[1] / 10 },
    }),
  ],
  0x65: [
    2,
    (p) => ({
      automaticChangeoverThreshold: {
        coolingThreshold: p[0],
        heatingThreshold: p[1],
      },
    }),
  ],
  0x6b: [1, (p) => ({ deltaTemperature1: p[0] / 10 })],
  0x6d: [
    2,
    (p) => ({
      deltaTemperature2and3: {
        deltaTemperature2: p[0] / 10,
        deltaTemperature3: p[1] / 10,
      },
    }),
  ],
  0x74: [
    2,
    (p) => ({
      automaticChangeoverMode: {
        ntcTemperature: p[0],
        automaticChangeover: p[1],
      },
    }),
  ],
  0x77: [
    4,
    (p) => ({ heatingCoolingTargetTempRangesUnoccupied: targetTempRanges(p) }),
  ],
};
Object.keys(SINGLE_BYTE).forEach((id) => {
  RESPONSES[id] = [1, (p) => ({ [SINGLE_BYTE[id]]: p[0] })];
});

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
