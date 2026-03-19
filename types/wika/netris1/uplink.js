function cToF(celsius) {
  return Math.round(((celsius * 9) / 5 + 32) * 10) / 10;
}

/**
 * ATTENTION: You must define the measurement ranges first, otherwise the script will not work.
 * The device configuration defines the measurement ranges for the supported measured variables of your used devices, e.g.
 * var VALUE_RANGE_START = 0;
 * var VALUE_RANGE_END = 10;
 * var CHANNEL_MEASURAND_CONFIGURATION = "voltage";
 */

/**
 * The starting value of the measuring range.
 * @type {number}
 */
let VALUE_RANGE_START;

/**
 * The ending value of the measuring range.
 * @type {number}
 */
let VALUE_RANGE_END;

/**
 * Possible channel types: "temperature", "current", "voltage", "relative"
 * An array of strings representing the available measurands for a channel.
 * @type {string}
 */
let CHANNEL_MEASURAND_CONFIGURATION = "";

/**
 * To decode from hex encoded string
 * @access public
 * @param   {number}    fPort             - The Port Field on which the uplink has been sent
 * @param   {string}    hexEncodedString  - A hex encoded string has been sent from the device
 * @returns {output}                      - The decoded object
 */
function decodeHexString(fPort, hexEncodedString) {
  /**
   * @type {input}
   */
  const input = {};
  input.bytes = convertHexStringToBytes(hexEncodedString);
  input.fPort = fPort;

  return decode(input);
}

// ***********************************************************************************
// Private Decoding Section
// ***********************************************************************************

/**
 * Generic Data Channel Values
 */
const DEVICE_NAME = "NETRIS1";

const GENERIC_DATA_CHANNEL_RANGE_START = 2500;
const GENERIC_DATA_CHANNEL_RANGE_END = 12500;
const ERROR_VALUE = 0xffff;

const ALARM_EVENT_NAMES_DICTIONARY = ["TRIGGERED", "DISAPPEREAD"];
const PROCESS_ALARM_TYPE_NAMES_DICTIONARY = [
  "LOW_THRESHOLD",
  "HIGH_THRESHOLD",
  "FALLING_SLOPE",
  "RISING_SLOPE",
  "LOW_THRESHOLD_WITH_DELAY",
  "HIGH_THRESHOLD_WITH_DELAY",
];
const TECHNICAL_ALARM_TYPE_NAMES_DICTIONARY = {
  1: "SSM_COMMUNICATION_ERROR",
  128: "SSM_IDENTITY_ERROR",
};
const DEVICE_ALARM_TYPE_NAMES_DICTIONARY = {
  1: "LOW_BATTERY_ERROR",
  4: "DUTY_CYCLE_ALARM",
  8: "CONFIGURATION_ERROR",
};
const MEASUREMENT_ALARM_TYPE_NAMES_DICTIONARY = {
  1: "MV_STAT_ERROR",
  2: "MV_STAT_WARNING",
  4: "MV_STAT_LIM_HI",
  8: "MV_STAT_LIM_LO",
  16: "MV_STAT_WARNING_2",
};

/**
 * The padStart() method of String values pads this string with another string (multiple times, if needed) until the resulting string reaches the given length.
 * The function is reimplemented to support ES5.
 * @access private
 * @param   {number}     targetLength - The length of the returned string
 * @param   {string}     padString - The string to modify
 * @returns {string}          - The decoded object
 */
String.prototype.padStart = function (targetLength, padString) {
  let tempString = this.valueOf();

  for (let i = this.length; i < targetLength; ++i) {
    tempString = padString + tempString;
  }

  return tempString;
};

/**
 * To decode the uplink data
 * @access private
 * @param   {input}     input - The object to decode
 * @returns {output}          - The decoded object
 */
function decode(input) {
  // Define output object

  let output = createOutputObject();
  output = checkMeasurementRanges(output);
  if (output.errors) {
    return output;
  }

  /* Select subfunction to decode message */
  switch (input.bytes[0]) {
    /* unused */
    default:
    case 0x00:
    case 0x06: // configuration status message is not supported
      // Error, not enough bytes
      output = addErrorMessage(
        output,
        `Data message type ${input.bytes[0].toString(16).padStart(2, "0")} not supported`,
      );
      break;

    /* Data message */
    case 0x01:
    case 0x02:
      /* Check if all bytes needed for decoding are there */
      /* At least 5 bytes for channelA only, and 8 for channelA and B */
      if (input.bytes.length >= 5 && input.bytes.length <= 8) {
        // decode
        output = decodeDataMessage(input);
      } else {
        // Error, not enough bytes
        output = addErrorMessage(
          output,
          `Data message 01/02 needs at least 4 and maximum 11 bytes but got ${input.bytes.length}`,
        );
      }
      break;

    /* Process alarm */
    case 0x03:
      /* Check if all bytes needed for decoding are there and all bytes for each alarm */
      if (input.bytes.length >= 6 && !((input.bytes.length - 3) % 3)) {
        // decode
        output = decodeProcessAlarm(input);
      } else {
        // Error, not enough bytes
        output = addErrorMessage(
          output,
          `Process alarm 03 needs at least 6 bytes and got ${input.bytes.length}. Also all bytes for each alarm needed`,
        );
      }
      break;

    /* Technical alarm */
    case 0x04:
      /* Check if all bytes needed for decoding are there and all bytes for each alarm */
      if (input.bytes.length === 5) {
        // decode
        output = decodeTechnicalAlarm(input);
      } else {
        // Error, not enough bytes
        output = addErrorMessage(
          output,
          `Technical alarm 04 needs 5 bytes but got ${input.bytes.length}`,
        );
      }
      break;

    /* Device alarm */
    case 0x05:
      /* Check if all bytes needed for decoding are there */
      if (input.bytes.length === 4) {
        // decode
        output = decodeDeviceAlarm(input);
      } else {
        // Error, not enough bytes
        output = addErrorMessage(
          output,
          `Device alarm 05 needs at least 4 bytes got ${input.bytes.length}`,
        );
      }
      break;

    /* Device identification */
    case 0x07:
      /* Check if at least 8 bytes, if no sensor detected, 29 bytes for channelA only or 39 bytes for both channel needed for decoding are there */
      if (input.bytes.length >= 8 && input.bytes.length <= 39) {
        // decode
        output = decodeDeviceIdentification(input);
      } else {
        // Error, not enough bytes
        output = addErrorMessage(
          output,
          `Identification message 07 needs at least 16 and maximum 56 bytes, but got ${input.bytes.length}`,
        );
      }
      break;

    /* Keep alive */
    case 0x08:
      /* Check if all bytes needed for decoding are there */
      if (input.bytes.length === 3) {
        // Decode
        output = decodeKeepAliveMessage(input);
      } else {
        // Error, not enough bytes
        output = addErrorMessage(
          output,
          `Keep alive message 08 needs 3 bytes but got ${input.bytes.length}`,
        );
      }
      break;

    /* Extended device identification */
    case 0x09:
      /* Check if all bytes needed for decoding are there */
      if (input.bytes.length === 5) {
        // decode
        output = decodeChannelFailureAlarm(input); // Todo use last netris1 specification
      } else {
        // Error, not enough bytes
        output = addErrorMessage(
          output,
          `Channel failure alarm 09 needs 5 bytes but got ${input.bytes.length}`,
        );
      }
      break;
  }

  return output;
}

/**
 * Decodes a data message 01, 02 into an object
 * @access private
 * @param {Object}      input           - An object provided by the IoT Flow framework
 * @param {number[]}    input.bytes     - Array of bytes represented as numbers as it has been sent from the device
 * @param {number}      input.fPort     - The Port Field on which the uplink has been sent
 * @param {Date}        input.recvTime  - The uplink message time recorded by the LoRaWAN network server
 * @returns {output}             - The decoded object
 */
function decodeDataMessage(input) {
  // Output
  let output = createOutputObject();

  // data message type
  output.data.messageType = input.bytes[0];

  // current configuration id
  output.data.configurationId = input.bytes[1];

  output.data.measurement = {};
  output.data.measurement.channels = [];

  // channel
  if (input.bytes.length <= 5) {
    const channelData = (input.bytes[3] << 8) | input.bytes[4];

    // If channel has an error
    if (channelData == ERROR_VALUE) {
      output = addErrorMessage(
        output,
        `Invalid data for channel - ${CHANNEL_MEASURAND_CONFIGURATION} : 0xffff, 65535`,
      );
    } else {
      const channelValue = {};
      channelValue.value = getRealValue(channelData);
      channelValue.channelId = 0; // netris 1 only has 1 channel
      channelValue.channelName = CHANNEL_MEASURAND_CONFIGURATION;
      output.data.measurement.channels.push(channelValue);
    }
  } else {
    output = addErrorMessage(
      output,
      `Invalid data for channel - ${CHANNEL_MEASURAND_CONFIGURATION} : 0xffff, 65535`,
    );
  }
  return output;
}

/**
 * Decodes a process alarm 03 into an object
 * @access private
 * @param {Object}          input           - An object provided by the IoT Flow framework
 * @param {number[]}        input.bytes     - Array of bytes represented as numbers as it has been sent from the device
 * @param {number}          input.fPort     - The Port Field on which the uplink has been sent
 * @param {Date}            input.recvTime  - The uplink message time recorded by the LoRaWAN network server
 * @returns {output}                        - The decoded object
 */
function decodeProcessAlarm(input) {
  const output = createOutputObject();
  output.data.processAlarms = [];

  // data message type
  output.data.messageType = input.bytes[0];

  // current configuration id
  output.data.configurationId = input.bytes[1];

  for (
    let byteIndex = 3, alarmCounter = 0;
    byteIndex < input.bytes.length;
    byteIndex += 3, alarmCounter++
  ) {
    output.data.processAlarms[alarmCounter] = {};

    // Sensor Id is always 0
    output.data.processAlarms[alarmCounter].sensorId =
      (input.bytes[2] & 0xf0) >> 4;

    // Alarm channel 0
    output.data.processAlarms[alarmCounter].channelId = input.bytes[2] & 0x0f;
    output.data.processAlarms[alarmCounter].channelName =
      CHANNEL_MEASURAND_CONFIGURATION;

    // Alarm event 0 = triggered, 1 = disappeared
    output.data.processAlarms[alarmCounter].event =
      (input.bytes[byteIndex] & 0x80) >> 7;
    output.data.processAlarms[alarmCounter].eventName =
      ALARM_EVENT_NAMES_DICTIONARY[
        output.data.processAlarms[alarmCounter].event
      ];

    // Alarm channel 0 = falling thresh, 1 = rising thresh, 2 = fal slope, 3 = rising slope, 4 = fall thresh delay, 5 = rise thresh delay
    output.data.processAlarms[alarmCounter].alarmType =
      input.bytes[byteIndex] & 0x07;
    output.data.processAlarms[alarmCounter].alarmTypeName =
      PROCESS_ALARM_TYPE_NAMES_DICTIONARY[
        output.data.processAlarms[alarmCounter].alarmType
      ];

    // Alarm value
    if (
      output.data.processAlarms[alarmCounter].alarmType == 3 ||
      output.data.processAlarms[alarmCounter].alarmType == 4
    ) {
      output.data.processAlarms[alarmCounter].value = getSlopeValue(
        (input.bytes[byteIndex + 1] << 8) | input.bytes[byteIndex + 2],
      );
    } else {
      output.data.processAlarms[alarmCounter].value = getThresholdValue(
        (input.bytes[byteIndex + 1] << 8) | input.bytes[byteIndex + 2],
      );
    }
  }

  return output;
}

/**
 * Decodes a technical alarm 04 into an object
 * @access private
 * @param {Object}          input           - An object provided by the IoT Flow framework
 * @param {number[]}        input.bytes     - Array of bytes represented as numbers as it has been sent from the device
 * @param {number}          input.fPort     - The Port Field on which the uplink has been sent
 * @param {Date}            input.recvTime  - The uplink message time recorded by the LoRaWAN network server
 * @returns {output}                 - The decoded object
 */
function decodeTechnicalAlarm(input) {
  // Output
  const output = createOutputObject();

  // data message type
  output.data.messageType = input.bytes[0];

  // current configuration id
  output.data.configurationId = input.bytes[1];

  // Create object entry
  output.data.technicalAlarms = [];

  output.data.technicalAlarms[0] = {};
  // Sensor id is always 0
  output.data.technicalAlarms[0].sensorId = input.bytes[2];

  // alarmType
  output.data.technicalAlarms[0].alarmType =
    (input.bytes[3] << 8) | input.bytes[4];

  // Go through each bit and check if set
  output.data.technicalAlarms[0].alarmTypeNames = [];
  for (let j = 0, i = 0; j < 15; j++) {
    // Check if bit is set
    if (output.data.technicalAlarms[0].alarmType & (1 << j)) {
      output.data.technicalAlarms[0].alarmTypeNames[i] =
        TECHNICAL_ALARM_TYPE_NAMES_DICTIONARY[1 << j];
      i++;
    }
  }

  return output;
}

/**
 * Decodes a device alarm 05 into an object
 * @param {Object} input - An object provided by the IoT Flow framework
 * @param {number[]} input.bytes - Array of bytes represented as numbers as it has been sent from the device
 * @param {number} input.fPort - The Port Field on which the uplink has been sent
 * @param {Date} input.recvTime - The uplink message time recorded by the LoRaWAN network server
 * @returns {output} The decoded object
 */
function decodeDeviceAlarm(input) {
  // Output
  const output = createOutputObject();
  output.data.deviceAlarm = {};

  // data message type
  output.data.messageType = input.bytes[0];

  // current configuration id
  output.data.configurationId = input.bytes[1];

  // Alarm type / alarm status
  output.data.deviceAlarm.alarmType = (input.bytes[2] << 8) | input.bytes[3];

  // Go through each bit and check if set
  output.data.deviceAlarm.alarmTypeNames = [];
  for (let j = 0, i = 0; j < 15; j++) {
    // Check if bit is set
    if (output.data.deviceAlarm.alarmType & (1 << j)) {
      output.data.deviceAlarm.alarmTypeNames[i] =
        DEVICE_ALARM_TYPE_NAMES_DICTIONARY[1 << j];
      i++;
    }
  }

  return output;
}

/**
 * Decodes a channel failure alarm 09 into an object
 * @access private
 * @param {Object}              input           - An object provided by the IoT Flow framework
 * @param {number[]}            input.bytes     - Array of bytes represented as numbers as it has been sent from the device
 * @param {number}              input.fPort     - The Port Field on which the uplink has been sent
 * @param {Date}                input.recvTime  - The uplink message time recorded by the LoRaWAN network server
 * @returns {output}                     - The decoded object
 */
function decodeChannelFailureAlarm(input) {
  // Output
  const output = createOutputObject();

  // data message type
  output.data.messageType = input.bytes[0];

  // current configuration id
  output.data.configurationId = input.bytes[1];

  // Create channelFailureAlarm
  output.data.channelFailureAlarm = {};

  // sensor ID
  output.data.channelFailureAlarm.sensorId = (input.bytes[2] & 0xf0) >> 4;

  // Alarm channel 0
  output.data.channelFailureAlarm.channelId = input.bytes[2] & 0x0f;
  output.data.channelFailureAlarm.channelName = CHANNEL_MEASURAND_CONFIGURATION;

  // Alarm type
  output.data.channelFailureAlarm.alarmType =
    (input.bytes[3] << 8) | input.bytes[4];

  // Go through each bit and check if set
  output.data.channelFailureAlarm.alarmTypeNames = [];
  for (let j = 0, i = 0; j < 15; j++) {
    // Check if bit is set
    if (output.data.channelFailureAlarm.alarmType & (1 << j)) {
      output.data.channelFailureAlarm.alarmTypeNames[i] =
        MEASUREMENT_ALARM_TYPE_NAMES_DICTIONARY[1 << j];
      i++;
    }
  }

  return output;
}

/**
 * Decodes a keep alive message 08 into an object
 * @access private
 * @param {Object}              input           - An object provided by the IoT Flow framework
 * @param {number[]}            input.bytes     - Array of bytes represented as numbers as it has been sent from the device
 * @param {number}              input.fPort     - The Port Field on which the uplink has been sent
 * @param {Date}                input.recvTime  - The uplink message time recorded by the LoRaWAN network server
 * @returns {output}                     - The decoded object
 */
function decodeKeepAliveMessage(input) {
  // Output
  const output = createOutputObject();

  // data message type
  output.data.messageType = input.bytes[0];

  // current configuration id
  output.data.configurationId = input.bytes[1];

  output.data.deviceStatistic = {};

  // Battery level event indicator
  output.data.deviceStatistic.batteryLevelNewEvent = !!(
    (input.bytes[2] & 0x80) >>
    7
  );

  // battery level in percent
  output.data.deviceStatistic.batteryLevel = input.bytes[2] & 0x7f;

  return output;
}

/**
 * Decodes a device identification message 07 into an object
 * @access private
 * @param {Object}              input           - An object provided by the IoT Flow framework
 * @param {number[]}            input.bytes     - Array of bytes represented as numbers as it has been sent from the device
 * @param {number}              input.fPort     - The Port Field on which the uplink has been sent
 * @param {Date}                input.recvTime  - The uplink message time recorded by the LoRaWAN network server
 * @returns {output}                            - The decoded object
 */
function decodeDeviceIdentification(input) {
  // Output
  let output = createOutputObject();

  // Data message type
  output.data.messageType = input.bytes[0];

  // Configuration id
  output.data.configurationId = input.bytes[1];

  output.data.deviceInformation = {};
  // Product id raw
  output.data.deviceInformation.productId = input.bytes[2];

  // Product id resolved
  switch (input.bytes[2]) {
    case 16:
      output.data.deviceInformation.productIdName = "NETRIS1 BLE+LPWAN";
      break;

    case 17:
      output.data.deviceInformation.productIdName = "NETRIS1 BLE";
      break;

    default:
      output.data.deviceInformation.productIdName = "Unknown";
      break;
  }

  // Product sub id
  output.data.deviceInformation.productSubId = input.bytes[3];

  /* Wirless product sub id contains to identifier, one in each nibble */
  switch (
    0x07 &
    (input.bytes[3] >> 5) // Only want the 3 bit 7-5
  ) {
    case 0x00:
      output.data.deviceInformation.productSubIdName = "No LPWAN";
      break;

    case 0x01:
      output.data.deviceInformation.productSubIdName = "MIOTY";
      break;

    case 0x02:
      output.data.deviceInformation.productSubIdName = "LoRa";
      break;

    default:
      output.data.deviceInformation.productSubIdName = "Unknown";
      break;
  }
  switch (
    0x1f & input.bytes[3] // Only want the 5 bit 4-0
  ) {
    case 0x00:
      output.data.deviceInformation.productSubIdName += " RTD";
      break;

    case 0x01:
      output.data.deviceInformation.productSubIdName += " E-Signal";
      break;

    case 0x02:
      output.data.deviceInformation.productSubIdName += " TRW";
      break;

    default:
      output.data.deviceInformation.productSubIdName += " Unknown";
      break;
  }

  // Wireless module firmware version
  output.data.deviceInformation.wirelessModuleFirmwareVersion = `${((input.bytes[4] >> 4) & 0x0f).toString()}.${(input.bytes[4] & 0x0f).toString()}.${input.bytes[5].toString()}`;

  // Wireless module hardware version
  output.data.deviceInformation.wirelessModuleHardwareVersion = `${((input.bytes[6] >> 4) & 0x0f).toString()}.${(input.bytes[6] & 0x0f).toString()}.${input.bytes[7].toString()}`;

  /* No Sensor has been detected, break here */
  if (input.bytes.length < 29) {
    output = addErrorMessage(
      output,
      `Device identification frame 07 has not all bytes included, received ${input.bytes.length} and need at least 29 bytes`,
    );
    return output;
  }

  // Sensor serial number
  output.data.deviceInformation.serialNumber = "";
  for (let i = 8; i < 19; i++) {
    if (input.bytes[i] == 0) break;
    output.data.deviceInformation.serialNumber += String.fromCharCode(
      input.bytes[i],
    );
  }

  /* If at least channelA is present */
  if (input.bytes.length >= 29) {
    output.data.deviceInformation.measurementRangeStart =
      convertHexToFloatIEEE754(
        input.bytes[19].toString(16).padStart(2, "0") +
          input.bytes[20].toString(16).padStart(2, "0") +
          input.bytes[21].toString(16).padStart(2, "0") +
          input.bytes[22].toString(16).padStart(2, "0"),
      );
    output.data.deviceInformation.measurementRangeStart = Number(
      output.data.deviceInformation.measurementRangeStart.toFixed(6),
    );
    output.data.deviceInformation.measurementRangeEnd =
      convertHexToFloatIEEE754(
        input.bytes[23].toString(16).padStart(2, "0") +
          input.bytes[24].toString(16).padStart(2, "0") +
          input.bytes[25].toString(16).padStart(2, "0") +
          input.bytes[26].toString(16).padStart(2, "0"),
      );
    output.data.deviceInformation.measurementRangeEnd = Number(
      output.data.deviceInformation.measurementRangeEnd.toFixed(6),
    );
    output.data.deviceInformation.measurand = input.bytes[27];
    output.data.deviceInformation.measurandName = lppReturnMeasurandFromId(
      input.bytes[27],
    );
    output.data.deviceInformation.unit = input.bytes[28];
    output.data.deviceInformation.unitName = lppReturnUnitFromId(
      input.bytes[28],
    );
  }

  return output;
}

// ***********************************************************************************
//          Additional Functions Section
// ***********************************************************************************
/**
 * Converts a hex string number to float number follows the IEEE 754 standard and it's ES5 compatible
 * @access private
 * @param  {string} hexString   - Float as string "3.141"
 * @return {number}             - returns a float
 * @see https://gist.github.com/Jozo132/2c0fae763f5dc6635a6714bb741d152f 2022 by Jozo132
 */
function convertHexToFloatIEEE754(hexString) {
  const int = parseInt(hexString, 16);
  if (int > 0 || int < 0) {
    const sign = int >>> 31 ? -1 : 1;
    let exp = ((int >>> 23) & 0xff) - 127;
    const mantissa = ((int & 0x7fffff) + 0x800000).toString(2);
    let float32 = 0;
    for (let i = 0; i < mantissa.length; i += 1) {
      float32 += parseInt(mantissa[i]) ? Math.pow(2, exp) : 0;
      exp--;
    }
    return float32 * sign;
  }
  return 0;
}

/**
 * Checks the user defined measurement ranges
 * @access private
 * @param  {output} output - Output object
 * @return {output}        - Returns if the ranges are correct defined
 */
function checkMeasurementRanges(output) {
  if (typeof VALUE_RANGE_START === "undefined") {
    output = addErrorMessage(output, "The VALUE_RANGE_START was not set.");
  }

  if (typeof VALUE_RANGE_END === "undefined") {
    output = addErrorMessage(output, "The VALUE_RANGE_END was not set.");
  }

  if (VALUE_RANGE_START >= VALUE_RANGE_END) {
    output = addErrorMessage(
      output,
      `The VALUE_RANGE_START must not be greater or equal to VALUE_RANGE_END, ${VALUE_RANGE_START} >= ${VALUE_RANGE_END}. `,
    );
  }

  return output;
}

/**
 * Add warning to output object
 * @param {output} output
 * @param {string} warningMessage
 * @access private
 */

function addWarningMessage(output, warningMessage) {
  // eslint-disable-line
  // use only functional supported by ECMA-262 5th edition. The nullish assign and .at are not supported. output.warnings ??= [];
  output.warnings = output.warnings || [];
  output.warnings.push(`${DEVICE_NAME} (JS): ${warningMessage}`);
  return output;
}

/**
 * Add private to output object
 * @param {output} output
 * @param {string} errorMessage
 * @access private
 */
function addErrorMessage(output, errorMessage) {
  output.errors = output.errors || [];
  output.errors.push(`${DEVICE_NAME} (JS): ${errorMessage}`);
  return output;
}

/**
 * Create an empty output object
 * @returns {output}        - Returns an output object
 * @access private
 */
function createOutputObject() {
  return {
    data: {},
  };
}

/**
 * Set measurement ranges only for test purposes
 * @access protected
 * @param  {Number} valueRangeStart   range start
 * @param  {Number} valueRangeEnd     range end
 * @param  {string} channelMeasurandConfig     channel measurand config
 */
function setMeasurementRanges(
  valueRangeStart,
  valueRangeEnd,
  channelMeasurandConfig,
) {
  VALUE_RANGE_START = valueRangeStart;
  VALUE_RANGE_END = valueRangeEnd;
  CHANNEL_MEASURAND_CONFIGURATION = channelMeasurandConfig;
}

/**
 * Returns the real physical value of the channel value based on measurement range
 * @access private
 * @param  {Number} channelValue    channel value as integer
 * @param  {Number} measurementRangeStart   range start
 * @param  {Number} measurementRangeEnd     range end
 * @param  {Number} measuringRangeStart   range start (MRS)
 * @param  {Number} measuringRangeEnd     range end (MRE)
 * @return {Number} Returns real physical value e.g. 10 °C
 */
function getCalculatedValue(
  channelValue,
  measurementRangeStart,
  measurementRangeEnd,
  measuringRangeStart,
  measuringRangeEnd,
) {
  const calculatedValue =
    (channelValue - measuringRangeStart) *
      ((measurementRangeEnd - measurementRangeStart) /
        (measuringRangeEnd - measuringRangeStart)) +
    measurementRangeStart;
  // round to the third number after the comma
  return Math.round(calculatedValue * 1000) / 1000;
}

/**
 * Returns the real physical value of defined measurand based on measurement range
 * @param {Number} channelValue
 * @access private
 */
function getRealValue(channelValue) {
  return getCalculatedValue(
    channelValue,
    VALUE_RANGE_START,
    VALUE_RANGE_END,
    GENERIC_DATA_CHANNEL_RANGE_START,
    GENERIC_DATA_CHANNEL_RANGE_END,
  );
}

/**
 * Returns the calculated threshold value of defined measurand based on measurement range
 * @param {Number} channelValue
 * @access private
 */
function getThresholdValue(channelValue) {
  return getCalculatedValue(
    channelValue,
    VALUE_RANGE_START,
    VALUE_RANGE_END,
    2500,
    12500,
  );
}

/**
 * Returns the slope physical value of defined measurand based on measurement range
 * @param {Number} channelValue
 * @access private
 */
function getSlopeValue(channelValue) {
  return getCalculatedValue(
    channelValue,
    VALUE_RANGE_START,
    VALUE_RANGE_END,
    0,
    10000,
  );
}

/**
 * To convert a hex encoded string to a integer array
 * @param {string} hexEncodedString
 * @access private
 */
function convertHexStringToBytes(hexEncodedString) {
  if (hexEncodedString.startsWith("0x")) {
    hexEncodedString = hexEncodedString.slice(2);
  }

  // remove spaces
  hexEncodedString = hexEncodedString.replace(/\s/g, "");

  const bytes = [];

  // convert byte to byte (2 characters are 1 byte)
  for (let i = 0; i < hexEncodedString.length; i += 2) {
    // extract 2 characters
    const hex = hexEncodedString.substr(i, 2);

    // convert hex pair to integer
    const intValue = parseInt(hex, 16);

    bytes.push(intValue);
  }

  return bytes;
}

/**
 * To convert a base64 encoded string to a integer array
 * @param {string} base64EncodedString
 * @access private
 */
function convertBase64StringToBytes(base64EncodedString) {
  const bytes = [];

  // convert base64 to string
  const decodedBytes = Buffer.from(base64EncodedString, "base64");

  // convert byte to byte (2 characters are 1 byte)
  for (let i = 0; i < decodedBytes.length; i++) {
    // convert byte to integer
    const intValue = decodedBytes[i];

    bytes.push(intValue);
  }

  return bytes;
}

/**
 * Returns the printable name of a measurand for a LPP supporting devices e.g.: 1 = "Temperature"
 * @access private
 * @param  {Number} id    Identifier as integer
 * @return {string}       Returns a string e.g.: "Temperature"
 */
function lppReturnMeasurandFromId(id) {
  switch (id) {
    case 1:
      return "Temperature";
    case 2:
      return "Temperature difference";
    case 3:
      return "Pressure (gauge)";
    case 4:
      return "Pressure (absolute)";
    case 5:
      return "Pressure (differential)";
    case 6:
      return "Flow (vol.)";
    case 7:
      return "Flow (mass)";
    case 8:
      return "Force";
    case 9:
      return "Mass";
    case 10:
      return "Level";
    case 11:
      return "Length";
    case 12:
      return "Volume";
    case 13:
      return "Current";
    case 14:
      return "Voltage";
    case 15:
      return "Resistance";
    case 16:
      return "Capacitance";
    case 17:
      return "Inductance";
    case 18:
      return "Relative";
    case 19:
      return "Time";
    case 20:
      return "Frequency";
    case 21:
      return "Speed";
    case 22:
      return "Acceleration";
    case 23:
      return "Density";
    case 24:
      return "Density (gauge pressure at 20 °C)";
    case 25:
      return "Density (absolute pressure at 20 °C)";
    case 26:
      return "Humidity (relative)";
    case 27:
      return "Humidity (absolute)";
    case 28:
      return "Angle of rotation / inclination";
    case 60:
    case 61:
    case 62:
      return "Device specific";
    default:
      return "Unknown";
  }
}

/**
 * Returns the printable name of a physical unit for LPP supporting devices e.g.: 1 = "°C"
 * @access private
 * @param  {Number} id    Identifier as integer
 * @return {string}       Returns a string e.g.: "°C"
 */
function lppReturnUnitFromId(id) {
  switch (id) {
    case 1:
      return "°C";
    case 2:
      return "°F";
    case 3:
      return "K";
    case 4:
      return "°R";
    case 7:
      return "bar";
    case 8:
      return "mbar";
    case 9:
      return "µbar";
    case 10:
      return "Pa";
    case 11:
      return "hPa";
    case 12:
      return "kPa";
    case 13:
      return "MPa";
    case 14:
      return "psi";
    case 15:
      return "lbf/ft²";
    case 16:
      return "kN/m²";
    case 17:
      return "N/cm²";
    case 18:
      return "atm";
    case 19:
      return "kg/cm²";
    case 20:
      return "kg/mm²";
    case 21:
      return "µmHg";
    case 22:
      return "mmHg";
    case 23:
      return "cmHg";
    case 24:
      return "inHg";
    case 25:
      return "mmH2O";
    case 26:
      return "mH2O";
    case 27:
      return "inH2O";
    case 28:
      return "ftH2O";
    case 45:
      return "N";
    case 46:
      return "daN";
    case 47:
      return "kN";
    case 48:
      return "MN";
    case 49:
      return "kp";
    case 50:
      return "lbf";
    case 51:
      return "ozf";
    case 52:
      return "dyn";
    case 55:
      return "kg";
    case 56:
      return "g";
    case 57:
      return "mg";
    case 58:
      return "lb";
    case 60:
      return "mm";
    case 61:
      return "cm";
    case 62:
      return "m";
    case 63:
      return "µm";
    case 64:
      return "ft";
    case 65:
      return "in";
    case 70:
      return "l";
    case 71:
      return "ml";
    case 72:
      return "m³";
    case 73:
      return "gal (UK)";
    case 74:
      return "gal (US)";
    case 75:
      return "ft³";
    case 76:
      return "in³";
    case 82:
      return "mΩ";
    case 83:
      return "Ω";
    case 84:
      return "[kΩ] kiloohm";
    case 86:
      return "μV";
    case 87:
      return "mV";
    case 88:
      return "V";
    case 90:
      return "mA";
    case 91:
      return "μA";
    case 93:
      return "[μF] microfarad";
    case 94:
      return "[nF] nanofarad";
    case 95:
      return "[pF] picofarad";
    case 97:
      return "[mH] millihenry";
    case 98:
      return "[μH] henry";
    case 100:
      return "[%] percent";
    case 101:
      return "[‰] per mille";
    case 102:
      return "[ppm]";
    case 105:
      return "[°] degree";
    case 106:
      return "[rad] radian";
    case 108:
      return "counts, counter value";
    case 110:
      return "[kg/m³]";
    case 111:
      return "[g/m³]";
    case 112:
      return "[mg/m³]";
    case 113:
      return "[μg/m³]";
    case 114:
      return "[kg/l]";
    case 115:
      return "[g/l]";
    case 116:
      return "[lb/ft³]";
    case 120:
      return "[l/min] litre per minute";
    case 121:
      return "[l/s] litre per second";
    case 122:
      return "[m³/h] cubic metre per hour (cbm/h)";
    case 123:
      return "[m³/s] cubic metre per second";
    case 124:
      return "[cfm] cubic feet per minute";
    case 140:
      return "[kg/s]";
    case 141:
      return "[kg/h]";
    case 160:
      return "[s]";
    case 161:
      return "[min]";
    case 162:
      return "[h] hour";
    case 163:
      return "[d] day";
    case 167:
      return "[Hz]";
    case 168:
      return "[kHz]";
    case 170:
      return "[m/s]";
    case 171:
      return "[cm/s]";
    case 172:
      return "[ft/min]";
    case 173:
      return "[ft/s]";
    case 180:
      return "[m/s²]";
    case 181:
      return "[ft/s²]";
    default:
      return "Unknown";
  }
}

function consume(event) {
  const payload = event.data.payloadHex;
  const { port } = event.data;
  const data = {};

  // Set globals with customfields
  if (event.device !== undefined && event.device.customFields !== undefined) {
    const { customFields } = event.device;

    // Only decode the messages if the customfields are set, otherwiese you can not decode correctly
    if (
      !isNaN(customFields.rangeStart) &&
      customFields.rangeStart !== null &&
      !isNaN(customFields.rangeEnd) &&
      customFields.rangeEnd !== null &&
      customFields.channelMeasurand !== undefined &&
      customFields.channelMeasurand !== null
    ) {
      VALUE_RANGE_START = customFields.rangeStart;
      VALUE_RANGE_END = customFields.rangeEnd;
      CHANNEL_MEASURAND_CONFIGURATION = customFields.channelMeasurand;

      // Lets try to not modify the standard decoder too much
      const decoded = decodeHexString(port, payload).data;

      if (decoded.errors !== undefined) {
        emit("sample", { data: decoded.errors, topic: "error" });
      } else if (decoded.measurement !== undefined) {
        decoded.measurement.channels.forEach((channel) => {
          data[channel.channelName] = channel.value;
        });

        emit("sample", { data, topic: "default" });
      } else if (decoded.processAlarms !== undefined) {
        decoded.processAlarms.forEach((alarm) => {
          const packet = {};
          packet.alarmChannel = alarm.channelName;
          packet.alarmStatus = alarm.eventName;
          packet.alarmType = alarm.alarmTypeName;
          packet.value = alarm.value;
          emit("sample", { data: packet, topic: "process_alarm" });
        });
      } else if (decoded.technicalAlarms !== undefined) {
        decoded.technicalAlarms.forEach((alarm) => {
          const packet = {};
          packet.alarmStatus = alarm.alarmType;
          packet.alarmType = alarm.alarmTypeNames;
          emit("sample", { data: packet, topic: "technical_alarm" });
        });
      } else if (decoded.deviceAlarm !== undefined) {
        data.alarmType = decoded.deviceAlarm.alarmType;
        data.alarmTypeNames = decoded.deviceAlarm.alarmTypeNames;

        emit("sample", { data, topic: "device_alarm" });
      } else if (decoded.deviceInformation !== undefined) {
        data.productId = decoded.deviceInformation.productId;
        data.wirelessModuleFirmwareVersion =
          decoded.deviceInformation.wirelessModuleFirmwareVersion;
        data.wirelessModuleHardwareVersion =
          decoded.deviceInformation.wirelessModuleHardwareVersion;
        data.serialNumber = decoded.deviceInformation.serialNumber;
        data.productSubId = decoded.deviceInformation.productSubId;
        data.measurementRangeStart =
          decoded.deviceInformation.measurementRangeStart;
        data.measurementRangeEnd =
          decoded.deviceInformation.measurementRangeEnd;
        data.measurandName = decoded.deviceInformation.measurandName;
        data.unitName = decoded.deviceInformation.unitName;

        emit("sample", { data, topic: "device_information" });
      } else if (decoded.deviceStatistic !== undefined) {
        data.batteryLevelNewEvent =
          decoded.deviceInformation.batteryLevelNewEvent;
        data.batteryLevel = decoded.deviceInformation.batteryLevel;

        emit("sample", { data, topic: "lifecycle" });
      }
    } else {
      const error = {
        errorMessage:
          "Please define the customfields: rangeStart, rangeEnd, channelMeasurand",
      };
      emit("sample", { data: error, topic: "error" });
    }
  } else {
    const error = {
      errorMessage:
        "Please define the customfields: rangeStart, rangeEnd, channelMeasurand",
    };
    emit("sample", { data: error, topic: "error" });
  }
}
