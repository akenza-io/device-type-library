function cToF(celsius) {
  return Math.round(((celsius * 9) / 5 + 32) * 10) / 10;
}

function slice(a, f, t) {
  const res = [];
  for (let i = 0; i < t - f; i++) {
    res[i] = a[f + i];
  }
  return res;
}

// Converts value to unsigned
function toUint(x) {
  return x >>> 0;
}

function extractBytes(chunk, startBit, endBit) {
  const totalBits = endBit - startBit + 1;
  const totalBytes =
    totalBits % 8 === 0 ? toUint(totalBits / 8) : toUint(totalBits / 8) + 1;
  const offsetInByte = startBit % 8;
  const endBitChunk = totalBits % 8;
  const arr = new Array(totalBytes);
  for (let byte = 0; byte < totalBytes; ++byte) {
    const chunkIdx = toUint(startBit / 8) + byte;
    let lo = chunk[chunkIdx] >> offsetInByte;
    let hi = 0;
    if (byte < totalBytes - 1) {
      hi =
        (chunk[chunkIdx + 1] & ((1 << offsetInByte) - 1)) << (8 - offsetInByte);
    } else if (endBitChunk !== 0) {
      // Truncate last bits
      lo &= (1 << endBitChunk) - 1;
    }
    arr[byte] = hi | lo;
  }
  return arr;
}

function toHexString(byteArray) {
  const arr = [];
  for (let i = 0; i < byteArray.length; ++i) {
    arr.push(`0${(byteArray[i] & 0xff).toString(16)}`.slice(-2));
  }
  return arr.join("");
}

function applyDataType(bytes, dataType) {
  let output = 0;
  if (dataType === "unsigned") {
    for (let i = 0; i < bytes.length; ++i) {
      output = toUint(output << 8) | bytes[i];
    }
    return output;
  }
  if (dataType === "signed") {
    for (let i = 0; i < bytes.length; ++i) {
      output = (output << 8) | bytes[i];
    }
    // Convert to signed, based on value size
    if (output > Math.pow(2, 8 * bytes.length - 1)) {
      output -= Math.pow(2, 8 * bytes.length);
    }
    return output;
  }
  if (dataType === "bool") {
    return !(bytes[0] === 0);
  }
  if (dataType === "hexstring") {
    return toHexString(bytes);
  }
  // Incorrect data type
  return null;
}

function decodeField(chunk, startBit, endBit, dataType) {
  const chunkSize = chunk.length;
  if (endBit >= chunkSize * 8) {
    return null; // Error: exceeding boundaries of the chunk
  }
  if (endBit < startBit) {
    return null; // Error: invalid input
  }
  const arr = extractBytes(chunk, startBit, endBit);
  return applyDataType(arr, dataType);
}

// Checks if two arrays are equal
function isEqual(arr1, arr2) {
  if (arr1.length !== arr2.length) {
    return false;
  }
  for (let i = 0; i !== arr1.length; i++) {
    if (arr1[i] !== arr2[i]) {
      return false;
    }
  }
  return true;
}

function byteToArray(byteArray) {
  const arr = [];
  for (let i = 0; i < byteArray.length; i++) {
    arr.push(byteArray[i]);
  }
  return arr;
}

function convertToUint8Array(byteArray) {
  const arr = [];
  for (let i = 0; i < byteArray.length; i++) {
    arr.push(toUint(byteArray[i]) & 0xff);
  }
  return arr;
}

function decoder(bytes, port) {
  let decodedData = {};
  let decode = [];

  if (port === 10) {
    decode = [
      {
        key: [0x00, 0xff],
        fn(arg) {
          decodedData.batteryVoltage = decodeField(arg, 0, 15, "signed") * 0.01;
          return 2;
        },
      },
      {
        key: [0x01, 0x00],
        fn(arg) {
          decodedData.open = decodeField(arg, 0, 7, "unsigned");
          if (decodedData.open === 255) {
            decodedData.open = true;
          } else {
            decodedData.open = false;
          }
          return 1;
        },
      },
      {
        key: [0x02, 0x00],
        fn(arg) {
          decodedData.lightDetected = decodeField(arg, 0, 7, "unsigned");
          return 1;
        },
      },
      {
        key: [0x03, 0x67],
        fn(arg) {
          decodedData.temperature = decodeField(arg, 0, 15, "signed") * 0.1;
          decodedData.temperatureF = cToF(decodedData.temperature);
          return 2;
        },
      },
      {
        key: [0x04, 0x68],
        fn(arg) {
          decodedData.humidity = decodeField(arg, 0, 7, "unsigned") * 0.5;
          return 1;
        },
      },
      {
        key: [0x05, 0x02],
        fn(arg) {
          decodedData.impactMagnitude =
            decodeField(arg, 0, 15, "unsigned") * 0.001;
          return 2;
        },
      },
      {
        key: [0x06, 0x00],
        fn(arg) {
          decodedData.breakIn = decodeField(arg, 0, 7, "bool");
          return 1;
        },
      },
      {
        key: [0x07, 0x71],
        fn(arg) {
          decodedData["acceleration.xaxis"] =
            decodeField(arg, 0, 15, "signed") * 0.001;
          decodedData["acceleration.yaxis"] =
            decodeField(arg, 16, 31, "signed") * 0.001;
          decodedData["acceleration.zaxis"] =
            decodeField(arg, 32, 47, "signed") * 0.001;
          return 6;
        },
      },
      {
        key: [0x08, 0x04],
        fn(arg) {
          decodedData.reedCount = decodeField(arg, 0, 15, "unsigned");
          return 2;
        },
      },
      {
        key: [0x09, 0x00],
        fn(arg) {
          decodedData.moisture = decodeField(arg, 0, 7, "unsigned");
          return 1;
        },
      },
      {
        key: [0x0a, 0x00],
        fn(arg) {
          decodedData.motionEventState = decodeField(arg, 0, 7, "unsigned");
          return 1;
        },
      },
      {
        key: [0x0b, 0x67],
        fn(arg) {
          decodedData.mcuTemperature = decodeField(arg, 0, 15, "signed") * 0.1;
          return 2;
        },
      },
      {
        key: [0x0c, 0x00],
        fn(arg) {
          decodedData.impactAlarm = decodeField(arg, 0, 7, "unsigned");
          return 1;
        },
      },
      {
        key: [0x0d, 0x04],
        fn(arg) {
          decodedData.motionEventCount = decodeField(arg, 0, 15, "unsigned");
          return 2;
        },
      },
      {
        key: [0x0e, 0x00],
        fn(arg) {
          decodedData.extconnectorState = decodeField(arg, 0, 7, "unsigned");
          return 1;
        },
      },
      {
        key: [0x0f, 0x04],
        fn(arg) {
          decodedData.extconnectorCount = decodeField(arg, 0, 15, "unsigned");
          return 2;
        },
      },
      {
        key: [0x10, 0x02],
        fn(arg) {
          decodedData.lightIntensity = decodeField(arg, 0, 7, "unsigned");
          return 1;
        },
      },
      {
        key: [0x11, 0x02],
        fn(arg) {
          decodedData.extconnectorAnalog =
            decodeField(arg, 0, 15, "unsigned") * 0.001;
          return 2;
        },
      },
    ];
  }
  if (port === 100) {
    decode = [
      {
        key: [0x00],
        fn(arg) {
          // decodedData.deviceEui = decodeField(arg, 0, 63, "hexstring");
          return 8;
        },
      },
      {
        key: [0x01],
        fn(arg) {
          // decodedData.appEui = decodeField(arg, 0, 63, "hexstring");
          return 8;
        },
      },
      {
        key: [0x02],
        fn(arg) {
          // decodedData.appKey = decodeField(arg, 0, 127, "hexstring");
          return 16;
        },
      },
      {
        key: [0x03],
        fn(arg) {
          // decodedData.deviceAddress = decodeField(arg, 0, 31, "hexstring");
          return 4;
        },
      },
      {
        key: [0x04],
        fn(arg) {
          // decodedData.networkSessionKey = decodeField(arg, 0, 127, "hexstring");
          return 16;
        },
      },
      {
        key: [0x05],
        fn(arg) {
          // decodedData.appSessionKey = decodeField(arg, 0, 127, "hexstring");
          return 16;
        },
      },
      {
        key: [0x10],
        fn(arg) {
          decodedData.loramacJoinMode = decodeField(arg, 7, 7, "unsigned");
          return 2;
        },
      },
      {
        key: [0x11],
        fn(arg) {
          decodedData["loramacOpts.confirmMode"] = decodeField(
            arg,
            8,
            8,
            "unsigned",
          );
          decodedData["loramacOpts.syncWord"] = decodeField(
            arg,
            9,
            9,
            "unsigned",
          );
          decodedData["loramacOpts.dutyCycle"] = decodeField(
            arg,
            10,
            10,
            "unsigned",
          );
          decodedData["loramacOpts.adr"] = decodeField(arg, 11, 11, "unsigned");
          return 2;
        },
      },
      {
        key: [0x12],
        fn(arg) {
          decodedData["loramacDrTx.drNumber"] = decodeField(
            arg,
            0,
            3,
            "unsigned",
          );
          decodedData["loramacDrTx.txPowerNumber"] = decodeField(
            arg,
            8,
            11,
            "unsigned",
          );
          return 2;
        },
      },
      {
        key: [0x13],
        fn(arg) {
          decodedData["loramacRx2.frequency"] = decodeField(
            arg,
            0,
            31,
            "unsigned",
          );
          decodedData["loramacRx2.drNumber"] = decodeField(
            arg,
            32,
            39,
            "unsigned",
          );
          return 5;
        },
      },
      {
        key: [0x20],
        fn(arg) {
          decodedData.secondsPerCoreTick = decodeField(arg, 0, 31, "unsigned");
          return 4;
        },
      },
      {
        key: [0x21],
        fn(arg) {
          decodedData.tickPerBattery = decodeField(arg, 0, 15, "unsigned");
          return 2;
        },
      },
      {
        key: [0x22],
        fn(arg) {
          decodedData.tickPerAmbientTemperature = decodeField(
            arg,
            0,
            15,
            "unsigned",
          );
          return 2;
        },
      },
      {
        key: [0x23],
        fn(arg) {
          decodedData.tickPerRelativeHumidity = decodeField(
            arg,
            0,
            15,
            "unsigned",
          );
          return 2;
        },
      },
      {
        key: [0x24],
        fn(arg) {
          decodedData.tickPerReedSwitch = decodeField(arg, 0, 15, "unsigned");
          return 2;
        },
      },
      {
        key: [0x25],
        fn(arg) {
          decodedData.tickPerLight = decodeField(arg, 0, 15, "unsigned");
          return 2;
        },
      },
      {
        key: [0x26],
        fn(arg) {
          decodedData.tickPerAccelerometer = decodeField(
            arg,
            0,
            15,
            "unsigned",
          );
          return 2;
        },
      },
      {
        key: [0x27],
        fn(arg) {
          decodedData.tickPerMcuTemperature = decodeField(
            arg,
            0,
            15,
            "unsigned",
          );
          return 2;
        },
      },
      {
        key: [0x28],
        fn(arg) {
          decodedData.tickPerPir = decodeField(arg, 0, 15, "unsigned");
          return 2;
        },
      },
      {
        key: [0x29],
        fn(arg) {
          decodedData.tickPerExternalConnector = decodeField(
            arg,
            0,
            15,
            "unsigned",
          );
          return 2;
        },
      },
      {
        key: [0x2a],
        fn(arg) {
          decodedData["reedMode.risingEdgeEnabled"] = decodeField(
            arg,
            0,
            0,
            "unsigned",
          );
          decodedData["reedMode.fallingEdgeEnabled"] = decodeField(
            arg,
            1,
            1,
            "unsigned",
          );
          return 1;
        },
      },
      {
        key: [0x2b],
        fn(arg) {
          decodedData.reedSwitchCountThreshold = decodeField(
            arg,
            0,
            15,
            "unsigned",
          );
          return 2;
        },
      },
      {
        key: [0x2c],
        fn(arg) {
          decodedData["reedTx.reportStateEnabled"] = decodeField(
            arg,
            0,
            0,
            "unsigned",
          );
          decodedData["reedTx.reportCountEnabled"] = decodeField(
            arg,
            1,
            1,
            "unsigned",
          );
          return 1;
        },
      },
      {
        key: [0x2d],
        fn(arg) {
          decodedData["externalConnector.risingEdgeEnabled"] = decodeField(
            arg,
            0,
            0,
            "unsigned",
          );
          decodedData["externalConnector.fallingEdgeEnabled"] = decodeField(
            arg,
            1,
            1,
            "unsigned",
          );
          decodedData["externalConnector.mode"] = decodeField(
            arg,
            7,
            7,
            "unsigned",
          );
          return 1;
        },
      },
      {
        key: [0x2e],
        fn(arg) {
          decodedData.externalConnectorCountThreshold = decodeField(
            arg,
            0,
            15,
            "unsigned",
          );
          return 2;
        },
      },
      {
        key: [0x2f],
        fn(arg) {
          decodedData["externalConnectorTx.reportStateEnabled"] = decodeField(
            arg,
            0,
            0,
            "unsigned",
          );
          decodedData["externalConnectorTx.reportCountEnabled"] = decodeField(
            arg,
            1,
            1,
            "unsigned",
          );
          return 1;
        },
      },
      {
        key: [0x30],
        fn(arg) {
          decodedData.impactEventThreshold =
            decodeField(arg, 0, 15, "unsigned") * 0.001;
          return 2;
        },
      },
      {
        key: [0x31],
        fn(arg) {
          decodedData.accelerationEventThreshold =
            decodeField(arg, 0, 15, "unsigned") * 0.001;
          return 2;
        },
      },
      {
        key: [0x32],
        fn(arg) {
          decodedData["accelerometerTx.reportAlarmEnabled"] = decodeField(
            arg,
            0,
            0,
            "unsigned",
          );
          decodedData["accelerometerTx.reportMagnitudeEnabled"] = decodeField(
            arg,
            4,
            4,
            "unsigned",
          );
          decodedData["accelerometerTx.reportVectorEnabled"] = decodeField(
            arg,
            5,
            5,
            "unsigned",
          );
          return 1;
        },
      },
      {
        key: [0x33],
        fn(arg) {
          decodedData.accelerationImpactGracePeriod = decodeField(
            arg,
            0,
            15,
            "unsigned",
          );
          return 2;
        },
      },
      {
        key: [0x34],
        fn(arg) {
          decodedData["accelerometer.impactThresholdEnabled"] = decodeField(
            arg,
            0,
            0,
            "unsigned",
          );
          decodedData["accelerometer.accelerationThresholdEnabled"] =
            decodeField(arg, 1, 1, "unsigned");
          decodedData["accelerometer.xaxisEnabled"] = decodeField(
            arg,
            4,
            4,
            "unsigned",
          );
          decodedData["accelerometer.yaxisEnabled"] = decodeField(
            arg,
            5,
            5,
            "unsigned",
          );
          decodedData["accelerometer.zaxisEnabled"] = decodeField(
            arg,
            6,
            6,
            "unsigned",
          );
          decodedData["accelerometer.poweron"] = decodeField(
            arg,
            7,
            7,
            "unsigned",
          );
          return 1;
        },
      },
      {
        key: [0x35],
        fn(arg) {
          // }
          decodedData["sensitivity.accelerometerSampleRate"] = decodeField(
            arg,
            0,
            2,
            "unsigned",
          );
          switch (decodedData["sensitivity.accelerometerSampleRate"]) {
            case 1:
              decodedData["sensitivity.accelerometerSampleRate"] = 1;
              break;
            case 2:
              decodedData["sensitivity.accelerometerSampleRate"] = 10;
              break;
            case 3:
              decodedData["sensitivity.accelerometerSampleRate"] = 25;
              break;
            case 4:
              decodedData["sensitivity.accelerometerSampleRate"] = 50;
              break;
            case 5:
              decodedData["sensitivity.accelerometerSampleRate"] = 100;
              break;
            case 6:
              decodedData["sensitivity.accelerometerSampleRate"] = 200;
              break;
            case 7:
              decodedData["sensitivity.accelerometerSampleRate"] = 400;
              break;
            default: // invalid value
              decodedData["sensitivity.accelerometerSampleRate"] = 0;
              break;
          }

          decodedData["sensitivity.accelerometerMeasurementRange"] =
            decodeField(arg, 4, 5, "unsigned");
          switch (decodedData["sensitivity.accelerometerMeasurementRange"]) {
            case 0:
              decodedData["sensitivity.accelerometerMeasurementRange"] = 2;
              break;
            case 1:
              decodedData["sensitivity.accelerometerMeasurementRange"] = 4;
              break;
            case 2:
              decodedData["sensitivity.accelerometerMeasurementRange"] = 8;
              break;
            case 3:
              decodedData["sensitivity.accelerometerMeasurementRange"] = 16;
              break;
            default:
              decodedData["sensitivity.accelerometerMeasurementRange"] = 0;
          }
          return 1;
        },
      },
      {
        key: [0x36],
        fn(arg) {
          decodedData.impactAlarmGracePeriod = decodeField(
            arg,
            0,
            15,
            "unsigned",
          );
          return 2;
        },
      },
      {
        key: [0x37],
        fn(arg) {
          decodedData.impactAlarmThresholdCount = decodeField(
            arg,
            0,
            15,
            "unsigned",
          );
          return 2;
        },
      },
      {
        key: [0x38],
        fn(arg) {
          decodedData.impactAlarmThresholdPeriod = decodeField(
            arg,
            0,
            15,
            "unsigned",
          );
          return 2;
        },
      },
      {
        key: [0x39],
        fn(arg) {
          decodedData.temperatureRelativeHumiditySamplePeriodIdle = decodeField(
            arg,
            0,
            31,
            "unsigned",
          );
          return 4;
        },
      },
      {
        key: [0x3a],
        fn(arg) {
          decodedData.temperatureRelativeHumiditySamplePeriodActive =
            decodeField(arg, 0, 31, "unsigned");
          return 4;
        },
      },
      {
        key: [0x3b],
        fn(arg) {
          decodedData["ambientTemperatureThreshold.high"] = decodeField(
            arg,
            0,
            7,
            "signed",
          );
          decodedData["ambientTemperatureThreshold.low"] = decodeField(
            arg,
            8,
            15,
            "signed",
          );
          return 2;
        },
      },
      {
        key: [0x3c],
        fn(arg) {
          decodedData.ambientTemperatureThresholdEnabled = decodeField(
            arg,
            0,
            0,
            "unsigned",
          );
          return 1;
        },
      },
      {
        key: [0x3d],
        fn(arg) {
          decodedData["relativeHumidityThreshold.low"] = decodeField(
            arg,
            0,
            7,
            "unsigned",
          );
          decodedData["relativeHumidityThreshold.high"] = decodeField(
            arg,
            8,
            15,
            "unsigned",
          );
          return 2;
        },
      },
      {
        key: [0x3e],
        fn(arg) {
          decodedData.relativeHumidityThresholdEnabled = decodeField(
            arg,
            0,
            0,
            "unsigned",
          );
          return 1;
        },
      },
      {
        key: [0x40],
        fn(arg) {
          decodedData.mcuTemperatureSamplePeriodIdle = decodeField(
            arg,
            0,
            31,
            "unsigned",
          );
          return 4;
        },
      },
      {
        key: [0x41],
        fn(arg) {
          decodedData.mcuTemperatureSamplePeriodActive = decodeField(
            arg,
            0,
            31,
            "unsigned",
          );
          return 4;
        },
      },
      {
        key: [0x42],
        fn(arg) {
          decodedData["mcuTemperatureThreshold.high"] = decodeField(
            arg,
            0,
            7,
            "signed",
          );
          decodedData["mcuTemperatureThreshold.low"] = decodeField(
            arg,
            8,
            15,
            "signed",
          );
          return 2;
        },
      },
      {
        key: [0x43],
        fn(arg) {
          decodedData.mcuTemperatureThresholdEnabled = decodeField(
            arg,
            0,
            0,
            "unsigned",
          );
          return 1;
        },
      },
      {
        key: [0x44],
        fn(arg) {
          decodedData.analogSamplePeriodIdle = decodeField(
            arg,
            0,
            31,
            "unsigned",
          );
          return 4;
        },
      },
      {
        key: [0x45],
        fn(arg) {
          decodedData.analogSamplePeriodActive = decodeField(
            arg,
            0,
            31,
            "unsigned",
          );
          return 4;
        },
      },
      {
        key: [0x46],
        fn(arg) {
          decodedData["analogInputThreshold.high"] =
            decodeField(arg, 0, 15, "unsigned") * 0.001;
          decodedData["analogInputThreshold.low"] =
            decodeField(arg, 16, 31, "unsigned") * 0.001;
          return 4;
        },
      },
      {
        key: [0x47],
        fn(arg) {
          decodedData.lightSamplePeriod = decodeField(arg, 0, 31, "unsigned");
          return 4;
        },
      },
      {
        key: [0x48],
        fn(arg) {
          decodedData["light.threshold"] = decodeField(arg, 0, 5, "unsigned");
          decodedData["light.thresholdEnabled"] =
            decodeField(arg, 7, 7, "unsigned") * 1;
          return 1;
        },
      },
      {
        key: [0x49],
        fn(arg) {
          decodedData["lightTx.stateReported"] = decodeField(
            arg,
            0,
            0,
            "unsigned",
          );
          decodedData["lightTx.intensityReported"] = decodeField(
            arg,
            1,
            1,
            "unsigned",
          );
          return 1;
        },
      },
      {
        key: [0x4a],
        fn(arg) {
          decodedData.analogInputThresholdEnabled = decodeField(
            arg,
            0,
            0,
            "unsigned",
          );
          return 1;
        },
      },
      {
        key: [0x50],
        fn(arg) {
          decodedData.pirGracePeriod = decodeField(arg, 0, 15, "unsigned");
          return 2;
        },
      },
      {
        key: [0x51],
        fn(arg) {
          decodedData.pirThreshold = decodeField(arg, 0, 15, "unsigned");
          return 2;
        },
      },
      {
        key: [0x52],
        fn(arg) {
          decodedData.pirThresholdPeriod = decodeField(arg, 0, 15, "unsigned");
          return 2;
        },
      },
      {
        key: [0x53],
        fn(arg) {
          decodedData["pirMode.motionCountReported"] = decodeField(
            arg,
            0,
            0,
            "unsigned",
          );
          decodedData["pirMode.motionStateReported"] = decodeField(
            arg,
            1,
            1,
            "unsigned",
          );
          decodedData["pirMode.eventTransmissionEnabled"] = decodeField(
            arg,
            6,
            6,
            "unsigned",
          );
          decodedData["pirMode.transducerEnabled"] = decodeField(
            arg,
            7,
            7,
            "unsigned",
          );
          return 1;
        },
      },
      {
        key: [0x5a],
        fn(arg) {
          // }
          decodedData.moistureSamplePeriod = decodeField(arg, 0, 2, "unsigned");
          switch (decodedData.moistureSamplePeriod) {
            case 1:
              decodedData.moistureSamplePeriod = 16;
              break;
            case 2:
              decodedData.moistureSamplePeriod = 32;
              break;
            case 3:
              decodedData.moistureSamplePeriod = 64;
              break;
            case 4:
              decodedData.moistureSamplePeriod = 128;
              break;
            default:
              decodedData.moistureSamplePeriod = 0;
          }
          return 1;
        },
      },
      {
        key: [0x5b],
        fn(arg) {
          decodedData.moistureThreshold = decodeField(arg, 0, 7, "unsigned");
          return 1;
        },
      },
      {
        key: [0x5c],
        fn(arg) {
          decodedData.moistureSensingEnabled = decodeField(
            arg,
            0,
            0,
            "unsigned",
          );
          return 1;
        },
      },
      {
        key: [0x5d],
        fn(arg) {
          decodedData.moistureCaliberationDry = decodeField(
            arg,
            0,
            7,
            "unsigned",
          );
          return 1;
        },
      },
      {
        key: [0x71],
        fn(arg) {
          decodedData["firmwareVersion.appMajorVersion"] = decodeField(
            arg,
            0,
            7,
            "unsigned",
          );
          decodedData["firmwareVersion.appMinorVersion"] = decodeField(
            arg,
            8,
            15,
            "unsigned",
          );
          decodedData["firmwareVersion.appRevision"] = decodeField(
            arg,
            16,
            23,
            "unsigned",
          );
          decodedData["firmwareVersion.loramacMajorVersion"] = decodeField(
            arg,
            24,
            31,
            "unsigned",
          );
          decodedData["firmwareVersion.loramacMinorVersion"] = decodeField(
            arg,
            32,
            39,
            "unsigned",
          );
          decodedData["firmwareVersion.loramacRevision"] = decodeField(
            arg,
            40,
            47,
            "unsigned",
          );
          decodedData["firmwareVersion.region"] = decodeField(
            arg,
            48,
            55,
            "unsigned",
          );
          return 7;
        },
      },
    ];
  }

  bytes = convertToUint8Array(bytes);

  for (let bytesLeft = bytes.length; bytesLeft > 0; ) {
    let found = false;
    for (let i = 0; i < decode.length; i++) {
      const item = decode[i];
      const { key } = item;
      const keylen = key.length;
      const header = slice(bytes, 0, keylen);
      // Header in the data matches to what we expect
      if (isEqual(header, key)) {
        const f = item.fn;
        const consumed = f(slice(bytes, keylen, bytes.length)) + keylen;
        bytesLeft -= consumed;
        bytes = slice(bytes, consumed, bytes.length);
        found = true;
        break;
      }
    }
    if (!found) {
      // Unable to decode -- headers are not as expected, send raw payload to the application!
      decodedData = {};
      decodedData.raw = JSON.stringify(byteToArray(bytes));
      decodedData.port = port;
      return decodedData;
    }
  }

  return decodedData;
}

function consume(event) {
  const payload = event.data.payloadHex;
  const { port } = event.data;
  const data = decoder(Hex.hexToBytes(payload), port);
  let topic = "default";

  if (data.batteryVoltage !== undefined) {
    emit("sample", {
      data: { batteryVoltage: data.batteryVoltage },
      topic: "lifecycle",
    });
    delete data.batteryVoltage;
  }

  if (data.reedCount !== undefined) {
    topic = "reed";
  } else if (data.occupancy !== undefined) {
    topic = "occupancy";
  }

  emit("sample", { data, topic });
}
