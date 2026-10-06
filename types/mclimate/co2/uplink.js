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

// Good, medium and bad CO2 zone values
function zones(p) {
  return { goodZone: p[0], mediumZone: p[1], badZone: p[2] };
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
  0x1f: [
    4,
    (p) => ({
      boundaryLevels: {
        goodMedium: uint16(p[0], p[1]),
        mediumBad: uint16(p[2], p[3]),
      },
    }),
  ],
  0x21: [2, (p) => ({ autoZeroValue: uint16(p[0], p[1]) })],
  0x23: [3, (p) => ({ notifyPeriod: zones(p) })],
  0x25: [3, (p) => ({ measurementPeriod: zones(p) })],
  0x27: [
    9,
    (p) => ({
      buzzerNotification: {
        durationGoodBeeping: p[0],
        durationGoodLoud: p[1] * 10,
        durationGoodSilent: p[2] * 10,
        durationMediumBeeping: p[3],
        durationMediumLoud: p[4] * 10,
        durationMediumSilent: p[5] * 10,
        durationBadBeeping: p[6],
        durationBadLoud: p[7] * 10,
        durationBadSilent: p[8] * 10,
      },
    }),
  ],
  0x29: [
    15,
    (p) => ({
      ledNotification: {
        redGood: p[0],
        greenGood: p[1],
        blueGood: p[2],
        durationGood: uint16(p[3], p[4]) * 10,
        redMedium: p[5],
        greenMedium: p[6],
        blueMedium: p[7],
        durationMedium: uint16(p[8], p[9]) * 10,
        redBad: p[10],
        greenBad: p[11],
        blueBad: p[12],
        durationBad: uint16(p[13], p[14]) * 10,
      },
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
