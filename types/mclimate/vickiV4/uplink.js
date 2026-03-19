function cToF(celsius) {
  return Math.round(((celsius * 9) / 5 + 32) * 10) / 10;
}

function toBool(value) {
  return value === 1;
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
  number = number.toString(2);
  return "00000000".substr(number.length) + number;
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

  const byte7Bin = decbin(bytes[8]);
  const openWindow = byte7Bin[4];
  const highMotorConsumption = byte7Bin[5];
  const lowMotorConsumption = byte7Bin[6];
  const brokenSensor = byte7Bin[7];
  const byte8Bin = decbin(bytes[8]);
  const childLock = byte8Bin[0];
  const calibrationFailed = byte8Bin[1];
  const attachedBackplate = byte8Bin[2];
  const perceiveAsOnline = byte8Bin[3];
  const antiFreezeProtection = byte8Bin[4];

  let sensorTemp = 0;
  if (Number(bytes[0].toString(16)) === 1) {
    sensorTemp = (bytes[2] * 165) / 256 - 40;
  }

  if (Number(bytes[0].toString(16)) === 81) {
    sensorTemp = (bytes[2] - 28.33333) / 5.66666;
  }
  data.targetTemperature = Number(bytes[1]);
  data.targetTemperatureF = cToF(data.targetTemperature);
  data.sensorTemperature = Number(sensorTemp.toFixed(2));
  data.sensorTemperatureF = cToF(data.sensorTemperature);
  data.humidity = Number(((bytes[3] * 100) / 256).toFixed(2));
  data.motorRange = motorRange;
  data.motorPosition = motorPosition;
  data.batteryVoltage = Number(batteryVoltageCalculated.toFixed(2));
  data.openWindow = toBool(openWindow);
  data.highMotorConsumption = toBool(highMotorConsumption);
  data.lowMotorConsumption = toBool(lowMotorConsumption);
  data.brokenSensor = toBool(brokenSensor);
  data.childLock = toBool(childLock);

  data.calibrationFailed = toBool(calibrationFailed);
  data.attachedBackplate = toBool(attachedBackplate);
  data.perceiveAsOnline = toBool(perceiveAsOnline);
  data.antiFreezeProtection = toBool(antiFreezeProtection);
  if (!data.hasOwnProperty("targetTemperatureFloat")) {
    data.targetTemperatureFloat = bytes[1].toFixed(2);
    data.targetTemperatureF = cToF(data.targetTemperature);
  }
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
      case "16":
        commandLen = 2;
        data = {
          internalAlgoParams: {
            period: parseInt(commands[i + 1], 16),
            pFirstLast: parseInt(commands[i + 2], 16),
            pNext: parseInt(commands[i + 3], 16),
          },
        };
        resultToPass = mergeObj(resultToPass, data);
        break;
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
        commandLen = 1;
        data = { primaryOperationalMode: commands[i + 1] };
        resultToPass = mergeObj(resultToPass, data);
        break;
      case "21":
        commandLen = 6;
        data = {
          batteryRangesBoundaries: {
            Boundary1: parseInt(commands[i + 1] + commands[i + 2], 16),
            Boundary2: parseInt(commands[i + 3] + commands[i + 4], 16),
            Boundary3: parseInt(commands[i + 5] + commands[i + 6], 16),
          },
        };
        resultToPass = mergeObj(resultToPass, data);
        break;
      case "23":
        commandLen = 4;
        data = {
          batteryRangesOverVoltage: {
            Range1: parseInt(commands[i + 2], 16),
            Range2: parseInt(commands[i + 3], 16),
            Range3: parseInt(commands[i + 4], 16),
          },
        };
        resultToPass = mergeObj(resultToPass, data);
        break;
      case "27":
        commandLen = 1;
        data = { OVAC: parseInt(commands[i + 1], 16) };
        resultToPass = mergeObj(resultToPass, data);
        break;
      case "28":
        commandLen = 1;
        data = {
          manualTargetTemperatureUpdate: parseInt(commands[i + 1], 16),
        };
        resultToPass = mergeObj(resultToPass, data);
        break;
      case "29":
        commandLen = 2;
        data = {
          proportionalAlgoParams: {
            coefficient: parseInt(commands[i + 1], 16),
            period: parseInt(commands[i + 2], 16),
          },
        };
        resultToPass = mergeObj(resultToPass, data);
        break;
      case "2b":
        commandLen = 1;
        data = { algoType: commands[i + 1] };
        resultToPass = mergeObj(resultToPass, data);
        break;
      case "36": {
        commandLen = 3;
        const kp =
          parseInt(
            `${commands[i + 1]}${commands[i + 2]}${commands[i + 3]}`,
            16,
          ) / 131072;
        data = { proportionalGain: Number(kp).toFixed(5) };
        resultToPass = mergeObj(resultToPass, data);
        break;
      }
      case "3d": {
        commandLen = 3;
        const ki =
          parseInt(
            `${commands[i + 1]}${commands[i + 2]}${commands[i + 3]}`,
            16,
          ) / 131072;
        data = { integralGain: Number(ki).toFixed(5) };
        resultToPass = mergeObj(resultToPass, data);
        break;
      }
      case "3f":
        commandLen = 2;
        data = {
          integralValue:
            parseInt(`${commands[i + 1]}${commands[i + 2]}`, 16) / 10,
        };
        resultToPass = mergeObj(resultToPass, data);
        break;
      case "40":
        commandLen = 1;
        data = { piRunPeriod: parseInt(commands[i + 1], 16) };
        resultToPass = mergeObj(resultToPass, data);
        break;
      case "42":
        commandLen = 1;
        data = { tempHysteresis: parseInt(commands[i + 1], 16) };
        resultToPass = mergeObj(resultToPass, data);
        break;
      case "44":
        commandLen = 2;
        data = {
          extSensorTemperature:
            parseInt(`${commands[i + 1]}${commands[i + 2]}`, 16) / 10,
        };
        resultToPass = mergeObj(resultToPass, data);
        break;
      case "46":
        {
          commandLen = 3;
          const enabled = toBool(parseInt(commands[i + 1], 16));
          const duration = parseInt(commands[i + 2], 16) * 5;
          const delta = parseInt(commands[i + 3], 16) / 10;

          data = { openWindowParams: { enabled, duration, delta } };
          resultToPass = mergeObj(resultToPass, data);
        }
        break;
      case "48":
        commandLen = 1;
        data = { forceAttach: parseInt(commands[i + 1], 16) };
        resultToPass = mergeObj(resultToPass, data);
        break;
      case "4a":
        {
          commandLen = 3;
          const activatedTemperature = parseInt(commands[i + 1], 16) / 10;
          const deactivatedTemperature = parseInt(commands[i + 2], 16) / 10;
          const targetTemperature = parseInt(commands[i + 3], 16);

          data = {
            antiFreezeParams: {
              activatedTemperature,
              deactivatedTemperature,
              targetTemperature,
            },
          };
          resultToPass = mergeObj(resultToPass, data);
        }
        break;
      case "4d":
        commandLen = 2;
        data = {
          piMaxIntegratedError:
            parseInt(`${commands[i + 1]}${commands[i + 2]}`, 16) / 10,
        };
        resultToPass = mergeObj(resultToPass, data);
        break;
      case "50":
        commandLen = 2;
        data = {
          effectiveMotorRange: {
            minMotorRange: parseInt(commands[i + 1], 16),
            maxMotorRange: parseInt(commands[i + 2], 16),
          },
        };
        resultToPass = mergeObj(resultToPass, data);
        break;
      case "52":
        commandLen = 2;
        data = {
          targetTemperatureFloat:
            parseInt(`${commands[i + 1]}${commands[i + 2]}`, 16) / 10,
        };
        resultToPass = mergeObj(resultToPass, data);
        break;
      case "54":
        {
          commandLen = 1;
          const offset = (parseInt(commands[i + 1], 16) - 28) * 0.176;
          data = { temperatureOffset: offset };
          resultToPass = mergeObj(resultToPass, data);
        }
        break;
      default:
        break;
    }
    commands.splice(i, commandLen);
  });
  return resultToPass;
}

function consume(event) {
  const payload = event.data.payloadHex;
  let bytes = Hex.hexToBytes(payload);
  let data = {};
  const lifecycle = {};
  const raw = {};

  if (Number(bytes[0]) === 1 || Number(bytes[0]) === 129) {
    data = handleKeepalive(bytes, data);
  } else {
    data = handleResponse(bytes, data);
    bytes = Array.from(bytes).slice(-9);
    data = mergeObj(data, handleKeepalive(bytes, data));
  }

  lifecycle.batteryVoltage = data.batteryVoltage;
  lifecycle.highMotorConsumption = data.highMotorConsumption;
  lifecycle.lowMotorConsumption = data.lowMotorConsumption;
  lifecycle.brokenSensor = data.brokenSensor;

  lifecycle.calibrationFailed = data.calibrationFailed;
  lifecycle.attachedBackplate = data.attachedBackplate;
  lifecycle.perceiveAsOnline = data.perceiveAsOnline;
  lifecycle.antiFreezeProtection = data.antiFreezeProtection;

  delete data.batteryVoltage;
  delete data.highMotorConsumption;
  delete data.lowMotorConsumption;
  delete data.brokenSensor;

  delete data.calibrationFailed;
  delete data.attachedBackplate;
  delete data.perceiveAsOnline;
  delete data.antiFreezeProtection;
  delete data.targetTemperatureFloat;

  // Add raw metadata for mclimate integration. Sent to mclimate broker.
  raw.deviceId = event.device.deviceId;
  raw.payloadHex = event.data.payloadHex;
  raw.timestamp = event.uplinkMetrics.timestamp;
  raw.port = event.uplinkMetrics.port;
  raw.frameCountUp = event.uplinkMetrics.frameCountUp;
  raw.rssi = event.uplinkMetrics.rssi;
  raw.snr = event.uplinkMetrics.snr;
  raw.spreadingFactor = event.uplinkMetrics.sf;

  emit("sample", { data, topic: "default" });
  emit("sample", { data: lifecycle, topic: "lifecycle" });
  emit("sample", { data: raw, topic: "raw_payload" });
}
