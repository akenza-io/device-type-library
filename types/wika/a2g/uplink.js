// WIKA A2G uplink decoder
// Port of the official WIKA javascript parser 4.12.0 (https://github.com/WIKA-Group/javascript_parsers)
// Supports the TULIP2 protocol (message types 0x01, 0x04, 0x05, 0x07 and 0x08)

// ***********************************************************************************
// Device configuration
// ***********************************************************************************

// Measuring ranges of the channels. The A2G sends float values, so the ranges are not used
// for decoding and can not be adjusted.
// eslint-disable-next-line no-unused-vars
const CHANNELS = {
  pressure: { start: 0, end: 100, adjustable: false },
  flow: { start: 0, end: 100, adjustable: false },
  input1: { start: 0, end: 100, adjustable: false },
  input2: { start: 0, end: 100, adjustable: false },
  input3: { start: 0, end: 100, adjustable: false },
  input4: { start: 0, end: 1, adjustable: false },
  relayStatus1: { start: 0, end: 1, adjustable: false },
  relayStatus2: { start: 0, end: 1, adjustable: false },
};

const ROUNDING_DECIMALS = 4;

// ***********************************************************************************
// TULIP2 lookups
// ***********************************************************************************

const TECHNICAL_ALARM_FLAGS = {
  pressureSignalOverload: 0x01,
  analogOutput1SignalOverload: 0x02,
  analogOutput2SignalOverload: 0x04,
  modbusCommunicationError: 0x08,
  voltageInput1SignalOverload: 0x10,
  voltageInput2SignalOverload: 0x20,
  temperatureInput3SignalOverload: 0x40,
  temperatureInput4SignalOverload: 0x80,
};

// 16 bit alarm field, byte 2 is the high byte
const DEVICE_ALARM_FLAGS = {
  adcConverterError: 0x8000,
  pressureSensorNoResponseError: 0x4000,
  pressureSensorTimeoutError: 0x2000,
  factoryOptionsWriteError: 0x1000,
  factoryOptionsDeleteError: 0x0800,
  invalidFactoryOptionsError: 0x0400,
  userSettingsInvalidError: 0x0200,
  userSettingsReadWriteError: 0x0100,
  zeroOffsetOverRangeError: 0x0080,
  invalidSignalSourceSpecifiedError: 0x0040,
  analogOutput2OverTemperatureError: 0x0020,
  analogOutput2LoadFaultError: 0x0010,
  analogOutput2OverRangeError: 0x0008,
  analogOutput1OverTemperatureError: 0x0004,
  analogOutput1LoadFaultError: 0x0002,
  analogOutput1OverRangeError: 0x0001,
};

const PRODUCT_SUB_ID_NAMES = {
  0: "LoRaWAN",
  1: "MIOTY",
};

const HARDWARE_ASSEMBLY_TYPE_NAMES = {
  0: "A2G HE0 Full Assembly",
  1: "A2G HE1 1AO Assembly",
  2: "A2G HE2 Modbus Assembly",
  3: "A2G HE3 Modular Assembly",
  128: "A2G LC1 LC1VAO",
  129: "A2G LC2 CT",
  130: "A2G LC3 BAT",
};

const LPP_UNIT_NAMES = {
  0: "None",
  1: "Pa",
  2: "kPa",
  3: "mbar",
  4: "mmWC",
  5: "inWC",
  10: "[m³/s] cubic metre per second",
  11: "[m³/h] cubic metre per hour (cbm/h)",
  12: "[l/s] litre per second",
  13: "[cfm] cubic feet per minute",
  14: "[m/s]",
  15: "[ft/min]",
  20: "% rH",
  21: "[g/m³]",
  22: "[g/ft³]",
  23: "[kJ/kg]",
  24: "[BTU/lb]",
  30: "normalized",
  31: "ppm",
  32: "[%] percent",
  40: "°C",
  41: "°F",
  45: "V",
  46: "bin",
};

// Measurands of the channel configurations in the identification message
const IDENTIFICATION_CHANNELS = [
  { name: "pressure", measurand: 3, measurandName: "Pressure (gauge)" },
  { name: "flow", measurand: 6, measurandName: "Flow (vol.)" },
  { name: "input 1", measurand: 70, measurandName: "Input 1" },
  { name: "input 2", measurand: 71, measurandName: "Input 2" },
  { name: "input 3", measurand: 72, measurandName: "Input 3" },
  { name: "input 4", measurand: 73, measurandName: "Input 4" },
];

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

function decodeFlags(value, flagDefinitions) {
  const flags = {};
  Object.keys(flagDefinitions).forEach((flag) => {
    flags[flag] = (value & flagDefinitions[flag]) !== 0;
  });
  return flags;
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

// Measurement values are floats, 0xffffffff marks an invalid value
function measurementValue(bytes, index) {
  if (
    bytes[index] === 0xff &&
    bytes[index + 1] === 0xff &&
    bytes[index + 2] === 0xff &&
    bytes[index + 3] === 0xff
  ) {
    throw new Error("Invalid data for channel - measurement: 0xffff, 65535");
  }
  return round(float32Clean(bytes, index));
}

function decodeTulip2DataMessage(bytes) {
  if (bytes.length !== 6 && bytes.length !== 27) {
    throw new Error(
      `Data message (0x01) requires 6 or 27 bytes, but received ${bytes.length} bytes`,
    );
  }

  // The short message only contains the pressure
  if (bytes.length === 6) {
    addSample("default", { pressure: measurementValue(bytes, 2) });
    return;
  }

  addSample("default", {
    pressure: measurementValue(bytes, 2),
    flow: measurementValue(bytes, 6),
    input1: measurementValue(bytes, 10),
    input2: measurementValue(bytes, 14),
    input3: measurementValue(bytes, 18),
    input4: measurementValue(bytes, 22),
    relayStatus1: bytes[26] & 0x01,
    relayStatus2: (bytes[26] >> 1) & 0x01,
  });
}

function decodeTulip2TechnicalAlarmMessage(bytes) {
  if (bytes.length !== 3) {
    throw new Error(
      `Technical alarm message (0x04) requires 3 bytes, but received ${bytes.length} bytes`,
    );
  }

  addSample("technical_alarm", decodeFlags(bytes[2], TECHNICAL_ALARM_FLAGS));
}

function decodeTulip2DeviceAlarmMessage(bytes) {
  if (bytes.length !== 4) {
    throw new Error(
      `Device alarm message (0x05) requires 4 bytes, but received ${bytes.length} bytes`,
    );
  }

  addSample("device_alarm", decodeFlags(uint16(bytes, 2), DEVICE_ALARM_FLAGS));
}

function decodeTulip2IdentificationMessage(bytes) {
  if (bytes.length !== 33 && bytes.length !== 38) {
    throw new Error(
      `Device identification message (0x07) requires 33 or 38 bytes, but received ${bytes.length} bytes`,
    );
  }

  const productId = bytes[2];
  if (productId !== 13) {
    throw new Error(
      `Invalid productId ${productId} in device identification message. Expected 13 (A2G).`,
    );
  }

  const productSubId = bytes[3];
  const hardwareAssemblyTypeId = bytes[7];
  if (HARDWARE_ASSEMBLY_TYPE_NAMES[hardwareAssemblyTypeId] === undefined) {
    throw new Error(
      `Unknown hardware assembly type ${hardwareAssemblyTypeId} in device identification message`,
    );
  }

  // The serial number is terminated by a 0 byte
  let serialNumber = "";
  for (let i = 8; i < 24 && bytes[i] !== 0; i++) {
    serialNumber += String.fromCharCode(bytes[i]);
  }

  const data = {
    productId,
    productIdName: "A2G",
    productSubId: String(productSubId),
    productSubIdName:
      PRODUCT_SUB_ID_NAMES[productSubId] === undefined
        ? null
        : PRODUCT_SUB_ID_NAMES[productSubId],
    sensorFirmwareVersion: `${bytes[4] >> 4}.${bytes[4] & 0x0f}.${bytes[5]}`,
    sensorHardwareVersion: `${bytes[6]}`,
    hardwareAssemblyTypeId,
    hardwareAssemblyTypeName:
      HARDWARE_ASSEMBLY_TYPE_NAMES[hardwareAssemblyTypeId],
    serialNumber,
  };

  // The short message only contains the pressure channel, the long one the units of all other channels.
  // The units follow the pressure unit (byte 32) in the order of IDENTIFICATION_CHANNELS.
  const channelCount = bytes.length === 33 ? 1 : IDENTIFICATION_CHANNELS.length;
  for (let i = 0; i < channelCount; i++) {
    const channel = IDENTIFICATION_CHANNELS[i];
    const unit = bytes[32 + i];
    if (LPP_UNIT_NAMES[unit] === undefined) {
      throw new Error(
        `Unknown ${channel.name} unit ${unit} in device identification message`,
      );
    }

    const prefix = `channel${i}`;
    data[`${prefix}Measurand`] = channel.measurand;
    data[`${prefix}MeasurandName`] = channel.measurandName;
    if (i === 0) {
      data[`${prefix}MeasurementRangeStart`] = float32Clean(bytes, 24);
      data[`${prefix}MeasurementRangeEnd`] = float32Clean(bytes, 28);
    }
    data[`${prefix}Unit`] = unit;
    data[`${prefix}UnitName`] = LPP_UNIT_NAMES[unit];
  }

  addSample("device_information", data);
}

function decodeTulip2KeepAliveMessage(bytes) {
  if (bytes.length !== 3) {
    throw new Error(
      `Keep alive message (0x08) requires 3 bytes, but received ${bytes.length} bytes`,
    );
  }
  if (bytes[2] === 0x7f) {
    throw new Error(
      "Keep Alive message 08: The device reports an error during the calculation of the battery capacity.",
    );
  }

  addSample("lifecycle", {
    batteryLevelNewEvent: (bytes[2] & 0x80) !== 0,
    batteryLevel: bytes[2] & 0x7f,
  });
}

function decodeTulip2(bytes) {
  switch (bytes[0]) {
    case 0x01:
      decodeTulip2DataMessage(bytes);
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
    default:
      throw new Error(`Message type ${hex(bytes[0])} is not supported`);
  }
}

// ***********************************************************************************
// Entry point
// ***********************************************************************************

function consume(event) {
  const bytes = Hex.hexToBytes(event.data.payloadHex);
  samples = [];

  try {
    decodeTulip2(bytes);
  } catch (error) {
    samples = [
      { topic: "error", data: { errorMessage: `A2G (JS): ${error.message}` } },
    ];
  }

  samples.forEach((sample) => {
    emit("sample", sample);
  });
}
