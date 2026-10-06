// Byte layouts follow the MClimate Wireless Thermostat LoRaWAN communication protocol
// https://docs.mclimate.eu/mclimate-lorawan-devices/devices/mclimate-wireless-thermostat
const POWER_SOURCES = ["PHOTOVOLTAIC", "BATTERY", "USB"];

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

// Firmware <= 1.3 sends 0x01 keepalives with a 1 °C target temperature,
// newer firmware sends 0x81 keepalives with a 0.1 °C target temperature
function keepaliveLength(byte) {
  if (byte === 0x01) {
    return 11;
  }
  if (byte === 0x81) {
    return 12;
  }
  return 0;
}

function isKeepalive(bytes, index) {
  const length = keepaliveLength(bytes[index]);
  return length > 0 && bytes.length - index >= length;
}

function decodeKeepalive(bytes) {
  // Offset of the fields after the target temperature
  const o = bytes[0] === 0x81 ? 1 : 0;
  return {
    default: {
      temperature: round((uint16(bytes[1], bytes[2]) - 400) / 10, 2),
      humidity: round((bytes[3] * 100) / 256, 2),
      targetTemperature: o ? uint16(bytes[6], bytes[7]) / 10 : bytes[6],
      light: uint16(bytes[8 + o], bytes[9 + o]),
      motionDetected: bytes[10 + o] === 1,
    },
    lifecycle: {
      batteryVoltage: round(uint16(bytes[4], bytes[5]) / 1000, 2),
      powerSource: POWER_SOURCES[bytes[7 + o]] || "UNKNOWN",
    },
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
  0x12: [1, (p) => ({ keepAliveTime: p[0] })],
  0x14: [1, (p) => ({ childLock: p[0] !== 0 })],
  0x15: [2, (p) => ({ temperatureRangeSettings: { min: p[0], max: p[1] } })],
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
  0x2f: [1, (p) => ({ targetTemperature: p[0] })],
  // Sent by the device when the target temperature is changed on the device
  0x30: [1, (p) => ({ manualTargetTemperatureUpdate: p[0] })],
  0x32: [1, (p) => ({ heatingStatus: p[0] })],
  0x34: [1, (p) => ({ displayRefreshPeriod: p[0] })],
  0x36: [1, (p) => ({ sendTargetTempDelay: p[0] })],
  0x38: [1, (p) => ({ automaticHeatingStatus: p[0] })],
  0x3a: [1, (p) => ({ sensorMode: p[0] })],
  0x3d: [1, (p) => ({ pirSensorStatus: p[0] })],
  0x3f: [1, (p) => ({ pirSensorSensitivity: p[0] })],
  0x41: [1, (p) => ({ currentTemperatureVisibility: p[0] })],
  0x43: [1, (p) => ({ humidityVisibility: p[0] })],
  0x45: [1, (p) => ({ lightIntensityVisibility: p[0] })],
  0x47: [1, (p) => ({ pirInitPeriod: p[0] })],
  0x49: [1, (p) => ({ pirMeasurementPeriod: p[0] })],
  0x4b: [2, (p) => ({ pirCheckPeriod: uint16(p[0], p[1]) })],
  0x4d: [2, (p) => ({ pirBlindPeriod: uint16(p[0], p[1]) })],
  0x4f: [1, (p) => ({ temperatureHysteresis: p[0] / 10 })],
  0x51: [2, (p) => ({ targetTemperature: uint16(p[0], p[1]) / 10 })],
  0x53: [1, (p) => ({ targetTemperatureStep: p[0] / 10 })],
  // Sent by the device when the target temperature is changed on the device
  0x54: [
    2,
    (p) => ({ manualTargetTemperatureUpdate: uint16(p[0], p[1]) / 10 }),
  ],
  0x56: [
    2,
    (p) => ({
      sensorCompensationTemperature: {
        negativeCompensation: p[0] !== 0,
        compensation: p[1] / 10,
      },
    }),
  ],
  0x5e: [1, (p) => ({ temperatureMeasurementPeriod: p[0] })],
  0xa4: [1, (p) => ({ region: p[0] })],
};

// Walks the command answers in an uplink. Answers can be followed by a keepalive.
function decodeUplink(bytes) {
  const configuration = {};
  let keepalive = null;
  let i = 0;

  while (i < bytes.length) {
    if (isKeepalive(bytes, i)) {
      const length = keepaliveLength(bytes[i]);
      keepalive = decodeKeepalive(bytes.slice(i, i + length));
      i += length;
    } else {
      const response = RESPONSES[bytes[i]];
      if (response === undefined || i + response[0] >= bytes.length) {
        // Unknown or truncated answer: its length is unknown, so stop here
        // but still use a trailing keepalive if there is one
        for (const length of [12, 11]) {
          const tail = bytes.length - length;
          if (tail > i && keepaliveLength(bytes[tail]) === length) {
            keepalive = decodeKeepalive(bytes.slice(tail));
            break;
          }
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
