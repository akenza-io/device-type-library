// WIKA GD-20-W uplink decoder
// Port of the official WIKA javascript parser 4.12.0 (https://github.com/WIKA-Group/javascript_parsers)
// Supports the TULIP2 protocol (message types 0x01 - 0x09)

// ***********************************************************************************
// Device configuration
// ***********************************************************************************

// Measuring ranges of the channels. Adjustable ranges can be overwritten with the
// custom fields <channel>RangeStart and <channel>RangeEnd, e.g. channel0RangeStart.
// The defaults are placeholders, check the device datasheet or the extended device identification message.
const CHANNELS = {
  channel0: { start: 0, end: 12, adjustable: true },
  channel1: { start: -1.013, end: 10.987, adjustable: true },
  channel2: { start: 0, end: 85.7879104614, adjustable: true },
  channel3: { start: -1.013, end: 14.7351512909, adjustable: true },
  channel4: { start: 0, end: 15.7481508255, adjustable: true },
  channel5: { start: -40, end: 80, adjustable: true },
};

const ROUNDING_DECIMALS = 3;

// ***********************************************************************************
// TULIP2 lookups
// ***********************************************************************************

const ALARM_EVENT_NAMES = ["triggered", "disappeared"];

const PROCESS_ALARM_TYPES = [
  "lowThreshold",
  "highThreshold",
  "fallingSlope",
  "risingSlope",
  "lowThresholdWithDelay",
  "highThresholdWithDelay",
];

// Alarm names by bit number
const SENSOR_TECHNICAL_ALARM_NAMES = {
  0: "modbus sensor communication error",
  1: "internal pressure sensor signal above upper limit",
  3: "internal temperature sensor signal below lower limit (< -40°C | -40°F)",
  4: "internal temperature sensor signal above upper limit (> 80°C | 178°F)",
  5: "communication error with internal pressure or temperature sensor",
  6: "liquefaction of SF6 detected (internal sensor)",
  7: "gas density above upper limit (based on the full scale of the density measuring range in bar abs. at 20°C | 68°F)",
  10: "recurring modbus communication error",
};

const DEVICE_ALARM_NAMES = {
  0: "low battery",
  2: "duty cycle alarm",
  3: "configuration error",
  8: "device specific alarm",
  9: "device specific alarm",
  10: "device specific alarm",
  11: "device specific alarm",
  12: "device specific alarm",
  13: "device specific alarm",
  14: "device specific alarm",
  15: "device specific alarm",
};

const CONFIGURATION_STATUS_NAMES = {
  2: "configuration successful",
  3: "configuration rejected",
  4: "configuration discarded",
  6: "command success",
  7: "command failed",
};

const MEASURAND_NAMES = {
  0x01: "Temperature",
  0x03: "Pressure gauge",
  0x04: "Pressure absolute",
  0x17: "Density",
  0x18: "Density (gauge pressure at 20 °C)",
  0x19: "Density (absolute pressure at 20 °C)",
};

const UNIT_NAMES = {
  0x01: "°C",
  0x02: "°F",
  0x03: "K",
  0x07: "bar",
  0x0a: "Pa",
  0x0c: "kPa",
  0x0d: "MPa",
  0x0e: "Psi",
  0x11: "N/cm²",
  0x6e: "kg/m³",
  0x73: "g/l",
};

// Gas mixture percentages in the identification message, starting at byte 31
const GAS_MIXTURES = ["SF6", "N2", "CF4", "O2", "C02", "Novec4710", "He", "Ar"];

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

function getChannel(channelId) {
  const channel = `channel${channelId}`;
  if (CHANNELS[channel] === undefined) {
    throw new Error(`Unknown channel id ${channelId}`);
  }
  return channel;
}

// Returns the bit numbers set in a 16 bit alarm field which have a name
function alarmBits(value, names) {
  const bits = [];
  for (let bit = 0; bit < 16; bit++) {
    if ((value & (1 << bit)) !== 0 && names[bit] !== undefined) {
      bits.push(bit);
    }
  }
  return bits;
}

function decodeTulip2DataMessage(bytes, ranges) {
  if (bytes.length < 5) {
    throw new Error(
      `Data message (0x01/0x02) requires at least 5 bytes, but received ${bytes.length} bytes`,
    );
  }

  // Blocks of 1 byte channel id and 2 bytes value, an incomplete last block is ignored
  const data = {};
  for (let i = 2; i + 2 < bytes.length; i += 3) {
    const channel = getChannel(bytes[i]);
    const raw = uint16(bytes, i + 1);
    // 0xffff marks an invalid value
    data[channel] =
      raw === 0xffff ? null : round(tulipToValue(raw, ranges[channel]));
  }

  addSample("default", data);
}

function decodeTulip2ProcessAlarmMessage(bytes, ranges) {
  if (bytes.length < 6 || (bytes.length - 2) % 4 !== 0) {
    throw new Error(
      `Process alarm message (0x03) requires at least 6 bytes (and target byte count 4n+2), but received ${bytes.length} bytes`,
    );
  }

  for (let i = 2; i < bytes.length; i += 4) {
    const channel = getChannel(bytes[i]);
    const alarmType = PROCESS_ALARM_TYPES[bytes[i + 1] & 0x07];
    if (alarmType === undefined) {
      throw new Error(
        `Unknown alarmType ${bytes[i + 1] & 0x07} in process alarm message`,
      );
    }

    const isSlope = alarmType === "fallingSlope" || alarmType === "risingSlope";
    const raw = uint16(bytes, i + 2);
    const value = isSlope
      ? slopeToValue(raw, ranges[channel])
      : tulipToValue(raw, ranges[channel]);

    addSample("process_alarm", {
      channel,
      alarmStatus: ALARM_EVENT_NAMES[(bytes[i + 1] & 0x80) >> 7],
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

// One sample per active alarm bit
function decodeTulip2SensorTechnicalAlarmMessage(bytes) {
  const channel = getChannel(bytes[2]);
  // Missing alarm bytes are read as 0
  const alarmField = ((bytes[3] || 0) << 8) | (bytes[4] || 0);

  alarmBits(alarmField, SENSOR_TECHNICAL_ALARM_NAMES).forEach((bit) => {
    addSample("technical_alarm", {
      channel,
      alarmType: SENSOR_TECHNICAL_ALARM_NAMES[bit],
    });
  });
}

// One sample per active alarm bit
function decodeTulip2DeviceAlarmMessage(bytes) {
  if (bytes.length < 4) {
    throw new Error(
      `Device alarm message (0x05) requires 4 bytes, but received ${bytes.length} bytes`,
    );
  }

  alarmBits(uint16(bytes, 2), DEVICE_ALARM_NAMES).forEach((bit) => {
    addSample("device_alarm", { alarmType: DEVICE_ALARM_NAMES[bit] });
  });
}

function decodeTulip2MainConfiguration(bytes) {
  // A value of 0 is not allowed
  const valueOrUnauthorized = (value) => (value === 0 ? "unauthorized" : value);

  return {
    acquisitionTimeAlarmsOff: valueOrUnauthorized(uint32(bytes, 4)),
    publicationTimeFactorAlarmsOff: valueOrUnauthorized(uint16(bytes, 8)),
    acquisitionTimeAlarmsOn: valueOrUnauthorized(uint32(bytes, 10)),
    publicationTimeFactorAlarmsOn: valueOrUnauthorized(uint16(bytes, 14)),
  };
}

function decodeTulip2ChannelConfiguration(bytes) {
  const enabled = bytes[7];
  const data = {
    sensorOrChannelId: bytes[4],
    deadBand: uint16(bytes, 5),
  };

  // The alarm values follow in the order of the enabled alarms, values missing in the message are left out
  const values = [];
  for (let i = 8; i < bytes.length; i += 2) {
    values.push((bytes[i] << 8) | (bytes[i + 1] || 0));
  }

  const keys = [];
  if (enabled & 0x80) keys.push("alarm1Threshold");
  if (enabled & 0x40) keys.push("alarm2Threshold");
  if (enabled & 0x20) keys.push("alarm3Slope");
  if (enabled & 0x10) keys.push("alarm4Slope");
  if (enabled & 0x08) keys.push("alarm5Threshold", "alarm5Period");
  if (enabled & 0x04) keys.push("alarm6Threshold", "alarm6Period");

  keys.forEach((key, index) => {
    if (values[index] !== undefined) {
      data[key] = values[index];
    }
  });

  return data;
}

function decodeTulip2ConfigurationStatusMessage(bytes) {
  if (bytes.length < 3) {
    throw new Error(
      `Configuration status message (0x06) requires at least 3 bytes, but received ${bytes.length} bytes`,
    );
  }

  // Only bits 7-4 carry the status value
  const status = bytes[2] >> 4;
  if (CONFIGURATION_STATUS_NAMES[status] === undefined) {
    throw new Error(
      `Unknown configuration status value ${status} in configuration status message`,
    );
  }

  // 0x04: main configuration, 0x40 - 0xff: channel configuration
  const commandType = bytes[3];
  if (commandType !== 0x04 && commandType < 0x40) {
    throw new Error(
      `Unknown command type ${commandType} in configuration status message`,
    );
  }
  if (commandType === 0x04 && bytes.length < 17) {
    throw new Error(
      `Configuration status message contains an invalid length for main configuration: ${bytes.length}`,
    );
  }
  if (commandType !== 0x04 && bytes.length < 8) {
    throw new Error(
      `Configuration status message contains an invalid length for channel configuration: ${bytes.length}`,
    );
  }

  const data = {
    configurationId: bytes[1],
    status,
    statusDescription: CONFIGURATION_STATUS_NAMES[status],
    commandType,
  };

  addSample(
    "configuration",
    Object.assign(
      data,
      commandType === 0x04
        ? decodeTulip2MainConfiguration(bytes)
        : decodeTulip2ChannelConfiguration(bytes),
    ),
  );
}

function decodeTulip2IdentificationMessage(bytes) {
  if (bytes.length < 39) {
    throw new Error(
      `Device identification message (0x07) requires at least 39 bytes, but received ${bytes.length} bytes`,
    );
  }
  if (bytes[2] !== 0x15) {
    throw new Error(
      `Invalid productId ${bytes[2]} in device identification message. Expected 21 (GD20W).`,
    );
  }
  if (bytes[3] !== 0x40) {
    throw new Error(
      `Unknown productSubId ${bytes[3]} in device identification message. Only LoRaWAN (0) is supported.`,
    );
  }

  const data = {
    productId: bytes[2],
    productSubId: bytes[3],
    wirelessModuleFirmwareVersion: `${bytes[4] >> 4}.${bytes[4] & 0x0f}.${bytes[5]}`,
    wirelessModuleHardwareVersion: `${bytes[6] >> 4}.${bytes[6] & 0x0f}.${bytes[7]}`,
    serialNumber: ascii(bytes.slice(8, 18)),
  };

  // Measurand and unit per channel, starting at byte 19
  Object.keys(CHANNELS).forEach((channel, index) => {
    const measurand = bytes[19 + index * 2];
    const unit = bytes[20 + index * 2];
    if (MEASURAND_NAMES[measurand] === undefined) {
      throw new Error(
        `Unknown measurand ${measurand} for channel ${index} in device identification message`,
      );
    }
    if (UNIT_NAMES[unit] === undefined) {
      throw new Error(
        `Unknown unit ${unit} for channel ${index} in device identification message`,
      );
    }

    data[`${channel}MeasurandId`] = measurand;
    data[`${channel}Measurand`] = MEASURAND_NAMES[measurand];
    data[`${channel}UnitId`] = unit;
    data[`${channel}Unit`] = UNIT_NAMES[unit];
  });

  GAS_MIXTURES.forEach((gas, index) => {
    data[`gasMixtures${capitalize(gas)}`] = bytes[31 + index];
  });

  addSample("device_information", data);
}

function decodeTulip2KeepAliveMessage(bytes) {
  if (bytes.length < 3) {
    throw new Error(
      `Keep alive message (0x08) requires at least 3 bytes, but received ${bytes.length} bytes`,
    );
  }

  const indicator = bytes[2];
  addSample("lifecycle", {
    restartedSinceLastKeepAlive: (indicator & 0x80) !== 0,
    batteryLevel: indicator & 0x7f,
    batteryLevelCalculationError: (indicator & 0x7f) === 0x7f,
    batteryPresent: indicator !== 0,
  });
}

// Measuring ranges of all channels
function decodeTulip2ExtendedIdentificationMessage(bytes) {
  if (bytes.length < 50) {
    throw new Error(
      `Extended device identification message (0x09) requires at least 50 bytes, but received ${bytes.length} bytes`,
    );
  }

  const data = {};
  Object.keys(CHANNELS).forEach((channel, index) => {
    data[`${channel}Min`] = float32Clean(bytes, 2 + index * 8);
    data[`${channel}Max`] = float32Clean(bytes, 6 + index * 8);
  });

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
      decodeTulip2SensorTechnicalAlarmMessage(bytes);
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
    case 0x09:
      decodeTulip2ExtendedIdentificationMessage(bytes);
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
        data: { errorMessage: `GD-20-W (JS): ${error.message}` },
      },
    ];
  }

  samples.forEach((sample) => {
    emit("sample", sample);
  });
}
