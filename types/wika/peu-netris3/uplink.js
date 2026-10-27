// WIKA PEU+NETRIS3 uplink decoder
// Port of the official WIKA javascript parser 4.12.0 (https://github.com/WIKA-Group/javascript_parsers)
// Supports the TULIP2 (message types 0x01 - 0x09) and the TULIP3 protocol (message types 0x10 - 0x17)

// ***********************************************************************************
// Device configuration
// ***********************************************************************************

// Measuring ranges of the channels. Adjustable ranges can be overwritten with the
// custom fields <channel>RangeStart and <channel>RangeEnd, e.g. pressureRangeStart.
// The defaults are placeholders, check the device datasheet or the device identification message.
const CHANNELS = {
  pressure: { start: 0, end: 10, adjustable: true },
  deviceTemperature: { start: -40, end: 60, adjustable: false },
};

const ROUNDING_DECIMALS = 4;

// ***********************************************************************************
// TULIP2 lookups
// ***********************************************************************************

// TULIP2 channel ids
const TULIP2_CHANNELS = ["pressure", "deviceTemperature"];

const ALARM_EVENT_NAMES = ["triggered", "disappeared"];

const PROCESS_ALARM_TYPE_NAMES = [
  "low threshold",
  "high threshold",
  "falling slope",
  "rising slope",
  "low threshold with delay",
  "high threshold with delay",
];

// Technical alarm types with the channel they belong to and their causes of failure (first match wins)
const MV_STAT_CAUSES_OF_FAILURE = [
  { mask: 0x01, name: "MV_STAT_ERROR" },
  { mask: 0x02, name: "MV_STAT_WARNING" },
];

const TECHNICAL_ALARM_TYPES = {
  0: {
    name: "MV_STAT channel 0",
    channel: "pressure",
    causes: MV_STAT_CAUSES_OF_FAILURE,
  },
  1: {
    name: "MV_STAT channel 1",
    channel: "deviceTemperature",
    causes: MV_STAT_CAUSES_OF_FAILURE,
  },
  2: {
    name: "MV_STAT channel 2",
    causes: MV_STAT_CAUSES_OF_FAILURE,
  },
  3: {
    name: "MV_STAT channel 3",
    causes: MV_STAT_CAUSES_OF_FAILURE,
  },
  4: {
    name: "STAT_DEV",
    causes: [
      { mask: 0x01, name: "STAT_DEV_ERROR" },
      { mask: 0x02, name: "STAT_DEV_WARNING" },
      { mask: 0x04, name: "STAT_DEV_RESTARTED" },
    ],
  },
};

const DEVICE_ALARM_FLAGS = {
  lowBattery: 0x0001,
  temperatureAlarm: 0x0002,
  dutyCycleAlarm: 0x0004,
  uartAlarm: 0x0100,
};

const PRODUCT_SUB_ID_NAMES = {
  0: "LoRaWAN",
  1: "MIOTY",
};

const LPP_MEASURANDS_PRESSURE = {
  0x03: "Pressure (gauge)",
  0x04: "Pressure (absolute)",
  0x05: "Pressure (differential)",
};

const LPP_MEASURANDS_TEMPERATURE = {
  0x01: "Temperature",
};

// Unit ids as defined by WIKA (0x20 - 0x22 follow 0x19)
const LPP_UNITS_PRESSURE = {
  0x07: "bar",
  0x08: "mbar",
  0x09: "µbar",
  0x0a: "Pa",
  0x0b: "hPa",
  0x0c: "kPa",
  0x0d: "MPa",
  0x0e: "psi",
  0x0f: "lbf/ft²",
  0x10: "kN/m²",
  0x11: "N/cm²",
  0x12: "atm",
  0x13: "kg/cm²",
  0x14: "kg/mm²",
  0x15: "µmHg",
  0x16: "mmHg",
  0x17: "cmHg",
  0x18: "inHg",
  0x19: "mmH2O",
  0x20: "mH2O",
  0x21: "inH2O",
  0x22: "ftH2O",
};

const LPP_UNITS_TEMPERATURE = {
  0x01: "°C",
  0x02: "°F",
  0x03: "K",
  0x04: "°R",
};

// ***********************************************************************************
// TULIP3 device profile
// ***********************************************************************************

const TULIP3_CHANNEL_IDENTIFICATION_REGISTERS = [
  "measurand",
  "unit",
  "minMeasureRange",
  "maxMeasureRange",
  "minPhysicalLimit",
  "maxPhysicalLimit",
  "accuracy",
  "offset",
  "gain",
  "calibrationDate",
];

const TULIP3_CHANNEL_CONFIGURATION_REGISTERS = [
  "processAlarmEnabled",
  "processAlarmDeadBand",
  "lowThresholdAlarmValue",
  "highThresholdAlarmValue",
  "fallingSlopeAlarmValue",
  "risingSlopeAlarmValue",
  "lowThresholdWithDelayAlarmValue",
  "lowThresholdWithDelayAlarmDelay",
  "highThresholdWithDelayAlarmValue",
  "highThresholdWithDelayAlarmDelay",
];

const TULIP3_PROFILE = {
  communicationModule: {
    alarmFlags: {
      airTimeLimitation: 0x0008,
      memoryError: 0x0010,
      lowVoltage: 0x0020,
    },
    identificationRegisters: [
      "productId",
      "productSubId",
      "channelPlan",
      "connectedSensors",
      "firmwareVersion",
      "hardwareVersion",
      "productionDate",
      "serialNumberPart1",
      "serialNumberPart2",
    ],
    configurationRegisters: [
      "measuringPeriodAlarmOff",
      "measuringPeriodAlarmOn",
      "transmissionRateAlarmOff",
      "transmissionRateAlarmOn",
      "underVoltageThreshold",
    ],
  },
  sensors: {
    sensor1: {
      alarmFlags: {
        sensorCommunicationError: 0x0001,
        sensorALUSaturation: 0x2000,
        sensorMemoryIntegrity: 0x4000,
        sensorBusy: 0x8000,
      },
      identificationRegisters: [
        "sensorType",
        "existingChannels",
        "firmwareVersion",
        "hardwareVersion",
        "productionDate",
        "serialNumberPart1",
        "serialNumberPart2",
      ],
      configurationRegisters: ["samplingChannels"],
      channels: {
        channel1: {
          name: "pressure",
          measurementTypes: [
            "uint16 - TULIP scale 2500 - 12500",
            "float - IEEE754",
          ],
          alarmFlags: {
            outOfMinPhysicalSensorLimit: 0x0010,
            outOfMaxPhysicalSensorLimit: 0x0020,
          },
          identificationRegisters: TULIP3_CHANNEL_IDENTIFICATION_REGISTERS,
          configurationRegisters: TULIP3_CHANNEL_CONFIGURATION_REGISTERS,
        },
        channel2: {
          name: "device temperature",
          measurementTypes: [
            "uint16 - TULIP scale 2500 - 12500",
            "float - IEEE754",
          ],
          alarmFlags: {
            outOfMaxPhysicalSensorLimit: 0x0020,
          },
          identificationRegisters: TULIP3_CHANNEL_IDENTIFICATION_REGISTERS,
          configurationRegisters: TULIP3_CHANNEL_CONFIGURATION_REGISTERS,
        },
      },
    },
  },
};

// ***********************************************************************************
// Helpers
// ***********************************************************************************

function uint16(bytes, index) {
  return (bytes[index] << 8) | bytes[index + 1];
}

function uint32(bytes, index) {
  return (
    ((bytes[index] << 24) |
      (bytes[index + 1] << 16) |
      (bytes[index + 2] << 8) |
      bytes[index + 3]) >>>
    0
  );
}

function float32(bytes, index) {
  const view = new DataView(new ArrayBuffer(4));
  for (let i = 0; i < 4; i++) {
    view.setUint8(i, bytes[index + i]);
  }
  return view.getFloat32(0);
}

function ascii(bytes) {
  return String.fromCharCode.apply(null, bytes);
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

function decodeFlags(value, flagDefinitions) {
  const flags = {};
  Object.keys(flagDefinitions).forEach((flag) => {
    flags[flag] = (value & flagDefinitions[flag]) !== 0;
  });
  return flags;
}

// Turns a channel name like "device temperature" into a data key like "deviceTemperature"
function toKey(name) {
  return name.replace(/[^a-zA-Z0-9]+(.)/g, (match, char) => char.toUpperCase());
}

function capitalize(text) {
  return text.charAt(0).toUpperCase() + text.slice(1);
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

function lookupName(table, value, name) {
  if (table[value] === undefined) {
    throw new Error(
      `Unknown ${name} ${value} in device identification message`,
    );
  }
  return table[value];
}

function version(bytes, index) {
  return `${bytes[index]}.${bytes[index + 1]}.${bytes[index + 2]}`;
}

function decodeTulip2DataMessage(bytes, ranges) {
  if (bytes.length < 4 || bytes.length > 11) {
    throw new Error(
      `Data message (0x01/0x02) requires at least 4 and at most 11 bytes, but received ${bytes.length} bytes`,
    );
  }

  // Channels which are missing or contain the error value 0xffff are null
  const data = {};
  TULIP2_CHANNELS.forEach((channel, channelId) => {
    const index = 3 + channelId * 2;
    const raw = index + 1 < bytes.length ? uint16(bytes, index) : 0xffff;
    if (raw !== 0xffff) {
      data[channel] =
        raw === 0xffff ? null : round(tulipToValue(raw, ranges[channel]));
    }
  });

  addSample("default", data);
}

function decodeTulip2ProcessAlarmMessage(bytes, ranges) {
  if (bytes.length < 6 || (bytes.length - 3) % 3 !== 0) {
    throw new Error(
      `Process alarm message (0x03) requires at least 6 bytes (and target byte count 3n+3), but received ${bytes.length} bytes`,
    );
  }

  for (let i = 3; i < bytes.length; i += 3) {
    const channelId = (bytes[i] & 0x78) >> 3;
    const alarmType = bytes[i] & 0x07;
    const channel = TULIP2_CHANNELS[channelId];
    if (channel === undefined) {
      throw new Error(
        `Channel configuration missing for channelId ${channelId} in process alarm message`,
      );
    }

    // 0xffff marks an invalid value
    const raw = uint16(bytes, i + 1);
    let value = null;
    if (raw !== 0xffff) {
      const isSlope = alarmType === 2 || alarmType === 3;
      value = round(
        isSlope
          ? slopeToValue(raw, ranges[channel])
          : tulipToValue(raw, ranges[channel]),
      );
    }

    if (PROCESS_ALARM_TYPE_NAMES[alarmType] === undefined) {
      throw new Error(
        `Unknown alarmType ${alarmType} in process alarm message`,
      );
    }

    addSample("process_alarm", {
      channel,
      alarmStatus: ALARM_EVENT_NAMES[(bytes[i] & 0x80) >> 7],
      lowThreshold: alarmType === 0,
      highThreshold: alarmType === 1,
      fallingSlope: alarmType === 2,
      risingSlope: alarmType === 3,
      lowThresholdWithDelay: alarmType === 4,
      highThresholdWithDelay: alarmType === 5,
      value,
    });
  }
}

function decodeTulip2TechnicalAlarmMessage(bytes) {
  if (bytes.length < 6 || (bytes.length - 3) % 3 !== 0) {
    throw new Error(
      `Technical alarm message (0x04) requires at least 6 bytes (and target byte count 3n+3), but received ${bytes.length} bytes`,
    );
  }

  for (let i = 3; i < bytes.length; i += 3) {
    const alarmType = TECHNICAL_ALARM_TYPES[bytes[i]];
    if (alarmType === undefined) {
      throw new Error(
        `Unknown technical alarm type ${bytes[i]} in technical alarm message`,
      );
    }

    // bytes[i + 1] is reserved
    const causeOfFailure = alarmType.causes.find(
      (cause) => (bytes[i + 2] & cause.mask) !== 0,
    );
    if (causeOfFailure === undefined) {
      throw new Error(
        `Unknown causeOfFailure ${bytes[i + 2]} for technical alarm type ${bytes[i]} in technical alarm message`,
      );
    }

    addSample("technical_alarm", {
      channel: alarmType.channel,
      alarmType: alarmType.name,
      causeOfFailure: causeOfFailure.name,
    });
  }
}

function decodeTulip2DeviceAlarmMessage(bytes) {
  if (bytes.length !== 4) {
    throw new Error(
      `Device alarm message (0x05) requires 4 bytes, but received ${bytes.length} bytes`,
    );
  }

  addSample(
    "device_alarm",
    decodeFlags(uint16(bytes, 2) & 0x7fff, DEVICE_ALARM_FLAGS),
  );
}

function decodeTulip2IdentificationMessage(bytes) {
  if (bytes.length < 26) {
    throw new Error(
      `Device identification message (0x07) requires at least 26 bytes, but received ${bytes.length} bytes`,
    );
  }

  const productId = bytes[2];
  if (productId !== 0x0f) {
    throw new Error(
      `Invalid productId ${productId} in device identification message. Expected 15 (NETRIS3).`,
    );
  }

  const productSubId = bytes[3];
  if (PRODUCT_SUB_ID_NAMES[productSubId] === undefined) {
    throw new Error(
      `Unknown productSubId ${productSubId} in device identification message. Only LoRaWAN (0) is supported.`,
    );
  }

  addSample("device_information", {
    productId,
    productIdName: "NETRIS3",
    productSubId: String(productSubId),
    productSubIdName: PRODUCT_SUB_ID_NAMES[productSubId],
    sensorDeviceTypeId: uint16(bytes, 4),
    pressureMeasurand: bytes[6],
    pressureMeasurandName: lookupName(
      LPP_MEASURANDS_PRESSURE,
      bytes[6],
      "pressure measurand",
    ),
    pressureMeasurementRangeStart: float32Clean(bytes, 7),
    pressureMeasurementRangeEnd: float32Clean(bytes, 11),
    pressureUnit: bytes[15],
    pressureUnitName: lookupName(
      LPP_UNITS_PRESSURE,
      bytes[15],
      "pressure unit",
    ),
    deviceTemperatureMeasurand: bytes[16],
    deviceTemperatureMeasurandName: lookupName(
      LPP_MEASURANDS_TEMPERATURE,
      bytes[16],
      "temperature measurand",
    ),
    deviceTemperatureMeasurementRangeStart: float32Clean(bytes, 17),
    deviceTemperatureMeasurementRangeEnd: float32Clean(bytes, 21),
    deviceTemperatureUnit: bytes[25],
    deviceTemperatureUnitName: lookupName(
      LPP_UNITS_TEMPERATURE,
      bytes[25],
      "temperature unit",
    ),
  });
}

function decodeTulip2KeepAliveMessage(bytes) {
  if (bytes.length !== 10) {
    throw new Error(
      `Keep alive message (0x08) requires 10 bytes, but received ${bytes.length} bytes`,
    );
  }

  addSample("lifecycle", {
    numberOfMeasurements: uint32(bytes, 2),
    numberOfTransmissions: uint32(bytes, 6),
  });
}

function decodeTulip2ExtendedIdentificationMessage(bytes) {
  if (bytes.length < 20 || bytes.length > 42) {
    throw new Error(
      `Extended device identification message (0x09) requires at least 20 and at most 42 bytes, but received ${bytes.length} bytes`,
    );
  }

  // Bit 0-3 flag the optional fields
  const optionalFieldsMask = bytes[2] & 0x0f;
  const expectedLength =
    20 +
    (optionalFieldsMask & 0x01 ? 12 : 0) +
    (optionalFieldsMask & 0x02 ? 4 : 0) +
    (optionalFieldsMask & 0x04 ? 3 : 0) +
    (optionalFieldsMask & 0x08 ? 3 : 0);
  if (bytes.length < expectedLength) {
    throw new Error(
      `Extended device identification message (0x09) with optional fields mask ${optionalFieldsMask} requires at least ${expectedLength} bytes, but received ${bytes.length} bytes`,
    );
  }

  const data = {
    optionalFieldsMask,
    wikaSensorSerialNumber: null,
    sensorLUID: null,
    sensorHardwareVersion: null,
    sensorFirmwareVersion: null,
  };
  let position = 3;

  if (optionalFieldsMask & 0x01) {
    // Zero terminated string of at most 12 characters
    let serial = "";
    for (let i = position; i < position + 12 && bytes[i] !== 0; i++) {
      serial += String.fromCharCode(bytes[i]);
    }
    data.wikaSensorSerialNumber = serial.length > 0 ? serial : null;
    position += 12;
  }
  if (optionalFieldsMask & 0x02) {
    data.sensorLUID = uint32(bytes, position);
    position += 4;
  }
  if (optionalFieldsMask & 0x04) {
    data.sensorHardwareVersion = version(bytes, position);
    position += 3;
  }

  data.deviceHardwareVersion = version(bytes, position);
  position += 3;

  if (optionalFieldsMask & 0x08) {
    data.sensorFirmwareVersion = version(bytes, position);
    position += 3;
  }

  // 3 bytes number followed by one letter, e.g. N013630
  const serialDigits =
    (bytes[position] << 16) | (bytes[position + 1] << 8) | bytes[position + 2];
  data.deviceSerialNumber =
    String.fromCharCode(bytes[position + 3]) +
    String(serialDigits).padStart(6, "0");
  position += 4;

  data.deviceProductCode = ascii(bytes.slice(position, position + 7));
  position += 7;

  data.deviceFirmwareVersion = version(bytes, position);

  addSample("device_information", data);
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
      decodeTulip2TechnicalAlarmMessage(bytes);
      break;
    case 0x05:
      decodeTulip2DeviceAlarmMessage(bytes);
      break;
    case 0x07:
      decodeTulip2IdentificationMessage(bytes);
      break;
    case 0x08:
      decodeTulip2KeepAliveMessage(bytes);
      break;
    case 0x09:
      decodeTulip2ExtendedIdentificationMessage(bytes);
      break;
    default:
      throw new Error(`Message type ${hex(bytes[0])} is not supported`);
  }
}

// ***********************************************************************************
// TULIP3
// ***********************************************************************************

const TULIP3_DATA_TYPES = {
  0: { name: "float - IEEE754", length: 4 },
  1: { name: "int 24 - Fixed-point s16.7 (Q16.7)", length: 3 },
  2: { name: "int 16 - Fixed-point s10.5 (Q10.5)", length: 2 },
  3: { name: "uint16 - TULIP scale 2500 - 12500", length: 2 },
};

const TULIP3_PRODUCT_SUB_IDS = {
  0x00: "LoRaWAN class A",
  0x01: "BLE only",
  0x02: "LoRaWAN class A",
  0x03: "LoRaWAN class B",
  0x04: "LoRaWAN class C",
  0x05: "Mioty class Z",
  0x06: "Mioty class A",
  0x07: "Mioty class B",
};

const TULIP3_CONFIGURATION_STATUS = {
  0: "Configuration received but not applied",
  1: "Configuration received and applied with success",
  2: "Configuration rejected - Tried to write a read only register",
  3: "Configuration rejected - At least one register has an invalid value",
  4: "Configuration rejected - The combination register start address/number of bytes is wrong",
  5: "Entire configuration discarded because of invalid parameter combination",
  6: "Entire configuration discarded because no answer from the cloud",
  7: "Missing frame",
  8: "Frame rejected - frame number already received",
};

const TULIP3_DOWNLINK_ANSWER_STATUS = {
  0: "Success",
  1: "Unsupported command",
  2: "Logical error",
  3: "Memory error",
  4: "Device error",
  5: "Wrong frame format",
  6: "Communication session lock",
};

// Message type and sub types of downlinks which can be answered by the device
const TULIP3_ANSWERABLE_DOWNLINKS = {
  0x01: [0x01, 0x02],
  0x02: [0x01, 0x02],
  0x03: [0x01, 0x02, 0x03],
  0x04: [0x01],
  0x05: [0x01],
};

const TULIP3_MEASURANDS = {
  1: "Temperature",
  2: "Temperature difference",
  3: "Pressure (gauge)",
  4: "Pressure (absolute)",
  5: "Pressure (differential)",
  6: "Flow (vol.)",
  7: "Flow (mass)",
  8: "Force",
  9: "Mass",
  10: "Level",
  11: "Length",
  12: "Volume",
  13: "Current",
  14: "Voltage",
  15: "Resistance",
  16: "Capacitance",
  17: "Inductance",
  18: "Relative",
  19: "Time",
  20: "Frequency",
  21: "Speed",
  22: "Acceleration",
  23: "Density",
  24: "Density (gauge pressure at 20 °C)",
  25: "Density (absolute pressure at 20 °C)",
  26: "Humidity (relative)",
  27: "Humidity (absolute)",
  28: "Angle of rotation / inclination",
  29: "Strain",
};

const TULIP3_UNITS = {
  1: "°C",
  2: "°F",
  3: "K",
  4: "°R",
  7: "bar",
  8: "mbar",
  9: "μbar",
  10: "Pa",
  11: "hPa",
  12: "kPa",
  13: "MPa",
  14: "psi",
  15: "lbf/ft²",
  16: "kN/m²",
  17: "N/cm²",
  18: "atm",
  19: "kg/cm²",
  20: "kg/mm²",
  21: "μmHg",
  22: "mmHg",
  23: "cmHg",
  24: "inHg",
  25: "mmH2O",
  26: "mH2O",
  27: "inH2O",
  28: "ftH2O",
  45: "N",
  46: "daN",
  47: "kN",
  48: "MN",
  49: "kp",
  50: "lbf",
  51: "ozf",
  52: "dyn",
  55: "kg",
  56: "g",
  57: "mg",
  58: "lb",
  60: "mm",
  61: "cm",
  62: "m",
  63: "μm",
  64: "ft",
  65: "in",
  70: "l",
  71: "ml",
  72: "m³",
  73: "gal (UK)",
  74: "gal (US)",
  75: "ft³",
  76: "in³",
  82: "mΩ",
  83: "Ω",
  84: "kΩ",
  86: "μV",
  87: "mV",
  88: "V",
  90: "mA",
  91: "μA",
  93: "μF",
  94: "nF",
  95: "pF",
  97: "mH",
  98: "μH",
  100: "%",
  101: "‰",
  102: "ppm",
  105: "°",
  106: "rad",
  108: "counts",
  110: "kg/m³",
  111: "g/m³",
  112: "mg/m³",
  113: "μg/m³",
  114: "kg/l",
  115: "g/l",
  116: "lb/ft³",
  120: "l/min",
  121: "l/s",
  122: "m³/h",
  123: "m³/s",
  124: "cfm",
  140: "kg/s",
  141: "kg/h",
  160: "s",
  161: "min",
  162: "h",
  163: "d",
  167: "Hz",
  168: "kHz",
  170: "m/s",
  171: "cm/s",
  172: "ft/min",
  173: "ft/s",
  180: "m/s²",
  181: "ft/s²",
  185: "µeps",
};

// Register value parsers. Each returns the value or an object of values which get prefixed with the register name.
function lookup(table, name) {
  return (bytes) => {
    if (table[bytes[0]] === undefined) {
      throw new Error(`Unknown ${name} value: ${bytes[0]} (${hex(bytes[0])})`);
    }
    return table[bytes[0]];
  };
}

function bitList(prefix, count) {
  return (bytes) => {
    const result = {};
    for (let i = 1; i <= count; i++) {
      result[`${prefix}${i}`] = (bytes[0] & (1 << (i - 1))) !== 0;
    }
    return result;
  };
}

const parseUInt8 = (bytes) => bytes[0];
const parseInt8 = (bytes) => (bytes[0] > 127 ? bytes[0] - 256 : bytes[0]);
const parseUInt16 = (bytes) => uint16(bytes, 0);
const parseUInt32 = (bytes) => uint32(bytes, 0);
const parseFloat32 = (bytes) => float32Clean(bytes, 0);
const parseBoolean = (bytes) => bytes[0] !== 0;
const parseVersion = (bytes) => `${bytes[0]}.${bytes[1]}.${bytes[2]}`;
const parseDate = (bytes) =>
  `${bytes[0] + 2000}-${String(bytes[1]).padStart(2, "0")}-${String(bytes[2]).padStart(2, "0")}`;
const parseAccuracy = (bytes) => uint16(bytes, 0) / 1000;
const parseDataType = (bytes) =>
  TULIP3_DATA_TYPES[bytes[0]]
    ? TULIP3_DATA_TYPES[bytes[0]].name
    : `Unknown type: ${bytes[0]}`;
const parseProcessAlarmEnabled = (bytes) => ({
  lowThreshold: (bytes[0] & 0x80) !== 0,
  highThreshold: (bytes[0] & 0x40) !== 0,
  fallingSlope: (bytes[0] & 0x20) !== 0,
  risingSlope: (bytes[0] & 0x10) !== 0,
  lowThresholdWithDelay: (bytes[0] & 0x08) !== 0,
  highThresholdWithDelay: (bytes[0] & 0x04) !== 0,
});

// Register maps: offset relative to the start address of the component, size in bytes and parser
const TULIP3_IDENTIFICATION_REGISTERS = {
  communicationModule: {
    productId: { offset: 0x00, size: 1, parse: parseUInt8 },
    productSubId: {
      offset: 0x01,
      size: 1,
      parse: lookup(TULIP3_PRODUCT_SUB_IDS, "product sub-ID"),
    },
    channelPlan: { offset: 0x02, size: 1, parse: parseUInt8 },
    connectedSensors: { offset: 0x03, size: 1, parse: bitList("sensor", 4) },
    firmwareVersion: { offset: 0x04, size: 3, parse: parseVersion },
    hardwareVersion: { offset: 0x07, size: 3, parse: parseVersion },
    productionDate: { offset: 0x0a, size: 3, parse: parseDate },
    serialNumberPart1: { offset: 0x0d, size: 5, parse: ascii },
    serialNumberPart2: { offset: 0x12, size: 6, parse: ascii },
  },
  sensor: {
    sensorType: { offset: 0x00, size: 2, parse: parseUInt16 },
    existingChannels: { offset: 0x02, size: 1, parse: bitList("channel", 8) },
    firmwareVersion: { offset: 0x03, size: 3, parse: parseVersion },
    hardwareVersion: { offset: 0x06, size: 3, parse: parseVersion },
    productionDate: { offset: 0x09, size: 3, parse: parseDate },
    serialNumberPart1: { offset: 0x0c, size: 5, parse: ascii },
    serialNumberPart2: { offset: 0x11, size: 6, parse: ascii },
  },
  channel: {
    measurand: {
      offset: 0x00,
      size: 1,
      parse: lookup(TULIP3_MEASURANDS, "measurand"),
    },
    unit: { offset: 0x01, size: 1, parse: lookup(TULIP3_UNITS, "unit") },
    minMeasureRange: { offset: 0x02, size: 4, parse: parseFloat32 },
    maxMeasureRange: { offset: 0x06, size: 4, parse: parseFloat32 },
    minPhysicalLimit: { offset: 0x0a, size: 4, parse: parseFloat32 },
    maxPhysicalLimit: { offset: 0x0e, size: 4, parse: parseFloat32 },
    accuracy: { offset: 0x12, size: 2, parse: parseAccuracy },
    offset: { offset: 0x14, size: 4, parse: parseFloat32 },
    gain: { offset: 0x18, size: 4, parse: parseFloat32 },
    calibrationDate: { offset: 0x1c, size: 3, parse: parseDate },
  },
};

const TULIP3_CONFIGURATION_REGISTERS = {
  communicationModule: {
    measuringPeriodAlarmOff: { offset: 0x00, size: 4, parse: parseUInt32 },
    measuringPeriodAlarmOn: { offset: 0x04, size: 4, parse: parseUInt32 },
    transmissionRateAlarmOff: { offset: 0x08, size: 2, parse: parseUInt16 },
    transmissionRateAlarmOn: { offset: 0x0a, size: 2, parse: parseUInt16 },
    overVoltageThreshold: { offset: 0x0c, size: 2, parse: parseUInt16 },
    underVoltageThreshold: { offset: 0x0e, size: 2, parse: parseUInt16 },
    overTemperatureCmChip: { offset: 0x10, size: 1, parse: parseInt8 },
    underTemperatureCmChip: { offset: 0x11, size: 1, parse: parseInt8 },
    downlinkAnswerTimeout: { offset: 0x12, size: 1, parse: parseUInt8 },
    fetchAdditionalDownlinkTimeInterval: {
      offset: 0x13,
      size: 1,
      parse: parseUInt8,
    },
    enableBleAdvertising: { offset: 0x14, size: 1, parse: parseBoolean },
  },
  sensor: {
    samplingChannels: { offset: 0x00, size: 1, parse: bitList("channel", 8) },
    bootTime: { offset: 0x01, size: 2, parse: parseUInt16 },
    communicationTimeout: { offset: 0x03, size: 2, parse: parseUInt16 },
    communicationRetryCount: { offset: 0x05, size: 1, parse: parseUInt8 },
  },
  channel: {
    protocolDataType: { offset: 0x00, size: 1, parse: parseDataType },
    processAlarmEnabled: {
      offset: 0x01,
      size: 1,
      parse: parseProcessAlarmEnabled,
    },
    processAlarmDeadBand: { offset: 0x02, size: 4, parse: parseFloat32 },
    lowThresholdAlarmValue: { offset: 0x06, size: 4, parse: parseFloat32 },
    highThresholdAlarmValue: { offset: 0x0a, size: 4, parse: parseFloat32 },
    fallingSlopeAlarmValue: { offset: 0x0e, size: 4, parse: parseFloat32 },
    risingSlopeAlarmValue: { offset: 0x12, size: 4, parse: parseFloat32 },
    lowThresholdWithDelayAlarmValue: {
      offset: 0x16,
      size: 4,
      parse: parseFloat32,
    },
    lowThresholdWithDelayAlarmDelay: {
      offset: 0x1a,
      size: 2,
      parse: parseUInt16,
    },
    highThresholdWithDelayAlarmValue: {
      offset: 0x1c,
      size: 4,
      parse: parseFloat32,
    },
    highThresholdWithDelayAlarmDelay: {
      offset: 0x20,
      size: 2,
      parse: parseUInt16,
    },
  },
};

// Start addresses of the sensors and channels in the identification and configuration register space
function identificationAddress(sensorNumber, channelNumber) {
  if (channelNumber === undefined) {
    return 0x03c + (sensorNumber - 1) * 460;
  }
  return (
    0x03c +
    (sensorNumber - 1) * 400 +
    sensorNumber * 60 +
    (channelNumber - 1) * 50
  );
}

function configurationAddress(sensorNumber, channelNumber) {
  if (channelNumber === undefined) {
    return 0x02a + (sensorNumber - 1) * 493;
  }
  return (
    0x02a +
    (sensorNumber - 1) * 464 +
    sensorNumber * 29 +
    (channelNumber - 1) * 58
  );
}

function getChannelConfig(sensorId, channelId) {
  const sensor = TULIP3_PROFILE.sensors[`sensor${sensorId + 1}`];
  return sensor ? sensor.channels[`channel${channelId + 1}`] : undefined;
}

// Builds a lookup of register address -> { key, size, parse } for all registers of the device.
// Data keys are prefixed with "sensor" for sensor registers and with the channel name for channel registers.
// Registers which the device does not support are added as guards to reject the message.
function buildRegisterLookup(registers, getAddress) {
  const registerLookup = {};

  function addRegisters(baseAddress, definitions, enabled, prefix, context) {
    Object.keys(definitions).forEach((name) => {
      const definition = definitions[name];
      const address = baseAddress + definition.offset;
      if (enabled.includes(name)) {
        registerLookup[address] = {
          key: prefix === "" ? name : prefix + capitalize(name),
          size: definition.size,
          parse: definition.parse,
        };
      } else {
        registerLookup[address] = {
          guard: `Register ${hex(address)} for '${name}' on ${context} is not available for this device`,
        };
      }
    });
  }

  const cm = TULIP3_PROFILE.communicationModule;
  addRegisters(
    0,
    registers.communicationModule,
    getAddress === identificationAddress
      ? cm.identificationRegisters
      : cm.configurationRegisters,
    "",
    "communication module",
  );

  for (let sensorNumber = 1; sensorNumber <= 4; sensorNumber++) {
    const sensor = TULIP3_PROFILE.sensors[`sensor${sensorNumber}`];
    const sensorRegisters =
      getAddress === identificationAddress
        ? "identificationRegisters"
        : "configurationRegisters";
    const sensorPrefix =
      sensorNumber === 1 ? "sensor" : `sensor${sensorNumber}`;
    addRegisters(
      getAddress(sensorNumber),
      registers.sensor,
      sensor ? sensor[sensorRegisters] : [],
      sensorPrefix,
      `sensor ${sensorNumber}`,
    );

    for (let channelNumber = 1; channelNumber <= 8; channelNumber++) {
      const channel = sensor
        ? sensor.channels[`channel${channelNumber}`]
        : undefined;
      const prefix = channel ? toKey(channel.name) : "";
      addRegisters(
        getAddress(sensorNumber, channelNumber),
        registers.channel,
        channel ? channel[sensorRegisters] : [],
        prefix,
        `sensor ${sensorNumber} channel ${channelNumber}`,
      );
    }
  }

  return registerLookup;
}

// Decodes the register blocks of an identification or configuration read message.
// Each block starts with a 2 byte addressing field: 11 bit start address and 5 bit length.
function decodeTulip3Registers(bytes, registerLookup) {
  const data = {};
  let position = 2;

  while (position < bytes.length) {
    if (position + 1 >= bytes.length) {
      throw new Error(`Incomplete register block at position ${position}`);
    }

    let address = uint16(bytes, position) >> 5;
    const length = bytes[position + 1] & 0x1f;
    if (position + 2 + length > bytes.length) {
      throw new Error(
        `Incomplete register data for address ${hex(address)} at position ${position}`,
      );
    }

    // A block can contain several consecutive registers
    let value = bytes.slice(position + 2, position + 2 + length);
    while (value.length > 0) {
      const register = registerLookup[address];
      if (register === undefined) {
        throw new Error(`Unknown register address ${hex(address)}`);
      }
      if (register.guard !== undefined) {
        throw new Error(register.guard);
      }
      if (value.length < register.size) {
        throw new Error(
          `Insufficient data for register ${hex(address)} (${register.key})`,
        );
      }

      const parsed = register.parse(value.slice(0, register.size));
      if (parsed !== null && typeof parsed === "object") {
        Object.keys(parsed).forEach((key) => {
          data[register.key + capitalize(key)] = parsed[key];
        });
      } else {
        data[register.key] = parsed;
      }

      address += register.size;
      value = value.slice(register.size);
    }

    position += 2 + length;
  }

  return data;
}

function decodeTulip3DataMessage(bytes, ranges) {
  if (bytes.length < 3) {
    throw new Error(
      `Data message too short. Expected at least 3 bytes but got ${bytes.length}`,
    );
  }

  const data = {};
  let position = 2;
  while (position < bytes.length) {
    // Bit 7-6 sensor id, bit 5-3 channel id, bit 2-1 data type
    const sensorId = (bytes[position] & 0xc0) >> 6;
    const channelId = (bytes[position] & 0x38) >> 3;
    const dataType = TULIP3_DATA_TYPES[(bytes[position] & 0x06) >> 1];

    if (position + dataType.length > bytes.length) {
      throw new Error(
        `Not enough data left to finish reading measurement data block for ${dataType.name}`,
      );
    }

    const channel = getChannelConfig(sensorId, channelId);
    if (channel === undefined) {
      throw new Error(
        `Measurement from sensor${sensorId + 1} channel${channelId + 1} is not supported by this device`,
      );
    }
    if (!channel.measurementTypes.includes(dataType.name)) {
      throw new Error(
        `Measurement from sensor${sensorId + 1} channel${channelId + 1} does not support data type ${dataType.name}`,
      );
    }

    const range = ranges[toKey(channel.name)];
    let value;
    if (dataType.name === "float - IEEE754") {
      value = float32(bytes, position + 1);
      if (Number.isNaN(value)) {
        value = null;
      } else if (value < range.start || value > range.end) {
        throw new Error(
          `Measurement for sensor${sensorId + 1} channel${channelId + 1} is out of range, got ${value}`,
        );
      }
    } else if (dataType.name === "uint16 - TULIP scale 2500 - 12500") {
      const raw = uint16(bytes, position + 1);
      value = raw === 0xffff ? null : tulipToValue(raw, range);
    } else {
      throw new Error(`Data type ${dataType.name} is not implemented yet`);
    }

    // null marks a value acquisition error
    data[toKey(channel.name)] = value === null ? null : round(value);
    position += dataType.length + 1;
  }

  addSample("default", data);
}

function decodeTulip3ProcessAlarmMessage(bytes) {
  if (bytes.length < 4) {
    throw new Error(
      `Process alarm message too short. Expected at least 4 bytes but got ${bytes.length}`,
    );
  }
  if (bytes.length % 2 !== 0) {
    throw new Error(
      "Not enough data left to finish reading process alarm entry",
    );
  }

  for (let position = 2; position < bytes.length; position += 2) {
    const sensorId = (bytes[position] & 0xc0) >> 6;
    const channelId = (bytes[position] & 0x38) >> 3;
    const channel = getChannelConfig(sensorId, channelId);
    if (channel === undefined) {
      throw new Error(
        `Process alarm for sensor${sensorId + 1} channel${channelId + 1} is not supported by this device`,
      );
    }

    const alarm = bytes[position + 1];
    addSample("process_alarm", {
      channel: toKey(channel.name),
      lowThreshold: (alarm & 0x80) !== 0,
      highThreshold: (alarm & 0x40) !== 0,
      fallingSlope: (alarm & 0x20) !== 0,
      risingSlope: (alarm & 0x10) !== 0,
      lowThresholdWithDelay: (alarm & 0x08) !== 0,
      highThresholdWithDelay: (alarm & 0x04) !== 0
    });
  }
}

function decodeTulip3DeviceAlarmMessage(bytes, subType) {
  switch (subType) {
    // Communication module alarms
    case 0x01: {
      if (bytes.length !== 4) {
        throw new Error(
          `Invalid data length for device alarm message: expected 4 but got ${bytes.length}`,
        );
      }
      addSample(
        "device_alarm",
        decodeFlags(
          uint16(bytes, 2),
          TULIP3_PROFILE.communicationModule.alarmFlags,
        ),
      );
      break;
    }
    // Sensor alarms: 1 byte sensor id (bit 7-6) and 2 bytes alarm flags per sensor
    case 0x02:
    case 0x03: {
      if (bytes.length < 5 || (bytes.length - 2) % 3 !== 0) {
        throw new Error(
          "Not enough data left to finish reading the alarm entry",
        );
      }
      for (let position = 2; position < bytes.length; position += 3) {
        const sensorId = (bytes[position] >> 6) & 0x03;
        const sensor = TULIP3_PROFILE.sensors[`sensor${sensorId + 1}`];
        if (sensor === undefined) {
          throw new Error(
            `Alarm for sensor${sensorId + 1} is not supported by this device`,
          );
        }

        const alarmType = uint16(bytes, position + 1);
        if (subType === 0x02) {
          addSample(
            "technical_alarm",
            Object.assign(
              { sensor: `sensor${sensorId + 1}` },
              decodeFlags(alarmType, sensor.alarmFlags),
            ),
          );
        } else {
          // Channel alarms: channel id in bit 5-3
          const channelId = (bytes[position] >> 3) & 0x07;
          const channel = sensor.channels[`channel${channelId + 1}`];
          if (channel === undefined) {
            throw new Error(
              `Channel alarm for sensor${sensorId + 1}/channel${channelId + 1} is not supported by this device`,
            );
          }
          addSample(
            "technical_alarm",
            Object.assign(
              { channel: toKey(channel.name) },
              decodeFlags(alarmType, channel.alarmFlags),
            ),
          );
        }
      }
      break;
    }
    default:
      throw new Error(
        `Unsupported sub message type ${hex(subType)} for message type 0x13`,
      );
  }
}

function decodeTulip3Frame(frameByte, statusByte) {
  const status = TULIP3_CONFIGURATION_STATUS[statusByte];
  if (status === undefined) {
    throw new Error(`Invalid status code: ${hex(statusByte)}`);
  }
  // Frame counter in bit 6-2
  return { frameNumber: (frameByte >> 2) & 0x1f, status };
}

// Answer to an identification or configuration write downlink
function decodeTulip3WriteResponse(bytes) {
  const data = { frames: [decodeTulip3Frame(bytes[2], bytes[3])] };

  if (bytes.length > 4) {
    if (bytes.length < 7) {
      throw new Error(
        `Invalid message length: expected 7 bytes minimum for apply config answer, got ${bytes.length}`,
      );
    }
    if (bytes.length > 7 && bytes.length % 2 === 0) {
      throw new Error(
        `Invalid message length: expected odd number of bytes for apply config answer with additional frames, got ${bytes.length}`,
      );
    }

    data.revisionCounter = uint16(bytes, 4);
    data.totalWrongFrames = bytes[6];
    for (let position = 7; position + 1 < bytes.length; position += 2) {
      data.frames.push(decodeTulip3Frame(bytes[position], bytes[position + 1]));
    }
  }

  addSample("configuration", data);
}

function decodeTulip3IdentificationMessage(bytes, subType) {
  if (bytes.length < 4) {
    throw new Error(
      `Identification message too short. Expected at least 4 bytes but got ${bytes.length}`,
    );
  }

  switch (subType) {
    case 0x01:
    case 0x02:
    case 0x04: {
      const data = decodeTulip3Registers(
        bytes,
        buildRegisterLookup(
          TULIP3_IDENTIFICATION_REGISTERS,
          identificationAddress,
        ),
      );

      // The connected sensors have to match the sensors of this device
      for (let sensorNumber = 1; sensorNumber <= 4; sensorNumber++) {
        const connected = data[`connectedSensorsSensor${sensorNumber}`];
        const expected =
          TULIP3_PROFILE.sensors[`sensor${sensorNumber}`] !== undefined;
        if (connected !== undefined && connected !== expected) {
          throw new Error(
            `Device sensor connection mismatch: sensor${sensorNumber} is ${connected ? "connected" : "not connected"} but this device expects it to ${expected ? "be connected" : "not be connected"}`,
          );
        }
      }

      addSample("device_information", data);
      break;
    }
    case 0x03:
      decodeTulip3WriteResponse(bytes);
      break;
    default:
      throw new Error(
        `Unsupported sub message type ${hex(subType)} for message type 0x14`,
      );
  }
}

function decodeTulip3ConfigurationMessage(bytes, subType) {
  if (bytes.length < 4) {
    throw new Error(
      `Configuration message too short. Expected at least 4 bytes but got ${bytes.length}`,
    );
  }

  switch (subType) {
    case 0x01:
    case 0x02: {
      const data = decodeTulip3Registers(
        bytes,
        buildRegisterLookup(
          TULIP3_CONFIGURATION_REGISTERS,
          configurationAddress,
        ),
      );

      // Channels which do not exist on this device must not be sampled
      Object.keys(TULIP3_PROFILE.sensors).forEach((sensorKey) => {
        const prefix = sensorKey === "sensor1" ? "sensor" : sensorKey;
        for (let channelNumber = 1; channelNumber <= 8; channelNumber++) {
          const sampled =
            data[`${prefix}SamplingChannelsChannel${channelNumber}`];
          if (
            sampled === true &&
            TULIP3_PROFILE.sensors[sensorKey].channels[
            `channel${channelNumber}`
            ] === undefined
          ) {
            throw new Error(
              `Sampling channel channel${channelNumber} for sensor '${sensorKey}' is not expected for this device`,
            );
          }
        }
      });

      addSample("configuration", data);
      break;
    }
    case 0x03:
      decodeTulip3WriteResponse(bytes);
      break;
    default:
      throw new Error(
        `Unsupported sub message type ${hex(subType)} for message type 0x15`,
      );
  }
}

function decodeTulip3KeepAliveMessage(bytes, subType) {
  if (subType !== 0x01 || bytes.length < 5) {
    throw new Error("Invalid keep alive message");
  }

  const status = bytes[2];
  const data = {
    mainPowered: (status & 0x80) !== 0,
    ableToComputeBatteryLevel: (status & 0x40) !== 0,
    hasCommunicationModuleRestarted: (status & 0x20) !== 0,
    revisionCounter: uint16(bytes, 3)
  };

  if (data.ableToComputeBatteryLevel) {
    if (bytes.length < 6) {
      throw new Error(
        `Keep alive message missing battery level. Expected 6 bytes but got ${bytes.length}`,
      );
    }
    if (bytes[5] > 100) {
      throw new Error(
        `Invalid battery level: ${bytes[5]}%. Must be between 0 and 100`,
      );
    }
    data.batteryLevel = bytes[5];
  } else if (bytes.length > 5) {
    throw new Error(
      `Keep alive message has unexpected extra bytes. Expected 5 bytes but got ${bytes.length}`,
    );
  }

  addSample("lifecycle", data);
}

function decodeTulip3SpontaneousMessage(bytes, subType) {
  switch (subType) {
    // Answer to a downlink
    case 0x01: {
      if (bytes.length < 5) {
        throw new Error(
          `Spontaneous downlink answer message too short. Expected at least 5 bytes but got ${bytes.length}`,
        );
      }

      const type = bytes[2];
      const answeredSubType = bytes[3] & 0x3f;
      if (
        TULIP3_ANSWERABLE_DOWNLINKS[type] === undefined ||
        !TULIP3_ANSWERABLE_DOWNLINKS[type].includes(answeredSubType)
      ) {
        throw new Error(
          `Answered downlink can not have a combination of type: ${type} and subType: ${answeredSubType}`,
        );
      }

      const status = TULIP3_DOWNLINK_ANSWER_STATUS[bytes[4]];
      if (status === undefined) {
        throw new Error(`Invalid status byte: ${bytes[4]}`);
      }

      const data = {
        answeredDownlinkType: type,
        answeredDownlinkSubType: answeredSubType,
        downlinkAnswerStatus: status,
      };

      // A device error contains an additional error code
      if (bytes[4] === 4) {
        if (bytes.length < 6) {
          throw new Error(
            "Device error code missing for Device error status (expected 6 bytes)",
          );
        }
        data.deviceErrorCode = bytes[5];
      } else if (bytes.length > 5) {
        throw new Error(
          `Spontaneous downlink answer message has unexpected extra bytes. Expected 5 bytes but got ${bytes.length}`,
        );
      }

      addSample("configuration", data);
      break;
    }
    // The device requests an additional downlink
    case 0x02:
      if (bytes.length !== 2) {
        throw new Error(
          `Spontaneous fetch additional downlink message has invalid length. Expected 2 bytes but got ${bytes.length}`,
        );
      }
      addSample("configuration", { fetchAdditionalDownlink: true });
      break;
    default:
      throw new Error(
        `Unsupported sub message type ${hex(subType)} for message type 0x17`,
      );
  }
}

function decodeTulip3(bytes, ranges) {
  if (bytes.length < 2) {
    throw new Error(
      `Invalid input length. Expected at least 2 bytes but got ${bytes.length}`,
    );
  }

  const subType = bytes[1] & 0x3f;
  switch (bytes[0]) {
    case 0x10:
    case 0x11:
      if (subType !== 0x01) {
        throw new Error(
          `Unsupported sub message type ${hex(subType)} for data message`,
        );
      }
      decodeTulip3DataMessage(bytes, ranges);
      break;
    case 0x12:
      if (subType !== 0x01) {
        throw new Error(
          `Unsupported sub message type ${hex(subType)} for process alarm message`,
        );
      }
      decodeTulip3ProcessAlarmMessage(bytes);
      break;
    case 0x13:
      decodeTulip3DeviceAlarmMessage(bytes, subType);
      break;
    case 0x14:
      decodeTulip3IdentificationMessage(bytes, subType);
      break;
    case 0x15:
      decodeTulip3ConfigurationMessage(bytes, subType);
      break;
    case 0x16:
      decodeTulip3KeepAliveMessage(bytes, subType);
      break;
    case 0x17:
      decodeTulip3SpontaneousMessage(bytes, subType);
      break;
    default:
      throw new Error(`Unsupported message type ${hex(bytes[0])}`);
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
    } else if (bytes[0] >= 0x10 && bytes[0] <= 0x17) {
      decodeTulip3(bytes, ranges);
    } else {
      decodeTulip2(bytes, ranges);
    }
  } catch (error) {
    samples = [
      {
        topic: "error",
        data: { errorMessage: `PEU+NETRIS3 (JS): ${error.message}` },
      },
    ];
  }

  samples.forEach((sample) => {
    emit("sample", sample);
  });
}
