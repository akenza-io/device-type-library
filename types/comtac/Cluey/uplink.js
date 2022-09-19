// DEFINES
const PAYLOAD_DECODER_VERSION = "00.04-VW";
const PAYLOAD_DECODER_INFO = "TTN/TTI";
const DEVICE_DESIGNATION_CLUEY_KM = "Cluey-KM";
const DEVICE_DESIGNATION_CLUEY_AM = "Cluey-AM";
const DEVICE_DESIGNATION_CLUEY_TM = "Cluey-TM";
const DEVICE_MANUFACTURER = "comtac AG";

const CLUEY_KM_DEVICE_ID = 0x10;
const CLUEY_AM_DEVICE_ID = 0x11;
const CLUEY_TM_DEVICE_ID = 0x12;

const PAYLOAD_VERSION = 0x00; // PL version 0

const FIXED_DATA_PORT = 3; // FIXED_DATA port
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
const DS_STATIC_PAYLOAD_CONFIG = 0x05;

// Timing Settings
const TS_MEAS_INT_DC = 0x06;
const TS_MEAS_INT_BAT = 0x07;
const TS_TIMESYNC_INT = 0x08;
const TS_REJOIN_INT = 0x09;
const TS_LEAP_SECONDS = 0x0a;

// Input Settings
const IS_ENABLE = 0x0b;
const IS_ACTIVE = 0x0c;
const IS_INVERT = 0x0d;
const IS_DELAY_ENABLE = 0x0e;
const IS_DELAY_RISING = 0x0f;
const IS_DELAY_FALLING = 0x10;
const IS_DELAY_SCALING = 0x11;
const IS_WIPER_ENABLE = 0x12;
const IS_WIPER_CONFIRMATION_TIMEOUT = 0x13;
const IS_DEFLUTTER_ENABLE = 0x14;
const IS_DEFLUTTER_INTERVAL = 0x15;
const IS_DEFLUTTER_COUNT = 0x16;
const IS_DOUBLE_ENABLE = 0x17;
const IS_DOUBLE_INTERMEDIATE_STATE_TIMEOUT_ENABLE = 0x18;
const IS_DOUBLE_INTERMEDIATE_STATE_TIMEOUT = 0x19;
const IS_COUNTER_ENABLE = 0x1a;
const IS_COUNTER_HARDWARE = 0x1b;
const IS_COUNTER_MODE = 0x1c;
const IS_COUNTER_SCALING = 0x1d;
const IS_COUNTER_DIFF_ENABLE = 0x1e;
const IS_COUNTER_DIFF_INTERVAL = 0x1f;

const AIS_ENABLE = 0x20;
const AIS_LIMIT_LOWER = 0x21;
const AIS_LIMIT_UPPER = 0x22;
const AIS_LIMIT_LOWER_HYST = 0x23;
const AIS_LIMIT_UPPER_HYST = 0x24;

const ES_RISING_ENABLE = 0x25;
const ES_FALLING_ENABLE = 0x26;
const ES_BLOCKED_CHANGED = 0x27;
const ES_CYCLIC_DI_ENABLE = 0x28;
const ES_DI_CONFIRMED = 0x29;
const ES_CYCLIC_DI_INTERVAL = 0x2a;
const ES_CYCLIC_AI_ENABLE = 0x2b;
const ES_AI_CONFIRMED = 0x2c;
const ES_CYCLIC_AI_INTERVAL = 0x2d;
const ES_CYCLIC_CNT_ENABLE = 0x2e;
const ES_CNT_CONFIRMED = 0x2f;
const ES_CYCLIC_CNT_TIMEDATE_WEEKDAY_SEL = 0x30;
const ES_CYCLIC_CNT_TIMEDATE_WEEKDAY = 0x31;
const ES_CYCLIC_CNT_TIME_HOUR = 0x32;
const ES_CYCLIC_CNT_TIME_MINUTE = 0x33;
const ES_CYCLIC_CNT_TIME_INTERVAL = 0x34;
const ES_PRIORITY = 0x35;
const ES_DELAY = 0x36;

const ACS_ENABLE = 0x37;
const ACS_ALARM_DELAY = 0x38;
const ACS_MOTION_DET_SEL = 0x39;
const ACS_KEY_SWITCH_SEL = 0x3a;
const ACS_DOOR_CONTACT_SEL = 0x3b;

const OS_ENABLE = 0x3c;
const OS_INVERT = 0x3d;
const OS_MODE = 0x3e;
const OS_WIPER_TIME = 0x3f;

const IOMS_OUT1 = 0x40;
const IOMS_OUT2 = 0x41;
const IOMS_OUT3 = 0x42;
const IOMS_OUT4 = 0x43;

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
      errors.push("not a valid port");
      return {
        data: {
          port: input.fPort,
          portFunction: "unknown",
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
      errors.push("not a valid port");
      return {
        data: {
          port: input.fPort,
          portFunction: "unknown",
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
    errors.push("Device version not supported by this decoder");
    return {
      data: {
        port: input.fPort,
        portFunction: "unknown",
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
      errors.push("not a valid port");
      return {
        data: {
          port: input.fPort,
          portFunction: "unknown",
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
    errors.push("Device version not supported by this decoder");
    return {
      data: {
        port: input.fPort,
        portFunction: "unknown",
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
      errors.push("not a valid port");
      return {
        data: {
          port: input.fPort,
          portFunction: "unknown",
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
    errors.push("Device version not supported by this decoder");
    return {
      data: {
        port: input.fPort,
        portFunction: "unknown",
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
  errors.push("Device ID not supported by this decoder");
  return {
    data: {
      port: input.fPort,
      portFunction: "unknown",
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

  if (!data[pointer]) {
    obj.batteryLevel = "external";
  } else if (data[pointer] === 255) {
    obj.batteryLevel = "error";
  } else {
    // ((input - min) * 100) / (max - min)
    obj.batteryLevel = `${Math.round(
      ((data[pointer] - 1) * 100) / (254 - 1),
    ).toString()}%`;
  }
  pointer++;
  return obj;
}

function decodeTimestamp(data) {
  const obj = {};

  let unixTimestamp;
  let milliseconds;
  let dateObject;
  let humanDateFormat;

  unixTimestamp = data[3] + (data[2] << 8) + (data[1] << 16) + (data[0] << 24);
  milliseconds = unixTimestamp * 1000;

  obj.unix = unixTimestamp;

  dateObject = new Date(milliseconds);
  humanDateFormat = dateObject.toString(); // Wed Nov 24 2021 15:32:14 GMT+0100 (Mitteleuropäische Normalzeit)
  // humanDateFormat = dateObject.toLocaleString();  //18.11.2021, 16:24:50
  // humanDateFormat = dateObject.toUTCString();   //Thu, 18 Nov 2021 15:24:50 GMT

  obj.string = humanDateFormat;

  return obj;
}

function addTimeToTimestamp(timestamp, data) {
  const obj = {};

  let dateObject;
  let humanDateFormat;

  obj.unix = timestamp + (data[1] + (data[0] << 8));

  dateObject = new Date(obj.unix * 1000);
  humanDateFormat = dateObject.toString(); // Wed Nov 24 2021 15:32:14 GMT+0100 (Mitteleuropäische Normalzeit)
  // humanDateFormat = (dateObject).toLocaleString();  //18.11.2021, 16:24:50
  // humanDateFormat = dateObject.toUTCString();     //Thu, 18 Nov 2021 15:24:50 GMT

  obj.string = humanDateFormat;

  return obj;
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
  const timestampAbsolute = {};
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
    data: {
      config: {
        timestamp: Boolean(data[pointer] & 0x01),
        digitalInputs: Boolean(data[pointer] & 0x02),
        values: Boolean(data[pointer] & 0x04),
      },
      timestamp: {},
      digitalInputs: "",
      objects: [],
    },
  };

  pointer += 1;

  if (obj.payload.data.config.timestamp) {
    obj.payload.data.timestamp = decodeTimestamp(
      data.slice(pointer, pointer + 4),
    );
    pointer += 4;
  }
  if (obj.payload.data.config.digitalInputs) {
    pointer += 1; // Skip object type
    obj.payload.data.digitalInputs = decode16BitAsBinaryString(
      data.slice(pointer, pointer + 2),
    );
    pointer += 2;
  }
  if (obj.payload.data.config.values) {
    while (pointer < data.length - 1) {
      switch (data[pointer] & 0xf0) {
        case OBJECT_TYPE_CNT:
          obj.payload.data.objects.push({
            type: "Counter",
            id: data[pointer] & 0x0f,
            value:
              data[pointer + 3] +
              (data[pointer + 2] << 8) +
              (data[pointer + 1] << 16),
          });
          pointer += 4;
          break;
        case OBJECT_TYPE_AI:
          obj.payload.data.objects.push({
            type: "Analog",
            id: data[pointer] & 0x0f,
            status: {
              "limit1:": Boolean(data[pointer + 1] & 0x01),
              "limit2:": Boolean(data[pointer + 1] & 0x02),
              "delta:": Boolean(data[pointer + 1] & 0x04),
            },
            value: data[pointer + 3] + (data[pointer + 2] << 8),
          });
          pointer += 4;
          break;
        case OBJECT_TYPE_TEMP:
          obj.payload.data.objects.push({
            type: "Temperature",
            id: data[pointer] & 0x0f,
            status: {
              "limit1:": Boolean(data[pointer + 1] & 0x01),
              "limit2:": Boolean(data[pointer + 1] & 0x02),
              "delta:": Boolean(data[pointer + 1] & 0x04),
            },
            value: decToInt(data[pointer + 3] + (data[pointer + 2] << 8)) / 100,
          });
          pointer += 4;
          break;
        default:
          break;
      }
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
    if ((data[pointer] & 0xf0) == OBJECT_TYPE_DI) {
      obj.payload.data.digitalInputs.push({
        info: {
          type: "singlePointInfo",
          id: data[pointer] & 0x0f,
        },
        cot: decodeCot(data[pointer + 1] & 0xf0),
        status: {
          blocked: Boolean(data[pointer + 1] & 0x04),
          state: data[pointer + 1] & 0x01,
        },
        timestamp: addTimeToTimestamp(
          timestampAbsolute.unix,
          data.slice(pointer + 2, pointer + 4),
        ),
      });
    } else if ((data[pointer] & 0xf0) == OBJECT_TYPE_DBL) {
      obj.payload.data.digitalInputs.push({
        info: {
          type: "doublePointInfo",
          id: data[pointer] & 0x0f,
        },
        cot: decodeCot(data[pointer + 1] & 0xf0),
        status: {
          blocked: Boolean(data[pointer + 1] & 0x04),
          state: data[pointer + 1] & 0x03,
        },
        timestamp: addTimeToTimestamp(
          timestampAbsolute.unix,
          data.slice(pointer + 2, pointer + 4),
        ),
      });
    }
    pointer += 4;
  } while (pointer < data.length - 1);

  // ------application specific assigments for digital inputs
  // obj.application={};
  // obj.payload.data.digitalInputs.forEach(function (item)
  // {
  //	switch(item.info.id)
  //    {
  //      case 5:
  //       obj.application.SwitchREMOTE=Boolean(item.status.state);
  //       break;
  //      case 6:
  //       obj.application.EndPositionOPEN=Boolean(item.status.state);
  //       break;
  //      case 7:
  //       obj.application.EndPositionCLOSE=Boolean(item.status.state);
  //       break;
  //      case 8:
  //       obj.application.EndPositionReserve=Boolean(item.status.state);
  //       break;
  //    }
  // });
  // ----end of  application specific assigments for digital inputs

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
    if ((data[pointer] & 0xf0) == OBJECT_TYPE_AI) {
      // AI Type
      obj.payload.data.analogInputs.push({
        info: {
          type: "analogValue",
          id: data[pointer] & 0x0f,
        },
        cot: decodeCot(data[pointer + 1] & 0xf0),
        status: {
          invalid: Boolean(data[pointer + 1] & 0x08),
          overflow: Boolean(data[pointer + 1] & 0x04),
          limit2: Boolean(data[pointer + 1] & 0x02),
          limit1: Boolean(data[pointer + 1] & 0x01),
        },
        value: decToInt(data[pointer + 3] + (data[pointer + 2] << 8)),
        timestamp: addTimeToTimestamp(
          timestampAbsolute.unix,
          data.slice(pointer + 4, pointer + 6),
        ),
      });
    } else if ((data[pointer] & 0xf0) === OBJECT_TYPE_TEMP) {
      // TEMP Type
      obj.payload.data.analogInputs.push({
        info: {
          type: "Temperature",
          id: data[pointer] & 0x0f,
        },
        cot: decodeCot(data[pointer + 1] & 0xf0),
        status: {
          invalid: Boolean(data[pointer + 1] & 0x08),
          overflow: Boolean(data[pointer + 1] & 0x04),
          limit2: Boolean(data[pointer + 1] & 0x02),
          limit1: Boolean(data[pointer + 1] & 0x01),
        },
        value: decToInt(data[pointer + 3] + (data[pointer + 2] << 8)) / 100,
        timestamp: addTimeToTimestamp(
          timestampAbsolute.unix,
          data.slice(pointer + 4, pointer + 6),
        ),
      });
    }
    pointer += 6;
  } while (pointer < data.length - 1);

  // ----application assigments   for analog inputs
  // obj.application={};
  // obj.payload.data.analogInputs.forEach(function (item)
  // {
  //	switch(item.info.id)
  //    {
  //      case 1:
  //       obj.application.fuellstand=item.value;
  //        obj.application.fuellstandInvalid=Boolean(item.status.invalid);
  //        obj.application.fuellstandOverflow=Boolean(item.status.overflow);
  //        obj.application.fuellstandLimit1=Boolean(item.status.limit1);
  //        obj.application.fuellstandLimit2=Boolean(item.status.limit2);
  //        break;
  //    }
  // });
  // ----end ofapplication assigments   for analog inputs

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
        info: {
          type: (data[pointer] & 0xf0) === 0x50 ? "counterdiff" : "counter",
          id: data[pointer] & 0x0f,
        },
        cot: decodeCot(data[pointer + 1] & 0xf0),
        status: {
          overflow: Boolean(data[pointer + 1] & 0x01),
          reset: Boolean(data[pointer + 1] & 0x02),
          limit: Boolean(data[pointer + 1] & 0x04),
        },
        timestamp: timestampCommon,
        value:
          data[pointer + 4] +
          (data[pointer + 3] << 8) +
          (data[pointer + 2] << 16),
      });
      pointer += 5;
    }
  } while (pointer < data.length - 1);

  // ----application assigments   for analog inputs
  // obj.application={};
  // obj.payload.data.counters.forEach(function (item)
  // {
  //	switch(item.info.id)
  //    {
  //      case 1:
  //       obj.application.counter1=item.value;
  //        obj.application.counter1Overflow=Boolean(item.status.overflow);
  //        obj.application.counter1Reset=Boolean(item.status.reset);
  //        obj.application.fuellstandLimit2=Boolean(item.status.limit2);
  //        break;
  //    }
  // });
  // ----end ofapplication assigments   for analog inputs
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
      case DS_STATIC_PAYLOAD_CONFIG:
        obj.payload.data.parameters.push({
          name: "DS_STATIC_PAYLOAD_CONFIG",
          value: {
            timestamp: Boolean(data[pointer] & 0x01),
            digitalInputs: Boolean(data[pointer] & 0x02),
            counterValues: Boolean(data[pointer++] & 0x04),
          },
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
      case AIS_LIMIT_LOWER:
        obj.payload.data.parameters.push({
          name: "AIS_LIMIT_LOWER",
          values: [],
          unit: "",
        });
        for (i = 0; i < length / 2; i++) {
          obj.payload.data.parameters[
            obj.payload.data.parameters.length - 1
          ].values.push(data[pointer + 1] + (data[pointer] << 8));
          pointer += 2;
        }
        break;
      case AIS_LIMIT_UPPER:
        obj.payload.data.parameters.push({
          name: "AIS_LIMIT_UPPER",
          values: [],
          unit: "",
        });
        for (i = 0; i < length / 2; i++) {
          obj.payload.data.parameters[
            obj.payload.data.parameters.length - 1
          ].values.push(data[pointer + 1] + (data[pointer] << 8));
          pointer += 2;
        }
        break;
      case AIS_LIMIT_LOWER_HYST:
        obj.payload.data.parameters.push({
          name: "AIS_LIMIT_LOWER_HYST",
          values: [],
          unit: "",
        });
        for (i = 0; i < length / 2; i++) {
          obj.payload.data.parameters[
            obj.payload.data.parameters.length - 1
          ].values.push(data[pointer + 1] + (data[pointer] << 8));
          pointer += 2;
        }
        break;
      case AIS_LIMIT_UPPER_HYST:
        obj.payload.data.parameters.push({
          name: "AIS_LIMIT_UPPER_HYST",
          values: [],
          unit: "",
        });
        for (i = 0; i < length / 2; i++) {
          obj.payload.data.parameters[
            obj.payload.data.parameters.length - 1
          ].values.push(data[pointer + 1] + (data[pointer] << 8));
          pointer += 2;
        }
        break;

      // ES
      case ES_RISING_ENABLE:
        obj.payload.data.parameters.push({
          name: "ES_RISING_ENABLE",
          value: decode16BitAsBinaryString(data.slice(pointer, pointer + 2)),
        });
        pointer += length;
        break;
      case ES_FALLING_ENABLE:
        obj.payload.data.parameters.push({
          name: "ES_FALLING_ENABLE",
          value: decode16BitAsBinaryString(data.slice(pointer, pointer + 2)),
        });
        pointer += length;
        break;
      case ES_BLOCKED_CHANGED:
        obj.payload.data.parameters.push({
          name: "ES_BLOCKED_CHANGED",
          value: decode16BitAsBinaryString(data.slice(pointer, pointer + 2)),
        });
        pointer += length;
        break;
      case ES_CYCLIC_DI_ENABLE:
        obj.payload.data.parameters.push({
          name: "ES_CYCLIC_DI_ENABLE",
          value: decode16BitAsBinaryString(data.slice(pointer, pointer + 2)),
        });
        pointer += length;
        break;
      case ES_DI_CONFIRMED:
        obj.payload.data.parameters.push({
          name: "ES_DI_CONFIRMED",
          value: data[pointer++] & 0x01 ? "confirmed" : "unconfirmed",
        });
        break;
      case ES_CYCLIC_DI_INTERVAL:
        obj.payload.data.parameters.push({
          name: "ES_CYCLIC_DI_INTERVAL",
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
      case ES_CYCLIC_AI_ENABLE:
        obj.payload.data.parameters.push({
          name: "ES_CYCLIC_AI_ENABLE",
          value: decode16BitAsBinaryString(data.slice(pointer, pointer + 2)),
        });
        pointer += length;
        break;
      case ES_AI_CONFIRMED:
        obj.payload.data.parameters.push({
          name: "ES_AI_CONFIRMED",
          value: data[pointer++] & 0x01 ? "confirmed" : "unconfirmed",
        });
        break;
      case ES_CYCLIC_AI_INTERVAL:
        obj.payload.data.parameters.push({
          name: "ES_CYCLIC_AI_INTERVAL",
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
      case ES_CYCLIC_CNT_ENABLE:
        obj.payload.data.parameters.push({
          name: "ES_CYCLIC_CNT_ENABLE",
          value: data[pointer++] & 0x01 ? "enabled" : "disabled",
        });
        break;
      case ES_CNT_CONFIRMED:
        obj.payload.data.parameters.push({
          name: "ES_CNT_CONFIRMED",
          value: data[pointer++] & 0x01 ? "confirmed" : "unconfirmed",
        });
        break;
      case ES_CYCLIC_CNT_TIMEDATE_WEEKDAY_SEL:
        obj.payload.data.parameters.push({
          name: "ES_CYCLIC_CNT_TIMEDATE_WEEKDAY_SEL",
          value: data[pointer++] & 0x01 ? "weekday" : "date",
        });
        break;
      case ES_CYCLIC_CNT_TIMEDATE_WEEKDAY:
        obj.payload.data.parameters.push({
          name: "ES_CYCLIC_CNT_TIMEDATE_WEEKDAY",
          value: data[pointer++] & 0x01,
        });
        break;
      case ES_CYCLIC_CNT_TIME_HOUR:
        obj.payload.data.parameters.push({
          name: "ES_CYCLIC_CNT_TIME_HOUR",
          value: data[pointer++] & 0x01,
        });
        break;
      case ES_CYCLIC_CNT_TIME_MINUTE:
        obj.payload.data.parameters.push({
          name: "ES_CYCLIC_CNT_TIME_MINUTE",
          value: data[pointer++] & 0x01,
        });
        break;
      case ES_CYCLIC_CNT_TIME_INTERVAL:
        obj.payload.data.parameters.push({
          name: "ES_CYCLIC_CNT_TIME_INTERVAL",
          value: data[pointer + 1] + (data[pointer] << 8),
          unit: "min",
        });
        pointer += length;
        break;
      case ES_PRIORITY:
        obj.payload.data.parameters.push({
          name: "ES_PRIORITY",
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

      // ASC
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

  obj.payload.data.coordinates.latitude = parseInt(
    data.slice(pointer, pointer + 4).toString("hex"),
    16,
  );
  obj.payload.data.coordinates.longitude = parseInt(
    data.slice(pointer + 5, pointer + 9).toString("hex"),
    16,
  );

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
  const { data } = decoded.data.payload;
  const { warnings } = decoded;

  // Digital inputs
  for (let i = 0; i < data.digitalInputs.length; i++) {
    const digitalInputs = {};
    const digital = data.digitalInputs[i];

    digitalInputs.inputNr = digital.info.id;
    digitalInputs.limit = digital.cot.limit;
    digitalInputs.event = digital.cot.event;
    digitalInputs.interrogation = digital.cot.interrogation;
    digitalInputs.cyclic = digital.cot.cyclic;

    digitalInputs.blocked = digital.status.blocked;
    digitalInputs.state = digital.status.state;

    const timestamp = new Date(digital.timestamp.string);

    emit("sample", {
      data: digitalInputs,
      topic: "digital",
      timestamp,
    });
  }

  // Lifecycle
  const lifecycle = device.deviceStatus;
  lifecycle.batteryLevel = Number(device.batteryLevel.replace(/\D/g, ""));

  emit("sample", { data: lifecycle, topic: "lifecycle" });

  // Warnings
  if (warnings.length > 0) {
    emit("sample", { data: warnings, topic: "warnings" });
  }
}
