// Byte layouts follow the MClimate 16A Switch & Power Meter (16ASPM) LoRaWAN communication protocol
// https://docs.mclimate.eu/mclimate-lorawan-devices/devices/mclimate-16a-switch-and-power-meter-lorawan-16aspm
const KEEPALIVE_LENGTH = 12;

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
  // Bit 7 is the sign, bits 6:0 the internal temperature in °C
  const temperature = bytes[1] & 0x7f;
  return {
    internalTemperature: bytes[1] & 0x80 ? -temperature : temperature,
    energy:
      (bytes[2] * 16777216 + ((bytes[3] << 16) | uint16(bytes[4], bytes[5]))) /
      1000,
    power: uint16(bytes[6], bytes[7]),
    voltage: bytes[8],
    current: uint16(bytes[9], bytes[10]),
    relayOn: bytes[11] === 1,
  };
}

// Number of events and the last measured value, e.g. overvoltageEventCount and overvoltageEventVoltage
function events(name, value) {
  return (p) => ({
    [`${name}EventCount`]: p[0],
    [`${name}Event${value}`]: uint16(p[1], p[2]),
  });
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
  0x1f: [
    2,
    (p) => ({
      overheatingThresholdTrigger: p[0],
      overheatingThresholdRecovery: p[1],
    }),
  ],
  0x21: [
    3,
    (p) => ({
      overvoltageThresholdTrigger: uint16(p[0], p[1]),
      overvoltageThresholdRecovery: p[2],
    }),
  ],
  0x23: [1, (p) => ({ overcurrentThreshold: p[0] })],
  0x25: [2, (p) => ({ overpowerThreshold: uint16(p[0], p[1]) })],
  0x54: [1, (p) => ({ relayStateChangeReason: p[0] })],
  0x56: [
    3,
    (p) => ({
      relayTimerMillisecondsState: p[0],
      relayTimerMillisecondsTime: uint16(p[1], p[2]),
    }),
  ],
  0x58: [
    3,
    (p) => ({
      relayTimerSecondsState: p[0],
      relayTimerSecondsTime: uint16(p[1], p[2]),
    }),
  ],
  0x5a: [1, (p) => ({ afterOverheatingProtectionRecovery: p[0] })],
  0x5c: [1, (p) => ({ ledIndicationMode: p[0] })],
  // Sent by the device when the relay is switched on the device
  0x5d: [1, (p) => ({ manualChangeRelayState: p[0] })],
  0x5f: [1, (p) => ({ relayRecoveryState: p[0] })],
  0x60: [
    2,
    (p) => ({
      overheatingEventCount: p[0],
      overheatingEventTemperature: p[1],
    }),
  ],
  0x61: [3, events("overvoltage", "Voltage")],
  0x62: [3, events("overcurrent", "Current")],
  0x63: [3, events("overpower", "Power")],
  0x70: [2, (p) => ({ overheatingRecoveryTime: uint16(p[0], p[1]) })],
  0x71: [2, (p) => ({ overvoltageRecoveryTime: uint16(p[0], p[1]) })],
  0x72: [1, (p) => ({ overcurrentRecoveryTemp: p[0] })],
  0x73: [1, (p) => ({ overpowerRecoveryTemp: p[0] })],
  0xa4: [1, (p) => ({ region: p[0] })],
  0xb1: [1, (p) => ({ relayState: p[0] === 1 })],
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
