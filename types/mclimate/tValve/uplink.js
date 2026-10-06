// Byte layouts follow the MClimate T-Valve LoRaWAN communication protocol
// https://docs.mclimate.eu/mclimate-lorawan-devices/devices/mclimate-t-valve-lorawan
const MESSAGE_TYPES = [
  "KEEPALIVE",
  "TEST_BUTTON_PRESSED",
  "FLOOD_DETECTED",
  "CONTROL_BUTTON_PRESSED",
  "FRAUD_DETECTED",
];

function uint16(high, low) {
  return (high << 8) | low;
}

// Short 2 byte packet, sent periodically
function decodeShortPacket(bytes) {
  return {
    waterTemperature: bytes[0] / 2,
    ambientTemperature: ((bytes[1] & 0x7f) - 20) / 2,
    valveOpen: (bytes[1] & 0x80) !== 0,
  };
}

// Long 5 byte packet, sent on events, once per day or on request (command 0x08)
function decodeLongPacket(bytes) {
  return {
    status: {
      messageType: MESSAGE_TYPES[bytes[0] >> 5] || "UNKNOWN",
      boxTamper: (bytes[0] & 0x08) !== 0,
      floodWireBroken: (bytes[0] & 0x04) !== 0,
      flood: (bytes[0] & 0x02) !== 0,
      magnet: (bytes[0] & 0x01) !== 0,
      alarmValidated: (bytes[1] & 0x80) !== 0,
      manualOpenEnabled: (bytes[1] & 0x40) !== 0,
      manualCloseEnabled: (bytes[1] & 0x20) !== 0,
      closeTime: bytes[2],
      openTime: bytes[3],
    },
    lifecycle: {
      batteryVoltage: (bytes[4] * 8 + 1600) / 1000,
      batteryTooLow: (bytes[0] & 0x10) !== 0,
      softwareVersion: bytes[1] & 0x1f,
    },
  };
}

// Command id -> [number of parameter bytes, decoder]
const RESPONSES = {
  0x0e: [
    4,
    (p) => ({
      openCloseTimeExtended: {
        openingTime: uint16(p[0], p[1]),
        closingTime: uint16(p[2], p[3]),
      },
    }),
  ],
  0x0f: [1, (p) => ({ emergencyOpenings: p[0] })],
  0x10: [1, (p) => ({ floodAlarmTime: p[0] })],
  0x11: [1, (p) => ({ workingVoltage: p[0] * 8 + 1600 })],
  0x12: [1, (p) => ({ keepAliveTime: p[0] })],
  0x13: [1, (p) => ({ deviceFloodSensor: p[0] })],
  0x16: [1, (p) => ({ joinRetryPeriod: (p[0] * 5) / 60 })],
  0x18: [1, (p) => ({ uplinkType: p[0] })],
  0x1a: [
    2,
    (p) => ({
      watchDogParams: {
        wdpC: p[0] === 0 ? false : p[0],
        wdpUc: p[1] === 0 ? false : p[1],
      },
    }),
  ],
  0xa4: [1, (p) => ({ region: p[0] })],
};

// Command answers follow the long packet
function decodeResponses(bytes) {
  const configuration = {};
  let i = 0;

  while (i < bytes.length) {
    const response = RESPONSES[bytes[i]];
    if (response === undefined || i + response[0] >= bytes.length) {
      break;
    }
    Object.assign(
      configuration,
      response[1](bytes.slice(i + 1, i + 1 + response[0])),
    );
    i += 1 + response[0];
  }

  return configuration;
}

function consume(event) {
  const payload = event.data.payloadHex;
  const metrics = event.uplinkMetrics || {};

  try {
    const bytes = Hex.hexToBytes(payload);
    if (bytes.length === 2) {
      emit("sample", { data: decodeShortPacket(bytes), topic: "default" });
    } else if (bytes.length >= 5) {
      const packet = decodeLongPacket(bytes.slice(0, 5));
      emit("sample", { data: packet.status, topic: "status" });
      emit("sample", { data: packet.lifecycle, topic: "lifecycle" });

      const configuration = decodeResponses(bytes.slice(5));
      if (Object.keys(configuration).length > 0) {
        emit("sample", { data: configuration, topic: "configuration" });
      }
    } else {
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
