// Byte layouts follow the MClimate Flood Sensor LoRaWAN communication protocol
// https://docs.mclimate.eu/mclimate-lorawan-devices/devices/mclimate-flood-sensor-lorawan
const KEEPALIVE_LENGTH = 3;
const MESSAGE_TYPES = [
  "KEEPALIVE",
  "TEST_BUTTON_PRESSED",
  "FLOOD_DETECTED",
  "FRAUD_DETECTED",
  "FRAUD_DETECTED",
];

function toHex(byte) {
  return `0${byte.toString(16)}`.slice(-2);
}

// Older devices send a 2 byte keepalive without temperature
function decodeKeepalive(bytes) {
  const status = bytes[0];
  const data = {
    messageType: MESSAGE_TYPES[status >> 5] || "UNKNOWN",
    boxTamper: !!(status & 0x08),
    flood: !!(status & 0x02),
    batteryVoltage: (bytes[1] * 16) / 1000,
  };

  if (bytes.length > 2) {
    data.temperature = bytes[2];
  }

  return data;
}

// Command id -> [number of parameter bytes, decoder]
const RESPONSES = {
  0x06: [1, (p) => ({ alarmDuration: p[0] })],
  0x07: [
    2,
    (p) => ({
      hardwareVersion: Number(toHex(p[0])),
      softwareVersion: Number(toHex(p[1])),
    }),
  ],
  0x09: [1, (p) => ({ floodEventSendTime: p[0] })],
  0x12: [2, (p) => ({ keepAliveTime: (p[0] << 8) | p[1] })],
  0x14: [1, (p) => ({ floodEventUplinkType: p[0] })],
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
  0xa4: [1, (p) => ({ region: p[0] })],
};

// Command answers are always followed by a 3 byte keepalive
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

  try {
    const bytes = Hex.hexToBytes(payload);
    if (bytes.length < 2) {
      throw new Error("payload too short");
    }

    if (bytes.length > KEEPALIVE_LENGTH) {
      const keepalive = bytes.slice(-KEEPALIVE_LENGTH);
      const configuration = decodeResponses(bytes.slice(0, -KEEPALIVE_LENGTH));
      emit("sample", { data: decodeKeepalive(keepalive), topic: "default" });
      if (Object.keys(configuration).length > 0) {
        emit("sample", { data: configuration, topic: "configuration" });
      }
    } else {
      emit("sample", { data: decodeKeepalive(bytes), topic: "default" });
    }
  } catch (error) {
    emit("log", { error: `Could not decode ${payload}: ${error.message}` });
  }
}
