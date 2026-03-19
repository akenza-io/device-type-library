function cToF(celsius) {
  return Math.round(((celsius * 9) / 5 + 32) * 10) / 10;
}

function bigEndianTransform(data) {
  const dataArray = [];
  for (let i = 0; i < data.length; i += 2) {
    dataArray.push(data.substring(i, i + 2));
  }
  return dataArray;
}

function toBinary(arr) {
  const binaryData = arr.map((item) => {
    let data = parseInt(item, 16).toString(2);
    const dataLength = data.length;
    if (data.length !== 8) {
      for (let i = 0; i < 8 - dataLength; i++) {
        data = `0${data}`;
      }
    }
    return data;
  });
  return binaryData.toString().replace(/,/g, "");
}

function loraWANV2DataFormat(str, divisor = 1) {
  const strReverse = bigEndianTransform(str);
  let str2 = toBinary(strReverse);
  if (str2.substring(0, 1) === "1") {
    const arr = str2.split("");
    const reverseArr = arr.map((item) => {
      if (parseInt(item) === 1) {
        return 0;
      }
      return 1;
    });
    str2 = parseInt(reverseArr.join(""), 2) + 1;
    return `-${str2 / divisor}`;
  }
  return parseInt(str2, 2) / divisor;
}

function getInt8RSSI(str) {
  return loraWANV2DataFormat(str);
}

function getInt(str) {
  return parseInt(str, 16);
}

function getByteArray(str) {
  const bytes = [];
  for (let i = 0; i < str.length; i += 2) {
    bytes.push(str.substring(i, i + 2));
  }
  return toBinary(bytes);
}

function getWorkingMode(workingMode) {
  return getInt(workingMode);
}

function getPositioningStrategy(strategy) {
  return getInt(strategy);
}

function loraWANV2PositiveDataFormat(str, divisor = 1) {
  const strReverse = bigEndianTransform(str);
  const str2 = toBinary(strReverse);
  return parseInt(str2, 2) / divisor;
}

function getUTCTimestamp(str) {
  return parseInt(loraWANV2PositiveDataFormat(str)) * 1000;
}

function getMotionId(str) {
  return getInt(str);
}

function getPositingStatus(str) {
  return getInt(str);
}

function getUpShortInfo(messageValue) {
  return {
    batteryLevel: getBattery(messageValue.substring(0, 2)),
    firmwareVersion: getSoftVersion(messageValue.substring(2, 6)),
    hardwareVersion: getHardVersion(messageValue.substring(6, 10)),
    workMode: getWorkingMode(messageValue.substring(10, 12)),
    positioningStrategy: getPositioningStrategy(messageValue.substring(12, 14)),
    heartbeatInterval: getMinsByMin(messageValue.substring(14, 18)),
    periodicInterval: getMinsByMin(messageValue.substring(18, 22)),
    eventInterval: getMinsByMin(messageValue.substring(22, 26)),
    sensorEnabled: getInt(messageValue.substring(26, 28)),
    sosMode: getSOSMode(messageValue.substring(28, 30)),
  };
}

function getMotionSetting(str) {
  return {
    motionEnabled: getInt(str.substring(0, 2)),
    anyMotionThreshold: getSensorValue(str.substring(2, 6), 1),
    motionStartInterval: getMinsByMin(str.substring(6, 10)),
  };
}

function getStaticSetting(str) {
  return {
    staticEnabled: getInt(str.substring(0, 2)),
    deviceStaticTimeout: getMinsByMin(str.substring(2, 6)),
  };
}

function getShockSetting(str) {
  return {
    shockEnabled: getInt(str.substring(0, 2)),
    shockThreshold: getInt(str.substring(2, 6)),
  };
}

function getTempSetting(str) {
  return {
    temperatureEnabled: getInt(str.substring(0, 2)),
    eventTemperatureInterval: getMinsByMin(str.substring(2, 6)),
    eventTemperatureSampleInterval: getSecondsByInt(str.substring(6, 10)),
    temperatureThMax: getSensorValue(str.substring(10, 14), 10),
    temperatureThMin: getSensorValue(str.substring(14, 18), 10),
    temperatureWarningType: getInt(str.substring(18, 20)),
  };
}

function getLightSetting(str) {
  return {
    lightEnabled: getInt(str.substring(0, 2)),
    eventLightInterval: getMinsByMin(str.substring(2, 6)),
    eventLightSampleInterval: getSecondsByInt(str.substring(6, 10)),
    lightThMax: getSensorValue(str.substring(10, 14), 10),
    lightThMin: getSensorValue(str.substring(14, 18), 10),
    lightWarningType: getInt(str.substring(18, 20)),
  };
}

function getShardFlag(str) {
  const bitStr = getByteArray(str);
  return {
    count: parseInt(bitStr.substring(0, 4), 2),
    index: parseInt(bitStr.substring(4), 2),
  };
}

function getBattery(batteryStr) {
  return loraWANV2DataFormat(batteryStr);
}
function getSoftVersion(softVersion) {
  return `${loraWANV2DataFormat(
    softVersion.substring(0, 2),
  )}.${loraWANV2DataFormat(softVersion.substring(2, 4))}`;
}
function getHardVersion(hardVersion) {
  return `${loraWANV2DataFormat(
    hardVersion.substring(0, 2),
  )}.${loraWANV2DataFormat(hardVersion.substring(2, 4))}`;
}

function getSecondsByInt(str) {
  return getInt(str);
}

function getMinsByMin(str) {
  return getInt(str);
}

function getSensorValue(str, dig) {
  if (str === "8000") {
    return null;
  }
  return loraWANV2DataFormat(str, dig);
}

function getSOSMode(str) {
  return loraWANV2DataFormat(str);
}

function getMacAddress(str) {
  if (str.toLowerCase() === "ffffffffffff") {
    return null;
  }
  const macArr = [];
  for (let i = 1; i < str.length; i++) {
    if (i % 2 === 1) {
      macArr.push(str.substring(i - 1, i + 1));
    }
  }
  let mac = "";
  for (let i = 0; i < macArr.length; i++) {
    mac += macArr[i];
    if (i < macArr.length - 1) {
      mac += ":";
    }
  }
  return mac;
}

function getMacAndRssiObj(pair) {
  const pairs = [];
  if (pair.length % 14 === 0) {
    for (let i = 0; i < pair.length; i += 14) {
      const mac = getMacAddress(pair.substring(i, i + 12));
      if (mac) {
        const rssi = getInt8RSSI(pair.substring(i + 12, i + 14));
        pairs.push({ mac, rssi });
      } else {
        continue;
      }
    }
  }
  return pairs;
}

function getEventStatus(str) {
  // return getInt(str)
  const bitStr = getByteArray(str);
  let bitArr = [];
  for (let i = 0; i < bitStr.length; i++) {
    bitArr[i] = bitStr.substring(i, i + 1);
  }
  bitArr = bitArr.reverse();
  const event = {
    startMovementEvent: false,
    endMovementEvent: false,
    motionlessEvent: false,
    shockEvent: false,
    temperatureEvent: false,
    lightEvent: false,
    sosEvent: false,
    pressOnceEvent: false,
  };
  for (let i = 0; i < bitArr.length; i++) {
    if (bitArr[i] !== "1") {
      continue;
    }
    switch (i) {
      case 0:
        event.startMovementEvent = true;
        break;
      case 1:
        event.endMovementEvent = true;
        break;
      case 2:
        event.motionlessEvent = true;
        break;
      case 3:
        event.shockEvent = true;
        break;
      case 4:
        event.temperatureEvent = true;
        break;
      case 5:
        event.lightEvent = true;
        break;
      case 6:
        event.sosEvent = true;
        break;
      case 7:
        event.pressOnceEvent = true;
        break;
      default:
        break;
    }
  }
  return event;
}

function decodeUplink(bytes, port) {
  const bytesString = bytes;
  const originMessage = bytesString.toLocaleUpperCase();
  let decoded = {};
  decoded.valid = true;

  if (port === 199 || port === 192) {
    decoded = { port, payload: bytesString };
    return decoded;
  }
  if (port !== 5) {
    decoded.valid = false;
    return decoded;
  }
  decoded = messageAnalyzed(originMessage);
  if (decoded.length === 0) {
    decoded.valid = false;
    return decoded;
  }

  return decoded;
}

function unpack(messageValue) {
  const frameArray = [];

  for (let i = 0; i < messageValue.length; i++) {
    const remainMessage = messageValue;
    const dataId = remainMessage.substring(0, 2).toUpperCase();
    let dataValue;
    let dataObj = {};
    let packageLen;
    switch (dataId) {
      case "01":
        packageLen = 94;
        if (remainMessage.length < packageLen) {
          return frameArray;
        }
        dataValue = remainMessage.substring(2, packageLen);
        messageValue = remainMessage.substring(packageLen);
        dataObj = {
          dataId,
          dataValue,
        };
        break;
      case "02":
        packageLen = 32;
        if (remainMessage.length < packageLen) {
          return frameArray;
        }
        dataValue = remainMessage.substring(2, packageLen);
        messageValue = remainMessage.substring(packageLen);
        dataObj = {
          dataId,
          dataValue,
        };
        break;
      case "03":
        packageLen = 64;
        if (remainMessage.length < packageLen) {
          return frameArray;
        }
        dataValue = remainMessage.substring(2, packageLen);
        messageValue = remainMessage.substring(packageLen);
        dataObj = {
          dataId,
          dataValue,
        };
        break;
      case "04":
        packageLen = 20;
        if (remainMessage.length < packageLen) {
          return frameArray;
        }
        dataValue = remainMessage.substring(2, packageLen);
        messageValue = remainMessage.substring(packageLen);
        dataObj = {
          dataId,
          dataValue,
        };
        break;
      case "05":
        packageLen = 10;
        if (remainMessage.length < packageLen) {
          return frameArray;
        }
        dataValue = remainMessage.substring(2, packageLen);
        messageValue = remainMessage.substring(packageLen);
        dataObj = {
          dataId,
          dataValue,
        };
        break;
      case "06":
        packageLen = 44;
        if (remainMessage.length < packageLen) {
          return frameArray;
        }
        dataValue = remainMessage.substring(2, packageLen);
        messageValue = remainMessage.substring(packageLen);
        dataObj = {
          dataId,
          dataValue,
        };
        break;
      case "07":
        packageLen = 84;
        if (remainMessage.length < packageLen) {
          return frameArray;
        }
        dataValue = remainMessage.substring(2, packageLen);
        messageValue = remainMessage.substring(packageLen);
        dataObj = {
          dataId,
          dataValue,
        };
        break;
      case "08":
        packageLen = 70;
        if (remainMessage.length < packageLen) {
          return frameArray;
        }
        dataValue = remainMessage.substring(2, packageLen);
        messageValue = remainMessage.substring(packageLen);
        dataObj = {
          dataId,
          dataValue,
        };
        break;
      case "09":
        packageLen = 36;
        if (remainMessage.length < packageLen) {
          return frameArray;
        }
        dataValue = remainMessage.substring(2, packageLen);
        messageValue = remainMessage.substring(packageLen);
        dataObj = {
          dataId,
          dataValue,
        };
        break;
      case "0A":
        packageLen = 76;
        if (remainMessage.length < packageLen) {
          return frameArray;
        }
        dataValue = remainMessage.substring(2, packageLen);
        messageValue = remainMessage.substring(packageLen);
        dataObj = {
          dataId,
          dataValue,
        };
        break;
      case "0B":
        packageLen = 62;
        if (remainMessage.length < packageLen) {
          return frameArray;
        }
        dataValue = remainMessage.substring(2, packageLen);
        messageValue = remainMessage.substring(packageLen);
        dataObj = {
          dataId,
          dataValue,
        };
        break;
      case "0C":
        packageLen = 2;
        if (remainMessage.length < packageLen) {
          return frameArray;
        }
        break;
      case "0D":
        packageLen = 10;
        if (remainMessage.length < packageLen) {
          return frameArray;
        }
        dataValue = remainMessage.substring(2, packageLen);
        messageValue = remainMessage.substring(packageLen);
        dataObj = {
          dataId,
          dataValue,
        };
        break;
      case "0E":
        packageLen = getInt(remainMessage.substring(8, 10)) * 2 + 10;
        if (remainMessage.length < packageLen) {
          return frameArray;
        }
        dataValue =
          remainMessage.substring(2, 8) +
          remainMessage.substring(10, packageLen);
        messageValue = remainMessage.substring(packageLen);
        dataObj = {
          dataId,
          dataValue,
        };
        break;
      case "0F":
        packageLen = 34;
        if (remainMessage.length < packageLen) {
          return frameArray;
        }
        dataValue = remainMessage.substring(2, packageLen);
        messageValue = remainMessage.substring(packageLen);
        dataObj = {
          dataId,
          dataValue,
        };
        break;
      case "10":
        packageLen = 26;
        if (remainMessage.length < packageLen) {
          return frameArray;
        }
        dataValue = remainMessage.substring(2, packageLen);
        messageValue = remainMessage.substring(packageLen);
        dataObj = {
          dataId,
          dataValue,
        };
        break;
      case "11":
        packageLen = 28;
        if (remainMessage.length < packageLen) {
          return frameArray;
        }
        dataValue = remainMessage.substring(2, packageLen);
        messageValue = remainMessage.substring(packageLen);
        dataObj = {
          dataId,
          dataValue,
        };
        break;
      default:
        return frameArray;
    }
    if (dataValue.length < 2) {
      break;
    }
    frameArray.push(dataObj);
  }
  return frameArray;
}

function deserialize(dataId, dataValue) {
  const measurement = {};
  const collectTime = 0;
  const groupId = 0;
  const payload = "";
  switch (dataId) {
    case "01":
      Object.assign(measurement, getUpShortInfo(dataValue));
      Object.assign(measurement, getMotionSetting(dataValue.substring(30, 40)));
      Object.assign(measurement, getStaticSetting(dataValue.substring(40, 46)));
      Object.assign(measurement, getShockSetting(dataValue.substring(46, 52)));
      Object.assign(measurement, getTempSetting(dataValue.substring(52, 72)));
      Object.assign(measurement, getLightSetting(dataValue.substring(72, 92)));
      break;
    case "02":
      Object.assign(measurement, getUpShortInfo(dataValue));
      break;
    case "03":
      Object.assign(measurement, getMotionSetting(dataValue.substring(0, 10)));
      Object.assign(measurement, getStaticSetting(dataValue.substring(10, 16)));
      Object.assign(measurement, getShockSetting(dataValue.substring(16, 22)));
      Object.assign(measurement, getTempSetting(dataValue.substring(22, 42)));
      Object.assign(measurement, getLightSetting(dataValue.substring(42, 62)));
      break;
    case "04": {
      let interval = 0;
      const workMode = getInt(dataValue.substring(0, 2));
      const heartbeatInterval = getMinsByMin(dataValue.substring(4, 8));
      const periodicInterval = getMinsByMin(dataValue.substring(8, 12));
      const eventInterval = getMinsByMin(dataValue.substring(12, 16));
      switch (workMode) {
        case 0:
          interval = heartbeatInterval;
          break;
        case 1:
          interval = periodicInterval;
          break;
        case 2:
          interval = eventInterval;
          break;
        default:
          break;
      }
      measurement.workMode = workMode;
      measurement.heartbeatInterval = heartbeatInterval;
      measurement.periodicInterval = periodicInterval;
      measurement.eventInterval = eventInterval;
      measurement.sosMode = getSOSMode(dataValue.substring(16, 18));
      measurement.uplinkInterval = interval;
      break;
    }
    case "05":
      measurement.batteryLevel = getBattery(dataValue.substring(0, 2));
      measurement.workMode = getWorkingMode(dataValue.substring(2, 4));
      measurement.positioningStrategy = getPositioningStrategy(
        dataValue.substring(4, 6),
      );
      measurement.sosMode = getSOSMode(dataValue.substring(6, 8));
      break;
    case "06":
      measurement.collectTime = getUTCTimestamp(dataValue.substring(8, 16));
      measurement.motionId = getMotionId(dataValue.substring(6, 8));
      Object.assign(measurement, getEventStatus(dataValue.substring(0, 6)));
      measurement.longitude = parseFloat(
        getSensorValue(dataValue.substring(16, 24), 1000000),
      );
      measurement.latitude = parseFloat(
        getSensorValue(dataValue.substring(24, 32), 1000000),
      );
      measurement.temperature = getSensorValue(dataValue.substring(32, 36), 10);
      measurement.light = getSensorValue(dataValue.substring(36, 40));
      measurement.batteryLevel = getBattery(dataValue.substring(40, 42));
      break;
    case "07":
      Object.assign(measurement, getEventStatus(dataValue.substring(0, 6)));
      measurement.collectTime = getUTCTimestamp(dataValue.substring(8, 16));
      measurement.motionId = getMotionId(dataValue.substring(6, 8));
      Object.assign(measurement, getEventStatus(dataValue.substring(0, 6)));
      measurement.wifiScan = getMacAndRssiObj(dataValue.substring(16, 72));
      measurement.temperature = getSensorValue(dataValue.substring(72, 76), 10);
      measurement.light = getSensorValue(dataValue.substring(76, 80));
      measurement.batteryLevel = getBattery(dataValue.substring(80, 82));
      break;
    case "08":
      Object.assign(measurement, getEventStatus(dataValue.substring(0, 6)));
      measurement.collectTime = getUTCTimestamp(dataValue.substring(8, 16));
      measurement.motionId = getMotionId(dataValue.substring(6, 8));
      measurement.bleScan = getMacAndRssiObj(dataValue.substring(16, 58));
      measurement.temperature = getSensorValue(dataValue.substring(58, 62), 10);
      measurement.light = getSensorValue(dataValue.substring(62, 66));
      measurement.batteryLevel = getBattery(dataValue.substring(66, 68));
      break;
    case "09":
      Object.assign(measurement, getEventStatus(dataValue.substring(0, 6)));
      measurement.collectTime = getUTCTimestamp(dataValue.substring(8, 16));
      measurement.motionId = getMotionId(dataValue.substring(6, 8));
      measurement.longitude = parseFloat(
        getSensorValue(dataValue.substring(16, 24), 1000000),
      );
      measurement.latitude = parseFloat(
        getSensorValue(dataValue.substring(24, 32), 1000000),
      );
      measurement.batteryLevel = getBattery(dataValue.substring(32, 34));
      break;
    case "0A":
      Object.assign(measurement, getEventStatus(dataValue.substring(0, 6)));
      measurement.collectTime = getUTCTimestamp(dataValue.substring(8, 16));
      measurement.motionId = getMotionId(dataValue.substring(6, 8));
      measurement.wifiScan = getMacAndRssiObj(dataValue.substring(16, 72));
      measurement.batteryLevel = getBattery(dataValue.substring(72, 74));
      break;
    case "0B":
      Object.assign(measurement, getEventStatus(dataValue.substring(0, 6)));
      measurement.collectTime = getUTCTimestamp(dataValue.substring(8, 16));
      measurement.motionId = getMotionId(dataValue.substring(6, 8));
      measurement.bleScan = getMacAndRssiObj(dataValue.substring(16, 58));
      measurement.batteryLevel = getBattery(dataValue.substring(58, 60));
      break;
    case "0D": {
      const errorCode = getInt(dataValue);
      let error = "";
      switch (errorCode) {
        case 1:
          error = "FAILED_TO_OBTAIN_THE_UTC_TIMESTAMP";
          break;
        case 2:
          error = "ALMANAC_TOO_OLD";
          break;
        case 3:
          error = "DOPPLER_ERROR";
          break;
        default:
          break;
      }
      measurement.errorCode = errorCode;
      measurement.error = error;
      break;
    }
    case "0E": {
      const shardFlag = getShardFlag(dataValue.substring(0, 2));
      measurement.shardFlagIndex = shardFlag.index;
      measurement.shardFlagCount = shardFlag.count;
      measurement.measurementValue = payload;
      measurement.groupId = getInt(dataValue.substring(2, 6));
      measurement.payload = dataValue.substring(6);
      break;
    }
    case "0F": {
      Object.assign(measurement, getEventStatus(dataValue.substring(0, 6)));
      measurement.collectTime = getUTCTimestamp(dataValue.substring(8, 16));
      measurement.motionId = getMotionId(dataValue.substring(6, 8));

      const shardFlag = getShardFlag(dataValue.substring(26, 28));
      measurement.groupId = getInt(dataValue.substring(28, 32));
      measurement.shardFlagIndex = shardFlag.index;
      measurement.shardFlagCount = shardFlag.count;

      measurement.temperature = getSensorValue(dataValue.substring(16, 20), 10);
      measurement.light = getSensorValue(dataValue.substring(20, 24));
      measurement.batteryLevel = getBattery(dataValue.substring(24, 26));
      break;
    }
    case "10": {
      Object.assign(measurement, getEventStatus(dataValue.substring(0, 6)));
      measurement.collectTime = getUTCTimestamp(dataValue.substring(8, 16));
      measurement.motionId = getMotionId(dataValue.substring(6, 8));

      const shardFlag = getShardFlag(dataValue.substring(18, 20));
      measurement.groupId = getInt(dataValue.substring(20, 24));
      measurement.shardFlagIndex = shardFlag.index;
      measurement.shardFlagCount = shardFlag.count;
      measurement.batteryLevel = getBattery(dataValue.substring(16, 18));
      break;
    }
    case "11":
      measurement.collectTime = getUTCTimestamp(dataValue.substring(8, 16));
      measurement.positioningStatus = getPositingStatus(
        dataValue.substring(0, 2),
      );
      Object.assign(measurement, getEventStatus(dataValue.substring(2, 8)));

      if (!isNaN(parseFloat(getSensorValue(dataValue.substring(16, 20), 10)))) {
        measurement.temperature = getSensorValue(
          dataValue.substring(16, 20),
          10,
        );
      }
      if (!isNaN(parseFloat(getSensorValue(dataValue.substring(20, 24))))) {
        measurement.light = getSensorValue(dataValue.substring(20, 24));
      }

      measurement.batteryLevel = getBattery(dataValue.substring(24, 26));
      break;
    default:
      break;
  }
  return measurement;
}

function messageAnalyzed(messageValue) {
  try {
    const frames = unpack(messageValue);
    const measurementResultArray = [];
    for (let i = 0; i < frames.length; i++) {
      const item = frames[i];
      const { dataId } = item;
      const { dataValue } = item;
      const measurementArray = deserialize(dataId, dataValue);
      measurementResultArray.push(measurementArray);
    }
    return measurementResultArray;
  } catch (e) {
    return e.toString();
  }
}

function deleteUnusedKeys(data) {
  let keysRetained = false;
  Object.keys(data).forEach((key) => {
    if (data[key] === undefined) {
      delete data[key];
    } else {
      keysRetained = true;
    }
  });
  return keysRetained;
}

function consume(event) {
  const payload = event.data.payloadHex;
  const { port } = event.data;

  const res = decodeUplink(payload, port)[0];
  const data = {};
  const gps = {};
  const error = {};
  const lifecycle = {};
  const settings = {};
  const eventSample = {};

  // Lifecycle values
  lifecycle.batteryLevel = res.batteryLevel;
  lifecycle.firmwareVersion = res.firmwareVersion;
  lifecycle.hardwareVersion = res.hardwareVersion;
  lifecycle.workMode = res.workMode;
  lifecycle.heartbeatInterval = res.heartbeatInterval;
  lifecycle.periodicInterval = res.periodicInterval;
  lifecycle.eventInterval = res.eventInterval;
  lifecycle.sosMode = res.sosMode;
  lifecycle.wifiScan = res.wifiScan;
  lifecycle.bleScan = res.bleScan;
  lifecycle.positioningStrategy = res.positioningStrategy;
  lifecycle.sensorEnabled = res.sensorEnabled;
  lifecycle.collectTime = res.collectTime;
  lifecycle.motionId = res.motionId;

  // Events
  eventSample.startMovementEvent = res.startMovementEvent;
  eventSample.endMovementEvent = res.endMovementEvent;
  eventSample.motionlessEvent = res.motionlessEvent;
  eventSample.shockEvent = res.shockEvent;
  eventSample.temperatureEvent = res.temperatureEvent;
  eventSample.lightEvent = res.lightEvent;
  eventSample.sosEvent = res.sosEvent;
  eventSample.pressOnceEvent = res.pressOnceEvent;

  // Settings
  settings.motionEnabled = res.motionEnabled;
  settings.anyMotionThreshold = res.anyMotionThreshold;
  settings.motionStartInterval = res.motionStartInterval;
  settings.staticEnabled = res.staticEnabled;
  settings.deviceStaticTimeout = res.deviceStaticTimeout;
  settings.shockEnabled = res.shockEnabled;
  settings.shockThreshold = res.shockThreshold;
  settings.temperatureEnabled = res.temperatureEnabled;
  settings.eventTemperatureInterval = res.eventTemperatureInterval;
  settings.eventTemperatureSampleInterval = res.eventTemperatureSampleInterval;
  settings.temperatureThMax = res.temperatureThMax;
  settings.temperatureThMin = res.temperatureThMin;
  settings.temperatureWarningType = res.temperatureWarningType;
  settings.lightEnabled = res.lightEnabled;
  settings.eventLightInterval = res.eventLightInterval;
  settings.eventLightSampleInterval = res.eventLightSampleInterval;
  settings.lightThMax = res.lightThMax;
  settings.lightThMin = res.lightThMin;
  settings.lightWarningType = res.lightWarningType;

  // GPS values
  gps.longitude = res.longitude;
  gps.latitude = res.latitude;

  // Default values
  data.temperature = res.temperature;
  data.light = res.light;

  // Error values
  error.error = res.error;
  error.errorCode = res.errorCode;

  if (deleteUnusedKeys(lifecycle)) {
    emit("sample", { data: lifecycle, topic: "lifecycle" });
  }

  if (deleteUnusedKeys(eventSample)) {
    emit("sample", { data: eventSample, topic: "event" });
  }

  if (deleteUnusedKeys(settings)) {
    emit("sample", { data: settings, topic: "event" });
  }

  if (deleteUnusedKeys(gps)) {
    emit("sample", { data: gps, topic: "gps" });
  }

  if (deleteUnusedKeys(data)) {
    data.temperatureF = cToF(data.temperature);
    emit("sample", { data, topic: "default" });
  }

  if (deleteUnusedKeys(error)) {
    emit("sample", { data: error, topic: "error" });
  }
}
