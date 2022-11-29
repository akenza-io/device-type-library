function bytes2HexString(arrBytes) {
  let str = "";
  for (let i = 0; i < arrBytes.length; i++) {
    let tmp;
    const num = arrBytes[i];
    if (num < 0) {
      tmp = (255 + num + 1).toString(16);
    } else {
      tmp = num.toString(16);
    }
    if (tmp.length === 1) {
      tmp = `0${tmp}`;
    }
    str += tmp;
  }
  return str;
}

function divideBy7Bytes(str) {
  const frameArray = [];
  for (let i = 0; i < str.length - 4; i += 14) {
    const data = str.substring(i, i + 14);
    frameArray.push(data);
  }
  return frameArray;
}

function littleEndianTransform(data) {
  const dataArray = [];
  for (let i = 0; i < data.length; i += 2) {
    dataArray.push(data.substring(i, i + 2));
  }
  dataArray.reverse();
  return dataArray;
}

function strTo10SysNub(str) {
  const arr = littleEndianTransform(str);
  return parseInt(arr.toString().replace(/,/g, ""), 16);
}

function checkDataIdIsMeasureUpload(dataId) {
  return parseInt(dataId) > 4096;
}

function isSpecialDataId(dataID) {
  switch (dataID) {
    case 0:
    case 1:
    case 2:
    case 3:
    case 4:
    case 7:
    case 0x120:
      return true;
    default:
      return false;
  }
}

function toBinary(arr) {
  const binaryData = [];
  for (let forArr = 0; forArr < arr.length; forArr++) {
    const item = arr[forArr];
    let data = parseInt(item, 16).toString(2);
    const dataLength = data.length;
    if (data.length !== 8) {
      for (let i = 0; i < 8 - dataLength; i++) {
        data = `0${data}`;
      }
    }
    binaryData.push(data);
  }
  return binaryData.toString().replace(/,/g, "");
}

function dataSpecialFormat(dataId, str) {
  const strReverse = littleEndianTransform(str);
  if (dataId === 2 || dataId === 3) {
    return strReverse.join("");
  }

  // handle unsigned number
  const str2 = toBinary(strReverse);

  const dataArray = [];
  switch (dataId) {
    case 0: // DATA_BOARD_VERSION
    case 1: // DATA_SENSOR_VERSION
      // Using point segmentation
      for (let k = 0; k < str2.length; k += 16) {
        let tmp146 = str2.substring(k, k + 16);
        tmp146 = `${parseInt(tmp146.substring(0, 8), 2) || 0}.${
          parseInt(tmp146.substring(8, 16), 2) || 0
        }`;
        dataArray.push(tmp146);
      }
      return dataArray.join(",");
    case 4:
      for (let i = 0; i < str2.length; i += 8) {
        let item = parseInt(str2.substring(i, i + 8), 2);
        if (item < 10) {
          item = `0${item.toString()}`;
        } else {
          item = item.toString();
        }
        dataArray.push(item);
      }
      return dataArray.join("");
    case 7:
      // battery && interval
      return {
        interval: parseInt(str2.substr(0, 16), 2),
        power: parseInt(str2.substr(-16, 16), 2),
      };
    default:
      return {};
  }
}

function dataFormat(str) {
  const strReverse = littleEndianTransform(str);
  let str2 = toBinary(strReverse);
  if (str2.substring(0, 1) === "1") {
    const arr = str2.split("");
    const reverseArr = [];
    for (let forArr = 0; forArr < arr.length; forArr++) {
      const item = arr[forArr];
      if (parseInt(item) === 1) {
        reverseArr.push(0);
      } else {
        reverseArr.push(1);
      }
    }
    str2 = parseInt(reverseArr.join(""), 2) + 1;
    return parseFloat(`-${str2 / 1000}`);
  }
  return parseInt(str2, 2) / 1000;
}

function sensorAttrForVersion(dataValue) {
  const dataValueSplitArray = dataValue.split(",");
  return {
    ver_hardware: dataValueSplitArray[0],
    ver_software: dataValueSplitArray[1],
  };
}

function decodeUplink(bytes) {
  // init
  const bytesString = bytes2HexString(bytes).toLocaleUpperCase();
  const decoded = {
    // valid
    valid: true,
    err: 0,
    // bytes
    payload: bytesString,
    // messages array
    messages: [],
  };

  // Length Check
  if ((bytesString.length / 2 - 2) % 7 !== 0) {
    decoded.valid = false;
    decoded.err = -2; // "length check fail."
    return { data: decoded };
  }

  // Cache sensor id
  let sensorEuiLowBytes;
  let sensorEuiHighBytes;

  // Handle each frame
  const frameArray = divideBy7Bytes(bytesString);
  for (let i = 0; i < frameArray.length; i++) {
    const frame = frameArray[i];
    // Extract key parameters
    const channel = strTo10SysNub(frame.substring(0, 2));
    const dataID = strTo10SysNub(frame.substring(2, 6));
    const dataValue = frame.substring(6, 14);
    const realDataValue = isSpecialDataId(dataID)
      ? dataSpecialFormat(dataID, dataValue)
      : dataFormat(dataValue);

    if (checkDataIdIsMeasureUpload(dataID)) {
      // if telemetry.
      decoded.messages.push({
        type: "report_telemetry",
        measurementId: dataID,
        measurementValue: realDataValue,
      });
    } else if (isSpecialDataId(dataID) || dataID === 5 || dataID === 6) {
      // if special order, except "report_sensor_id".
      switch (dataID) {
        case 0x00: {
          // node version
          const versionData = sensorAttrForVersion(realDataValue);
          decoded.messages.push({
            type: "upload_version",
            hardwareVersion: versionData.ver_hardware,
            softwareVersion: versionData.ver_software,
          });
          break;
        }
        case 1:
          // sensor version
          break;
        case 2:
          // sensor eui, low bytes
          sensorEuiLowBytes = realDataValue;
          break;
        case 3:
          // sensor eui, high bytes
          sensorEuiHighBytes = realDataValue;
          break;
        case 7:
          // battery power && interval
          decoded.messages.push(
            {
              type: "upload_battery",
              battery: realDataValue.power,
            },
            {
              type: "upload_interval",
              interval: parseInt(realDataValue.interval) * 60,
            },
          );
          break;
        case 0x120:
          // remove sensor
          decoded.messages.push({
            type: "report_remove_sensor",
            channel: 1,
          });
          break;
        default:
          break;
      }
    } else {
      decoded.messages.push({
        type: "unknown_message",
        dataID,
        dataValue,
      });
    }
  }

  // if the complete id received, as "upload_sensor_id"
  if (sensorEuiHighBytes && sensorEuiLowBytes) {
    decoded.messages.unshift({
      type: "upload_sensor_id",
      channel: 1,
      sensorId: (sensorEuiHighBytes + sensorEuiLowBytes).toUpperCase(),
    });
  }

  // return
  return decoded;
}

function consume(event) {
  const payload = event.data.payloadHex;
  const bytes = Hex.hexToBytes(payload);
  const data = {};
  const lifecycle = {};

  const decoded = decodeUplink(bytes);
  decoded.messages.forEach((element) => {
    const mID = element.measurementId;
    const value = element.measurementValue;

    if (mID !== undefined) {
      if (mID === 4175) {
        data.objectDetected1 = value;
      } else if (mID === 4176) {
        data.objectDetected2 = value;
      } else if (mID === 4177) {
        data.objectDetected3 = value;
      } else if (mID === 4178) {
        data.objectDetected4 = value;
      } else if (mID === 4179) {
        data.objectDetected5 = value;
      } else if (mID === 4180) {
        data.objectDetected6 = value;
      } else if (mID === 4181) {
        data.objectDetected7 = value;
      } else if (mID === 4182) {
        data.objectDetected8 = value;
      } else if (mID === 4183) {
        data.objectDetected9 = value;
      } else if (mID === 4184) {
        data.objectDetected10 = value;
      }
    } else {
      const { type } = element;
      if (type === "upload_battery") {
        lifecycle.batteryLevel = element.battery;
      } else if (type === "upload_interval") {
        lifecycle.sendInterval = element.interval;
      } else if (type === "upload_version") {
        lifecycle.hardwareVersion = element.hardwareVersion;
        lifecycle.softwareVersion = element.softwareVersion;
      }
    }
  });

  if (Object.keys(lifecycle).length > 0) {
    emit("sample", { data: lifecycle, topic: "lifecycle" });
  }

  emit("sample", { data, topic: "default" });
}
