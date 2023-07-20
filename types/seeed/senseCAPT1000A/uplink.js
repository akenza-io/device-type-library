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

function getByteArray(str) {
  const bytes = [];
  for (let i = 0; i < str.length; i += 2) {
    bytes.push(str.substring(i, i + 2));
  }
  return toBinary(bytes);
}

function bigEndianTransform(data) {
  const dataArray = [];
  for (let i = 0; i < data.length; i += 2) {
    dataArray.push(data.substring(i, i + 2));
  }
  return dataArray;
}

function loraWANV2PositiveDataFormat(str, divisor = 1) {
  const strReverse = bigEndianTransform(str);
  const str2 = toBinary(strReverse);
  return parseInt(str2, 2) / divisor;
}

function getUTCTimestamp(str) {
  return parseInt(loraWANV2PositiveDataFormat(str)) * 1000;
}

function getEventStatus(str) {
  const bitStr = getByteArray(str);
  const event = [];
  for (let i = bitStr.length; i >= 0; i--) {
    let type = 0;
    if (i === 0) {
      type = bitStr.substring(0);
    } else {
      type = bitStr.substring(i - 1, i);
    }

    switch (type) {
      case 1:
        event[i] = "MOVING_STARTING";
        break;
      case 2:
        event[i] = "MOVING_END";
        break;
      case 3:
        event[i] = "DEVICE_STATIC";
        break;
      case 4:
        event[i] = "SHOCK_EVENT";
        break;
      case 5:
        event[i] = "TEMP_EVENT";
        break;
      case 6:
        event[i] = "LIGHTING_EVENT";
        break;
      case 7:
        event[i] = "SOS_EVENT";
        break;
      case 8:
        event[i] = "CUSTOMER_EVENT";
        break;
      default:
        event[i] = "NO_EVENT";
        break;
    }
  }
  return event.reverse();
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

function getOneWeekInterval(str) {
  return loraWANV2DataFormat(str) * 60;
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

function getInt8RSSI(str) {
  return loraWANV2DataFormat(str);
}

function getMacAndRssiObj(pair) {
  const pairs = [];
  if (pair.length % 14 === 0) {
    for (let i = 0; i < pair.length; i += 14) {
      const mac = getMacAddress(pair.substring(i, i + 12));
      if (mac) {
        const rssi = getInt8RSSI(pair.substring(i + 12, i + 14));
        pairs.push({ mac, rssi });
      }
    }
  }
  return pairs;
}

function getInt(str) {
  return parseInt(str);
}

function getWorkingMode(workingMode) {
  return getInt(workingMode);
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
  let measurement = {};
  let eventList = [];
  let collectTime = 0;
  switch (dataId) {
    case "01":
      measurement = getUpShortInfo(dataValue);
      break;
    case "02":
      measurement = getUpShortInfo(dataValue);
      break;
    case "03":
      break;
    case "04":
      measurement = {
        workMode: getWorkingMode(dataValue.substring(0, 2)),
        heartbeatInterval: getOneWeekInterval(dataValue.substring(4, 8)),
        periodicInterval: getOneWeekInterval(dataValue.substring(8, 12)),
        eventInterval: getOneWeekInterval(dataValue.substring(12, 16)),
        sosMode: getSOSMode(dataValue.substring(16, 18)),
      };
      break;
    case "05":
      measurement = {
        batteryLevel: getBattery(dataValue.substring(0, 2)),
        workMode: getWorkingMode(dataValue.substring(2, 4)),
        sosMode: getSOSMode(dataValue.substring(6, 8)),
      };
      break;
    case "06":
      eventList = getEventStatus(dataValue.substring(0, 6));
      collectTime = getUTCTimestamp(dataValue.substring(8, 16));
      measurement = {
        sosEvent: eventList[6],
        longitude: getSensorValue(dataValue.substring(16, 24), 1000000),
        latitude: getSensorValue(dataValue.substring(24, 32), 1000000),
        temperature: getSensorValue(dataValue.substring(32, 36), 10),
        light: getSensorValue(dataValue.substring(36, 40)),
        batteryLevel: getBattery(dataValue.substring(40, 42)),
        timestamp: collectTime,
      };
      break;
    case "07":
      eventList = getEventStatus(dataValue.substring(0, 6));
      collectTime = getUTCTimestamp(dataValue.substring(8, 16));
      measurement = {
        sosEvent: eventList[6],
        wifiScan: getMacAndRssiObj(dataValue.substring(16, 72)),
        temperature: getSensorValue(dataValue.substring(72, 76), 10),
        light: getSensorValue(dataValue.substring(76, 80)),
        batteryLevel: getBattery(dataValue.substring(80, 82)),
        timestamp: collectTime,
      };
      break;
    case "08":
      eventList = getEventStatus(dataValue.substring(0, 6));
      collectTime = getUTCTimestamp(dataValue.substring(8, 16));
      measurement = {
        sosEvent: eventList[6],
        bleScan: getMacAndRssiObj(dataValue.substring(16, 58)),
        temperature: getSensorValue(dataValue.substring(58, 62), 10),
        light: getSensorValue(dataValue.substring(62, 66)),
        batteryLevel: getBattery(dataValue.substring(66, 68)),
        timestamp: collectTime,
      };
      break;
    case "09":
      eventList = getEventStatus(dataValue.substring(0, 6));
      collectTime = getUTCTimestamp(dataValue.substring(8, 16));
      measurement = {
        sosEvent: eventList[6],
        longitude: getSensorValue(dataValue.substring(16, 24), 1000000),
        latitude: getSensorValue(dataValue.substring(24, 32), 1000000),
        batteryLevel: getBattery(dataValue.substring(32, 34)),
        timestamp: collectTime,
      };
      break;
    case "0A":
      eventList = getEventStatus(dataValue.substring(0, 6));
      collectTime = getUTCTimestamp(dataValue.substring(8, 16));
      measurement = {
        sosEvent: eventList[6],
        wifiScan: getMacAndRssiObj(dataValue.substring(16, 72)),
        batteryLevel: getBattery(dataValue.substring(72, 74)),
        timestamp: collectTime,
      };
      break;
    case "0B":
      eventList = getEventStatus(dataValue.substring(0, 6));
      collectTime = getUTCTimestamp(dataValue.substring(8, 16));
      measurement = {
        sosEvent: eventList[6],
        bleScan: getMacAndRssiObj(dataValue.substring(16, 58)),
        batteryLevel: getBattery(dataValue.substring(58, 60)),
        timestamp: collectTime,
      };
      break;
    case "0D": {
      const errorCode = getInt(dataValue);
      let error = "";
      switch (errorCode) {
        case 0:
          error = "GNSS_SCAN_TIME_OUT";
          break;
        case 1:
          error = "WIFI_SCAN_TIME_OUT";
          break;
        case 2:
          error = "WIFI_GNSS_SCAN_TIME_OUT";
          break;
        case 3:
          error = "GNSS_WIFI_SCAN_TIME_OUT";
          break;
        case 4:
          error = "BEACON_SCAN_TIME_OUT";
          break;
        case 5:
          error = "BEACON_WIFI_SCAN_TIME_OUT";
          break;
        case 6:
          error = "BEACON_GNSS_SCAN_TIME_OUT";
          break;
        case 7:
          error = "BEACON_WIFI_GNSS_SCAN_TIME_OUT";
          break;
        case 8:
          error = "FAILED_TO_OBTAIN_THE_UTC_TIMESTAMP";
          break;
        default:
          break;
      }
      measurement = { errorCode, error };
      break;
    }
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

function getUpShortInfo(messageValue) {
  return {
    batteryLevel: getBattery(messageValue.substring(0, 2)),
    firmwareVersion: getSoftVersion(messageValue.substring(2, 6)),
    hardwareVersion: getHardVersion(messageValue.substring(6, 10)),
    workMode: getWorkingMode(messageValue.substring(10, 12)),
    heartbeatInterval: getOneWeekInterval(messageValue.substring(14, 18)),
    periodicInterval: getOneWeekInterval(messageValue.substring(18, 22)),
    eventInterval: getOneWeekInterval(messageValue.substring(22, 26)),
    sosMode: getSOSMode(messageValue.substring(28, 30)),
  };
}

function isEmpty(obj) {
  return Object.keys(obj).length === 0;
}

function consume(event) {
  const payload = event.data.payloadHex;
  const result = messageAnalyzed(payload)[0];
  const defaultData = {};
  const gps = {};
  const error = {};
  const lifecycle = {};

  Object.keys(result).forEach((key) => {
    if (
      key === "batteryLevel" ||
      key === "firmwareVersion" ||
      key === "hardwareVersion" ||
      key === "workMode" ||
      key === "heartbeatInterval" ||
      key === "periodicInterval" ||
      key === "eventInterval" ||
      key === "sosMode" ||
      key === "sosEvent" ||
      key === "wifiScan" ||
      key === "bleScan"
    ) {
      lifecycle[key] = result[key];
    }

    if (key === "longitude" || key === "latitude") {
      gps[key] = result[key];
    }

    if (key === "temperature" || key === "light") {
      defaultData[key] = result[key];
    }

    if (key === "error" || key === "errorCode") {
      error[key] = result[key];
    }
  });

  if (!isEmpty(lifecycle)) {
    emit("sample", { data: lifecycle, topic: "lifecycle" });
  }

  if (!isEmpty(gps)) {
    emit("sample", { data: gps, topic: "gps" });
  }

  if (!isEmpty(defaultData)) {
    emit("sample", { data: defaultData, topic: "default" });
  }

  if (!isEmpty(error)) {
    emit("sample", { data: error, topic: "error" });
  }
}
