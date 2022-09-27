function toBool(value) {
  return value === "1";
}

function mergeObj(obj1, obj2) {
  const obj3 = {};
  for (const attrname in obj1) {
    obj3[attrname] = obj1[attrname];
  }
  for (const attrname2 in obj2) {
    obj3[attrname2] = obj2[attrname2];
  }
  return obj3;
}

function decbin(number) {
  if (number < 0) {
    number = 0xffffffff + number + 1;
  }
  return parseInt(number, 10).toString(2);
}

function handleKeepalive(bytes, data) {
  const tmp = `0${bytes[6].toString(16)}`.substr(-2);
  const motorRange1 = tmp[1];
  const motorRange2 = `0${bytes[5].toString(16)}`.substr(-2);
  const motorRange = parseInt(`0x${motorRange1}${motorRange2}`, 16);

  const motorPos2 = `0${bytes[4].toString(16)}`.substr(-2);
  const motorPos1 = tmp[0];
  const motorPosition = parseInt(`0x${motorPos1}${motorPos2}`, 16);

  const batteryTmp = `0${bytes[7].toString(16)}`.substr(-2)[0];
  const batteryVoltageCalculated = 2 + parseInt(`0x${batteryTmp}`, 16) * 0.1;

  const byteBin = decbin(bytes[7].toString(16));
  const openWindow = byteBin.substr(4, 1);
  const childLockBin = decbin(bytes[8].toString(16));
  const childLock = childLockBin.charAt(0);
  const highMotorConsumption = byteBin.substr(-2, 1);
  const lowMotorConsumption = byteBin.substr(-3, 1);
  const brokenSensor = byteBin.substr(-4, 1);
  let sensorTemp = 0;
  if (Number(bytes[0].toString(16)) === 1) {
    sensorTemp = (bytes[2] * 165) / 256 - 40;
  }

  if (Number(bytes[0].toString(16)) === 81) {
    sensorTemp = (bytes[2] - 28.33333) / 5.66666;
  }
  data.reason = Number(bytes[0].toString(16));
  data.targetTemperature = Number(bytes[1]);
  data.sensorTemperature = Number(sensorTemp.toFixed(2));
  data.relativeHumidity = Number(((bytes[3] * 100) / 256).toFixed(2));
  data.motorRange = motorRange;
  data.motorPosition = motorPosition;
  data.batteryVoltage = Number(batteryVoltageCalculated.toFixed(2));
  data.openWindow = toBool(openWindow);
  data.childLock = toBool(childLock);
  data.highMotorConsumption = toBool(highMotorConsumption);
  data.lowMotorConsumption = toBool(lowMotorConsumption);
  data.brokenSensor = toBool(brokenSensor);

  return data;
}

function handleResponse(bytes, data) {
  let commands = bytes.map((byte, i) => `0${byte.toString(16)}`.substr(-2));
  commands = commands.slice(0, -9);
  let commandLen = 0;
  let resultToPass;

  commands.map((command, i) => {
    switch (command) {
      case "04":
        {
          commandLen = 2;
          const hardwareVersion = commands[i + 1];
          const softwareVersion = commands[i + 2];
          const dataK = {
            deviceVersions: {
              hardware: Number(hardwareVersion),
              software: Number(softwareVersion),
            },
          };
          resultToPass = mergeObj(resultToPass, dataK);
        }
        break;
      case "12":
        {
          commandLen = 1;
          const dataC = { keepAliveTime: parseInt(commands[i + 1], 16) };
          resultToPass = mergeObj(resultToPass, dataC);
        }
        break;
      case "13":
        {
          commandLen = 4;
          const enabled = toBool(parseInt(commands[i + 1], 16));
          const duration = parseInt(commands[i + 2], 16) * 5;
          const tmp = `0${commands[i + 4].toString(16)}`.substr(-2);
          const motorPos2 = `0${commands[i + 3].toString(16)}`.substr(-2);
          const motorPos1 = tmp[0];
          const motorPosition = parseInt(`0x${motorPos1}${motorPos2}`, 16);
          const delta = Number(tmp[1]);

          const dataD = {
            openWindowParams: { enabled, duration, motorPosition, delta },
          };
          resultToPass = mergeObj(resultToPass, dataD);
        }
        break;
      case "14":
        {
          commandLen = 1;
          const dataB = { childLock: toBool(parseInt(commands[i + 1], 16)) };
          resultToPass = mergeObj(resultToPass, dataB);
        }
        break;
      case "15":
        {
          commandLen = 2;
          const dataA = {
            temperatureRangeSettings: {
              min: parseInt(commands[i + 1], 16),
              max: parseInt(commands[i + 2], 16),
            },
          };
          resultToPass = mergeObj(resultToPass, dataA);
        }
        break;
      case "16": {
        commandLen = 2;
        const da = {
          internalAlgoParams: {
            period: parseInt(commands[i + 1], 16),
            pFirstLast: parseInt(commands[i + 2], 16),
            pNext: parseInt(commands[i + 3], 16),
          },
        };
        resultToPass = mergeObj(resultToPass, da);
        break;
      }
      case "17":
        {
          commandLen = 2;
          const dataF = {
            internalAlgoTdiffParams: {
              warm: parseInt(commands[i + 1], 16),
              cold: parseInt(commands[i + 2], 16),
            },
          };
          resultToPass = mergeObj(resultToPass, dataF);
        }
        break;
      case "18":
        {
          commandLen = 1;
          const dataE = { operationalMode: parseInt(commands[i + 1], 16) };
          resultToPass = mergeObj(resultToPass, dataE);
        }
        break;
      case "19":
        {
          commandLen = 1;
          const commandResponse = parseInt(commands[i + 1], 16);
          const periodInMinutes = (commandResponse * 5) / 60;
          const dataH = { joinRetryPeriod: periodInMinutes };
          resultToPass = mergeObj(resultToPass, dataH);
        }
        break;
      case "1b":
        {
          commandLen = 1;
          const dataG = { uplinkType: parseInt(commands[i + 1], 16) };
          resultToPass = mergeObj(resultToPass, dataG);
        }
        break;
      case "1d":
        {
          // get default keepalive if it is not available in data
          commandLen = 2;
          const deviceKeepAlive = 5;
          const wdpC =
            commands[i + 1] === "00"
              ? false
              : commands[i + 1] * deviceKeepAlive + 7;
          const wdpUc =
            commands[i + 2] === "00" ? false : parseInt(commands[i + 2], 16);
          const dataJ = { watchDogParams: { wdpC, wdpUc } };
          resultToPass = mergeObj(resultToPass, dataJ);
        }
        break;
      case "1f":
        {
          commandLen = 1;
          const da = { primaryOperationalMode: commands[i + 1] };
          resultToPass = mergeObj(resultToPass, da);
        }
        break;
      case "21":
        {
          commandLen = 6;
          const da = {
            batteryRangesBoundaries: {
              Boundary1: parseInt(commands[i + 1] + commands[i + 2], 16),
              Boundary2: parseInt(commands[i + 3] + commands[i + 4], 16),
              Boundary3: parseInt(commands[i + 5] + commands[i + 6], 16),
            },
          };
          resultToPass = mergeObj(resultToPass, da);
        }
        break;
      case "23":
        {
          commandLen = 4;
          const da = {
            batteryRangesOverVoltage: {
              Range1: parseInt(commands[i + 2], 16),
              Range2: parseInt(commands[i + 3], 16),
              Range3: parseInt(commands[i + 4], 16),
            },
          };
          resultToPass = mergeObj(resultToPass, da);
        }
        break;
      case "27":
        {
          commandLen = 1;
          const da = { OVAC: parseInt(commands[i + 1], 16) };
          resultToPass = mergeObj(resultToPass, da);
        }
        break;
      case "28":
        {
          commandLen = 1;
          const da = {
            manualTargetTemperatureUpdate: parseInt(commands[i + 1], 16),
          };
          resultToPass = mergeObj(resultToPass, da);
        }
        break;
      case "29":
        {
          commandLen = 2;
          const da = {
            proportionalAlgoParams: {
              coefficient: parseInt(commands[i + 1], 16),
              period: parseInt(commands[i + 2], 16),
            },
          };
          resultToPass = mergeObj(resultToPass, da);
        }
        break;
      case "2b":
        {
          commandLen = 1;
          const da = { algoType: commands[i + 1] };
          resultToPass = mergeObj(resultToPass, da);
        }
        break;
      default:
        break;
    }
    commands.splice(i, commandLen);
  });
  return resultToPass;
}

function decodeUplink(bytes) {
  let data = {};
  const resultToPass = {};

  if (bytes[0].toString(16) === 1 || bytes[0].toString(16) === 129) {
    data = mergeObj(data, handleKeepalive(bytes, data));
  } else {
    data = mergeObj(data, handleResponse(bytes, data));
    bytes = bytes.slice(-9);
    data = mergeObj(data, handleKeepalive(bytes, data));
  }

  return {
    data,
  };
}

function consume(event) {
  const payload = event.data.payloadHex;
  const decoded = decodeUplink(Hex.hexToBytes(payload)).data;
  delete decoded.reason;

  emit("sample", { data: decoded, topic: "default" });
}
