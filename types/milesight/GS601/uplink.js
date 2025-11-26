const RAW_VALUE = 0x00;
const WITH_QUERY_CMD = 0x00;

function readProtocolVersion(bytes) {
  var major = bytes[0] & 0xff;
  var minor = bytes[1] & 0xff;
  return "v" + major + "." + minor;
}

function readHardwareVersion(bytes) {
  var major = bytes[0] & 0xff;
  var minor = bytes[1] & 0xff;
  return "v" + major + "." + minor;
}

function readFirmwareVersion(bytes) {
  var major = bytes[0] & 0xff;
  var minor = bytes[1] & 0xff;
  var release = bytes[2] & 0xff;
  var alpha = bytes[3] & 0xff;
  var unitTest = bytes[4] & 0xff;
  var test = bytes[5] & 0xff;

  var version = "v" + major + "." + minor;
  if (release !== 0) version += "-r" + release;
  if (alpha !== 0) version += "-a" + alpha;
  if (unitTest !== 0) version += "-u" + unitTest;
  if (test !== 0) version += "-t" + test;
  return version;
}

function readDeviceStatus(type) {
  var deviceStatusMap = { 0: "OFF", 1: "ON" };
  return getValue(deviceStatusMap, type);
}

function readVapeIndexAlarmType(type) {
  var vapeIndexAlarmMap = {
    0: "COLLECTION_ERROR", // 0x00
    1: "LOWER_RANGE_ERROR", // 0x01
    2: "OVER_RANGE_ERROR", // 0x02
    16: "ALARM_DEACTIVATION", // 0x10
    17: "ALARM_TRIGGER", // 0x11
    32: "INTERFERENCE_ALARM_DEACTIVATION", // 0x20
    33: "INTERFERENCE_ALARM_TRIGGER", // 0x21
  };
  return getValue(vapeIndexAlarmMap, type);
}

function readPMAlarmType(type) {
  var pmAlarmMap = {
    0: "COLLECTION_ERROR", // 0x00
    1: "LOWER_RANGE_ERROR", // 0x01
    2: "OVER_RANGE_ERROR", // 0x02
    16: "ALARM_DEACTIVATION", // 0x10
    17: "ALARM_TRIGGER", // 0x11
  };
  return getValue(pmAlarmMap, type);
}

function readTemperatureAlarmType(type) {
  var temperatureAlarmMap = {
    0: "COLLECTION_ERROR", // 0x00
    1: "LOWER_RANGE_ERROR", // 0x01
    2: "OVER_RANGE_ERROR", // 0x02
    16: "ALARM_DEACTIVATION", // 0x10
    17: "ALARM_TRIGGER", // 0x11
    32: "BURNING_ALARM_DEACTIVATION", // 0x20
    33: "BURNING_ALARM_TRIGGER", // 0x21
  };
  return getValue(temperatureAlarmMap, type);
}

function readHumidityAlarmType(type) {
  var humidityAlarmMap = {
    0: "COLLECTION_ERROR", // 0x00
    1: "LOWER_RANGE_ERROR", // 0x01
    2: "OVER_RANGE_ERROR", // 0x02
  };
  return getValue(humidityAlarmMap, type);
}

function readTVOCAlarmType(type) {
  var tvocAlarmMap = {
    0: "COLLECTION_ERROR", // 0x00
    1: "LOWER_RANGE_ERROR", // 0x01
    2: "OVER_RANGE_ERROR", // 0x02
    16: "ALARM_DEACTIVATION", // 0x10
    17: "ALARM_TRIGGER", // 0x11
  };
  return getValue(tvocAlarmMap, type);
}

function readTamperStatus(type) {
  var tamperStatusMap = { 0: "NORMAL", 1: "TRIGGERED" };
  return getValue(tamperStatusMap, type);
}

function readTamperAlarmType(type) {
  var tamperAlarmMap = {
    32: "ALARM_DEACTIVATION", // 0x20
    33: "ALARM_TRIGGER", // 0x21
  };
  return getValue(tamperAlarmMap, type);
}

function readBuzzerStatus(type) {
  var buzzerStatusMap = { 0: "NORMAL", 1: "TRIGGERED" };
  return getValue(buzzerStatusMap, type);
}

function readOccupancyStatus(type) {
  var occupancyStatusMap = { 0: "VACANT", 1: "OCCUPIED" };
  return getValue(occupancyStatusMap, type);
}

function readTimeUnitType(type) {
  var unitMap = { 0: "SECOND", 1: "MINUTE" };
  return getValue(unitMap, type);
}

function readTemperatureType(type) {
  var unitMap = { 0: "CELSIUS", 1: "FAHRENHEIT" };
  return getValue(unitMap, type);
}

function readEnableStatus(status) {
  var statusMap = { 0: "DISABLE", 1: "ENABLE" };
  return getValue(statusMap, status);
}

function readYesNoStatus(type) {
  var yesNoMap = { 0: "NO", 1: "YES" };
  return getValue(yesNoMap, type);
}

function readThresholdCondition(type) {
  var conditionMap = { 0: "DISABLE", 1: "BELOW", 2: "ABOVE", 3: "BETWEEN", 4: "OUTSIDE" };
  return getValue(conditionMap, type);
}

function readTimeZone(time_zone) {
  var timezoneMap = { "-720": "UTC-12", "-660": "UTC-11", "-600": "UTC-10", "-570": "UTC-9:30", "-540": "UTC-9", "-480": "UTC-8", "-420": "UTC-7", "-360": "UTC-6", "-300": "UTC-5", "-240": "UTC-4", "-210": "UTC-3:30", "-180": "UTC-3", "-120": "UTC-2", "-60": "UTC-1", 0: "UTC", 60: "UTC+1", 120: "UTC+2", 180: "UTC+3", 210: "UTC+3:30", 240: "UTC+4", 270: "UTC+4:30", 300: "UTC+5", 330: "UTC+5:30", 345: "UTC+5:45", 360: "UTC+6", 390: "UTC+6:30", 420: "UTC+7", 480: "UTC+8", 540: "UTC+9", 570: "UTC+9:30", 600: "UTC+10", 630: "UTC+10:30", 660: "UTC+11", 720: "UTC+12", 765: "UTC+12:45", 780: "UTC+13", 840: "UTC+14" };
  return getValue(timezoneMap, time_zone);
}

function readCmdResult(type) {
  var resultMap = { 0: "success", 1: "parsing error", 2: "order error", 3: "password error", 4: "read params error", 5: "write params error", 6: "read execution error", 7: "write execution error", 8: "read apply error", 9: "write apply error", 10: "associative error" };
  return getValue(resultMap, type);
}

function readCmdName(type) {
  var nameMap = {
    60: { level: 1, name: "reportingInterval" },
    61: { level: 1, name: "temperatureUnit" },
    62: { level: 1, name: "ledStatus" },
    63: { level: 1, name: "buzzerEnable" },
    64: { level: 1, name: "buzzerSleep" },
    65: { level: 1, name: "buzzerButtonStopEnable" },
    66: { level: 1, name: "buzzerSilentTime" },
    67: { level: 1, name: "tamperAlarmEnable" },
    68: { level: 1, name: "tvocRawReportingEnable" },
    69: { level: 1, name: "temperatureAlarmSettings" },
    "6a": { level: 1, name: "pm1_0AlarmSettings" },
    "6b": { level: 1, name: "pm2_5AlarmSettings" },
    "6c": { level: 1, name: "pm10AlarmSettings" },
    "6d": { level: 1, name: "tvocAlarmSettings" },
    "6e": { level: 1, name: "vapingIndexAlarmSettings" },
    "6f": { level: 1, name: "alarmReportingTimes" },
    70: { level: 1, name: "alarmDeactivationEnable" },
    71: { level: 1, name: "temperatureCalibrationSettings" },
    72: { level: 1, name: "humidityCalibrationSettings" },
    73: { level: 1, name: "pm1_0CalibrationSettings" },
    74: { level: 1, name: "pm2_5CalibrationSettings" },
    75: { level: 1, name: "pm10CalibrationSettings" },
    76: { level: 1, name: "tvocCalibrationSettings" },
    77: { level: 1, name: "vapingIndexCalibrationSettings" },
    c6: { level: 1, name: "daylightSavingTime" },
    c7: { level: 1, name: "timeZone" },
    be: { level: 1, name: "reboot" },
    b6: { level: 0, name: "reconnect" },
    b8: { level: 0, name: "synchronizeTime" },
    b9: { level: 0, name: "queryDeviceStatus" },
    "5f": { level: 0, name: "stopBuzzerAlarm" },
    "5e": { level: 0, name: "executeTvocSelfClean" },
  };

  var data = nameMap[type];
  if (data === undefined) return "unknown";
  return data.name;
}

/* eslint-disable */
function readUInt8(bytes) {
  return bytes & 0xff;
}

function readInt8(bytes) {
  var ref = readUInt8(bytes);
  return ref > 0x7f ? ref - 0x100 : ref;
}

function readUInt16LE(bytes) {
  var value = (bytes[1] << 8) + bytes[0];
  return value & 0xffff;
}

function readInt16LE(bytes) {
  var ref = readUInt16LE(bytes);
  return ref > 0x7fff ? ref - 0x10000 : ref;
}

function readUInt32LE(bytes) {
  var value = (bytes[3] << 24) + (bytes[2] << 16) + (bytes[1] << 8) + bytes[0];
  return (value & 0xffffffff) >>> 0;
}

function readInt32LE(bytes) {
  var ref = readUInt32LE(bytes);
  return ref > 0x7fffffff ? ref - 0x100000000 : ref;
}

function readFloat16LE(bytes) {
  var bits = (bytes[1] << 8) | bytes[0];
  var sign = bits >>> 15 === 0 ? 1.0 : -1.0;
  var e = (bits >>> 10) & 0x1f;
  var m = e === 0 ? (bits & 0x3ff) << 1 : (bits & 0x3ff) | 0x400;
  var f = sign * m * Math.pow(2, e - 25);

  var n = Number(f.toFixed(2));
  return n;
}

function readFloatLE(bytes) {
  var bits = (bytes[3] << 24) | (bytes[2] << 16) | (bytes[1] << 8) | bytes[0];
  var sign = bits >>> 31 === 0 ? 1.0 : -1.0;
  var e = (bits >>> 23) & 0xff;
  var m = e === 0 ? (bits & 0x7fffff) << 1 : (bits & 0x7fffff) | 0x800000;
  var f = sign * m * Math.pow(2, e - 150);
  return Number(f.toFixed(3));
}

function readString(bytes) {
  var str = "";
  var i = 0;
  var byte1, byte2, byte3, byte4;
  while (i < bytes.length) {
    byte1 = bytes[i++];
    if (byte1 <= 0x7f) {
      str += String.fromCharCode(byte1);
    } else if (byte1 <= 0xdf) {
      byte2 = bytes[i++];
      str += String.fromCharCode(((byte1 & 0x1f) << 6) | (byte2 & 0x3f));
    } else if (byte1 <= 0xef) {
      byte2 = bytes[i++];
      byte3 = bytes[i++];
      str += String.fromCharCode(((byte1 & 0x0f) << 12) | ((byte2 & 0x3f) << 6) | (byte3 & 0x3f));
    } else if (byte1 <= 0xf7) {
      byte2 = bytes[i++];
      byte3 = bytes[i++];
      byte4 = bytes[i++];
      var codepoint = ((byte1 & 0x07) << 18) | ((byte2 & 0x3f) << 12) | ((byte3 & 0x3f) << 6) | (byte4 & 0x3f);
      codepoint -= 0x10000;
      str += String.fromCharCode((codepoint >> 10) + 0xd800);
      str += String.fromCharCode((codepoint & 0x3ff) + 0xdc00);
    }
  }
  return str;
}

function readHexString(bytes) {
  var temp = [];
  for (var idx = 0; idx < bytes.length; idx++) {
    temp.push(("0" + (bytes[idx] & 0xff).toString(16)).slice(-2));
  }
  return temp.join("");
}

function getValue(map, key) {
  if (RAW_VALUE) return key;
  var value = map[key];
  if (!value) value = "unknown";
  return value;
}

function isEmpty(obj) {
  if (obj === undefined) {
    return true;
  }
  return Object.keys(obj).length === 0;
}

function consume(event) {
  const payload = event.data.payloadHex;
  const bytes = Hex.hexToBytes(payload);
  const decoded = {};
  const config = {};
  const system = {};
  const alert = {};
  const lifecycle = {};
  const occupancy = {};
  const raw = {};

  for (let i = 0; i < bytes.length;) {
    const commandId = bytes[i++];

    switch (commandId) {
      // attribute
      case 0xdf:
        system.tslVersion = readProtocolVersion(bytes.slice(i, i + 2));
        i += 2;
        break;
      case 0xde:
        // Device name
        i += 32;
        break;
      case 0xdd:
        system.pn = readString(bytes.slice(i, i + 32));
        i += 32;
        break;
      case 0xdb:
        system.sn = readHexString(bytes.slice(i, i + 8));
        i += 8;
        break;
      case 0xda:
        system.hardwareVersion = readHardwareVersion(bytes.slice(i, i + 2));
        system.firmwareVersion = readFirmwareVersion(bytes.slice(i + 2, i + 8));
        i += 8;
        break;
      case 0xd9:
        system.oemId = readHexString(bytes.slice(i, i + 2));
        i += 2;
        break;
      case 0xd8:
        // Frequency
        i += 16;
        break;
      case 0xee:
        system.deviceRequest = true;
        i += 0;
        break;
      case 0xc8:
        system.deviceStatus = readDeviceStatus(bytes[i]);
        i += 1;
        break;
      case 0xcf:
        // Lorawan class
        i += 2;
        break;

      // telemetry
      case 0x00:
        lifecycle.batteryVoltage = readUInt8(bytes[i]);
        i += 1;
        break;
      case 0x01:
        decoded.vapingIndex = readUInt8(bytes[i]);
        i += 1;
        break;
      case 0x02: {
        const alarmType = bytes[i];

        alert.vapingAlarm = readVapeIndexAlarmType(alarmType);
        if (alarmType === 0x10 || alarmType === 0x11) {
          decoded.vapingIndex = readUInt8(bytes[i + 1]);
          i += 1;
        }
        i += 1;
        break;
      } case 0x03:
        decoded.pm1 = readUInt16LE(bytes.slice(i, i + 2));
        i += 2;
        break;
      case 0x04: {
        const alarmType = bytes[i];

        alert.pm1Alarm = readPMAlarmType(alarmType);
        if (alarmType === 0x10 || alarmType === 0x11) {
          decoded.pm1 = readUInt16LE(bytes.slice(i + 1, i + 3));
          i += 2;
        }
        i += 1;
        break;
      } case 0x05:
        decoded.pm2_5 = readUInt16LE(bytes.slice(i, i + 2));
        i += 2;
        break;
      case 0x06: {
        const alarmType = bytes[i];

        alert.pm2_5Alarm = readPMAlarmType(alarmType);
        if (alarmType === 0x10 || alarmType === 0x11) {
          decoded.pm2_5 = readUInt16LE(bytes.slice(i + 1, i + 3));
          i += 2;
        }
        i += 1;
        break;
      } case 0x07:
        decoded.pm10 = readUInt16LE(bytes.slice(i, i + 2));
        i += 2;
        break;
      case 0x08:
        const alarmType = bytes[i];

        alert.pm10Alarm = readPMAlarmType(alarmType);
        if (alarmType === 0x10 || alarmType === 0x11) {
          decoded.pm10 = readUInt16LE(bytes.slice(i + 1, i + 3));
          i += 2;
        }
        i += 1;
        break;
      case 0x09:
        decoded.temperature = readInt16LE(bytes.slice(i, i + 2)) / 10;
        i += 2;
        break;
      case 0x0a: {
        const alarmType = bytes[i];

        alert.temperatureAlarm = readTemperatureAlarmType(alarmType);
        if (alarmType === 0x10 || alarmType === 0x11) {
          decoded.temperature = readInt16LE(bytes.slice(i + 1, i + 3)) / 10;
          i += 2;
        }
        i += 1;
        break;
      } case 0x0b:
        decoded.humidity = readUInt16LE(bytes.slice(i, i + 2)) / 10;
        i += 2;
        break;
      case 0x0c:
        alert.humidityAlarm = readHumidityAlarmType(bytes[i]);
        i += 1;
        break;
      case 0x0d:
        decoded.tvoc = readUInt16LE(bytes.slice(i, i + 2));
        i += 2;
        break;
      case 0x0e: {
        const alarmType = bytes[i];

        alert.tvocAlarm = readTVOCAlarmType(alarmType);
        if (alarmType === 0x10 || alarmType === 0x11) {
          decoded.tvoc = readUInt16LE(bytes.slice(i + 1, i + 3));
          i += 2;
        }
        i += 1;
        break;
      } case 0x0f:
        alert.tamperStatus = readTamperStatus(bytes[i]);
        i += 1;
        break;
      case 0x10:
        alert.tamperStatusAlarm = readTamperAlarmType(bytes[i]);
        i += 1;
        break;
      case 0x11:
        alert.buzzer = readBuzzerStatus(bytes[i]);
        i += 1;
        break;
      case 0x12:
        occupancy.occupancyStatus = readOccupancyStatus(bytes[i]);
        i += 1;
        break;
      case 0x20:
      case 0x21:
      case 0x22:
      case 0x23:
      case 0x24:
      case 0x25:
      case 0x26:
        raw.tvocRawDataRmox = raw.tvocRawDataRmox || [];
        raw.tvocRawDataRmox.push(readFloatLE(bytes.slice(i, i + 4)));
        raw.tvocRawDataRmox.push(readFloatLE(bytes.slice(i + 4, i + 8)));
        i += 8;
        break;
      case 0x27:
        raw.logRcda = readFloatLE(bytes.slice(i, i + 4));
        raw.rhtr = readFloatLE(bytes.slice(i + 4, i + 8));
        i += 8;
        break;
      case 0x28:
        raw.rawTemperature = readFloatLE(bytes.slice(i, i + 4));
        raw.rawIaq = readFloatLE(bytes.slice(i + 4, i + 8));
        i += 8;
        break;
      case 0x29:
        raw.rawTvoc = readFloatLE(bytes.slice(i, i + 4));
        raw.rawEtoh = readFloatLE(bytes.slice(i + 4, i + 8));
        i += 8;
        break;
      case 0x2a:
        raw.rawEco2 = readFloatLE(bytes.slice(i, i + 4));
        raw.rawRelIaq = readFloatLE(bytes.slice(i + 4, i + 8));
        i += 8;
        break;
      case 0x2b:
        raw.pmSensorWorkingTime = readUInt32LE(bytes.slice(i, i + 4));
        i += 4;
        break;

      // config
      case 0x60:
        const timeUnit = readUInt8(bytes[i]);
        config.reportingInterval = {};
        config.reportingInterval.unit = readTimeUnitType(timeUnit);
        if (timeUnit === 0) {
          config.reportingInterval.secondsOfTime = readUInt16LE(bytes.slice(i + 1, i + 3));
        } else if (timeUnit === 1) {
          config.reportingInterval.minutesOfTime = readUInt16LE(bytes.slice(i + 1, i + 3));
        }
        i += 3;
        break;
      case 0x61:
        config.temperatureUnit = readTemperatureType(bytes[i]);
        i += 1;
        break;
      case 0x62:
        config.ledStatus = readEnableStatus(bytes[i]);
        i += 1;
        break;
      case 0x63:
        config.buzzerEnable = readEnableStatus(bytes[i]);
        i += 1;
        break;
      case 0x64:
        const index = readUInt8(bytes[i]);
        const buzzerSleep = {};
        buzzerSleep.enable = readEnableStatus(bytes[i + 1]);
        buzzerSleep.startTime = readUInt16LE(bytes.slice(i + 2, i + 4));
        buzzerSleep.endTime = readUInt16LE(bytes.slice(i + 4, i + 6));
        i += 6;
        config.buzzerSleep = config.buzzerSleep || {};
        config.buzzerSleep["item" + index] = buzzerSleep;
        break;
      case 0x65:
        config.buzzerButtonStopEnable = readEnableStatus(bytes[i]);
        i += 1;
        break;
      case 0x66:
        config.buzzerSilentTime = readUInt16LE(bytes.slice(i, i + 2));
        i += 2;
        break;
      case 0x67:
        config.tamperAlarmEnable = readEnableStatus(bytes[i]);
        i += 1;
        break;
      case 0x68:
        config.tvocRawReportingEnable = readEnableStatus(bytes[i]);
        i += 1;
        break;
      case 0x69:
        config.temperatureAlarmSettings = {};
        config.temperatureAlarmSettings.enable = readEnableStatus(bytes[i]);
        config.temperatureAlarmSettings.condition = readThresholdCondition(bytes[i + 1]);
        config.temperatureAlarmSettings.thresholdMin = readInt16LE(bytes.slice(i + 2, i + 4)) / 10;
        config.temperatureAlarmSettings.thresholdMax = readInt16LE(bytes.slice(i + 4, i + 6)) / 10;
        i += 6;
        break;
      case 0x6a:
        config.pm1AlarmSettings = {};
        config.pm1AlarmSettings.enable = readEnableStatus(bytes[i]);
        // decoded.pm1_0AlarmSettings.condition = readThresholdCondition(bytes[i + 1]);
        // decoded.pm1_0AlarmSettings.thresholdMin = readInt16LE(bytes.slice(i + 2, i + 4));
        config.pm1AlarmSettings.thresholdMax = readInt16LE(bytes.slice(i + 4, i + 6));
        i += 6;
        break;
      case 0x6b:
        config.pm2_5AlarmSettings = {};
        config.pm2_5AlarmSettings.enable = readEnableStatus(bytes[i]);
        // decoded.pm2_5AlarmSettings.condition = readThresholdCondition(bytes[i + 1]);
        // decoded.pm2_5AlarmSettings.thresholdMin = readInt16LE(bytes.slice(i + 2, i + 4));
        config.pm2_5AlarmSettings.thresholdMax = readInt16LE(bytes.slice(i + 4, i + 6));
        i += 6;
        break;
      case 0x6c:
        config.pm10AlarmSettings = {};
        config.pm10AlarmSettings.enable = readEnableStatus(bytes[i]);
        // decoded.pm10AlarmSettings.condition = readThresholdCondition(bytes[i + 1]);
        // decoded.pm10AlarmSettings.thresholdMin = readInt16LE(bytes.slice(i + 2, i + 4));
        config.pm10AlarmSettings.thresholdMax = readInt16LE(bytes.slice(i + 4, i + 6));
        i += 6;
        break;
      case 0x6d:
        config.tvocAlarmSettings = {};
        config.tvocAlarmSettings.enable = readEnableStatus(bytes[i]);
        // decoded.tvocAlarmSettings.condition = readThresholdCondition(bytes[i + 1]);
        // decoded.tvocAlarmSettings.thresholdMin = readInt16LE(bytes.slice(i + 2, i + 4));
        config.tvocAlarmSettings.thresholdMax = readInt16LE(bytes.slice(i + 4, i + 6));
        i += 6;
        break;
      case 0x6e:
        config.vapingIndexAlarmSettings = {};
        config.vapingIndexAlarmSettings.enable = readEnableStatus(bytes[i]);
        // decoded.vapingIndexAlarmSettings.condition = readThresholdCondition(bytes[i + 1]);
        // decoded.vapingIndexAlarmSettings.thresholdMin = readUInt8(bytes[i + 2]);
        config.vapingIndexAlarmSettings.thresholdMax = readUInt8(bytes[i + 3]);
        i += 4;
        break;
      case 0x6f:
        config.alarmReportingTimes = readUInt16LE(bytes.slice(i, i + 2));
        i += 2;
        break;
      case 0x70:
        config.alarmDeactivationEnable = readEnableStatus(bytes[i]);
        i += 1;
        break;
      case 0x71:
        config.temperatureCalibrationSettings = {};
        config.temperatureCalibrationSettings.enable = readEnableStatus(bytes[i]);
        config.temperatureCalibrationSettings.calibrationValue = readInt16LE(bytes.slice(i + 1, i + 3)) / 10;
        i += 3;
        break;
      case 0x72:
        config.humidityCalibrationSettings = {};
        config.humidityCalibrationSettings.enable = readEnableStatus(bytes[i]);
        config.humidityCalibrationSettings.calibrationValue = readInt16LE(bytes.slice(i + 1, i + 3)) / 10;
        i += 3;
        break;
      case 0x73:
        config.pm1CalibrationSettings = {};
        config.pm1CalibrationSettings.enable = readEnableStatus(bytes[i]);
        config.pm1CalibrationSettings.calibrationValue = readInt16LE(bytes.slice(i + 1, i + 3));
        i += 3;
        break;
      case 0x74:
        config.pm2_5CalibrationSettings = {};
        config.pm2_5CalibrationSettings.enable = readEnableStatus(bytes[i]);
        config.pm2_5CalibrationSettings.calibrationValue = readInt16LE(bytes.slice(i + 1, i + 3));
        i += 3;
        break;
      case 0x75:
        config.pm10CalibrationSettings = {};
        config.pm10CalibrationSettings.enable = readEnableStatus(bytes[i]);
        config.pm10CalibrationSettings.calibrationValue = readInt16LE(bytes.slice(i + 1, i + 3));
        i += 3;
        break;
      case 0x76:
        config.tvocCalibrationSettings = {};
        config.tvocCalibrationSettings.enable = readEnableStatus(bytes[i]);
        config.tvocCalibrationSettings.calibrationValue = readInt16LE(bytes.slice(i + 1, i + 3));
        i += 3;
        break;
      case 0x77:
        config.vapingIndexCalibrationSettings = {};
        config.vapingIndexCalibrationSettings.enable = readEnableStatus(bytes[i]);
        config.vapingIndexCalibrationSettings.calibrationValue = readInt8(bytes[i + 1]);
        i += 2;
        break;
      case 0xc6:
        config.daylightSavingTime = {};
        config.daylightSavingTime.daylightSavingTimeEnable = readEnableStatus(bytes[i]);
        config.daylightSavingTime.daylightSavingTimeOffset = readUInt8(bytes[i + 1]);
        config.daylightSavingTime.startMonth = readUInt8(bytes[i + 2]);
        const startDayValue = readUInt8(bytes[i + 3]);
        config.daylightSavingTime.startWeekNum = (startDayValue >>> 4) & 0x07;
        config.daylightSavingTime.startWeekDay = startDayValue & 0x0f;
        config.daylightSavingTime.startHourMin = readUInt16LE(bytes.slice(i + 4, i + 6));
        config.daylightSavingTime.endMonth = readUInt8(bytes[i + 6]);
        const endDayValue = readUInt8(bytes[i + 7]);
        config.daylightSavingTime.endWeekNum = (endDayValue >>> 4) & 0x0f;
        config.daylightSavingTime.endWeekDay = endDayValue & 0x0f;
        config.daylightSavingTime.endHourMin = readUInt16LE(bytes.slice(i + 8, i + 10));
        i += 10;
        break;
      case 0xc7:
        config.timeZone = readTimeZone(readInt16LE(bytes.slice(i, i + 2)));
        i += 2;
        break;

      // service
      case 0x5f:
        config.stopBuzzerAlarm = readYesNoStatus(1);
        break;
      case 0x5e:
        config.executeTvocSelfClean = readYesNoStatus(1);
        break;
      case 0xb6:
        config.reconnect = readYesNoStatus(1);
        break;
      case 0xb8:
        config.synchronizeTime = readYesNoStatus(1);
        break;
      case 0xb9:
        config.queryDeviceStatus = readYesNoStatus(1);
        break;
      case 0xbe:
        config.reboot = readYesNoStatus(1);
        break;
      // control frame
      case 0xef:
        const cmdData = readUInt8(bytes[i]);
        const cmdResult = (cmdData >>> 4) & 0x0f;
        const cmdLength = cmdData & 0x0f;
        const cmdId = readHexString(bytes.slice(i + 1, i + 1 + cmdLength));
        const cmdHeader = readHexString(bytes.slice(i + 1, i + 2));
        i += 1 + cmdLength;

        const response = {};
        config.result = readCmdResult(cmdResult);
        config.cmdId = cmdId;
        config.cmdName = readCmdName(cmdHeader);

        config.requestResult = config.requestResult || [];
        config.requestResult.push(response);
        break;
      case 0xfe:
        config.frame = readUInt8(bytes[i]);
        i += 1;
        break;
      default:
        unknownCommand = 1;
        break;
    }
  }

  if (!isEmpty(decoded)) {
    emit("sample", { data: decoded, topic: "default" });
  }

  if (!isEmpty(system)) {
    emit("sample", { data: system, topic: "system" });
  }

  if (!isEmpty(config)) {
    emit("sample", { data: config, topic: "config" });
  }

  if (!isEmpty(alert)) {
    emit("sample", { data: alert, topic: "alert" });
  }

  if (!isEmpty(occupancy)) {
    emit("sample", { data: occupancy, topic: "occupancy" });
  }

  if (!isEmpty(raw)) {
    emit("sample", { data: raw, topic: "raw" });
  }

  if (!isEmpty(lifecycle)) {
    emit("sample", { data: lifecycle, topic: "lifecycle" });
  }
}
