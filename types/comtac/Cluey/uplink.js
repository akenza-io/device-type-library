/*
  comtac AG
  Cluey KM/AM/TM payload decoder (TTN/TTI v3). 
  www.comtac.ch
  manuel.bruetsch@comtac.ch
*/

// DEFINES
const PAYLOAD_DECODER_VERSION = "00.11";
const PAYLOAD_DECODER_INFO = "comtac Cluey";
const DEVICE_DESIGNATION_CLUEY_KM = "Cluey-KM";
const DEVICE_DESIGNATION_CLUEY_AM = "Cluey-AM/MB";
const DEVICE_DESIGNATION_CLUEY_TM = "Cluey-TM";
const DEVICE_MANUFACTURER = "comtac AG";

const CLUEY_KM_DEVICE_ID = 0x10;
const CLUEY_AM_DEVICE_ID = 0x11;
const CLUEY_TM_DEVICE_ID = 0x12;

const PAYLOAD_VERSION = 0x00; // PL version 0

const FIXED_DATA_PORT = 3; // FIXED_DATA port
const MODBUS_PORT = 5; // MBS port
const MODBUS_TP_PORT = 6; // MBS TRANSPARENT port
const DI_DATA_PORT = 20; // DI_DATA port
const CNT_DATA_PORT = 21; // CNT_DATA port
const TIMESYNC_PORT = 22; // TIMESYNC port
const AI_DATA_PORT = 23; // AI_DATA port
const CONFIG_PORT = 100; // CONFIG port
const INFO_PORT = 101; // INFO port
const GPS_PORT = 106; // GPS port
const PING_PORT = 110; // PING port

// Object Types
const OBJECT_TYPE_DI = 0x10;
const OBJECT_TYPE_DBL = 0x20;
const OBJECT_TYPE_CNT = 0x40;
const OBJECT_TYPE_AI = 0x50;
const OBJECT_TYPE_TEMP = 0x60;

// SETTINGS
// Device Information
const DI_LABEL = 0x00;

// Device Settings
const DS_DEFAULT_SUPPLY_MODE = 0x01;
const DS_BUFFERED_OPERATION = 0x02;
const DS_BUFFERED_OPERATION_SPAN = 0x03;
const DS_PAYLOAD_FORMAT = 0x04;

// Timing Settings
const TS_MEAS_INT_DC = 0x06;
const TS_MEAS_INT_BAT = 0x07;
const TS_TIMESYNC_INT = 0x08;
const TS_REJOIN_INT = 0x09;
const TS_AI_MEAS_INT = 0x0a;
const TS_LEAP_SECONDS = 0x0b;

// Input Settings
const IS_ENABLE = 0x0c;
const IS_ACTIVE = 0x0d;
const IS_INVERT = 0x0e;
const IS_DELAY_ENABLE = 0x0f;
const IS_DELAY_RISING = 0x10;
const IS_DELAY_FALLING = 0x11;
const IS_DELAY_SCALING = 0x12;
const IS_WIPER_ENABLE = 0x13;
const IS_WIPER_CONFIRMATION_TIMEOUT = 0x14;
const IS_DEFLUTTER_ENABLE = 0x15;
const IS_DEFLUTTER_INTERVAL = 0x16;
const IS_DEFLUTTER_COUNT = 0x17;
const IS_DOUBLE_ENABLE = 0x18;
const IS_DOUBLE_INTERMEDIATE_STATE_TIMEOUT_ENABLE = 0x19;
const IS_DOUBLE_INTERMEDIATE_STATE_TIMEOUT = 0x1a;
const IS_COUNTER_ENABLE = 0x1b;
const IS_COUNTER_HARDWARE = 0x1c;
const IS_COUNTER_MODE = 0x1d;
const IS_COUNTER_SCALING = 0x1e;
const IS_COUNTER_DIFF_ENABLE = 0x1f;
const IS_COUNTER_DIFF_INTERVAL = 0x20;

// Analog Input Settings
const AIS_ENABLE = 0x21;
const AIS_DELTA_ENABLE = 0x22;
const AIS_DELTA_VALUE = 0x23;
const AIS_LIMIT1_ENABLE = 0x24;
const AIS_LIMIT2_ENABLE = 0x25;
const AIS_LIMIT1_DELAY_ENABLE = 0x26;
const AIS_LIMIT2_DELAY_ENABLE = 0x27;
const AIS_LIMIT_DELAY_SCALING = 0x28;
const AIS_LIMIT1_DELAY_RISING = 0x29;
const AIS_LIMIT2_DELAY_RISING = 0x2a;
const AIS_LIMIT1_DELAY_FALLING = 0x2b;
const AIS_LIMIT2_DELAY_FALLING = 0x2c;
const AIS_LIMIT1_VALUE = 0x2d;
const AIS_LIMIT2_VALUE = 0x2e;
const AIS_LIMIT1_HYSTERESIS = 0x2f;
const AIS_LIMIT2_HYSTERESIS = 0x30;
const AIS_LIMIT1_DIRECTION = 0x31;
const AIS_LIMIT2_DIRECTION = 0x32;

// Input Event Settings
const IES_RISING_ENABLE = 0x33;
const IES_FALLING_ENABLE = 0x34;
const IES_BLOCKED_CHANGED = 0x35;
const IES_PRIORITY = 0x36;
const IES_DELAY = 0x37;

// Analog Event Settings
const AES_LIMIT1_RISING_ENABLE = 0x38;
const AES_LIMIT2_RISING_ENABLE = 0x39;
const AES_LIMIT1_FALLING_ENABLE = 0x3a;
const AES_LIMIT2_FALLING_ENABLE = 0x3b;
const AES_DELTA_ENABLE = 0x3c;
const AES_INVALID_VALUE_ENABLE = 0x3d;
const AES_OVERFLOW_VALUE_ENABLE = 0x3e;

// Cyclic Settings
const CS_CYCLIC_DI_ENABLE = 0x3f;
const CS_DI_CONFIRMED = 0x40;
const CS_CYCLIC_DI_INTERVAL = 0x41;
const CS_CYCLIC_AI_ENABLE = 0x42;
const CS_AI_CONFIRMED = 0x43;
const CS_CYCLIC_AI_INTERVAL = 0x44;
const CS_CYCLIC_CNT_ENABLE = 0x45;
const CS_CNT_CONFIRMED = 0x46;
const CS_CYCLIC_CNT_TIMEDATE_WEEKDAY_SEL = 0x47;
const CS_CYCLIC_CNT_TIMEDATE_WEEKDAY = 0x48;
const CS_CYCLIC_CNT_TIME_HOUR = 0x49;
const CS_CYCLIC_CNT_TIME_MINUTE = 0x4a;
const CS_CYCLIC_CNT_TIME_INTERVAL = 0x4b;

// Access Control Settings
const ACS_ENABLE = 0x4c;
const ACS_ALARM_DELAY = 0x4d;
const ACS_MOTION_DET_SEL = 0x4e;
const ACS_KEY_SWITCH_SEL = 0x4f;
const ACS_DOOR_CONTACT_SEL = 0x50;

// Output Settings
const OS_ENABLE = 0x51;
const OS_INVERT = 0x52;
const OS_MODE = 0x53;
const OS_WIPER_TIME = 0x54;
const OS_TRIGGER_ENABLE = 0x5d;
const OS_TRIGGER_PERIOD = 0x5e;
const OS_TRIGGER_SCALING = 0x5f;

// Input-Output Mapping Settings
const IOMS_OUT1 = 0x55;
const IOMS_OUT2 = 0x56;
const IOMS_OUT3 = 0x57;
const IOMS_OUT4 = 0x58;

// Limit-Output Mapping Settings
const LOMS_OUT1 = 0x59;
const LOMS_OUT2 = 0x5a;
const LOMS_OUT3 = 0x5b;
const LOMS_OUT4 = 0x5c;

// Modbus Settings
const MBS_CONFIG = 0x60;
const MBS_TRANSPARENT_DOWNLINK_ENABLE = 0x61;
const MBS_DPRATE_ENABLE = 0x62;
const MBS_DPRATE_TIMEDATE_WEEKDAY_SEL = 0x63;
const MBS_DPRATE_TIMEDATE_WEEKDAY = 0x64;
const MBS_DPRATE_TIME_HOUR = 0x65;
const MBS_DPRATE_TIME_MINUTE = 0x66;
const MBS_DPRATE_TIME_INTERVAL = 0x67;
const MBS_DP_00 = 0x68;
const MBS_DP_01 = 0x69;
const MBS_DP_02 = 0x6a;
const MBS_DP_03 = 0x6b;
const MBS_DP_04 = 0x6c;
const MBS_DP_05 = 0x6d;
const MBS_DP_06 = 0x6e;
const MBS_DP_07 = 0x6f;
const MBS_DP_08 = 0x70;
const MBS_DP_09 = 0x71;
const MBS_DP_10 = 0x72;
const MBS_DP_11 = 0x73;
const MBS_DP_12 = 0x74;
const MBS_DP_13 = 0x75;
const MBS_DP_14 = 0x76;
const MBS_DP_15 = 0x77;

let pointer = 0;
let deviceHeader = {};

// MAIN DECODER CALL
function decodeUplink(input) {
  const warnings = [];
  const errors = [];

  deviceHeader = decodeDeviceHeader(input.bytes);

  if (deviceHeader.info.deviceId === CLUEY_KM_DEVICE_ID) {
    if (deviceHeader.info.deviceVersion === 0) {
      if (input.fPort === FIXED_DATA_PORT) {
        return decodeFixedDataPayload(input.bytes);
      }
      if (input.fPort === DI_DATA_PORT) {
        return decodeDiDataPayload(input.bytes);
      }
      if (input.fPort === CNT_DATA_PORT) {
        return decodeCntDataPayload(input.bytes);
      }
      if (input.fPort === TIMESYNC_PORT) {
        return decodeTimesyncPayload(input.bytes);
      }
      if (input.fPort === CONFIG_PORT) {
        return decodeConfigPayload(input.bytes);
      }
      if (input.fPort === INFO_PORT) {
        return decodeInfoPayload(input.bytes);
      }
      if (input.fPort === GPS_PORT) {
        return decodeGpsPayload(input.bytes);
      }
      if (input.fPort === PING_PORT) {
        return decodePingPayload(input.bytes);
      }
      errors.push("INVALID_PORT");
      return {
        data: {
          port: input.fPort,
          portFunction: "UNKNOWN",
          payloadLength: input.bytes.length,
          payload: {
            device: deviceHeader,
          },
          decoder: {
            version: PAYLOAD_DECODER_VERSION,
            info: PAYLOAD_DECODER_INFO,
          },
        },
        warnings,
        errors,
      };
    }
    if (deviceHeader.info.deviceVersion === 1) {
      if (input.fPort === FIXED_DATA_PORT) {
        return decodeFixedDataPayload(input.bytes);
      }
      if (input.fPort === DI_DATA_PORT) {
        return decodeDiDataPayload(input.bytes);
      }
      if (input.fPort === CNT_DATA_PORT) {
        return decodeCntDataPayload(input.bytes);
      }
      if (input.fPort === TIMESYNC_PORT) {
        return decodeTimesyncPayload(input.bytes);
      }
      if (input.fPort === CONFIG_PORT) {
        return decodeConfigPayload(input.bytes);
      }
      if (input.fPort === INFO_PORT) {
        return decodeInfoPayload(input.bytes);
      }
      errors.push("INVALID_PORT");
      return {
        data: {
          port: input.fPort,
          portFunction: "UNKNOWN",
          payloadLength: input.bytes.length,
          payload: {
            device: deviceHeader,
          },
          decoder: {
            version: PAYLOAD_DECODER_VERSION,
            info: PAYLOAD_DECODER_INFO,
          },
        },
        warnings,
        errors,
      };
    }
    if (deviceHeader.info.deviceVersion === 3) {
      if (input.fPort === FIXED_DATA_PORT) {
        return decodeFixedDataPayload(input.bytes);
      }
      if (input.fPort === DI_DATA_PORT) {
        return decodeDiDataPayload(input.bytes);
      }
      if (input.fPort === CNT_DATA_PORT) {
        return decodeCntDataPayload(input.bytes);
      }
      if (input.fPort === TIMESYNC_PORT) {
        return decodeTimesyncPayload(input.bytes);
      }
      if (input.fPort === CONFIG_PORT) {
        return decodeConfigPayload(input.bytes);
      }
      if (input.fPort === INFO_PORT) {
        return decodeInfoPayload(input.bytes);
      }
      errors.push("INVALID_PORT");
      return {
        data: {
          port: input.fPort,
          portFunction: "UNKNOWN",
          payloadLength: input.bytes.length,
          payload: {
            device: deviceHeader,
          },
          decoder: {
            version: PAYLOAD_DECODER_VERSION,
            info: PAYLOAD_DECODER_INFO,
          },
        },
        warnings,
        errors,
      };
    }
    if (deviceHeader.info.deviceVersion === 4) {
      if (input.fPort === FIXED_DATA_PORT) {
        return decodeFixedDataPayload(input.bytes);
      }
      if (input.fPort === DI_DATA_PORT) {
        return decodeDiDataPayload(input.bytes);
      }
      if (input.fPort === CNT_DATA_PORT) {
        return decodeCntDataPayload(input.bytes);
      }
      if (input.fPort === TIMESYNC_PORT) {
        return decodeTimesyncPayload(input.bytes);
      }
      if (input.fPort === CONFIG_PORT) {
        return decodeConfigPayload(input.bytes);
      }
      if (input.fPort === INFO_PORT) {
        return decodeInfoPayload(input.bytes);
      }
      if (input.fPort === MODBUS_PORT) {
        return decodeModbusPayload(input.bytes);
      }
      if (input.fPort === MODBUS_TP_PORT) {
        return decodeModbusTransparentPayload(input.bytes);
      }
      errors.push("INVALID_PORT");
      return {
        data: {
          port: input.fPort,
          portFunction: "UNKNOWN",
          payloadLength: input.bytes.length,
          payload: {
            device: deviceHeader,
          },
          decoder: {
            version: PAYLOAD_DECODER_VERSION,
            info: PAYLOAD_DECODER_INFO,
          },
        },
        warnings,
        errors,
      };
    }
    errors.push("DEVICE_VERSION_NOT_SUPPORTED");
    return {
      data: {
        port: input.fPort,
        portFunction: "UNKNOWN",
        payloadLength: input.bytes.length,
        payload: {
          device: deviceHeader,
        },
        decoder: {
          version: PAYLOAD_DECODER_VERSION,
          info: PAYLOAD_DECODER_INFO,
        },
      },
      warnings,
      errors,
    };
  }
  if (deviceHeader.info.deviceId === CLUEY_AM_DEVICE_ID) {
    if (deviceHeader.info.deviceVersion === 1) {
      if (input.fPort === FIXED_DATA_PORT) {
        return decodeFixedDataPayload(input.bytes);
      }
      if (input.fPort === DI_DATA_PORT) {
        return decodeDiDataPayload(input.bytes);
      }
      if (input.fPort === AI_DATA_PORT) {
        return decodeAiDataPayload(input.bytes);
      }
      if (input.fPort === CNT_DATA_PORT) {
        return decodeCntDataPayload(input.bytes);
      }
      if (input.fPort === TIMESYNC_PORT) {
        return decodeTimesyncPayload(input.bytes);
      }
      if (input.fPort === CONFIG_PORT) {
        return decodeConfigPayload(input.bytes);
      }
      if (input.fPort === INFO_PORT) {
        return decodeInfoPayload(input.bytes);
      }
      errors.push("INVALID_PORT");
      return {
        data: {
          port: input.fPort,
          portFunction: "UNKNOWN",
          payloadLength: input.bytes.length,
          payload: {
            device: deviceHeader,
          },
          decoder: {
            version: PAYLOAD_DECODER_VERSION,
            info: PAYLOAD_DECODER_INFO,
          },
        },
        warnings,
        errors,
      };
    }
    if (deviceHeader.info.deviceVersion === 3) {
      if (input.fPort === FIXED_DATA_PORT) {
        return decodeFixedDataPayload(input.bytes);
      }
      if (input.fPort === DI_DATA_PORT) {
        return decodeDiDataPayload(input.bytes);
      }
      if (input.fPort === AI_DATA_PORT) {
        return decodeAiDataPayload(input.bytes);
      }
      if (input.fPort === CNT_DATA_PORT) {
        return decodeCntDataPayload(input.bytes);
      }
      if (input.fPort === TIMESYNC_PORT) {
        return decodeTimesyncPayload(input.bytes);
      }
      if (input.fPort === CONFIG_PORT) {
        return decodeConfigPayload(input.bytes);
      }
      if (input.fPort === INFO_PORT) {
        return decodeInfoPayload(input.bytes);
      }
      if (input.fPort === MODBUS_PORT) {
        return decodeModbusPayload(input.bytes);
      }
      if (input.fPort === MODBUS_TP_PORT) {
        return decodeModbusTransparentPayload(input.bytes);
      }
      errors.push("INVALID_PORT");
      return {
        data: {
          port: input.fPort,
          portFunction: "UNKOWN",
          payloadLength: input.bytes.length,
          payload: {
            device: deviceHeader,
          },
          decoder: {
            version: PAYLOAD_DECODER_VERSION,
            info: PAYLOAD_DECODER_INFO,
          },
        },
        warnings,
        errors,
      };
    }
    if (deviceHeader.info.deviceVersion === 4) {
      if (input.fPort === FIXED_DATA_PORT) {
        return decodeFixedDataPayload(input.bytes);
      }
      if (input.fPort === DI_DATA_PORT) {
        return decodeDiDataPayload(input.bytes);
      }
      if (input.fPort === AI_DATA_PORT) {
        return decodeAiDataPayload(input.bytes);
      }
      if (input.fPort === CNT_DATA_PORT) {
        return decodeCntDataPayload(input.bytes);
      }
      if (input.fPort === TIMESYNC_PORT) {
        return decodeTimesyncPayload(input.bytes);
      }
      if (input.fPort === CONFIG_PORT) {
        return decodeConfigPayload(input.bytes);
      }
      if (input.fPort === INFO_PORT) {
        return decodeInfoPayload(input.bytes);
      }
      errors.push("INVALID_PORT");
      return {
        data: {
          port: input.fPort,
          portFunction: "UNKOWN",
          payloadLength: input.bytes.length,
          payload: {
            device: deviceHeader,
          },
          decoder: {
            version: PAYLOAD_DECODER_VERSION,
            info: PAYLOAD_DECODER_INFO,
          },
        },
        warnings,
        errors,
      };
    }
    errors.push("DEVICE_VERSION_NOT_SUPPORTED");
    return {
      data: {
        port: input.fPort,
        portFunction: "UNKOWN",
        payloadLength: input.bytes.length,
        payload: {
          device: deviceHeader,
        },
        decoder: {
          version: PAYLOAD_DECODER_VERSION,
          info: PAYLOAD_DECODER_INFO,
        },
      },
      warnings,
      errors,
    };
  }
  if (deviceHeader.info.deviceId === CLUEY_TM_DEVICE_ID) {
    if (deviceHeader.info.deviceVersion === 0) {
      if (input.fPort === FIXED_DATA_PORT) {
        return decodeFixedDataPayload(input.bytes);
      }
      if (input.fPort === DI_DATA_PORT) {
        return decodeDiDataPayload(input.bytes);
      }
      if (input.fPort === AI_DATA_PORT) {
        return decodeAiDataPayload(input.bytes);
      }
      if (input.fPort === CNT_DATA_PORT) {
        return decodeCntDataPayload(input.bytes);
      }
      if (input.fPort === TIMESYNC_PORT) {
        return decodeTimesyncPayload(input.bytes);
      }
      if (input.fPort === CONFIG_PORT) {
        return decodeConfigPayload(input.bytes);
      }
      if (input.fPort === INFO_PORT) {
        return decodeInfoPayload(input.bytes);
      }
      errors.push("INVALID_PORT");
      return {
        data: {
          port: input.fPort,
          portFunction: "UNKOWN",
          payloadLength: input.bytes.length,
          payload: {
            device: deviceHeader,
          },
          decoder: {
            version: PAYLOAD_DECODER_VERSION,
            info: PAYLOAD_DECODER_INFO,
          },
        },
        warnings,
        errors,
      };
    }
    if (deviceHeader.info.deviceVersion === 3) {
      if (input.fPort === FIXED_DATA_PORT) {
        return decodeFixedDataPayload(input.bytes);
      }
      if (input.fPort === DI_DATA_PORT) {
        return decodeDiDataPayload(input.bytes);
      }
      if (input.fPort === AI_DATA_PORT) {
        return decodeAiDataPayload(input.bytes);
      }
      if (input.fPort === CNT_DATA_PORT) {
        return decodeCntDataPayload(input.bytes);
      }
      if (input.fPort === TIMESYNC_PORT) {
        return decodeTimesyncPayload(input.bytes);
      }
      if (input.fPort === CONFIG_PORT) {
        return decodeConfigPayload(input.bytes);
      }
      if (input.fPort === INFO_PORT) {
        return decodeInfoPayload(input.bytes);
      }
      errors.push("INVALID_PORT");
      return {
        data: {
          port: input.fPort,
          portFunction: "UNKOWN",
          payloadLength: input.bytes.length,
          payload: {
            device: deviceHeader,
          },
          decoder: {
            version: PAYLOAD_DECODER_VERSION,
            info: PAYLOAD_DECODER_INFO,
          },
        },
        warnings,
        errors,
      };
    }
    if (deviceHeader.info.deviceVersion === 4) {
      if (input.fPort === FIXED_DATA_PORT) {
        return decodeFixedDataPayload(input.bytes);
      }
      if (input.fPort === DI_DATA_PORT) {
        return decodeDiDataPayload(input.bytes);
      }
      if (input.fPort === AI_DATA_PORT) {
        return decodeAiDataPayload(input.bytes);
      }
      if (input.fPort === CNT_DATA_PORT) {
        return decodeCntDataPayload(input.bytes);
      }
      if (input.fPort === TIMESYNC_PORT) {
        return decodeTimesyncPayload(input.bytes);
      }
      if (input.fPort === CONFIG_PORT) {
        return decodeConfigPayload(input.bytes);
      }
      if (input.fPort === INFO_PORT) {
        return decodeInfoPayload(input.bytes);
      }
      errors.push("INVALID_PORT");
      return {
        data: {
          port: input.fPort,
          portFunction: "UNKOWN",
          payloadLength: input.bytes.length,
          payload: {
            device: deviceHeader,
          },
          decoder: {
            version: PAYLOAD_DECODER_VERSION,
            info: PAYLOAD_DECODER_INFO,
          },
        },
        warnings,
        errors,
      };
    }
    errors.push("DEVICE_VERSION_NOT_SUPPORTED");
    return {
      data: {
        port: input.fPort,
        portFunction: "UNKOWN",
        payloadLength: input.bytes.length,
        payload: {
          device: deviceHeader,
        },
        decoder: {
          version: PAYLOAD_DECODER_VERSION,
          info: PAYLOAD_DECODER_INFO,
        },
      },
      warnings,
      errors,
    };
  }
  errors.push("DEVICE_ID_NOT_SUPPORTED");
  return {
    data: {
      port: input.fPort,
      portFunction: "UNKOWN",
      payloadLength: input.bytes.length,
      payload: {
        device: deviceHeader,
      },
      decoder: {
        version: PAYLOAD_DECODER_VERSION,
        info: PAYLOAD_DECODER_INFO,
      },
    },
    warnings,
    errors,
  };
}

function decodeDeviceHeader(data) {
  const obj = {};
  let status = 0;
  let deviceId = 0;
  deviceId = data[pointer++];
  if (deviceId & 0x80) {
    deviceId += 256 * data[pointer++];
  }
  obj.info = {
    deviceId,
    deviceVersion: data[pointer++],
    deviceDesignation: "",
    deviceManufacturer: DEVICE_MANUFACTURER,
  };

  status = data[pointer++];

  switch (obj.info.deviceId) {
    case CLUEY_KM_DEVICE_ID:
      obj.info.deviceDesignation = DEVICE_DESIGNATION_CLUEY_KM;
      break;
    case CLUEY_AM_DEVICE_ID:
      obj.info.deviceDesignation = DEVICE_DESIGNATION_CLUEY_AM;
      break;
    case CLUEY_TM_DEVICE_ID:
      obj.info.deviceDesignation = DEVICE_DESIGNATION_CLUEY_TM;
      break;
    default:
      obj.info.deviceDesignation = "UNKNOWN";
      break;
  }
  obj.deviceStatus = {
    configurationError: Boolean(status & 0x01),
    bufferOverflow: Boolean(status & 0x02),
    timeSynced: Boolean(status & 0x04),
    batteryPowered: Boolean(status & 0x08),
    txCreditsConsumed: Boolean(status & 0x10),
    deviceRestarted: Boolean(status & 0x20),
    lowSupplyVoltage: Boolean(status & 0x40),
    confirmationTimeout: Boolean(status & 0x80),
  };

  if (data[pointer] === 255) {
    obj.batteryLevel = "error";
  } else {
    // ((input - min) * 100) / (max - min)
    // obj.batteryLevel = (Math.round(((data[pointer] - 1) * 100) / (254 - 1))).toString() + "%";
    obj.batteryLevel = Math.round(((data[pointer] - 1) * 100) / (254 - 1));
  }
  pointer++;
  return obj;
}

function decodeTimestamp(data) {
  const obj = {};

  const unixTimestamp =
    data[3] + (data[2] << 8) + (data[1] << 16) + (data[0] << 24);
  const milliseconds = unixTimestamp * 1000;

  obj.unix = unixTimestamp;

  const dateObject = new Date(milliseconds);
  const humanDateFormat = dateObject.toString(); // Wed Nov 24 2021 15:32:14 GMT+0100 (Mitteleurop‰ische Normalzeit)
  // humanDateFormat = dateObject.toLocaleString();  //18.11.2021, 16:24:50
  // humanDateFormat = dateObject.toUTCString();   //Thu, 18 Nov 2021 15:24:50 GMT

  obj.string = humanDateFormat;

  return obj;
}

function addTimeToTimestamp(timestamp, data) {
  const obj = {};
  obj.unix = timestamp + (data[1] + (data[0] << 8));

  const dateObject = new Date(obj.unix * 1000);
  const humanDateFormat = dateObject.toString(); // Wed Nov 24 2021 15:32:14 GMT+0100 (Mitteleurop‰ische Normalzeit)
  // humanDateFormat = (dateObject).toLocaleString();  //18.11.2021, 16:24:50
  // humanDateFormat = dateObject.toUTCString();     //Thu, 18 Nov 2021 15:24:50 GMT

  obj.string = humanDateFormat;

  return obj;
}

function decodeModbusState(data) {
  let string;

  switch (data) {
    case 0:
      string = "MB_STATE_OK";
      break;
    case 1:
      string = "MB_STATE_NOT_INIT";
      break;
    case 2:
      string = "MB_STATE_BUSY";
      break;
    case 3:
      string = "MB_STATE_BUS_ERROR";
      break;
    case 4:
      string = "MB_STATE_FC_NOT_SUPPORTED";
      break;
    case 5:
      string = "MB_STATE_RX_TIMEOUT";
      break;
    case 6:
      string = "MB_STATE_RX_CHAR_TIMEOUT";
      break;
    case 7:
      string = "MB_STATE_RX_ERR";
      break;
    case 8:
      string = "MB_STATE_RX_CRC_ERR";
      break;
    case 9:
      string = "MB_STATE_RX_DATA_ERR";
      break;
    case 10:
      string = "MB_STATE_RX_EXCEPTION";
      break;
    case 11:
      string = "MB_STATE_WRONG_SLV_ADR";
      break;
    default:
      break;
  }
  return string;
}

function decodeCot(data) {
  let obj = {};

  obj = {
    limit: Boolean(data & 0x10),
    event: Boolean(data & 0x20),
    interrogation: Boolean(data & 0x40),
    cyclic: Boolean(data & 0x80),
  };
  return obj;
}

function decode8BitAsBinaryString(data) {
  let string = data.toString(2);
  string = "00000000".substr(string.length) + string;

  return string;
}

function decode16BitAsBinaryString(data) {
  let string = (data[1] + (data[0] << 8)).toString(2);
  string = "0000000000000000".substr(string.length) + string;

  return string;
}

function decToInt(val) {
  let num = val;
  const maxVal = Math.pow(2, (4 / 2) * 8); // 4 for 16bit
  if (num > maxVal / 2 - 1) {
    num -= maxVal;
  }
  return num;
}

function decodeFixedDataPayload(data) {
  const obj = {};
  const warnings = [];

  obj.port = FIXED_DATA_PORT;
  obj.portFunction = "FIXED_DATA";
  obj.payloadLength = data.length;

  obj.decoder = {
    version: PAYLOAD_DECODER_VERSION,
    info: PAYLOAD_DECODER_INFO,
  };

  obj.payload = {
    device: deviceHeader,
    data: {},
  };

  obj.payload.data.timestamp = decodeTimestamp(
    data.slice(pointer, pointer + 4),
  );
  pointer += 4;
  obj.payload.data.digital_inputs = {
    cot: decodeCot(data[pointer] & 0xf0),
    digitalInput1: !!(data[pointer + 2] & 0x01),
    digitalInput2: !!(data[pointer + 2] & 0x02),
    digitalInput3: !!(data[pointer + 2] & 0x04),
    digitalInput4: !!(data[pointer + 2] & 0x08),
    digitalInput5: !!(data[pointer + 2] & 0x10),
    digitalInput6: !!(data[pointer + 2] & 0x20),
    digitalInput7: !!(data[pointer + 2] & 0x40),
    digitalInput8: !!(data[pointer + 2] & 0x80),
    digitalInput9: !!(data[pointer + 1] & 0x01),
    digitalInput10: !!(data[pointer + 1] & 0x02),
    digitalInput11: !!(data[pointer + 1] & 0x04),
    digitalInput12: !!(data[pointer + 1] & 0x08),
    digitalInput13: !!(data[pointer + 1] & 0x10),
    digitalInput14: !!(data[pointer + 1] & 0x20),
    digitalInput15: !!(data[pointer + 1] & 0x40),
    digitalInput16: !!(data[pointer + 1] & 0x80),
  };
  pointer += 3;

  for (let i = 0; i < 8; i++) {
    switch (data[pointer] & 0xf0) {
      case OBJECT_TYPE_CNT:
        obj.payload.data[`counter_input_${i + 1}`] = {
          overflow: Boolean(data[pointer + 1] & 0x01),
          reset: Boolean(data[pointer + 1] & 0x02),
          limit: Boolean(data[pointer + 1] & 0x04),
          cot: decodeCot(data[pointer + 1] & 0xf0),
          value:
            data[pointer + 4] +
            (data[pointer + 3] << 8) +
            (data[pointer + 2] << 16),
        };
        pointer += 5;
        break;

      case OBJECT_TYPE_AI:
        obj.payload.data[`analog_input_${i + 1}`] = {
          invalid: Boolean(data[pointer + 1] & 0x08),
          overflow: Boolean(data[pointer + 1] & 0x04),
          limit2: Boolean(data[pointer + 1] & 0x02),
          limit1: Boolean(data[pointer + 1] & 0x01),
          cot: decodeCot(data[pointer + 1] & 0xf0),
          value: data[pointer + 4] + (data[pointer + 3] << 8),
        };
        pointer += 5;
        break;
      case OBJECT_TYPE_TEMP:
        obj.payload.data[`temperature_input_${i + 1}`] = {
          invalid: Boolean(data[pointer + 1] & 0x08),
          overflow: Boolean(data[pointer + 1] & 0x04),
          limit2: Boolean(data[pointer + 1] & 0x02),
          limit1: Boolean(data[pointer + 1] & 0x01),
          cot: decodeCot(data[pointer + 1] & 0xf0),
          value: decToInt(data[pointer + 4] + (data[pointer + 3] << 8)) / 100,
        };
        pointer += 5;
        break;

      default:
        pointer += 5;
        break;
    }
  }

  return {
    data: obj,
    warnings,
  };
}

function decodeDiDataPayload(data) {
  const obj = {};
  let timestampAbsolute = {};
  const warnings = [];

  obj.port = DI_DATA_PORT;
  obj.portFunction = "DI_DATA";
  obj.payloadLength = data.length;
  obj.payload = {
    device: deviceHeader,
    data: {
      digitalInputs: [],
    },
  };

  obj.decoder = {
    version: PAYLOAD_DECODER_VERSION,
    info: PAYLOAD_DECODER_INFO,
  };

  timestampAbsolute = decodeTimestamp(data.slice(pointer, pointer + 4));
  pointer += 4;

  do {
    if ((data[pointer] & 0xf0) === OBJECT_TYPE_DI) {
      obj.payload.data.digitalInputs.push({
        type: "SINGLE_POINT_INFO",
        id: data[pointer] & 0x0f,
        cot: decodeCot(data[pointer + 1] & 0xf0),
        blocked: Boolean(data[pointer + 1] & 0x04),
        state: data[pointer + 1] & 0x01,
        timestamp: addTimeToTimestamp(
          timestampAbsolute.unix,
          data.slice(pointer + 2, pointer + 4),
        ),
      });
    } else if ((data[pointer] & 0xf0) === OBJECT_TYPE_DBL) {
      obj.payload.data.digitalInputs.push({
        type: "DOUBLE_POINT_INFO",
        id: data[pointer] & 0x0f,
        cot: decodeCot(data[pointer + 1] & 0xf0),
        blocked: Boolean(data[pointer + 1] & 0x04),
        state: data[pointer + 1] & 0x03,
        timestamp: addTimeToTimestamp(
          timestampAbsolute.unix,
          data.slice(pointer + 2, pointer + 4),
        ),
      });
    }
    pointer += 4;
  } while (pointer < data.length - 1);

  return {
    data: obj,
    warnings,
  };
}

function decodeAiDataPayload(data) {
  const obj = {};
  let timestampAbsolute = {};
  const warnings = [];

  obj.port = AI_DATA_PORT;
  obj.portFunction = "AI_DATA";
  obj.payloadLength = data.length;
  obj.payload = {
    device: deviceHeader,
    data: {
      analogInputs: [],
    },
  };

  obj.decoder = {
    version: PAYLOAD_DECODER_VERSION,
    info: PAYLOAD_DECODER_INFO,
  };

  timestampAbsolute = decodeTimestamp(data.slice(pointer, pointer + 4));
  pointer += 4;

  do {
    const id = data[pointer] & 0x0f;
    if ((data[pointer] & 0xf0) === OBJECT_TYPE_AI) {
      // AI Type
      obj.payload.data.analogInputs.push({
        topic: `analog_input_${id}`,
        cot: decodeCot(data[pointer + 1] & 0xf0),
        invalid: Boolean(data[pointer + 1] & 0x08),
        overflow: Boolean(data[pointer + 1] & 0x04),
        limit2: Boolean(data[pointer + 1] & 0x02),
        limit1: Boolean(data[pointer + 1] & 0x01),
        value: decToInt(data[pointer + 3] + (data[pointer + 2] << 8)),
        timestamp: addTimeToTimestamp(
          timestampAbsolute.unix,
          data.slice(pointer + 4, pointer + 6),
        ),
      });
    } else if ((data[pointer] & 0xf0) === OBJECT_TYPE_TEMP) {
      // TEMP Type
      obj.payload.data.analogInputs.push({
        topic: `temperature_input_${id}`,
        cot: decodeCot(data[pointer + 1] & 0xf0),
        invalid: Boolean(data[pointer + 1] & 0x08),
        overflow: Boolean(data[pointer + 1] & 0x04),
        limit2: Boolean(data[pointer + 1] & 0x02),
        limit1: Boolean(data[pointer + 1] & 0x01),
        value: decToInt(data[pointer + 3] + (data[pointer + 2] << 8)) / 100,
        timestamp: addTimeToTimestamp(
          timestampAbsolute.unix,
          data.slice(pointer + 4, pointer + 6),
        ),
      });
    }
    pointer += 6;
  } while (pointer < data.length - 1);

  return {
    data: obj,
    warnings,
  };
}

function decodeCntDataPayload(data) {
  const obj = {};
  let timestampCommon = {};
  let objectCount = 0;
  const warnings = [];

  obj.port = CNT_DATA_PORT;
  obj.portFunction = "CNT_DATA";
  obj.payloadLength = data.length;
  obj.payload = {
    device: deviceHeader,
    data: {
      counters: [],
    },
  };

  obj.decoder = {
    version: PAYLOAD_DECODER_VERSION,
    info: PAYLOAD_DECODER_INFO,
  };

  do {
    objectCount = data[pointer++];
    timestampCommon = decodeTimestamp(data.slice(pointer, pointer + 4));
    pointer += 4;
    for (let i = 0; i < objectCount; i++) {
      obj.payload.data.counters.push({
        type:
          (data[pointer] & 0xf0) === 0x50 ? "COUNTER_DIFFERENCE" : "COUNTER",
        id: data[pointer] & 0x0f,
        cot: decodeCot(data[pointer + 1] & 0xf0),
        overflow: Boolean(data[pointer + 1] & 0x01),
        reset: Boolean(data[pointer + 1] & 0x02),
        limit: Boolean(data[pointer + 1] & 0x04),
        timestamp: timestampCommon,
        value:
          data[pointer + 4] +
          (data[pointer + 3] << 8) +
          (data[pointer + 2] << 16),
      });
      pointer += 5;
    }
  } while (pointer < data.length - 1);

  return {
    data: obj,
    warnings,
  };
}

function decodeTimesyncPayload(data) {
  const obj = {};
  const warnings = [];

  obj.port = TIMESYNC_PORT;
  obj.portFunction = "TIMESYNC";
  obj.payloadLength = data.length;
  obj.payload = {
    device: deviceHeader,
    data: {
      timestamp: decodeTimestamp(data.slice(pointer, pointer + 4)),
    },
  };

  obj.decoder = {
    version: PAYLOAD_DECODER_VERSION,
    info: PAYLOAD_DECODER_INFO,
  };

  return {
    data: obj,
    warnings,
  };
}

function decodeDataPointConfig(data) {
  let obj = {};

  obj = {
    name: data,
    config: {
      slave_address: data[pointer],
      rfc: (data[pointer + 1] & 0xe0) >> 5,
      register_count: data[pointer + 1] & 0x1f,
      data_address: data[pointer + 3] + (data[pointer + 2] << 8),
    },
  };

  pointer += 4;

  return obj;
}

function decodeConfigPayload(data) {
  const obj = {};
  const warnings = [];
  let length = 0;
  let value = 0;
  let string = "";
  let parameter = 0;
  let i = 0;

  obj.port = CONFIG_PORT;
  obj.portFunction = "CONFIG";
  obj.payloadLength = data.length;
  obj.payload = {
    device: deviceHeader,
    data: {
      parameters: [],
    },
  };

  obj.decoder = {
    version: PAYLOAD_DECODER_VERSION,
    info: PAYLOAD_DECODER_INFO,
  };

  do {
    parameter = data[pointer++];
    length = data[pointer++];

    switch (parameter) {
      // DI
      case DI_LABEL:
        obj.payload.data.parameters.push({
          name: "DI_LABEL",
          value: String.fromCharCode.apply(
            null,
            data.slice(pointer, pointer + length),
          ),
        });
        pointer += length;
        break;

      // DS
      case DS_DEFAULT_SUPPLY_MODE:
        obj.payload.data.parameters.push({
          name: "DS_DEFAULT_SUPPLY_MODE",
          value: data[pointer++] & 0x01 ? "external" : "battery",
        });
        break;
      case DS_BUFFERED_OPERATION:
        obj.payload.data.parameters.push({
          name: "DS_BUFFERED_OPERATION",
          value: data[pointer++] & 0x01 ? "enabled" : "disabled",
        });
        break;
      case DS_BUFFERED_OPERATION_SPAN:
        obj.payload.data.parameters.push({
          name: "DS_BUFFERED_OPERATION_SPAN",
          value: data[pointer + 1] + (data[pointer] << 8),
          unit: "s",
        });
        pointer += length;
        break;
      case DS_PAYLOAD_FORMAT:
        obj.payload.data.parameters.push({
          name: "DS_PAYLOAD_FORMAT",
          value: data[pointer++] & 0x01 ? "dynamic" : "static",
        });
        break;

      // TS
      case TS_MEAS_INT_DC:
        obj.payload.data.parameters.push({
          name: "TS_MEAS_INT_DC",
          value: data[pointer + 1] + (data[pointer] << 8),
          unit: "ms",
        });
        pointer += length;
        break;
      case TS_MEAS_INT_BAT:
        obj.payload.data.parameters.push({
          name: "TS_MEAS_INT_BAT",
          value: data[pointer + 1] + (data[pointer] << 8),
          unit: "ms",
        });
        pointer += length;
        break;
      case TS_TIMESYNC_INT:
        obj.payload.data.parameters.push({
          name: "TS_TIMESYNC_INT",
          value: data[pointer + 1] + (data[pointer] << 8),
          unit: "h",
        });
        pointer += length;
        break;
      case TS_REJOIN_INT:
        obj.payload.data.parameters.push({
          name: "TS_REJOIN_INT",
          value: data[pointer + 1] + (data[pointer] << 8),
          unit: "d",
        });
        pointer += length;
        break;
      case TS_LEAP_SECONDS:
        obj.payload.data.parameters.push({
          name: "TS_LEAP_SECONDS",
          value: data[pointer + 1] + (data[pointer] << 8),
          unit: "s",
        });
        pointer += length;
        break;

      // IS
      case IS_ENABLE:
        obj.payload.data.parameters.push({
          name: "IS_ENABLE",
          value: decode16BitAsBinaryString(data.slice(pointer, pointer + 2)),
        });
        pointer += length;
        break;
      case IS_INVERT:
        obj.payload.data.parameters.push({
          name: "IS_INVERT",
          value: decode16BitAsBinaryString(data.slice(pointer, pointer + 2)),
        });
        pointer += length;
        break;
      case IS_ACTIVE:
        obj.payload.data.parameters.push({
          name: "IS_ACTIVE",
          value: decode16BitAsBinaryString(data.slice(pointer, pointer + 2)),
        });
        pointer += length;
        break;
      case IS_DELAY_ENABLE:
        obj.payload.data.parameters.push({
          name: "IS_DELAY_ENABLE",
          value: decode16BitAsBinaryString(data.slice(pointer, pointer + 2)),
        });
        pointer += length;
        break;
      case IS_DELAY_RISING:
        obj.payload.data.parameters.push({
          name: "IS_DELAY_RISING",
          values: [],
          unit: "ms",
        });
        for (i = 0; i < length / 2; i++) {
          obj.payload.data.parameters[
            obj.payload.data.parameters.length - 1
          ].values.push(data[pointer + 1] + (data[pointer] << 8));
          pointer += 2;
        }
        break;
      case IS_DELAY_FALLING:
        obj.payload.data.parameters.push({
          name: "IS_DELAY_FALLING",
          values: [],
          unit: "ms",
        });
        for (i = 0; i < length / 2; i++) {
          obj.payload.data.parameters[
            obj.payload.data.parameters.length - 1
          ].values.push(data[pointer + 1] + (data[pointer] << 8));
          pointer += 2;
        }
        break;
      case IS_DELAY_SCALING:
        obj.payload.data.parameters.push({
          name: "IS_DELAY_SCALING",
          values: [],
        });
        for (i = 0; i < length / 2; i++) {
          value = data[pointer + 1] + (data[pointer] << 8);
          pointer += 2;
          switch (value) {
            case 0:
              string = "ms";
              break;
            case 1:
              string = "s";
              break;
            case 2:
              string = "min";
              break;
            case 3:
              string = "h";
              break;
            default:
              string = "notAllowed";
              break;
          }
          obj.payload.data.parameters[
            obj.payload.data.parameters.length - 1
          ].values.push(string);
        }
        break;
      case IS_WIPER_ENABLE:
        obj.payload.data.parameters.push({
          name: "IS_WIPER_ENABLE",
          value: decode16BitAsBinaryString(data.slice(pointer, pointer + 2)),
        });
        pointer += length;
        break;
      case IS_WIPER_CONFIRMATION_TIMEOUT:
        obj.payload.data.parameters.push({
          name: "IS_WIPER_CONFIRMATION_TIMEOUT",
          values: [],
          unit: "s",
        });
        for (i = 0; i < length / 2; i++) {
          obj.payload.data.parameters[
            obj.payload.data.parameters.length - 1
          ].values.push(data[pointer + 1] + (data[pointer] << 8));
          pointer += 2;
        }
        break;
      case IS_DEFLUTTER_ENABLE:
        obj.payload.data.parameters.push({
          name: "IS_DEFLUTTER_ENABLE",
          value: decode16BitAsBinaryString(data.slice(pointer, pointer + 2)),
        });
        pointer += length;
        break;
      case IS_DEFLUTTER_INTERVAL:
        obj.payload.data.parameters.push({
          name: "IS_DEFLUTTER_INTERVAL",
          values: [],
          unit: "ms",
        });
        for (i = 0; i < length / 2; i++) {
          obj.payload.data.parameters[
            obj.payload.data.parameters.length - 1
          ].values.push(data[pointer + 1] + (data[pointer] << 8));
          pointer += 2;
        }
        break;
      case IS_DEFLUTTER_COUNT:
        obj.payload.data.parameters.push({
          name: "IS_DEFLUTTER_COUNT",
          values: [],
          unit: "units",
        });
        for (i = 0; i < length / 2; i++) {
          obj.payload.data.parameters[
            obj.payload.data.parameters.length - 1
          ].values.push(data[pointer + 1] + (data[pointer] << 8));
          pointer += 2;
        }
        break;
      case IS_DOUBLE_ENABLE:
        obj.payload.data.parameters.push({
          name: "IS_DOUBLE_ENABLE",
          value: decode8BitAsBinaryString(data[pointer++]),
        });
        break;
      case IS_DOUBLE_INTERMEDIATE_STATE_TIMEOUT_ENABLE:
        obj.payload.data.parameters.push({
          name: "IS_DOUBLE_INTERMEDIATE_STATE_TIMEOUT_ENABLE",
          value: decode8BitAsBinaryString(data[pointer++]),
        });
        break;
      case IS_DOUBLE_INTERMEDIATE_STATE_TIMEOUT:
        obj.payload.data.parameters.push({
          name: "IS_DOUBLE_INTERMEDIATE_STATE_TIMEOUT",
          values: [],
          unit: "s",
        });
        for (i = 0; i < length / 2; i++) {
          obj.payload.data.parameters[
            obj.payload.data.parameters.length - 1
          ].values.push(data[pointer + 1] + (data[pointer] << 8));
          pointer += 2;
        }
        break;
      case IS_COUNTER_ENABLE:
        obj.payload.data.parameters.push({
          name: "IS_COUNTER_ENABLE",
          value: decode16BitAsBinaryString(data.slice(pointer, pointer + 2)),
        });
        pointer += length;
        break;
      case IS_COUNTER_HARDWARE:
        obj.payload.data.parameters.push({
          name: "IS_COUNTER_HARDWARE",
          value: decode16BitAsBinaryString(data.slice(pointer, pointer + 2)),
        });
        pointer += length;
        break;
      case IS_COUNTER_MODE:
        obj.payload.data.parameters.push({
          name: "IS_COUNTER_MODE",
          values: [],
        });
        value = data[pointer + 1] + (data[pointer] << 8);
        pointer += 2;
        for (i = 0; i < 16; i++) {
          obj.payload.data.parameters[
            obj.payload.data.parameters.length - 1
          ].values.push(value & (0x01 << i) ? "operatingTime" : "pulse");
        }
        break;
      case IS_COUNTER_SCALING:
        obj.payload.data.parameters.push({
          name: "IS_COUNTER_SCALING",
          values: [],
        });
        for (i = 0; i < length / 2; i++) {
          value = data[pointer + 1] + (data[pointer] << 8);
          pointer += 2;
          switch (value) {
            case 0:
              string = "ms";
              break;
            case 1:
              string = "s";
              break;
            case 2:
              string = "min";
              break;
            case 3:
              string = "h";
              break;
            default:
              string = "notAllowed";
              break;
          }
          obj.payload.data.parameters[
            obj.payload.data.parameters.length - 1
          ].values.push(string);
        }
        break;

      // AIS
      case AIS_ENABLE:
        obj.payload.data.parameters.push({
          name: "AIS_ENABLE",
          values: [],
        });
        for (i = 0; i < length / 2; i++) {
          value = data[pointer + 1] + (data[pointer] << 8);
          pointer += 2;
          switch (value) {
            case 0:
              string = "disabled";
              break;
            case 1:
              string = "0-10V";
              break;
            case 2:
              string = "0-20mA";
              break;
            case 3:
              string = "PT1000 2-Wire";
              break;
            case 4:
              string = "PT1000 4-Wire";
              break;
            case 5:
              string = "PT100 2-Wire";
              break;
            case 6:
              string = "PT100 4-Wire";
              break;
            default:
              string = "notAllowed";
              break;
          }
          obj.payload.data.parameters[
            obj.payload.data.parameters.length - 1
          ].values.push(string);
        }
        break;
      case AIS_DELTA_ENABLE:
        obj.payload.data.parameters.push({
          name: "AIS_DELTA_ENABLE",
          value: decode16BitAsBinaryString(data.slice(pointer, pointer + 2)),
        });
        break;
      case AIS_DELTA_VALUE:
        obj.payload.data.parameters.push({
          name: "AIS_DELTA_VALUE",
          values: [],
          unit: "units",
        });
        for (i = 0; i < length / 2; i++) {
          obj.payload.data.parameters[
            obj.payload.data.parameters.length - 1
          ].values.push(data[pointer + 1] + (data[pointer] << 8));
          pointer += 2;
        }
        break;
      case AIS_LIMIT1_ENABLE:
        obj.payload.data.parameters.push({
          name: "AIS_LIMIT1_ENABLE",
          value: decode8BitAsBinaryString(data[pointer++]),
        });
        break;
      case AIS_LIMIT2_ENABLE:
        obj.payload.data.parameters.push({
          name: "AIS_LIMIT2_ENABLE",
          value: decode8BitAsBinaryString(data[pointer++]),
        });
        break;
      case AIS_LIMIT1_DELAY_ENABLE:
        obj.payload.data.parameters.push({
          name: "AIS_LIMIT1_DELAY_ENABLE",
          value: decode8BitAsBinaryString(data[pointer++]),
        });
        break;
      case AIS_LIMIT2_DELAY_ENABLE:
        obj.payload.data.parameters.push({
          name: "AIS_LIMIT2_DELAY_ENABLE",
          value: decode8BitAsBinaryString(data[pointer++]),
        });
        break;
      case AIS_LIMIT_DELAY_SCALING:
        obj.payload.data.parameters.push({
          name: "AIS_LIMIT_DELAY_SCALING",
          values: [],
        });
        for (i = 0; i < length / 2; i++) {
          value = data[pointer + 1] + (data[pointer] << 8);
          pointer += 2;
          switch (value) {
            case 0:
              string = "ms";
              break;
            case 1:
              string = "s";
              break;
            case 2:
              string = "min";
              break;
            case 3:
              string = "h";
              break;
            default:
              string = "notAllowed";
              break;
          }
          obj.payload.data.parameters[
            obj.payload.data.parameters.length - 1
          ].values.push(string);
        }
        break;
      case AIS_LIMIT1_DELAY_RISING:
        obj.payload.data.parameters.push({
          name: "AIS_LIMIT1_DELAY_RISING",
          values: [],
          unit: "units",
        });
        for (i = 0; i < length / 2; i++) {
          obj.payload.data.parameters[
            obj.payload.data.parameters.length - 1
          ].values.push(data[pointer + 1] + (data[pointer] << 8));
          pointer += 2;
        }
        break;
      case AIS_LIMIT2_DELAY_RISING:
        obj.payload.data.parameters.push({
          name: "AIS_LIMIT2_DELAY_RISING",
          values: [],
          unit: "units",
        });
        for (i = 0; i < length / 2; i++) {
          obj.payload.data.parameters[
            obj.payload.data.parameters.length - 1
          ].values.push(data[pointer + 1] + (data[pointer] << 8));
          pointer += 2;
        }
        break;
      case AIS_LIMIT1_DELAY_FALLING:
        obj.payload.data.parameters.push({
          name: "AIS_LIMIT1_DELAY_FALLING",
          values: [],
          unit: "units",
        });
        for (i = 0; i < length / 2; i++) {
          obj.payload.data.parameters[
            obj.payload.data.parameters.length - 1
          ].values.push(data[pointer + 1] + (data[pointer] << 8));
          pointer += 2;
        }
        break;
      case AIS_LIMIT2_DELAY_FALLING:
        obj.payload.data.parameters.push({
          name: "AIS_LIMIT2_DELAY_FALLING",
          values: [],
          unit: "units",
        });
        for (i = 0; i < length / 2; i++) {
          obj.payload.data.parameters[
            obj.payload.data.parameters.length - 1
          ].values.push(data[pointer + 1] + (data[pointer] << 8));
          pointer += 2;
        }
        break;
      case AIS_LIMIT1_VALUE:
        obj.payload.data.parameters.push({
          name: "AIS_LIMIT1_VALUE",
          values: [],
          unit: "units",
        });
        for (i = 0; i < length / 2; i++) {
          obj.payload.data.parameters[
            obj.payload.data.parameters.length - 1
          ].values.push(decToInt(data[pointer + 1] + (data[pointer] << 8)));
          pointer += 2;
        }
        break;
      case AIS_LIMIT2_VALUE:
        obj.payload.data.parameters.push({
          name: "AIS_LIMIT2_VALUE",
          values: [],
          unit: "units",
        });
        for (i = 0; i < length / 2; i++) {
          obj.payload.data.parameters[
            obj.payload.data.parameters.length - 1
          ].values.push(decToInt(data[pointer + 1] + (data[pointer] << 8)));
          pointer += 2;
        }
        break;
      case AIS_LIMIT1_HYSTERESIS:
        obj.payload.data.parameters.push({
          name: "AIS_LIMIT1_HYSTERESIS",
          values: [],
          unit: "units",
        });
        for (i = 0; i < length / 2; i++) {
          obj.payload.data.parameters[
            obj.payload.data.parameters.length - 1
          ].values.push(data[pointer + 1] + (data[pointer] << 8));
          pointer += 2;
        }
        break;
      case AIS_LIMIT2_HYSTERESIS:
        obj.payload.data.parameters.push({
          name: "AIS_LIMIT2_HYSTERESIS",
          values: [],
          unit: "units",
        });
        for (i = 0; i < length / 2; i++) {
          obj.payload.data.parameters[
            obj.payload.data.parameters.length - 1
          ].values.push(data[pointer + 1] + (data[pointer] << 8));
          pointer += 2;
        }
        break;
      case AIS_LIMIT1_DIRECTION:
        obj.payload.data.parameters.push({
          name: "AIS_LIMIT1_DIRECTION",
          value: decode8BitAsBinaryString(data[pointer++]),
        });
        break;
      case AIS_LIMIT2_DIRECTION:
        obj.payload.data.parameters.push({
          name: "AIS_LIMIT2_DIRECTION",
          value: decode8BitAsBinaryString(data[pointer++]),
        });
        break;

      // IES
      case IES_RISING_ENABLE:
        obj.payload.data.parameters.push({
          name: "IES_RISING_ENABLE",
          value: decode16BitAsBinaryString(data.slice(pointer, pointer + 2)),
        });
        pointer += length;
        break;
      case IES_FALLING_ENABLE:
        obj.payload.data.parameters.push({
          name: "IES_FALLING_ENABLE",
          value: decode16BitAsBinaryString(data.slice(pointer, pointer + 2)),
        });
        pointer += length;
        break;
      case IES_BLOCKED_CHANGED:
        obj.payload.data.parameters.push({
          name: "IES_BLOCKED_CHANGED",
          value: decode16BitAsBinaryString(data.slice(pointer, pointer + 2)),
        });
        pointer += length;
        break;
      case IES_PRIORITY:
        obj.payload.data.parameters.push({
          name: "IES_PRIORITY",
          value: decode16BitAsBinaryString(data.slice(pointer, pointer + 2)),
        });
        pointer += length;
        break;
      case ES_DELAY:
        obj.payload.data.parameters.push({
          name: "ES_DELAY",
          value: data[pointer + 1] + (data[pointer] << 8),
          unit: "ms",
        });
        pointer += length;
        break;

      // AES
      case AES_LIMIT1_RISING_ENABLE:
        obj.payload.data.parameters.push({
          name: "AES_LIMIT1_RISING_ENABLE",
          value: decode16BitAsBinaryString(data.slice(pointer, pointer + 2)),
        });
        pointer += length;
        break;
      case AES_LIMIT1_FALLING_ENABLE:
        obj.payload.data.parameters.push({
          name: "AES_LIMIT1_FALLING_ENABLE",
          value: decode16BitAsBinaryString(data.slice(pointer, pointer + 2)),
        });
        pointer += length;
        break;
      case AES_LIMIT2_FALLING_ENABLE:
        obj.payload.data.parameters.push({
          name: "AES_LIMIT2_FALLING_ENABLE",
          value: decode16BitAsBinaryString(data.slice(pointer, pointer + 2)),
        });
        pointer += length;
        break;
      case AES_DELTA_ENABLE:
        obj.payload.data.parameters.push({
          name: "AES_DELTA_ENABLE",
          value: decode16BitAsBinaryString(data.slice(pointer, pointer + 2)),
        });
        pointer += length;
        break;
      case AES_INVALID_VALUE_ENABLE:
        obj.payload.data.parameters.push({
          name: "AES_INVALID_VALUE_ENABLE",
          value: decode16BitAsBinaryString(data.slice(pointer, pointer + 2)),
        });
        pointer += length;
        break;
      case AES_OVERFLOW_VALUE_ENABLE:
        obj.payload.data.parameters.push({
          name: "AES_OVERFLOW_VALUE_ENABLE",
          value: decode16BitAsBinaryString(data.slice(pointer, pointer + 2)),
        });
        pointer += length;
        break;

      // CS
      case CS_CYCLIC_DI_ENABLE:
        obj.payload.data.parameters.push({
          name: "CS_CYCLIC_DI_ENABLE",
          value: decode16BitAsBinaryString(data.slice(pointer, pointer + 2)),
        });
        pointer += length;
        break;
      case CS_DI_CONFIRMED:
        obj.payload.data.parameters.push({
          name: "CS_DI_CONFIRMED",
          value: data[pointer++] & 0x01 ? "confirmed" : "unconfirmed",
        });
        break;
      case CS_CYCLIC_DI_INTERVAL:
        obj.payload.data.parameters.push({
          name: "CS_CYCLIC_DI_INTERVAL",
          values: [],
          unit: "s",
        });
        for (i = 0; i < length / 2; i++) {
          obj.payload.data.parameters[
            obj.payload.data.parameters.length - 1
          ].values.push(data[pointer + 1] + (data[pointer] << 8));
          pointer += 2;
        }
        break;
      case CS_CYCLIC_AI_ENABLE:
        obj.payload.data.parameters.push({
          name: "CS_CYCLIC_AI_ENABLE",
          value: decode16BitAsBinaryString(data.slice(pointer, pointer + 2)),
        });
        pointer += length;
        break;
      case CS_AI_CONFIRMED:
        obj.payload.data.parameters.push({
          name: "CS_AI_CONFIRMED",
          value: data[pointer++] & 0x01 ? "confirmed" : "unconfirmed",
        });
        break;
      case CS_CYCLIC_AI_INTERVAL:
        obj.payload.data.parameters.push({
          name: "CS_CYCLIC_AI_INTERVAL",
          values: [],
          unit: "s",
        });
        for (i = 0; i < length / 2; i++) {
          obj.payload.data.parameters[
            obj.payload.data.parameters.length - 1
          ].values.push(data[pointer + 1] + (data[pointer] << 8));
          pointer += 2;
        }
        break;
      case CS_CYCLIC_CNT_ENABLE:
        obj.payload.data.parameters.push({
          name: "CS_CYCLIC_CNT_ENABLE",
          value: data[pointer++] & 0x01 ? "enabled" : "disabled",
        });
        break;
      case CS_CNT_CONFIRMED:
        obj.payload.data.parameters.push({
          name: "CS_CNT_CONFIRMED",
          value: data[pointer++] & 0x01 ? "confirmed" : "unconfirmed",
        });
        break;
      case CS_CYCLIC_CNT_TIMEDATE_WEEKDAY_SEL:
        obj.payload.data.parameters.push({
          name: "CS_CYCLIC_CNT_TIMEDATE_WEEKDAY_SEL",
          value: data[pointer++] & 0x01 ? "weekday" : "date",
        });
        break;
      case CS_CYCLIC_CNT_TIMEDATE_WEEKDAY:
        obj.payload.data.parameters.push({
          name: "CS_CYCLIC_CNT_TIMEDATE_WEEKDAY",
          value: data[pointer++] & 0x01,
        });
        break;
      case CS_CYCLIC_CNT_TIME_HOUR:
        obj.payload.data.parameters.push({
          name: "CS_CYCLIC_CNT_TIME_HOUR",
          value: data[pointer++] & 0x01,
        });
        break;
      case CS_CYCLIC_CNT_TIME_MINUTE:
        obj.payload.data.parameters.push({
          name: "CS_CYCLIC_CNT_TIME_MINUTE",
          value: data[pointer++] & 0x01,
        });
        break;
      case CS_CYCLIC_CNT_TIME_INTERVAL:
        obj.payload.data.parameters.push({
          name: "CS_CYCLIC_CNT_TIME_INTERVAL",
          value: data[pointer + 1] + (data[pointer] << 8),
          unit: "min",
        });
        pointer += length;
        break;

      // ACS
      case ACS_ENABLE:
        obj.payload.data.parameters.push({
          name: "ACS_ENABLE",
          value: data[pointer++] & 0x01 ? "enabled" : "disabled",
        });
        break;
      case ACS_ALARM_DELAY:
        obj.payload.data.parameters.push({
          name: "ACS_ALARM_DELAY",
          value: decode16BitAsBinaryString(data.slice(pointer, pointer + 2)),
        });
        pointer += length;
        break;
      case ACS_MOTION_DET_SEL:
        obj.payload.data.parameters.push({
          name: "ACS_MOTION_DET_SEL",
          value: data[pointer++] & 0x01,
        });
        break;
      case ACS_KEY_SWITCH_SEL:
        obj.payload.data.parameters.push({
          name: "ACS_KEY_SWITCH_SEL",
          value: data[pointer++] & 0x01,
        });
        break;
      case ACS_DOOR_CONTACT_SEL:
        obj.payload.data.parameters.push({
          name: "ACS_DOOR_CONTACT_SEL",
          value: data[pointer++] & 0x01,
        });
        break;

      // OS
      case OS_ENABLE:
        obj.payload.data.parameters.push({
          name: "OS_ENABLE",
          value: decode16BitAsBinaryString(data.slice(pointer, pointer + 2)),
        });
        pointer += length;
        break;
      case OS_INVERT:
        obj.payload.data.parameters.push({
          name: "OS_INVERT",
          value: decode16BitAsBinaryString(data.slice(pointer, pointer + 2)),
        });
        pointer += length;
        break;
      case OS_MODE:
        obj.payload.data.parameters.push({
          name: "OS_MODE",
          values: [],
        });
        value = data[pointer + 1] + (data[pointer] << 8);
        pointer += 2;
        for (i = 0; i < 16; i++) {
          obj.payload.data.parameters[
            obj.payload.data.parameters.length - 1
          ].values.push(value & (0x01 << i) ? "wiper" : "static");
        }
        break;
      case OS_WIPER_TIME:
        obj.payload.data.parameters.push({
          name: "OS_WIPER_TIME",
          values: [],
          unit: "ms",
        });
        for (i = 0; i < length / 2; i++) {
          obj.payload.data.parameters[
            obj.payload.data.parameters.length - 1
          ].values.push(data[pointer + 1] + (data[pointer] << 8));
          pointer += 2;
        }
        break;
      case OS_TRIGGER_ENABLE:
        obj.payload.data.parameters.push({
          name: "OS_TRIGGER_ENABLE",
          value: data[pointer++] & 0x01 ? "enabled" : "disabled",
        });
        break;
      case OS_TRIGGER_PERIOD:
        obj.payload.data.parameters.push({
          name: "OS_TRIGGER_PERIOD",
          value: decode16BitAsBinaryString(data.slice(pointer, pointer + 2)),
        });
        pointer += length;
        break;
      case OS_TRIGGER_SCALING:
        obj.payload.data.parameters.push({
          name: "OS_TRIGGER_SCALING",
          value: data[pointer++] & 0x01,
        });
        break;

      // IOMS
      case IOMS_OUT1:
        obj.payload.data.parameters.push({
          name: "IOMS_OUT1",
          values: [],
        });
        for (i = 0; i < length / 2; i++) {
          value = data[pointer + 1] + (data[pointer] << 8);
          pointer += 2;
          switch (value) {
            case 0:
              string = "disabled";
              break;
            case 1:
              string = "rising";
              break;
            case 2:
              string = "falling";
              break;
            case 3:
              string = "both";
              break;
            default:
              string = "notAllowed";
              break;
          }
          obj.payload.data.parameters[
            obj.payload.data.parameters.length - 1
          ].values.push(string);
        }
        break;
      case IOMS_OUT2:
        obj.payload.data.parameters.push({
          name: "IOMS_OUT2",
          values: [],
        });
        for (i = 0; i < length / 2; i++) {
          value = data[pointer + 1] + (data[pointer] << 8);
          pointer += 2;
          switch (value) {
            case 0:
              string = "disabled";
              break;
            case 1:
              string = "rising";
              break;
            case 2:
              string = "falling";
              break;
            case 3:
              string = "both";
              break;
            default:
              string = "notAllowed";
              break;
          }
          obj.payload.data.parameters[
            obj.payload.data.parameters.length - 1
          ].values.push(string);
        }
        break;
      case IOMS_OUT3:
        obj.payload.data.parameters.push({
          name: "IOMS_OUT3",
          values: [],
        });
        for (i = 0; i < length / 2; i++) {
          value = data[pointer + 1] + (data[pointer] << 8);
          pointer += 2;
          switch (value) {
            case 0:
              string = "disabled";
              break;
            case 1:
              string = "rising";
              break;
            case 2:
              string = "falling";
              break;
            case 3:
              string = "both";
              break;
            default:
              string = "notAllowed";
              break;
          }
          obj.payload.data.parameters[
            obj.payload.data.parameters.length - 1
          ].values.push(string);
        }
        break;
      case IOMS_OUT4:
        obj.payload.data.parameters.push({
          name: "IOMS_OUT4",
          values: [],
        });
        for (i = 0; i < length / 2; i++) {
          value = data[pointer + 1] + (data[pointer] << 8);
          pointer += 2;
          switch (value) {
            case 0:
              string = "disabled";
              break;
            case 1:
              string = "rising";
              break;
            case 2:
              string = "falling";
              break;
            case 3:
              string = "both";
              break;
            default:
              string = "notAllowed";
              break;
          }
          obj.payload.data.parameters[
            obj.payload.data.parameters.length - 1
          ].values.push(string);
        }
        break;

      // LOMS
      case LOMS_OUT1:
        obj.payload.data.parameters.push({
          name: "LOMS_OUT1",
          values: [],
        });
        for (i = 0; i < length / 2; i++) {
          value = data[pointer + 1] + (data[pointer] << 8);
          pointer += 2;
          switch (value) {
            case 0:
              string = "disabled";
              break;
            case 1:
              string = "rising";
              break;
            case 2:
              string = "falling";
              break;
            case 3:
              string = "both";
              break;
            default:
              string = "notAllowed";
              break;
          }
          obj.payload.data.parameters[
            obj.payload.data.parameters.length - 1
          ].values.push(string);
        }
        break;
      case LOMS_OUT2:
        obj.payload.data.parameters.push({
          name: "LOMS_OUT2",
          values: [],
        });
        for (i = 0; i < length / 2; i++) {
          value = data[pointer + 1] + (data[pointer] << 8);
          pointer += 2;
          switch (value) {
            case 0:
              string = "disabled";
              break;
            case 1:
              string = "rising";
              break;
            case 2:
              string = "falling";
              break;
            case 3:
              string = "both";
              break;
            default:
              string = "notAllowed";
              break;
          }
          obj.payload.data.parameters[
            obj.payload.data.parameters.length - 1
          ].values.push(string);
        }
        break;
      case LOMS_OUT3:
        obj.payload.data.parameters.push({
          name: "LOMS_OUT3",
          values: [],
        });
        for (i = 0; i < length / 2; i++) {
          value = data[pointer + 1] + (data[pointer] << 8);
          pointer += 2;
          switch (value) {
            case 0:
              string = "disabled";
              break;
            case 1:
              string = "rising";
              break;
            case 2:
              string = "falling";
              break;
            case 3:
              string = "both";
              break;
            default:
              string = "notAllowed";
              break;
          }
          obj.payload.data.parameters[
            obj.payload.data.parameters.length - 1
          ].values.push(string);
        }
        break;
      case LOMS_OUT4:
        obj.payload.data.parameters.push({
          name: "LOMS_OUT4",
          values: [],
        });
        for (i = 0; i < length / 2; i++) {
          value = data[pointer + 1] + (data[pointer] << 8);
          pointer += 2;
          switch (value) {
            case 0:
              string = "disabled";
              break;
            case 1:
              string = "rising";
              break;
            case 2:
              string = "falling";
              break;
            case 3:
              string = "both";
              break;
            default:
              string = "notAllowed";
              break;
          }
          obj.payload.data.parameters[
            obj.payload.data.parameters.length - 1
          ].values.push(string);
        }
        break;
      case MBS_CONFIG:
        obj.payload.data.parameters.push({
          name: "MBS_CONFIG",
          config: {
            baudrate:
              data[pointer + 2] +
              (data[pointer + 1] << 8) +
              (data[pointer] << 16),
            answer_timeout: data[pointer + 4] + (data[pointer + 3] << 8),
            parity: data[pointer + 5] & 0x03,
            retries: (data[pointer + 5] & 0x0c) >> 2,
          },
        });
        pointer += 6;
        break;
      case MBS_TRANSPARENT_DOWNLINK_ENABLE:
        obj.payload.data.parameters.push({
          name: "MBS_TRANSPARENT_DOWNLINK_ENABLE",
          value: data[pointer++] & 0x01 ? "enabled" : "disabled",
        });
        break;
      case MBS_DPRATE_ENABLE:
        obj.payload.data.parameters.push({
          name: "MBS_DPRATE_ENABLE",
          value: data[pointer++] & 0x01 ? "enabled" : "disabled",
        });
        break;
      case MBS_DPRATE_TIMEDATE_WEEKDAY_SEL:
        obj.payload.data.parameters.push({
          name: "MBS_DPRATE_TIMEDATE_WEEKDAY_SEL",
          value: data[pointer++] & 0x01 ? "weekday" : "date",
        });
        break;
      case MBS_DPRATE_TIMEDATE_WEEKDAY:
        obj.payload.data.parameters.push({
          name: "MBS_DPRATE_TIMEDATE_WEEKDAY",
          value: data[pointer++] & 0x01,
        });
        break;
      case MBS_DPRATE_TIME_HOUR:
        obj.payload.data.parameters.push({
          name: "MBS_DPRATE_TIME_HOUR",
          value: data[pointer++] & 0x01,
        });
        break;
      case MBS_DPRATE_TIME_MINUTE:
        obj.payload.data.parameters.push({
          name: "MBS_DPRATE_TIME_MINUTE",
          value: data[pointer++] & 0x01,
        });
        break;
      case MBS_DPRATE_TIME_INTERVAL:
        obj.payload.data.parameters.push({
          name: "MBS_DPRATE_TIME_INTERVAL",
          value: data[pointer + 1] + (data[pointer] << 8),
          unit: "min",
        });
        pointer += length;
        break;
      case MBS_DP_00:
        obj.payload.data.parameters.push(decodeDataPointConfig("MBS_DP_00"));
        break;
      case MBS_DP_01:
        obj.payload.data.parameters.push(decodeDataPointConfig("MBS_DP_01"));
        break;
      case MBS_DP_02:
        obj.payload.data.parameters.push(decodeDataPointConfig("MBS_DP_02"));
        break;
      case MBS_DP_03:
        obj.payload.data.parameters.push(decodeDataPointConfig("MBS_DP_03"));
        break;
      case MBS_DP_04:
        obj.payload.data.parameters.push(decodeDataPointConfig("MBS_DP_04"));
        break;
      case MBS_DP_05:
        obj.payload.data.parameters.push(decodeDataPointConfig("MBS_DP_05"));
        break;
      case MBS_DP_06:
        obj.payload.data.parameters.push(decodeDataPointConfig("MBS_DP_06"));
        break;
      case MBS_DP_07:
        obj.payload.data.parameters.push(decodeDataPointConfig("MBS_DP_07"));
        break;
      case MBS_DP_08:
        obj.payload.data.parameters.push(decodeDataPointConfig("MBS_DP_08"));
        break;
      case MBS_DP_09:
        obj.payload.data.parameters.push(decodeDataPointConfig("MBS_DP_09"));
        break;
      case MBS_DP_10:
        obj.payload.data.parameters.push(decodeDataPointConfig("MBS_DP_10"));
        break;
      case MBS_DP_11:
        obj.payload.data.parameters.push(decodeDataPointConfig("MBS_DP_11"));
        break;
      case MBS_DP_12:
        obj.payload.data.parameters.push(decodeDataPointConfig("MBS_DP_12"));
        break;
      case MBS_DP_13:
        obj.payload.data.parameters.push(decodeDataPointConfig("MBS_DP_13"));
        break;
      case MBS_DP_14:
        obj.payload.data.parameters.push(decodeDataPointConfig("MBS_DP_14"));
        break;
      case MBS_DP_15:
        obj.payload.data.parameters.push(decodeDataPointConfig("MBS_DP_15"));
        break;
      default:
        break;
    }
  } while (pointer < data.length - 1);

  return {
    data: obj,
    warnings,
  };
}

function decodeInfoPayload(data) {
  const obj = {};
  const warnings = [];

  obj.port = INFO_PORT;
  obj.portFunction = "INFO";
  obj.payloadLength = data.length;
  obj.payload = {
    device: deviceHeader,
  };

  obj.decoder = {
    version: PAYLOAD_DECODER_VERSION,
    info: PAYLOAD_DECODER_INFO,
  };

  return {
    data: obj,
    warnings,
  };
}

function decodeModbusPayload(data) {
  const obj = {};
  const warnings = [];

  obj.port = MODBUS_PORT;
  obj.portFunction = "MODBUS";
  obj.payloadLength = data.length;

  obj.decoder = {
    version: PAYLOAD_DECODER_VERSION,
    info: PAYLOAD_DECODER_INFO,
  };

  obj.payload = {
    device: deviceHeader,
    datapoints: {},
  };
  while (pointer <= data.length - 5) {
    // there must be at leased 5 additional bytes in the payload (state(=1) + timestamp(=4)
    const dpErrorCode = (data[pointer] & 0xf0) >> 4;
    const keyName = `dp_${(data[pointer] & 0x0f)
      .toString(10)
      .padStart(2, "0")}`;
    obj.payload.datapoints[keyName] = {
      errorVerbose: decodeModbusState(dpErrorCode),
      errorCode: dpErrorCode,
      index: data[pointer] & 0x0f,
      timestamp: decodeTimestamp(data.slice(pointer + 1, pointer + 5)),
      registers: [],
    };
    pointer += 5;
    // datenlength & Registers only present if no error!!
    if (dpErrorCode === 0) {
      const regCount = data[pointer];
      for (let i = 0; i < regCount; i++) {
        obj.payload.datapoints[keyName].registers.push(
          (data[pointer + 1 + 2 * i] << 8) + data[pointer + 2 + 2 * i],
        );
      }
      pointer += 1 + regCount * 2;
    }
  }

  return {
    data: obj,
    warnings,
  };
}

function decodeModbusTransparentPayload(data) {
  const obj = {};
  const warnings = [];

  obj.port = MODBUS_PORT;
  obj.portFunction = "MODBUS_TRANSPARENT";
  obj.payloadLength = data.length;

  obj.decoder = {
    version: PAYLOAD_DECODER_VERSION,
    info: PAYLOAD_DECODER_INFO,
  };

  obj.payload = {
    device: deviceHeader,
  };

  obj.payload = {
    command: {
      slaveAdress: data[pointer],
      fc: data[pointer + 1],
      answer: [],
    },
  };

  for (let i = pointer + 2; i < data.length; i++) {
    obj.payload.command.answer.push(data[pointer + i]);
  }

  return {
    data: obj,
    warnings,
  };
}

function decodeGpsPayload(data) {
  const obj = {};
  const warnings = [];

  obj.port = GPS_PORT;
  obj.portFunction = "GPS";
  obj.payloadLength = data.length;
  obj.payload = {
    device: deviceHeader,
    data: {
      coordinates: {
        latitude: 0,
        longitude: 0,
      },
    },
  };

  obj.decoder = {
    version: PAYLOAD_DECODER_VERSION,
    info: PAYLOAD_DECODER_INFO,
  };

  // obj.payload.data.coordinates.latitude = parseInt(data.slice(pointer, (pointer + 4)).toString("hex"), 16);
  // obj.payload.data.coordinates.longitude = parseInt(data.slice(pointer + 5, (pointer + 9)).toString("hex"), 16);
  obj.payload.data.coordinates.latitude =
    (((((data[pointer] << 8) + data[pointer + 1]) << 8) + data[pointer + 2]) <<
      8) +
    data[pointer + 3];
  obj.payload.data.coordinates.longitude =
    (((((data[pointer + 4] << 8) + data[pointer + 5]) << 8) +
      data[pointer + 6]) <<
      8) +
    data[pointer + 7];
  pointer += 8;

  return {
    data: obj,
    warnings,
  };
}

function decodePingPayload(data) {
  const obj = {};
  const warnings = [];

  obj.port = PING_PORT;
  obj.portFunction = "PING";
  obj.payloadLength = data.length;
  obj.payload = {
    device: deviceHeader,
  };

  obj.decoder = {
    version: PAYLOAD_DECODER_VERSION,
    info: PAYLOAD_DECODER_INFO,
  };

  return {
    data: obj,
    warnings,
  };
}

function consume(event) {
  const payload = event.data.payloadHex;
  const { port } = event.data;
  const bytes = Hex.hexToBytes(payload);
  const decoded = decodeUplink({
    fPort: port,
    bytes,
  });

  const { device } = decoded.data.payload;
  const type = decoded.data.portFunction;
  const { data } = decoded.data.payload;
  const { errors } = decoded;

  switch (type) {
    case "FIXED_DATA":
      delete data.timestamp;
      Object.keys(data).forEach((key) => {
        data[key].limit = data[key].cot.limit;
        data[key].event = data[key].cot.event;
        data[key].interrogation = data[key].cot.interrogation;
        data[key].cyclic = data[key].cot.cyclic;
        delete data[key].cot;

        emit("sample", { data: data[key], topic: key });
      });
      break;
    case "DI_DATA":
      data.digitalInputs.forEach((dataPoint) => {
        let result = {};
        result.limit = dataPoint.cot.limit;
        result.event = dataPoint.cot.event;
        result.interrogation = dataPoint.cot.interrogation;
        result.cyclic = dataPoint.cot.cyclic;
        delete dataPoint.cot;

        // Timestamp
        const { timestamp } = dataPoint;
        delete dataPoint.timestamp;

        result = Object.assign(result, dataPoint);

        emit("sample", {
          data: result,
          topic: "point_info",
        });
      });
      break;
    case "AI_DATA":
      data.analogInputs.forEach((dataPoint) => {
        const { topic } = dataPoint;
        const { timestamp } = dataPoint;

        const result = {};
        result.limit = dataPoint.cot.limit;
        result.event = dataPoint.cot.event;
        result.interrogation = dataPoint.cot.interrogation;
        result.cyclic = dataPoint.cot.cyclic;

        delete dataPoint.cot;
        delete dataPoint.topic;
        delete dataPoint.timestamp;

        dataPoint = Object.assign(result, dataPoint);

        emit("sample", { data: result, topic });
      });
      break;
    case "CNT_DATA":
      data.digitalInputs.forEach((dataPoint) => {
        const result = {};
        result.limit = dataPoint.cot.limit;
        result.event = dataPoint.cot.event;
        result.interrogation = dataPoint.cot.interrogation;
        result.cyclic = dataPoint.cot.cyclic;
        delete dataPoint.cot;

        // Timestamp
        const { timestamp } = dataPoint;
        delete dataPoint.timestamp;

        dataPoint = Object.assign(result, dataPoint);

        emit("sample", { data: result, topic: "count_data" });
      });
      break;
    case "MODBUS": {
      const { datapoints } = decoded.data.payload;
      Object.keys(datapoints).forEach((key) => {
        let result = {};
        result.modbusId = key;
        // Timestamp
        const { timestamp } = datapoints[key];
        delete dataPoint.timestamp;
        result = Object.assign(result, datapoints[key]);

        emit("sample", { data: result, topic: "modbus" });
      });
      break;
    }
    case "MODBUS_TRANSPARENT": {
      const { command } = decoded.data.payload;
      emit("sample", { data: command, topic: "modbus_transparent" });
      break;
    }
    case "TIMESYNC":
      emit("sample", { data: data.data, topic: "time_sync" });
      break;
    case "CONFIG":
      // Could be singular datapoints instead of an array.
      emit("sample", {
        data: { parameters: data.parameters },
        topic: "configuration",
      });
      break;
    case "INFO":
      // Empty
      break;
    case "GPS":
      emit("sample", { data: data.coordinates, topic: "gps" });
      // Empty
      break;
    case "PING":
      // Empty
      break;
    case "UNKNOWN":
      // Empty
      break;
    default:
      break;
  }

  // Lifecycle
  const lifecycle = device.deviceStatus;
  lifecycle.batteryLevel = device.batteryLevel;

  emit("sample", { data: lifecycle, topic: "lifecycle" });

  // Errors
  if (errors !== undefined) {
    if (errors.length > 0) {
      emit("sample", { data: { errors }, topic: "error" });
    }
  }
}
