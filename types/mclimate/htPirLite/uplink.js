// Byte layouts follow the MClimate HT + PIR Lite LoRaWAN communication protocol
// https://docs.mclimate.eu/mclimate-lorawan-devices/devices/mclimate-ht-+-pir-lite
const KEEPALIVE_LENGTH = 6;

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
  return bytes[index] === 0x81 && bytes.length - index >= KEEPALIVE_LENGTH;
}

function decodeKeepalive(bytes) {
  return {
    default: {
      temperature: round(((((bytes[1] & 0x03) << 8) | bytes[2]) - 400) / 10, 2),
      humidity: round((bytes[3] * 100) / 256, 2),
      occupied: (bytes[1] & 0x04) !== 0,
      motion: bytes[5],
    },
    lifecycle: {
      batteryVoltage: round(((bytes[4] * 2200) / 255 + 1600) / 1000, 2),
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
  0x2f: [1, (p) => ({ uplinkSendingOnButtonPress: p[0] })],
  0x37: [1, (p) => ({ pirSensorState: p[0] })],
  0x39: [2, (p) => ({ occupancyTimeout: uint16(p[0], p[1]) })],
  0x3f: [1, (p) => ({ pirSensorSensitivity: p[0] })],
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
