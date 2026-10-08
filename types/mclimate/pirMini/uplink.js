// Byte layouts follow the MClimate PIR Mini LoRaWAN communication protocol
// https://docs.mclimate.eu/mclimate-lorawan-devices/devices/mclimate-pir-mini
const KEEPALIVE_LENGTH = 10;

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
  const data = {
    temperature: round(((((bytes[1] & 0x03) << 8) | bytes[2]) - 400) / 10, 2),
    humidity: round((bytes[3] * 100) / 256, 2),
    occupied: (bytes[7] & 0x01) === 1,
    motion: uint16(bytes[8], bytes[9]),
  };
  const lifecycle = {
    batteryVoltage: round(((bytes[6] * 2200) / 255 + 1600) / 1000, 2),
  };

  // 0x0000-0xFFFA valid, 0xFFFF light sensor disabled, 0xFFFB-0xFFFE sensor error
  const light = uint16(bytes[4], bytes[5]);
  if (light <= 0xfffa) {
    data.light = light;
    lifecycle.lightSensorStatus = "OK";
  } else if (light === 0xffff) {
    lifecycle.lightSensorStatus = "DISABLED";
  } else {
    lifecycle.lightSensorStatus = "SENSOR_ERROR";
  }

  return { default: data, lifecycle };
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
  0x1f: [1, (p) => ({ lightSensorState: p[0] })],
  0x22: [1, (p) => ({ ledBrightness: p[0] })],
  0x37: [1, (p) => ({ pirSensorState: p[0] })],
  0x39: [2, (p) => ({ occupancyTimeout: uint16(p[0], p[1]) })],
  0x3a: [0, () => ({ event: "OCCUPIED" })],
  0x3b: [0, () => ({ event: "UNOCCUPIED" })],
  0x3d: [1, (p) => ({ pirDemoMode: p[0] })],
  0x3f: [1, (p) => ({ pirOperationMode: p[0] })],
  0x40: [0, () => ({ event: "PIR_TRIGGER" })],
  0x42: [2, (p) => ({ pirBlindTime: uint16(p[0], p[1]) })],
  0x44: [1, (p) => ({ pirCounterResetFlag: p[0] })],
  0xa4: [1, (p) => ({ region: p[0] })],
};

// Walks the command answers and events in an uplink. They can be followed by a keepalive.
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

  const { event } = configuration;
  delete configuration.event;

  return { keepalive, configuration, event };
}

function consume(event) {
  const payload = event.data.payloadHex;

  try {
    const result = decodeUplink(Hex.hexToBytes(payload));
    if (result.event !== undefined) {
      emit("sample", { data: { event: result.event }, topic: "event" });
    }
    if (result.keepalive !== null) {
      emit("sample", { data: result.keepalive.default, topic: "default" });
      emit("sample", { data: result.keepalive.lifecycle, topic: "lifecycle" });
    }
    if (Object.keys(result.configuration).length > 0) {
      emit("sample", { data: result.configuration, topic: "configuration" });
    } else if (result.keepalive === null && result.event === undefined) {
      emit("log", { error: `Unknown payload ${payload}` });
    }
  } catch (error) {
    emit("log", { error: `Could not decode ${payload}: ${error.message}` });
  }
}
