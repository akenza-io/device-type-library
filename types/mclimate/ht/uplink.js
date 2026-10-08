// Byte layouts follow the MClimate HT Sensor LoRaWAN communication protocol
// https://docs.mclimate.eu/mclimate-lorawan-devices/devices/mclimate-ht-sensor-lorawan
const KEEPALIVE_LENGTH = 7;

function round(value, decimals) {
  const factor = Math.pow(10, decimals);
  return Math.round(value * factor) / factor;
}

function toHex(byte) {
  return `0${byte.toString(16)}`.slice(-2);
}

function isKeepalive(bytes, index) {
  return bytes[index] === 0x01 && bytes.length - index >= KEEPALIVE_LENGTH;
}

function decodeKeepalive(bytes) {
  const data = {
    temperature: (((bytes[1] << 8) | bytes[2]) - 400) / 10,
    humidity: round((bytes[3] * 100) / 256, 2),
    batteryVoltage: (bytes[4] * 8 + 1600) / 1000,
    thermistorOperational: (bytes[5] & 0x04) === 0,
  };

  if (data.thermistorOperational) {
    data.extTemperature = (((bytes[5] & 0x03) << 8) | bytes[6]) / 10;
  }

  return data;
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
  // Sign byte (0 = positive) followed by the compensation
  0x32: [
    2,
    (p) => ({ temperatureCompensation: ((p[0] !== 0 ? -1 : 1) * p[1]) / 10 }),
  ],
  0x34: [2, (p) => ({ humidityCompensation: (p[0] !== 0 ? -1 : 1) * p[1] })],
  0xa4: [1, (p) => ({ region: p[0] })],
  0xaa: [1, (p) => ({ d2dCommunicationState: p[0] === 1 })],
  0xac: [1, (p) => ({ d2dCommunicationPeriod: p[0] })],
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
