const TYPE_TEMP = 0x01; // Temperature | 2 bytes  | -3276.5C to 3276.5C
const TYPE_RH = 0x02; // Humidity | 1 byte   | 0 to 100%
const TYPE_ACC = 0x03; // Acceleration | 3 bytes  | x/y/z
const TYPE_LIGHT = 0x04; // Light | 2 bytes  | lux
const TYPE_MOTION = 0x05; // Motion count | 1 byte   |
const TYPE_CO2 = 0x06; // CO2 | 2 bytes  | ppm
const TYPE_VDD = 0x07; // Battery voltage | 2 bytes  | mV
const TYPE_ANALOG1 = 0x08; // Analog input 1 | 2 bytes  | mV
const TYPE_GPS = 0x09; // GPS | 6 bytes  | signed lat/lon
const TYPE_PULSE1 = 0x0A; // Pulse input 1 | 2 bytes  |
const TYPE_PULSE1_ABS = 0x0B; // Pulse input 1 absolute | 4 bytes  |
const TYPE_EXT_TEMP1 = 0x0C; // External temperature 1 | 2 bytes  |
const TYPE_EXT_DIGITAL = 0x0D; // External digital input 1 | 1 byte   |
const TYPE_EXT_DISTANCE = 0x0E; // External distance | 2 bytes  | mm
const TYPE_ACC_MOTION = 0x0F; // Acc motion count | 1 byte   |
const TYPE_IR_TEMP = 0x10; // IR temperature | 4 bytes  | internal/external
const TYPE_OCCUPANCY = 0x11; // Occupancy | 1 byte   |
const TYPE_WATERLEAK = 0x12; // Water leak | 1 byte   |
const TYPE_GRIDEYE = 0x13; // Grid-EYE | 65 bytes | ref + 64 pixels
const TYPE_PRESSURE = 0x14; // Pressure | 4 bytes  | hPa
const TYPE_SOUND = 0x15; // Sound | 2 bytes  | peak/average
const TYPE_PULSE2 = 0x16; // Pulse input 2 | 2 bytes  |
const TYPE_PULSE2_ABS = 0x17; // Pulse input 2 absolute   | 4 bytes  |
const TYPE_ANALOG2 = 0x18; // Analog input 2 | 2 bytes  | mV
const TYPE_EXT_TEMP2 = 0x19; // External temperature 2 | 2 bytes  |
const TYPE_EXT_DIGITAL2 = 0x1A; // External digital input 2 | 1 byte   |
const TYPE_EXT_ANALOG_UV = 0x1B; // External analog | 4 bytes  | signed uV
const TYPE_TVOC = 0x1C; // TVOC | 2 bytes  | ppb
const TYPE_IAQ = 0x1D; // IAQ | 1 byte   |
const TYPE_GENERIC_BOOL = 0x1E; // Generic boolean | 1 byte   |
const TYPE_GENERIC_INT8 = 0x1F; // Generic int8 | 1 byte   |
const TYPE_GENERIC_INT16 = 0x20; // Generic int16 | 2 bytes  |
const TYPE_VIEW = 0x21; // Reactive display view | 1 byte   |
const TYPE_SETPOINT = 0x22; // Thermostat setpoint | 2 bytes  |
const TYPE_SPEED = 0x23; // Fan speed | 1 byte   |
const TYPE_EXT_HUMIDITY = 0x24; // External humidity | 1 byte   | 0 to 100%
const TYPE_BYTES = 0x3B; // Byte array | variable | 1 byte length + data
const TYPE_CRC = 0x3C; // CRC | 4 bytes  |
const TYPE_DEBUG = 0x3D; // Debug | 4 bytes

const SETTINGS_HEADER = 0x3E; // Settings Decoder

function signed(value, bits) {
  var sign = 1 << (bits - 1);
  var mask = (1 << bits) - 1;
  value = value & mask;
  return (value ^ sign) - sign;
}

function u16(data, i) {
  return (data[i] << 8) | data[i + 1];
}

function u32(data, i) {
  return ((data[i] << 24) | (data[i + 1] << 16) | (data[i + 2] << 8) | data[i + 3]) >>> 0;
}

function s32(data, i) {
  return (data[i] << 24) | (data[i + 1] << 16) | (data[i + 2] << 8) | data[i + 3];
}

function s24le(data, i) {
  var value = data[i] | (data[i + 1] << 8) | (data[i + 2] << 16);
  return value & 0x800000 ? value | 0xFF000000 : value;
}

function need(data, i, size, typeName, errors) {
  if (i + size >= data.length) {
    errors.push("truncated " + typeName + " at byte " + i);
    return false;
  }
  return true;
}

function DecodeElsysPayload(data) {
  const obj = {};
  const errors = [];

  for (var i = 0; i < data.length; i++) {
    switch (data[i]) {
      case TYPE_TEMP:
        if (!need(data, i, 2, "temperature", errors)) { i = data.length; break; }
        obj.temperature = signed(u16(data, i + 1), 16) / 10;
        i += 2;
        break;
      case TYPE_RH:
        if (!need(data, i, 1, "humidity", errors)) { i = data.length; break; }
        obj.humidity = data[i + 1];
        i += 1;
        break;
      case TYPE_ACC:
        if (!need(data, i, 3, "acceleration", errors)) { i = data.length; break; }
        obj.accX = signed(data[i + 1], 8);
        obj.accY = signed(data[i + 2], 8);
        obj.accZ = signed(data[i + 3], 8);
        i += 3;
        break;
      case TYPE_LIGHT:
        if (!need(data, i, 2, "light", errors)) { i = data.length; break; }
        obj.light = u16(data, i + 1);
        i += 2;
        break;
      case TYPE_MOTION:
        if (!need(data, i, 1, "motion", errors)) { i = data.length; break; }
        obj.motion = data[i + 1];
        i += 1;
        break;
      case TYPE_CO2:
        if (!need(data, i, 2, "co2", errors)) { i = data.length; break; }
        obj.co2 = u16(data, i + 1);
        i += 2;
        break;
      case TYPE_VDD:
        if (!need(data, i, 2, "vdd", errors)) { i = data.length; break; }
        obj.vdd = u16(data, i + 1);
        i += 2;
        break;
      case TYPE_ANALOG1:
        if (!need(data, i, 2, "analog1", errors)) { i = data.length; break; }
        obj.analog1 = u16(data, i + 1);
        i += 2;
        break;
      case TYPE_GPS:
        if (!need(data, i, 6, "gps", errors)) { i = data.length; break; }
        obj.lat = s24le(data, i + 1) / 10000;
        obj.long = s24le(data, i + 4) / 10000;
        i += 6;
        break;
      case TYPE_PULSE1:
        if (!need(data, i, 2, "pulse1", errors)) { i = data.length; break; }
        obj.pulse1 = u16(data, i + 1);
        i += 2;
        break;
      case TYPE_PULSE1_ABS:
        if (!need(data, i, 4, "pulseAbs", errors)) { i = data.length; break; }
        obj.pulseAbs1 = u32(data, i + 1);
        i += 4;
        break;
      case TYPE_EXT_TEMP1:
        if (!need(data, i, 2, "externalTemperature", errors)) { i = data.length; break; }
        obj.externalTemperature1 = signed(u16(data, i + 1), 16) / 10;
        i += 2;
        break;
      case TYPE_EXT_DIGITAL:
        if (!need(data, i, 1, "digital", errors)) { i = data.length; break; }
        obj.digital = !!data[i + 1];
        i += 1;
        break;
      case TYPE_EXT_DISTANCE:
        if (!need(data, i, 2, "distance", errors)) { i = data.length; break; }
        obj.distance = u16(data, i + 1);
        i += 2;
        break;
      case TYPE_ACC_MOTION:
        if (!need(data, i, 1, "accMotion", errors)) { i = data.length; break; }
        obj.accMotion = data[i + 1];
        i += 1;
        break;
      case TYPE_IR_TEMP:
        if (!need(data, i, 4, "irTemperature", errors)) { i = data.length; break; }
        obj.irInternalTemperature = signed(u16(data, i + 1), 16) / 10;
        obj.irExternalTemperature = signed(u16(data, i + 3), 16) / 10;
        i += 4;
        break;
      case TYPE_OCCUPANCY:
        if (!need(data, i, 1, "occupancy", errors)) { i = data.length; break; }
        obj.occupancy = data[i + 1];
        obj.occupied = !!obj.occupancy;
        i += 1;
        break;
      case TYPE_WATERLEAK:
        if (!need(data, i, 1, "waterleak", errors)) { i = data.length; break; }
        obj.waterleak = !!data[i + 1];
        i += 1;
        break;
      case TYPE_GRIDEYE:
        if (!need(data, i, 65, "grideye", errors)) { i = data.length; break; }
        var ref = data[i + 1];
        obj.grideye = [];
        for (var j = 0; j < 64; j++) {
          obj.grideye[j] = ref + data[i + 2 + j] / 10;
        }
        i += 65;
        break;
      case TYPE_PRESSURE:
        if (!need(data, i, 4, "pressure", errors)) { i = data.length; break; }
        obj.pressure = u32(data, i + 1) / 1000;
        i += 4;
        break;
      case TYPE_SOUND:
        if (!need(data, i, 2, "sound", errors)) { i = data.length; break; }
        obj.soundPeak = data[i + 1];
        obj.soundAvg = data[i + 2];
        i += 2;
        break;
      case TYPE_PULSE2:
        if (!need(data, i, 2, "pulse2", errors)) { i = data.length; break; }
        obj.pulse2 = u16(data, i + 1);
        i += 2;
        break;
      case TYPE_PULSE2_ABS:
        if (!need(data, i, 4, "pulseAbs2", errors)) { i = data.length; break; }
        obj.pulseAbs2 = u32(data, i + 1);
        i += 4;
        break;
      case TYPE_ANALOG2:
        if (!need(data, i, 2, "analog2", errors)) { i = data.length; break; }
        obj.analog2 = u16(data, i + 1);
        i += 2;
        break;
      case TYPE_EXT_TEMP2:
        if (!need(data, i, 2, "externalTemperature2", errors)) { i = data.length; break; }
        var extTemp2 = signed(u16(data, i + 1), 16) / 10;
        if (typeof obj.externalTemperature2 === "number") {
          obj.externalTemperature2 = [obj.externalTemperature2];
        }
        if (Array.isArray(obj.externalTemperature2)) {
          obj.externalTemperature2.push(extTemp2);
        } else {
          obj.externalTemperature2 = extTemp2;
        }
        i += 2;
        break;
      case TYPE_EXT_DIGITAL2:
        if (!need(data, i, 1, "digital2", errors)) { i = data.length; break; }
        obj.digital2 = !!data[i + 1];
        i += 1;
        break;
      case TYPE_EXT_ANALOG_UV:
        if (!need(data, i, 4, "analogUv", errors)) { i = data.length; break; }
        obj.analogUv = s32(data, i + 1);
        i += 4;
        break;
      case TYPE_TVOC:
        if (!need(data, i, 2, "tvoc", errors)) { i = data.length; break; }
        obj.tvoc = u16(data, i + 1);
        i += 2;
        break;
      case TYPE_IAQ:
        if (!need(data, i, 1, "iaq", errors)) { i = data.length; break; }
        obj.iaq = data[i + 1];
        i += 1;
        break;
      case TYPE_GENERIC_BOOL:
        if (!need(data, i, 1, "genericBool", errors)) { i = data.length; break; }
        obj.genericBool = data[i + 1] !== 0;
        i += 1;
        break;
      case TYPE_GENERIC_INT8:
        if (!need(data, i, 1, "genericInt8", errors)) { i = data.length; break; }
        obj.genericInt8 = signed(data[i + 1], 8);
        i += 1;
        break;
      case TYPE_GENERIC_INT16:
        if (!need(data, i, 2, "genericInt16", errors)) { i = data.length; break; }
        obj.genericInt16 = signed(u16(data, i + 1), 16);
        i += 2;
        break;
      case TYPE_VIEW:
        if (!need(data, i, 1, "view", errors)) { i = data.length; break; }
        obj.view = data[i + 1];
        i += 1;
        break;
      case TYPE_SETPOINT:
        if (!need(data, i, 2, "setpoint", errors)) { i = data.length; break; }
        obj.setpoint = signed(u16(data, i + 1), 16) / 10;
        i += 2;
        break;
      case TYPE_SPEED:
        if (!need(data, i, 1, "speed", errors)) { i = data.length; break; }
        obj.speed = data[i + 1];
        i += 1;
        break;
      case TYPE_EXT_HUMIDITY:
        if (!need(data, i, 1, "externalHumidity", errors)) { i = data.length; break; }
        obj.externalHumidity = data[i + 1];
        i += 1;
        break;
      case TYPE_BYTES:
        if (!need(data, i, 1, "bytes length", errors)) { i = data.length; break; }
        var length = data[i + 1];
        if (i + 1 + length >= data.length) { errors.push("truncated bytes at byte " + i); i = data.length; break; }
        obj.bytes = data.slice(i + 2, i + 2 + length);
        i += 1 + length;
        break;
      case TYPE_CRC:
        if (!need(data, i, 4, "crc", errors)) { i = data.length; break; }
        obj.crc = u32(data, i + 1);
        i += 4;
        break;
      case TYPE_DEBUG:
        if (!need(data, i, 4, "debug", errors)) { i = data.length; break; }
        obj.debug = u32(data, i + 1);
        i += 4;
        break;
      default:
        errors.push("unknown type 0x" + data[i].toString(16).padStart(2, "0") + " at byte " + i);
        i = data.length;
        break;
    }
  }
  return obj;
}

function bool(a) {
  return !!a[0];
}

function uint(a) {
  if (a.length === 1) return a[0];
  if (a.length === 2) return (a[0] << 8) | a[1];
  if (a.length === 4) return (a[0] << 24) | (a[1] << 16) | (a[2] << 8) | a[3];
  return a;
}

function extcfg(a) {
  const cfg = a[0];
  switch (cfg) {
    case 1:
      return "ANALOG";
    case 2:
      return "PULSE_PULLDOWN";
    case 3:
      return "PULSE_PULLUP";
    case 4:
      return "ABSOLUT_PULSE_PULLDOWN";
    case 5:
      return "ABSOLUT_PULSE_PULLUP";
    case 6:
      return "1_WIRE_TEMP_DS18B20";
    case 7:
      return "SWITCH_NO";
    case 8:
      return "SWITCH_NC";
    case 9:
      return "DIGITAL";
    case 10:
      return "SRF_01";
    case 11:
      return "DECAGON";
    case 12:
      return "WATERLEAK";
    case 13:
      return "MAXBOTIX_ML738X";
    case 14:
      return "GPS";
    case 15:
      return "1_WIRE_TEMP_SWITCH_NO";
    case 16:
      return "ANALOG_0_3V";
    case 17:
      return "ADC_MODULE_PT1000";
    default:
      break;
  }
  return a;
}

function sensor(bytes) {
  var types = {
    0: "Unknown",
    1: "ESM5K",
    10: "ELT_1",
    11: "ELT_1_HP",
    12: "ELT_2_HP",
    13: "ELT_LITE",
    20: "ERS",
    21: "ERS_CO2",
    22: "ERS_LITE",
    23: "ERS_EYE",
    24: "ERS_DESK",
    25: "ERS_SOUND",
    26: "ERS_TVOC",
    27: "ERS_CO2_LITE",
    30: "EMS",
    31: "EMS_DOOR",
    32: "EMS_DESK",
    33: "EMS_LITE",
    40: "TAG",
    50: "ERS15",
    51: "ERS15_CO2",
    52: "ERS15_LITE",
    53: "ERS15_EYE",
    55: "ERS15_SOUND",
    56: "ERS15_TVOC",
    57: "ERS15_CO2_LITE",
    60: "ERS2",
    61: "ERS2_CO2",
    62: "ERS2_LITE",
    63: "ERS2_EYE",
    65: "ERS2_SOUND",
    66: "ERS2_TVOC",
    67: "ERS2_CO2_LITE",
    70: "ECO",
    71: "ECO_CO2",
    80: "EMS2",
    90: "ETHD10",
    91: "EIAQD10",
    92: "EIAQDP10"
  };
  return types[bytes[0]] || "Unknown";
}

const settings = [
  { size: 16, type: 1, name: "appSKey", hex: true, parse: null },
  { size: 16, type: 2, name: "nwkSKey", hex: true, parse: null },
  { size: 8, type: 3, name: "devEui", hex: true, parse: null }, // Internal doc
  { size: 8, type: 4, name: "appEui", hex: true, parse: null },
  { size: 16, type: 5, name: "appKey", hex: true, parse: null }, // Internal doc
  { size: 4, type: 6, name: "devAddr", hex: true, parse: null },
  { size: 1, type: 7, name: "ota", parse: bool },
  { size: 1, type: 8, name: "port", parse: uint },
  { size: 1, type: 9, name: "mode", parse: uint },
  { size: 1, type: 10, name: "ack", parse: bool },
  { size: 1, type: 11, name: "drDef", parse: uint },
  { size: 1, type: 12, name: "drMax", parse: uint },
  { size: 1, type: 13, name: "drMin", parse: uint },
  { size: 1, type: 14, name: "class", parse: uint },
  { size: 1, type: 15, name: "power", parse: uint }, // Internal doc
  { size: 1, type: 16, name: "extCfg", parse: extcfg }, // Internal doc
  { size: 1, type: 17, name: "pirCfg", parse: uint },
  { size: 1, type: 18, name: "co2Cfg", parse: uint },
  { size: 4, type: 19, name: "accCfg", parse: null },
  { size: 4, type: 20, name: "splPer", parse: uint },
  { size: 4, type: 21, name: "tempPer", parse: uint },
  { size: 4, type: 22, name: "rhPer", parse: uint }, // Internal doc
  { size: 4, type: 23, name: "lightPer", parse: uint },
  { size: 4, type: 24, name: "pirPer", parse: uint },
  { size: 4, type: 25, name: "co2Per", parse: uint },
  { size: 4, type: 26, name: "extPer", parse: uint },
  { size: 4, type: 27, name: "extPwrTime", parse: uint },
  { size: 4, type: 28, name: "triggTime", parse: uint },
  { size: 4, type: 29, name: "accPer", parse: uint },
  { size: 4, type: 30, name: "vddPer", parse: uint },
  { size: 4, type: 31, name: "sendPer", parse: uint },
  { size: 4, type: 32, name: "lock", parse: uint },
  { size: 4, type: 33, name: "rfu", parse: uint },
  { size: 4, type: 34, name: "link", hex: true, parse: null },
  { size: 4, type: 35, name: "pressPer", parse: uint },
  { size: 4, type: 36, name: "soundPer", parse: uint },
  { size: 1, type: 37, name: "plan", parse: uint },
  { size: 1, type: 38, name: "subBand", parse: uint },
  { size: 1, type: 39, name: "lbt", parse: bool },
  { size: 1, type: 40, name: "ledConfig", parse: uint },
  { size: 1, type: 41, name: "co2Action", parse: uint }, // Internal doc
  { size: 4, type: 42, name: "waterPer", parse: uint },
  { size: 4, type: 43, name: "reedPer", parse: uint },
  { size: 4, type: 44, name: "reedCfg", parse: uint },
  { size: 1, type: 45, name: "pirSens", parse: uint }, // Internal doc
  { size: 1, type: 46, name: "qSize", parse: uint },
  { size: 1, type: 47, name: "qOffset", parse: bool },
  { size: 1, type: 48, name: "qPurge", parse: bool },
  { size: 2, type: 49, name: "co2Ref", parse: uint },
  { size: 1, type: 50, name: "co2Cal", parse: uint },
  { size: 2, type: 51, name: "co2Abc", parse: uint },
  { size: 1, type: 52, name: "pirSensivity", parse: uint },
  { size: 2, type: 53, name: "occSens", parse: uint },
  { size: 1, type: 54, name: "soundPwr", parse: uint },
  { size: 4, type: 55, name: "dispPer", parse: uint },
  { size: 1, type: 56, name: "dispAction", parse: uint },
  { size: 1, type: 57, name: "dispUnit", parse: uint },
  { size: 1, type: 58, name: "dispInv", parse: bool },
  { size: 1, type: 59, name: "asr", parse: bool },
  { size: 1, type: 60, name: "dispFull", parse: uint },
  { size: 1, type: 61, name: "dispLogo", parse: uint },
  { size: 1, type: 62, name: "dispLang", parse: uint },
  { size: 4, type: 63, name: "lightComp", parse: uint },
  { size: 4, type: 64, name: "vocPer", parse: uint },
  { size: -1, type: 65, name: "dispCustom", parse: null },
  { size: 1, type: 66, name: "buttonPer", parse: uint },
  { size: 51, type: 67, name: "buttonCfg", parse: null },
  { size: 0, type: 239, name: "rxStatus", parse: null },
  { size: 4, type: 240, name: "c1", parse: uint },
  { size: 4, type: 241, name: "c2", parse: uint },
  { size: 4, type: 242, name: "c3", parse: uint },
  { size: 4, type: 243, name: "c4", parse: uint },
  { size: 1, type: 244, name: "nfcDisable", parse: bool },
  { size: 1, type: 245, name: "sensor", parse: sensor },
  { size: 2, type: 246, name: "output", parse: sensor },
  { size: 4, type: 247, name: "pulse1", parse: sensor },
  { size: 4, type: 248, name: "pulse2", parse: sensor },
  { size: 0, type: 249, name: "settings", parse: null },
  { size: 1, type: 250, name: "external", parse: null },
  { size: 2, type: 251, name: "version", parse: uint },
  { size: 4, type: 252, name: "sleep", parse: null },
  { size: 0, type: 253, name: "generic", parse: null },
  { size: 0, type: 254, name: "reboot", parse: null },
];

function DecodeElsysSettings(input) {
  let bytes = [];
  if (Array.isArray(input)) {
    if (input.length > 0 && typeof input[0] === "number") {
      bytes = input;
    } else {
      return makeError("unknown input type; array with non-number elements");
    }
  } else if (typeof input === "string") {
    const result = [];
    while (input.length >= 2) {
      result.push(parseInt(input.substring(0, 2), 16));
      input = input.substring(2, input.length);
    }
    bytes = result;
  } else {
    return makeError("unknown input type; not array nor string");
  }

  const payload = {};

  let i = 0;
  if (bytes[i++] != SETTINGS_HEADER) {
    return makeError("INCORRECT_HEADER ");
  }
  const size = bytes[i++];
  while (i < bytes.length) {
    var type = bytes[i++];

    let setting = settings.filter((s) => s.type == type);
    if (setting.length === 0) {
      payload.error = "UNKWON_HEADER_ABORTING";
      return {
        settings: payload,
      };
    }
    setting = setting[0];
    const d = Array.from(bytes).slice(i, i + setting.size);

    // Do not emit LoRa Secrets
    const sensitiveInfo = ["appSKey", "nwkSKey", "devEui", "appEui", "appKey", "devAddr"];
    if (sensitiveInfo.indexOf(setting.name) === -1) {
      if (setting.parse == null) {
        payload[setting.name] = Hex.bytesToHex(d); // Make them a hexstring again
      } else {
        payload[setting.name] = setting.parse(d);
      }
    }
    i += setting.size;
  }

  return {
    settings: payload,
  };
}

function makeError(desc) {
  return {
    error: { error: desc },
  };
}

function deleteUnusedKeys(data) {
  let keysRetained = false;
  Object.keys(data).forEach((key) => {
    if (data[key] === undefined || isNaN(data[key])) {
      delete data[key];
    } else {
      keysRetained = true;
    }
  });
  return keysRetained;
}

function checkForCustomFields(device, target, fallbackValue) {
  if (device !== undefined && device.customFields !== undefined && device.customFields[target] !== undefined) {
    return device.customFields[target];
  }
  return fallbackValue;
}

function calculateRecentOccupancy(device, state, occupancy) {
  const minOccupancyThreshold = checkForCustomFields(device, "minOccupancyThreshold", 3);
  const occupancyWarmThreshold = checkForCustomFields(device, "occupancyWarmThreshold", 90);
  state = state || {};

  // Occupancy status
  if (occupancy.occupied) {
    occupancy.occupancyStatus = "OCCUPIED";
    occupancy.occupiedOrWarm = true;
  } else {
    occupancy.occupancyStatus = "FREE";
    occupancy.occupiedOrWarm = false;
  }

  const time = new Date().getTime();
  occupancy.minutesSinceLastOccupied = 0;
  occupancy.occupiedMinutes = 0;

  if (occupancy.occupied) {
    // Set state to first occupancy occurence so occupied time can be calulcated
    if (state.firstOccupancyTimestamp == undefined) {
      state.firstOccupancyTimestamp = time;
    }
    // Give out how long there has been occupancy
    occupancy.occupiedMinutes = Math.round((time - state.firstOccupancyTimestamp) / 1000 / 60);

    // Only reset if a real occupancy has been tracked
    if (occupancy.occupiedMinutes >= minOccupancyThreshold) {
      delete state.lastOccupancyTimestamp; // Reset cycle
    }
    delete state.occupiedMinutes;
  } else {
    // Give out how long there has been no occupancy
    if (state.lastOccupancyTimestamp !== undefined) {
      occupancy.minutesSinceLastOccupied = Math.round((time - state.lastOccupancyTimestamp) / 1000 / 60);
    } else {
      state.lastOccupancyTimestamp = time;

      // Only save the timestamp on first leave and save how long the occupancy has gone on for
      state.occupiedMinutes = Math.round((time - state.firstOccupancyTimestamp) / 1000 / 60);
      delete state.firstOccupancyTimestamp; // Reset cycle
    }
  }

  if (occupancy.minutesSinceLastOccupied < occupancyWarmThreshold && !occupancy.occupied && state.occupiedMinutes >= minOccupancyThreshold) {
    occupancy.warm = true;
    occupancy.occupiedOrWarm = true;
    occupancy.occupancyStatus = "WARM";
  } else {
    occupancy.warm = false;
    occupancy.occupiedOrWarm = occupancy.occupied;
  }
  return { state, occupancy }
}

function consume(event) {
  const payload = Hex.hexToBytes(event.data.payloadHex);

  if (payload[0] !== SETTINGS_HEADER) {
    const res = DecodeElsysPayload(payload);
    const data = {};
    const lifecycle = {};
    let occupancy = {};
    const noise = {};

    // Default values
    data.temperature = res.temperature;
    data.humidity = res.humidity;
    data.accX = res.accX;
    data.accY = res.accY;
    data.accZ = res.accZ;
    data.light = res.light;
    data.co2 = res.co2;
    data.analogUv = res.analogUv;
    data.iaq = res.iaq;
    data.speed = res.speed;
    data.tvoc = res.tvoc;
    data.reed = res.digital;
    data.distance = res.distance;
    data.accMotion = res.accMotion;
    data.waterleak = res.waterleak;
    data.pressure = res.pressure;
    data.lat = res.lat;
    data.long = res.long;
    data.analog1 = res.analog1;
    data.analog2 = res.analog2;
    data.pulse1 = res.pulse1;
    data.pulse2 = res.pulse2;
    data.pulseAbs1 = res.pulseAbs1;
    data.pulseAbs2 = res.pulseAbs2;
    data.externalTemperature1 = res.externalTemperature1;
    data.externalTemperature2 = res.externalTemperature2;
    data.externalHumidity = res.externalHumidity;
    data.grideye = res.grideye;
    data.view = res.view;
    data.genericBool = res.genericBool;
    data.genericInt8 = res.genericInt8;
    data.genericInt16 = res.genericInt16;
    data.bytes = res.bytes;
    data.debug = res.debug;

    // Occupancy values
    occupancy.motion = res.motion;
    occupancy.occupancy = res.occupancy;
    occupancy.occupied = res.occupied;

    // Noise values
    noise.soundPeak = res.soundPeak;
    noise.soundAvg = res.soundAvg;

    // Lifecycle values
    if (res.vdd !== undefined) {
      lifecycle.batteryVoltage = res.vdd / 1000;
      let batteryLevel =
        Math.round((lifecycle.batteryVoltage - 2.7) / 0.009 / 10) * 10;

      if (batteryLevel > 100) {
        batteryLevel = 100;
      } else if (batteryLevel < 0) {
        batteryLevel = 0;
      }
      lifecycle.batteryLevel = batteryLevel;
    }

    if (deleteUnusedKeys(data)) {
      emit("sample", { data, topic: "default" });
    }

    if (deleteUnusedKeys(lifecycle)) {
      emit("sample", { data: lifecycle, topic: "lifecycle" });
    }

    if (deleteUnusedKeys(occupancy)) {
      let recentOccupancyResult = calculateRecentOccupancy(event.device, event.state, occupancy);
      occupancy = recentOccupancyResult.occupancy;

      emit("state", recentOccupancyResult.state);
      emit("sample", { data: occupancy, topic: "occupancy" });
    }

    if (deleteUnusedKeys(noise)) {
      emit("sample", { data: noise, topic: "sound" });
    }
  } else if (payload[0] === SETTINGS_HEADER) {
    const res = DecodeElsysSettings(payload);
    if (res.error !== undefined) {
      emit("sample", { data: res.error, topic: "configuration" });
    } else {
      emit("sample", { data: res.settings, topic: "configuration" });
    }
  }
}
