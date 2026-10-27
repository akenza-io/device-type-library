// WIKA PGW23.100.11 uplink decoder
// Port of the official WIKA javascript parser 4.12.0 (https://github.com/WIKA-Group/javascript_parsers)
// Supports the TULIP2 protocol (message types 0x01 - 0x08)

// ***********************************************************************************
// Device configuration
// ***********************************************************************************

// Measuring ranges of the channels. Adjustable ranges can be overwritten with the
// custom fields <channel>RangeStart and <channel>RangeEnd, e.g. pressureRangeStart.
// The defaults are placeholders, check the device datasheet or the device identification message.
// The battery voltage of the data message is sent in 0.1 V and needs no measuring range.
const CHANNELS = {
  pressure: { start: 0, end: 10, adjustable: true },
  deviceTemperature: { start: -40, end: 60, adjustable: false },
};

const ROUNDING_DECIMALS = 4;

// ***********************************************************************************
// TULIP2 lookups
// ***********************************************************************************

// Channel keys by TULIP2 channel id
const CHANNEL_IDS = ["pressure", "deviceTemperature"];

const ALARM_EVENT_NAMES = ["triggered", "disappeared"];

const PROCESS_ALARM_TYPES = [
  "lowThreshold",
  "highThreshold",
  "fallingSlope",
  "risingSlope",
  "lowThresholdWithDelay",
  "highThresholdWithDelay",
];

const TECHNICAL_ALARM_CAUSE_OF_FAILURE_NAMES = {
  0: "",
  1: "general failure",
};

const DEVICE_ALARM_CAUSE_OF_FAILURE_NAMES = {
  0: "",
  1: "device dependent",
};

const DEVICE_ALARM_TYPE_NAMES = {
  0: "low temperature alarm",
};

const CONFIGURATION_STATUS_NAMES = {
  0: "packet received",
  1: "no packet received",
  2: "configuration applied",
  3: "configuration rejected",
  4: "configuration discarded - Never received all packets",
  5: "configuration discarded",
  6: "command success",
  7: "command failed",
};

const PRESSURE_TYPE_NAMES = {
  1: "absolute",
  2: "relative",
  3: "differential",
};

const PRESSURE_UNIT_NAMES = {
  1: "inH2O",
  2: "inHg",
  3: "ftH2O",
  4: "mmH2O",
  5: "mmHg",
  6: "psi",
  7: "bar",
  8: "mbar",
  9: "g/cm²",
  10: "kg/cm²",
  11: "Pa",
  12: "kPa",
  13: "Torr",
  14: "at",
  145: "inH2O (60 °F)",
  170: "cmH2O (4 °C)",
  171: "mH2O (4 °C)",
  172: "cmHg",
  173: "lb/ft²",
  174: "hPa",
  175: "psia",
  176: "kg/m²",
  177: "ftH2O (4 °C)",
  178: "ftH2O (60 °F)",
  179: "mHg",
  180: "Mpsi",
  237: "MPa",
  238: "inH2O (4 °C)",
  239: "mmH2O (4 °C)",
};

const TEMPERATURE_UNIT_NAMES = {
  32: "°C",
  33: "°F",
};

// ***********************************************************************************
// Helpers
// ***********************************************************************************

function uint16(bytes, index) {
  return (bytes[index] << 8) | bytes[index + 1];
}

function float32(bytes, index) {
  const view = new DataView(new ArrayBuffer(4));
  for (let i = 0; i < 4; i++) {
    view.setUint8(i, bytes[index + i]);
  }
  return view.getFloat32(0);
}

// Formats a number with at most maxDecimals decimals and removes floating point artifacts.
// A run of at least `threshold` zeros or nines in the decimals is treated as an artifact,
// e.g. 0.30000001192 -> 0.3 and 12.979999542 -> 12.98 (same behaviour as the WIKA parser).
function cleanNumber(value, threshold, maxDecimals) {
  if (
    Number.isNaN(value) ||
    !Number.isFinite(value) ||
    Number.isInteger(value)
  ) {
    return value;
  }

  const fixed = value.toFixed(maxDecimals);
  const decimalsStart = fixed.indexOf(".") + 1;
  let result = fixed;

  for (let i = decimalsStart; i < fixed.length; i++) {
    const digit = fixed[i];
    if (digit === "0" || digit === "9") {
      let end = i + 1;
      while (end < fixed.length && fixed[end] === digit) {
        end++;
      }

      if (end - i >= threshold) {
        result = fixed.substring(0, i);
        if (digit === "9") {
          // Round the cut number up on its last decimal
          const decimals = result.length - decimalsStart;
          const step = 10 ** -decimals;
          const number = parseFloat(result);
          const rounded = number < 0 ? number - step : number + step;
          result =
            decimals > 0 ? rounded.toFixed(decimals) : rounded.toString();
        }
        break;
      }
      i = end - 1;
    }
  }

  return parseFloat(result) || 0;
}

function round(value) {
  if (Number.isInteger(value)) {
    return value;
  }
  return cleanNumber(value + 5 * Number.EPSILON, 4, ROUNDING_DECIMALS);
}

function float32Clean(bytes, index) {
  return cleanNumber(float32(bytes, index), 3, 10);
}

// Converts a TULIP scale value (2500 - 12500) into the measuring range
function tulipToValue(tulipValue, range) {
  const percentage = ((tulipValue - 2500) * 100) / 10000;
  return (range.end - range.start) * (percentage / 100) + range.start;
}

// Converts a slope value (0 - 10000) into a change relative to the measuring range span
function slopeToValue(slopeValue, range) {
  if (slopeValue < 0 || slopeValue > 10000) {
    throw new Error(
      `Slope value must be between 0 and 10000, is ${slopeValue}`,
    );
  }
  return (slopeValue / 10000) * (range.end - range.start);
}

function hex(value) {
  return `0x${value.toString(16).padStart(2, "0")}`;
}

// Samples are collected and only emitted once the whole message could be decoded
let samples = [];

function addSample(topic, data) {
  samples.push({ topic, data });
}

// ***********************************************************************************
// TULIP2
// ***********************************************************************************

function getChannel(channelId, messageName) {
  const channel = CHANNEL_IDS[channelId];
  if (channel === undefined) {
    throw new Error(
      `Unknown channel ID: ${channelId} in ${messageName} message`,
    );
  }
  return channel;
}

function decodeTulip2DataMessage(bytes, ranges) {
  if (bytes.length !== 7) {
    throw new Error(
      `Data message (0x01/0x02) requires 7 bytes, but received ${bytes.length} bytes`,
    );
  }

  addSample("default", {
    pressure: round(tulipToValue(uint16(bytes, 3), ranges.pressure)),
    deviceTemperature: round(
      tulipToValue(uint16(bytes, 5), ranges.deviceTemperature),
    ),
    batteryVoltage: bytes[2] / 10,
  });
}

function decodeTulip2ProcessAlarmMessage(bytes, ranges) {
  if (bytes.length < 5 || (bytes.length - 2) % 3 !== 0) {
    throw new Error(
      `Process alarm message (0x03) requires at least 5 bytes (and target byte count 3n+2), but received ${bytes.length} bytes`,
    );
  }

  for (let i = 2; i < bytes.length; i += 3) {
    const channel = getChannel((bytes[i] & 0x78) >> 3, "process alarm");
    // Alarm types 6 and 7 are not defined, no flag is set for them
    const alarmType = PROCESS_ALARM_TYPES[bytes[i] & 0x07];
    const isSlope = alarmType === "fallingSlope" || alarmType === "risingSlope";
    const raw = uint16(bytes, i + 1);
    const value = isSlope
      ? slopeToValue(raw, ranges[channel])
      : tulipToValue(raw, ranges[channel]);

    addSample("process_alarm", {
      channel,
      alarmStatus: ALARM_EVENT_NAMES[(bytes[i] & 0x80) >> 7],
      lowThreshold: alarmType === "lowThreshold",
      highThreshold: alarmType === "highThreshold",
      fallingSlope: alarmType === "fallingSlope",
      risingSlope: alarmType === "risingSlope",
      lowThresholdWithDelay: alarmType === "lowThresholdWithDelay",
      highThresholdWithDelay: alarmType === "highThresholdWithDelay",
      value: round(value),
    });
  }
}

function decodeTulip2TechnicalAlarmMessage(bytes, ranges) {
  if (bytes.length < 5 || (bytes.length - 2) % 3 !== 0) {
    throw new Error(
      `Technical alarm message (0x04) requires at least 5 bytes (and target byte count 3n+2), but received ${bytes.length} bytes`,
    );
  }

  for (let i = 2; i < bytes.length; i += 3) {
    const channel = getChannel((bytes[i] & 0x78) >> 3, "technical alarm");
    const causeOfFailure =
      TECHNICAL_ALARM_CAUSE_OF_FAILURE_NAMES[bytes[i] & 0x07];

    addSample("technical_alarm", {
      channel,
      alarmStatus: ALARM_EVENT_NAMES[(bytes[i] & 0x80) >> 7],
      causeOfFailure: causeOfFailure === undefined ? "" : causeOfFailure,
      value: round(tulipToValue(uint16(bytes, i + 1), ranges[channel])),
    });
  }
}

function decodeTulip2DeviceAlarmMessage(bytes) {
  if (bytes.length !== 4) {
    throw new Error(
      `Device alarm message (0x05) requires 4 bytes, but received ${bytes.length} bytes`,
    );
  }

  const descriptor = bytes[2];
  const causeOfFailure =
    DEVICE_ALARM_CAUSE_OF_FAILURE_NAMES[(descriptor & 0x60) >> 6];
  const alarmType = DEVICE_ALARM_TYPE_NAMES[descriptor & 0x1f];

  addSample("device_alarm", {
    alarmStatus: ALARM_EVENT_NAMES[(descriptor & 0x80) >> 7],
    causeOfFailure: causeOfFailure === undefined ? "" : causeOfFailure,
    alarmType: alarmType === undefined ? null : alarmType,
    // Signed 8 bit value
    value: bytes[3] > 127 ? bytes[3] - 256 : bytes[3],
  });
}

function decodeTulip2ConfigurationStatusMessage(bytes) {
  if (bytes.length < 3) {
    throw new Error(
      `Configuration status message (0x06) requires at least 3 bytes, but received ${bytes.length} bytes`,
    );
  }

  // Bits 7-4 carry the status value, bits 3-0 the index of the last received packet
  const status = bytes[2] >> 4;
  if (CONFIGURATION_STATUS_NAMES[status] === undefined) {
    throw new Error(
      `Unknown configuration status value ${status} in configuration status message`,
    );
  }

  addSample("configuration", {
    configurationId: bytes[1],
    status,
    statusDescription: CONFIGURATION_STATUS_NAMES[status],
    lastPacketIndexReceived: bytes[2] & 0x0f,
  });
}

function decodeTulip2IdentificationMessage(bytes) {
  if (bytes.length < 41) {
    throw new Error(
      `Device identification message (0x07) requires at least 41 bytes, but received ${bytes.length} bytes`,
    );
  }

  // The serial number is terminated by a 0 byte
  let serialNumber = "";
  for (let i = 11; i < 22 && bytes[i] !== 0; i++) {
    serialNumber += String.fromCharCode(bytes[i]);
  }

  const pressureType = PRESSURE_TYPE_NAMES[bytes[22]];
  if (pressureType === undefined) {
    throw new Error(
      `Unknown pressure type ${bytes[22]} in device identification message`,
    );
  }

  const pressureUnit = bytes[39];
  if (PRESSURE_UNIT_NAMES[pressureUnit] === undefined) {
    throw new Error(
      `Unknown pressure unit ${pressureUnit} in device identification message`,
    );
  }

  const deviceTemperatureUnit = bytes[40];
  if (TEMPERATURE_UNIT_NAMES[deviceTemperatureUnit] === undefined) {
    throw new Error(
      `Unknown temperature unit ${deviceTemperatureUnit} in device identification message`,
    );
  }

  const version = (index) =>
    `${bytes[index] >> 4}.${bytes[index] & 0x0f}.${bytes[index + 1]}`;
  // The measuring ranges are little endian floats
  const littleEndianFloat = (index) =>
    float32Clean(bytes.slice(index, index + 4).reverse(), 0);

  addSample("device_information", {
    productIdName: bytes[2] === 10 ? "PGW23.100.11" : `${bytes[2]}`,
    productId: bytes[2],
    wirelessModuleFirmwareVersion: version(3),
    wirelessModuleHardwareVersion: version(5),
    sensorModuleFirmwareVersion: version(7),
    sensorModuleHardwareVersion: version(9),
    serialNumber,
    pressureType,
    measurementRangeStartPressure: littleEndianFloat(23),
    measurementRangeEndPressure: littleEndianFloat(27),
    measurementRangeStartDeviceTemperature: littleEndianFloat(31),
    measurementRangeEndDeviceTemperature: littleEndianFloat(35),
    pressureUnit,
    pressureUnitName: PRESSURE_UNIT_NAMES[pressureUnit],
    deviceTemperatureUnit,
    deviceTemperatureUnitName: TEMPERATURE_UNIT_NAMES[deviceTemperatureUnit],
  });
}

function decodeTulip2KeepAliveMessage(bytes) {
  if (bytes.length !== 3) {
    throw new Error(
      `Keep alive message (0x08) requires 3 bytes, but received ${bytes.length} bytes`,
    );
  }

  addSample("lifecycle", {
    batteryLevelNewEvent: (bytes[2] & 0x80) !== 0,
    batteryLevel: bytes[2] & 0x7f,
  });
}

function decodeTulip2(bytes, ranges) {
  switch (bytes[0]) {
    case 0x01:
    case 0x02:
      decodeTulip2DataMessage(bytes, ranges);
      break;
    case 0x03:
      decodeTulip2ProcessAlarmMessage(bytes, ranges);
      break;
    case 0x04:
      decodeTulip2TechnicalAlarmMessage(bytes, ranges);
      break;
    case 0x05:
      decodeTulip2DeviceAlarmMessage(bytes);
      break;
    case 0x06:
      decodeTulip2ConfigurationStatusMessage(bytes);
      break;
    case 0x07:
      decodeTulip2IdentificationMessage(bytes);
      break;
    case 0x08:
      decodeTulip2KeepAliveMessage(bytes);
      break;
    default:
      throw new Error(`Message type ${hex(bytes[0])} is not supported`);
  }
}

// ***********************************************************************************
// Entry point
// ***********************************************************************************

function getRanges(device) {
  const customFields =
    device !== undefined && device.customFields !== undefined
      ? device.customFields
      : {};
  const ranges = {};

  Object.keys(CHANNELS).forEach((channel) => {
    const range = {
      start: CHANNELS[channel].start,
      end: CHANNELS[channel].end,
    };
    const start = customFields[`${channel}RangeStart`];
    const end = customFields[`${channel}RangeEnd`];

    if (
      CHANNELS[channel].adjustable &&
      start !== undefined &&
      start !== null &&
      end !== undefined &&
      end !== null
    ) {
      range.start = Number(start);
      range.end = Number(end);
    }
    if (range.start >= range.end) {
      throw new Error(
        `Invalid measuring range for ${channel}: ${range.start} >= ${range.end}`,
      );
    }
    ranges[channel] = range;
  });

  return ranges;
}

function consume(event) {
  const bytes = Hex.hexToBytes(event.data.payloadHex);
  samples = [];

  try {
    const ranges = getRanges(event.device);

    if (bytes.length === 0) {
      throw new Error(
        "Message could not be decoded. No codec matched the input.",
      );
    }
    decodeTulip2(bytes, ranges);
  } catch (error) {
    samples = [
      {
        topic: "error",
        data: { errorMessage: `PGW23.100.11 (JS): ${error.message}` },
      },
    ];
  }

  samples.forEach((sample) => {
    emit("sample", sample);
  });
}
