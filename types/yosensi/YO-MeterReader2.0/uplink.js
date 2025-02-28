/**
 * __  __                      _
 * \ \/ /__  ___ ___ ___  ___ (_)
 *  \  / _ \(_-</ -_) _ \(_-</ /
 *  /_/\___/___/\__/_//_/___/_/
 *
 * Yosensi JS payload decoder compatible with TTN v3 payload formatter and ChirpStact payload codec
 * Compatibility with ECMAScript 5 and later versions of the standard
 *
 * @author      Pawel Poplawski <pawel.poplawski@yosensi.io>
 * @author      Maciej Sacewicz <maciej.sacewicz@yosensi.io>
 * @version     1.0.1
 * @copyright   YOSENSI SP. Z O.O. | http://yosensi.io
 * @license     Modified-BSD-License, see LICENSE file include in the project
 *
 * @since 1.0.0
 *
 * Version with V2 payload decoding functionality with output compatible with TTN v3 payload formatter and ChirpStact payload codec.
 *
 * @since 1.0.1
 *
 * Converted to meet ESLint rules and prepared for Akenza platform.
 */

/**
 * Set of utility functions
 *
 * @returns Utility functions
 */
function utilityFunctions() {
  function unsignedNbrFromByte(byte) {
    return byte & 0xff;
  }

  function signedNbrFromByte(byte) {
    if (byte & 0x80) {
      return byte - 0x100;
    }
    return byte & 0xff;
  }

  function unsignedNbrFromBytes(bytes) {
    let value = 0;
    let count = bytes.length;
    for (let i = 0; i < bytes.length; i++) {
      value |= (bytes[i] & 0xff) << (8 * --count);
    }
    return value;
  }

  function signedNbrFromBytes(bytes) {
    let value = 0;
    let count = bytes.length;
    let firstByteValue;
    let bytesWithoutFirst = 0;
    if (bytes[0] & 0x80) {
      firstByteValue = bytes[0] - 0x100;
    } else {
      firstByteValue = bytes[0] & 0xff;
    }
    value |= firstByteValue << (8 * --count);
    bytesWithoutFirst = bytes.slice(1, bytes.length);
    for (let i = 0; i < bytesWithoutFirst.length; i++) {
      value |= (bytesWithoutFirst[i] & 0xff) << (8 * --count);
    }
    return value;
  }

  function encodeHexString(bytes) {
    let hexStr = "";
    for (let i = 0; i < bytes.length; i++) {
      if (bytes[i] < 16) {
        hexStr = `${hexStr}0`;
      }
      hexStr = `${hexStr}${bytes[i].toString(16)}`;
    }
    return hexStr;
  }

  const getStrFromArrOfObj = (bytes) => {
    let str = "";
    Object.keys(bytes).forEach((key) => {
      str += `${bytes[key]},`;
    });
    return str.slice(0, -2);
  };

  function toFixedNumber(value, precision, base) {
    const pow = base || 10;
    const multiplier = 10 ** precision;
    return Math.round(value * multiplier * pow) / (multiplier * pow);
  }

  function checkIfArrInclude(bytes, byte) {
    for (let i = 0; i < bytes.length; i++) {
      if (bytes[i] === byte) {
        return true;
      }
    }
    return false;
  }

  return {
    unsignedNbrFromByte,
    signedNbrFromByte,
    unsignedNbrFromBytes,
    signedNbrFromBytes,
    encodeHexString,
    getStrFromArrOfObj,
    toFixedNumber,
    checkIfArrInclude,
  };
}

/**
 * Payload V2 measurement
 *
 * @param {string} address Address of measurement
 * @param {string} dateTime Calculated time of measurement
 * @param {number} type Type of the measurement
 * @param {string} typeName Type name of the measurement
 * @param {string} typeUnits Type units of the measurement
 * @param {number} value Measurement value
 * @returns Object with payload V2 single measurement data
 */
function payloadV2Measurement(
  address,
  dateTime,
  type,
  typeName,
  typeUnits,
  value,
) {
  const measurement = {
    /**
     * Address of measurement
     */
    address,
    /**
     * Calculated time of measurement
     * (payload creation date and time + received time difference between getting the measurement and creating payload)
     */
    dateTime,
    /**
     * Type of the measurement
     */
    type,
    /**
     * Type name of the measurement
     */
    typeName,
    /**
     * Type units of the measurement
     */
    typeUnits,
    /**
     * Measurement value
     */
    value,
  };
  return measurement;
}

/**
 * Payload
 *
 * @param {object} data Decoded data object
 * @param {object} warnings Warnings array, if any
 * @param {object} errors Errors array, if any
 * @returns Decoded data in TTN v3 payload formatter compatible format
 */
function payload(data, warnings, errors) {
  const payloadReturn = {
    /**
     * Data decoded from supported protocol
     */
    data,
    /**
     * Warnings array, if any
     */
    warnings,
    /**
     * Errors array, if any
     */
    errors,
  };
  return payloadReturn;
}

/**
 * Payload V2
 *
 * @param {number} payloadCounter Payload counter
 * @param {string} dateTime Calculated time of payload creation
 * @param {object} measurements Array of measurements data objects
 * @returns Object with all payload V2 data
 */
function payloadV2(payloadCounter, dateTime, measurements) {
  const data = {
    /**
     * Payload version
     */
    payloadVersion: 2,
    /**
     * Payload counter
     */
    payloadCounter,
    /**
     * Calculated time of payload creation
     * (payload reception date and time (current date and time by default) - received time difference between sending and creating payload)
     */
    payloadCreationDateTime: dateTime,
    /**
     * Array of measurements data objects
     */
    measurements,
  };
  return data;
}

/**
 * Payload V2 parser function
 *
 * @param {object} bytes Bytes of received payload
 * @param {object} date Payload reception date and time (current date and time by default)
 * @returns Decoded payload and/or error array, if any, compatible with TTN v3 payload formatter
 *
 */
function payloadV2Parse(bytes, date, utils) {
  /**
   * Payload V2 measurement types and units
   */
  const PAYLOAD_V2_MEAS_TYPES = Object.freeze({
    1: ["state", ""],
    2: ["battery voltage", "[mV]"],
    3: ["temperature", "[°C]"],
    4: ["relative humidity", "[%]"],
    5: ["pressure", "[hPa]"],
    6: ["illuminance", "[klx]"],
    7: ["CO2 equivalent", "[ppm]"],
    8: ["TVOC concentration", "[ppb]"],
    9: ["dust concentration", "[ug/m3]"],
    10: ["distance", "[mm]"],
    11: ["current", "[mA or A]"],
    12: ["voltage", "[mV] or [V]"],
    13: ["power", "[W]"],
    14: ["acceleration - x, y, z", "[g]"],
    15: ["three-value custom", ""],
    16: ["three-value custom", ""],
    17: ["four-value custom", ""],
    18: ["four-value custom", ""],
    19: ["vibration intensity", ""],
    20: ["vibration acceleration", ""],
    21: ["0-10V external analog - ?", "mV"],
    22: ["two-value custom", ""],
    23: ["two-value custom", ""],
    24: ["counter", ""],
    25: ["custom", ""],
    26: ["CO", "[ppm]"],
    27: ["CO2", "[ppm]"],
    28: ["sound pressure level", "[dB]"],
    29: ["custom", ""],
    30: ["custom", ""],
    31: ["custom", ""],
    32: ["PM1", "[ug/m3]"],
    33: ["PM2.5", "[ug/m3]"],
    34: ["PM4", "pug/m3]"],
    35: ["PM10", "pug/m3]"],
    36: ["generic modbus", ""],
    37: ["O2", "[%]"],
    38: ["Total Units", "[kWh | J | m3]"],
    39: ["OBIS", ""],
    40: ["velocity", "m/s"],
    63: ["Command", ""],
  });
  /**
   * Two-value custom types
   */
  const values2Types = Object.freeze([22, 23]);
  /**
   * Three-value custom types
   */
  const values3Types = Object.freeze([15, 16]);
  /**
   * Four-value custom types
   */
  const values4Types = Object.freeze([17, 18]);

  function raiseError(message) {
    return payload({}, [], [message]);
  }

  function extractPayloadDateTime(
    extractPayloadDateTimeBytes,
    extractPayloadDateTimeDate,
  ) {
    return new Date(
      Number(extractPayloadDateTimeDate) -
      utils.unsignedNbrFromBytes(extractPayloadDateTimeBytes.slice(2, 4)) *
      1000,
    );
  }

  function extractAddressLength(byte) {
    return (byte >> 4) & 0x0f;
  }

  function extractValueLength(byte) {
    return (byte & 0x0f) + 1;
  }

  function extractMeasurementDateTime(byte, extractMeasurementDateTimeDate) {
    return new Date(
      Number(extractMeasurementDateTimeDate) +
      utils.unsignedNbrFromByte(byte) * 1000,
    );
  }

  function extractMeasurementType(byte) {
    return (byte >> 2) & 0x3f;
  }

  function extractValuePrecision(byte) {
    return byte & 0x03;
  }

  function extractAddress(extractAddressBytes) {
    const addressLen = extractAddressLength(extractAddressBytes[2]);
    if (addressLen === 0) return "";
    return utils.encodeHexString(extractAddressBytes.slice(3, 3 + addressLen));
  }

  function extractValue(extractValueBytes) {
    const precision = extractValuePrecision(extractValueBytes[0]);
    const valueLen = extractValueLength(extractValueBytes[2]);
    const addressLen = extractAddressLength(extractValueBytes[2]);
    const value = utils.signedNbrFromBytes(
      extractValueBytes.slice(3 + addressLen, 3 + addressLen + valueLen),
    );
    const valueExp = value / 10 ** precision;
    return utils.toFixedNumber(valueExp, precision, 10);
  }

  function extractValueFromRange(
    extractValueFromRangeBytes,
    valueFrom,
    valueTo,
  ) {
    const precision = extractValuePrecision(extractValueFromRangeBytes[0]);
    const valueLen = extractValueLength(extractValueFromRangeBytes[2]);
    const addressLen = extractAddressLength(extractValueFromRangeBytes[2]);
    if (valueTo > valueLen) {
      return raiseError(
        "Extract value size out of index for value from: ".concat(
          valueFrom,
          " to: ",
          valueTo,
        ),
      );
    }
    const value = utils.signedNbrFromBytes(
      extractValueFromRangeBytes.slice(
        3 + addressLen + valueFrom,
        3 + addressLen + valueTo,
      ),
    );
    const valueExp = value / 10 ** precision;
    return utils.toFixedNumber(valueExp, precision, 10);
  }

  function parseMeasurement(parseMeasurementBytes, parseMeasurementDate) {
    if (parseMeasurementBytes.length < 4) {
      return raiseError(
        "Measurement length must be at least 4 but was: ".concat(
          parseMeasurementBytes.length,
        ),
      );
    }
    const dateTime = extractMeasurementDateTime(
      parseMeasurementBytes[1],
      parseMeasurementDate,
    );
    const valueLen = extractValueLength(parseMeasurementBytes[2]);
    const addrLen = extractAddressLength(parseMeasurementBytes[2]);
    const expectedLen = 3 + valueLen + addrLen;
    if (parseMeasurementBytes.length !== expectedLen) {
      return raiseError(
        "Measurement bytes corrupted. Expected length: ".concat(
          expectedLen,
          " but was: ",
          parseMeasurementBytes.length,
        ),
      );
    }
    const type = extractMeasurementType(parseMeasurementBytes[0]);
    const address = extractAddress(parseMeasurementBytes);
    const value = extractValue(parseMeasurementBytes);
    let typeName = "undefined";
    let typeUnits = "undefined";
    if (Object.prototype.hasOwnProperty.call(PAYLOAD_V2_MEAS_TYPES, type)) {
      typeName = PAYLOAD_V2_MEAS_TYPES[type][0];
      typeUnits = PAYLOAD_V2_MEAS_TYPES[type][1];
    }
    if (utils.checkIfArrInclude(values4Types, type)) {
      if (valueLen !== 8) {
        return raiseError(
          "Extender measurement bytes corrupted. Expected value length: 8 but was: ".concat(
            parseMeasurementBytes.length,
          ),
        );
      }
      return [
        payloadV2Measurement(
          `${address}00`,
          dateTime.toISOString(),
          type,
          typeName,
          typeUnits,
          extractValueFromRange(parseMeasurementBytes, 0, 2),
        ),
        payloadV2Measurement(
          `${address}01`,
          dateTime.toISOString(),
          type,
          typeName,
          typeUnits,
          extractValueFromRange(parseMeasurementBytes, 2, 4),
        ),
        payloadV2Measurement(
          `${address}02`,
          dateTime.toISOString(),
          type,
          typeName,
          typeUnits,
          extractValueFromRange(parseMeasurementBytes, 4, 6),
        ),
        payloadV2Measurement(
          `${address}03`,
          dateTime.toISOString(),
          type,
          typeName,
          typeUnits,
          extractValueFromRange(parseMeasurementBytes, 6, 8),
        ),
      ];
    }
    if (utils.checkIfArrInclude(values3Types, type)) {
      if (valueLen !== 6) {
        return raiseError(
          "Values 3 measurement bytes corrupted. Expected value length: 6 but was: ".concat(
            parseMeasurementBytes.length,
          ),
        );
      }
      return [
        payloadV2Measurement(
          `${address}00`,
          dateTime.toISOString(),
          type,
          typeName,
          typeUnits,
          extractValueFromRange(parseMeasurementBytes, 0, 2),
        ),
        payloadV2Measurement(
          `${address}01`,
          dateTime.toISOString(),
          type,
          typeName,
          typeUnits,
          extractValueFromRange(parseMeasurementBytes, 2, 4),
        ),
        payloadV2Measurement(
          `${address}02`,
          dateTime.toISOString(),
          type,
          typeName,
          typeUnits,
          extractValueFromRange(parseMeasurementBytes, 4, 6),
        ),
      ];
    }
    if (utils.checkIfArrInclude(values2Types, type)) {
      if (valueLen < 2 || valueLen % 2 !== 0) {
        return raiseError(
          "Values 2 measurement bytes corrupted. Expected value length: '2 * n' but was: ".concat(
            bytes.length,
          ),
        );
      }
      return [
        payloadV2Measurement(
          `${address}00`,
          dateTime.toISOString(),
          type,
          typeName,
          typeUnits,
          extractValueFromRange(parseMeasurementBytes, 0, valueLen / 2),
        ),
        payloadV2Measurement(
          `${address}01`,
          dateTime.toISOString(),
          type,
          typeName,
          typeUnits,
          extractValueFromRange(parseMeasurementBytes, valueLen / 2, valueLen),
        ),
      ];
    }
    return payloadV2Measurement(
      address,
      dateTime.toISOString(),
      type,
      typeName,
      typeUnits,
      value,
    );
  }

  function extractPayloadCnt(extractPayloadCntBytes) {
    return utils.unsignedNbrFromByte(extractPayloadCntBytes[1]);
  }

  function parse(parseBytes, parseDate) {
    const measurements = [];
    if (parseBytes.length < 7) {
      return raiseError(
        "Payload length must be at least 7 but was: ".concat(bytes.length),
      );
    }
    let currPos = 4;
    const dateTime = extractPayloadDateTime(parseBytes, parseDate);
    let measLen;
    while (currPos < parseBytes.length) {
      if (parseBytes.length - currPos < 4) {
        return raiseError(
          "Payload measurement (started at ".concat(
            currPos,
            " byte) length must be at least 4 but was: ",
            bytes.length - currPos,
          ),
        );
      }
      measLen =
        3 +
        extractAddressLength(parseBytes[currPos + 2]) +
        extractValueLength(bytes[currPos + 2]);
      if (parseBytes.length < currPos + measLen) {
        return raiseError(
          "Package measurement (started at ".concat(
            currPos,
            " byte) corrupted. Expected length: ",
            measLen,
            " but was: ",
            bytes.length - currPos,
          ),
        );
      }
      const currentMeas = parseMeasurement(
        parseBytes.slice(currPos, currPos + measLen),
        dateTime,
      );
      if (Array.isArray(currentMeas)) {
        for (let i = 0; i < currentMeas.length; i++) {
          measurements.push(currentMeas[i]);
        }
      } else {
        measurements.push(currentMeas);
      }
      currPos += measLen;
    }

    return payload(
      payloadV2(
        extractPayloadCnt(parseBytes),
        dateTime.toISOString(),
        measurements,
      ),
      [],
      [],
    );
  }

  function checkInputDataType(checkInputDataTypeBytes) {
    if (typeof checkInputDataTypeBytes === "object") {
      for (let i = 0; i < checkInputDataTypeBytes.length; i++) {
        if (typeof checkInputDataTypeBytes[i] !== "number") {
          return false;
        }
      }
      return true;
    }
    return false;
  }

  if (!checkInputDataType(bytes)) {
    return raiseError(
      "Incorrect input data type. Payload should only consist of numeric values",
    );
  }

  try {
    return parse(bytes, date);
  } catch (err) {
    return raiseError("Input data parse failed. ".concat(err));
  }
}

/**
 * Supported payload versions
 *
 * @returns Object with supported payload versions
 */
function supportedPayloadVersions() {
  const PAYLOAD_VER = Object.freeze({
    V2: 2,
  });
  return PAYLOAD_VER;
}

/**
 * Decode function compliant with ChirpStack payload formatter
 *
 * @param {number} port Port on which data was received
 * @param {object} bytes Bytes of received payload
 * @returns Decoded data with warnings/errors, if any, according to the TTN v3 payload formatter, accepted by ChirpStack
 */
function decoder(port, bytes) {
  /**
   * Protocol version
   */
  const protocolVersion = bytes[0] & 0xff;
  /**
   * Object of decoded data
   */
  let decoded = {};
  const data = {};
  /**
   * Utility functions
   */
  const utils = utilityFunctions();

  if (protocolVersion === supportedPayloadVersions().V2) {
    decoded = payloadV2Parse(bytes, new Date(), utils);
  } else {
    decoded = payload(
      {},
      [],
      [
        "Unsupported payload. Supported versions: ".concat(
          utils.getStrFromArrOfObj(supportedPayloadVersions()),
          " but was: ",
          protocolVersion,
        ),
      ],
    );
  }

  /**
   * Read Data
   */
  for (let i = 0; i < decoded.data.measurements.length; i++) {
    switch (decoded.data.measurements[i].typeName) {
      case "battery voltage":
        data.batteryVoltage = decoded.data.measurements[i].value;
        break;
      case "temperature":
        data.internalTemperature = decoded.data.measurements[i].value;
        break;
      case "relative humidity":
        data.humidity = decoded.data.measurements[i].value;
        break;
      case "Total Units":
        data.totalUnits = decoded.data.measurements[i].value;
        break;
      case "two-value custom":
        switch (decoded.data.measurements[i].address) {
          case "00":
            data.periodicPulseCnt = decoded.data.measurements[i].value;
            break;
          case "01":
            data.persistentPulseCnt = decoded.data.measurements[i].value;
            break;
          default:
            data.status = "Error";
        }
        break;
      default:
        data.status = "Error";
    }
  }

  return {
    data,
  };
}

function consume(event) {
  const payloadData = event.data.payloadHex;
  const { port } = event.data;
  const data = decoder(port, Hex.hexToBytes(payloadData));

  if (data.data.batteryVoltage !== undefined) {
    emit("sample", {
      data: { batteryVoltage: data.data.batteryVoltage },
      topic: "battery_voltage",
    });
    delete data.data.batteryVoltage;
  }
  if (data.data.internalTemperature !== undefined) {
    emit("sample", {
      data: { internalTemperature: data.data.internalTemperature },
      topic: "internal_temperature",
    });
    delete data.data.internalTemperature;
  }
  if (data.data.humidity !== undefined) {
    emit("sample", {
      data: { humidity: data.data.humidity },
      topic: "humidity",
    });
    delete data.data.humidity;
  }

  if (data.data.periodicPulseCnt !== undefined) {
    emit("sample", {
      data: { periodicPulseCnt: data.data.periodicPulseCnt },
      topic: "periodic_pulse_cnt",
    });
    delete data.data.periodicPulseCnt;
  }
  if (data.data.persistentPulseCnt !== undefined) {
    emit("sample", {
      data: { persistentPulseCnt: data.data.persistentPulseCnt },
      topic: "persistent_pulse_cnt",
    });
    delete data.data.persistentPulseCnt;
  }
  if (data.data.totalUnits !== undefined) {
    emit("sample", {
      data: { totalUnits: data.data.totalUnits },
      topic: "total_units",
    });
    delete data.data.totalUnits;
  }
}
