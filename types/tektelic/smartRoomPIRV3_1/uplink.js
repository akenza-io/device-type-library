function slice(a, f, t) {
  const res = [];
  for (let i = 0; i < t - f; i++) {
    res[i] = a[f + i];
  }
  return res;
}

// Extracts bits from a byte array
function extractBytes(chunk, startBit, endBit) {
  const array = new Array(0);
  let totalBits = startBit - endBit + 1;
  const totalBytes = Math.ceil(totalBits / 8);
  let endBits = 0;
  let startBits = 0;
  for (let i = 0; i < totalBytes; i++) {
    if (totalBits > 8) {
      endBits = endBit;
      startBits = endBits + 7;
      endBit += 8;
      totalBits -= 8;
    } else {
      endBits = endBit;
      startBits = endBits + totalBits - 1;
      totalBits = 0;
    }
    const endChunk = chunk.length - Math.ceil((endBits + 1) / 8);
    const startChunk = chunk.length - Math.ceil((startBits + 1) / 8);
    let word = 0x0;
    if (startChunk === endChunk) {
      const endOffset = endBits % 8;
      const startOffset = startBits % 8;
      const mask = 0xff >> (8 - (startOffset - endOffset + 1));
      word = (chunk[startChunk] >> endOffset) & mask;
      array.unshift(word);
    } else {
      const endChunkEndOffset = endBits % 8;
      const endChunkStartOffset = 7;
      const endChunkMask =
        0xff >> (8 - (endChunkStartOffset - endChunkEndOffset + 1));
      const endChunkWord =
        (chunk[endChunk] >> endChunkEndOffset) & endChunkMask;
      const startChunkEndOffset = 0;
      const startChunkStartOffset = startBits % 8;
      const startChunkMask =
        0xff >> (8 - (startChunkStartOffset - startChunkEndOffset + 1));
      const startChunkWord =
        (chunk[startChunk] >> startChunkEndOffset) & startChunkMask;
      const startChunkWordShifted =
        startChunkWord << (endChunkStartOffset - endChunkEndOffset + 1);
      word = endChunkWord | startChunkWordShifted;
      array.unshift(word);
    }
  }
  return array;
}

// Applies data type to a byte array
function applyDataType(bytes, dataType) {
  let output = 0;
  if (dataType === "unsigned") {
    let i = 0;
    for (i = 0; i < bytes.length; ++i) {
      output = toUint(output << 8) | bytes[i];
    }
    return output;
  }
  if (dataType === "signed") {
    let i = 0;
    for (i = 0; i < bytes.length; ++i) {
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
  return null; // Incorrect data type
}

// Decodes bitfield from the given chunk of bytes
function decodeField(chunk, size, startBit, endBit, dataType) {
  const newChunk = chunk.slice(0, size);
  const chunkSize = newChunk.length;
  if (startBit >= chunkSize * 8) {
    return null; // Error: exceeding boundaries of the chunk
  }
  if (startBit < endBit) {
    return null; // Error: invalid input
  }
  const array = extractBytes(newChunk, startBit, endBit);
  return applyDataType(array, dataType);
}

// Converts value to unsigned
function toUint(x) {
  return x >>> 0;
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

// Converts array of bytes to hex string
function toHexString(byteArray) {
  const arr = [];
  for (let i = 0; i < byteArray.length; ++i) {
    arr.push(`0${(byteArray[i] & 0xff).toString(16)}`.slice(-2));
  }
  return arr.join(" ");
}

// Converts array of bytes to 8 bit array
function convertToUint8Array(byteArray) {
  const arr = [];
  for (let i = 0; i < byteArray.length; i++) {
    arr.push(toUint(byteArray[i]) & 0xff);
  }
  return arr;
}

function decoder(bytes, port) {
  const decodedData = {};
  let decode = [];

  if (port === 101) {
    decode = [
      {
        key: [],
        fn(arg) {
          const size = arg.length;
          let invalidRegisters = [];
          const responses = [];
          while (arg.length > 0) {
            const downlinkFcnt = arg[0];
            const numInvalidWrites = arg[1];
            arg = arg.slice(2);
            if (numInvalidWrites > 0) {
              for (let i = 0; i < numInvalidWrites; i++) {
                invalidRegisters.push(`0x${arg[i].toString(16)}`);
              }
              arg = arg.slice(numInvalidWrites);
              responses.push(
                `${numInvalidWrites} Invalid write command(s) from DL:${downlinkFcnt} for register(s): ${invalidRegisters}`,
              );
            } else {
              responses.push(
                `All write commands from DL:${downlinkFcnt}were successfull`,
              );
            }
            invalidRegisters = [];
          }
          decodedData.response = responses;
          return size;
        },
      },
    ];
  }

  if (port === 100) {
    decode = [
      {
        key: [0x00],
        fn(arg) {
          return 8;
        },
      },
      {
        key: [0x01],
        fn(arg) {
          return 8;
        },
      },
      {
        key: [0x02],
        fn(arg) {
          return 16;
        },
      },
      {
        key: [0x03],
        fn(arg) {
          return 4;
        },
      },
      {
        key: [0x04],
        fn(arg) {
          return 16;
        },
      },
      {
        key: [0x05],
        fn(arg) {
          return 16;
        },
      },
      {
        key: [0x10],
        fn(arg) {
          const val = decodeField(arg, 2, 15, 15, "unsigned");
          switch (val) {
            case 0:
              decodedData.joinMode = "ABP";
              break;
            case 1:
              decodedData.joinMode = "OTAA";
              break;
            default:
              decodedData.joinMode = "Invalid";
          }
          return 2;
        },
      },
      {
        key: [0x11],
        fn(arg) {
          let val = decodeField(arg, 2, 0, 0, "unsigned");
          switch (val) {
            case 0:
              decodedData.confirmMode = "UNCONFIRMED";
              break;
            case 1:
              decodedData.confirmMode = "CONFIRMED";
              break;
            default:
              decodedData.confirmMode = "INVALID";
          }
          val = decodeField(arg, 2, 1, 1, "unsigned");
          switch (val) {
            case 0:
              decodedData.syncWord = "PRIVATE";
              break;
            case 1:
              decodedData.syncWord = "PUBLIC";
              break;
            default:
              decodedData.syncWord = "INVALID";
          }
          val = decodeField(arg, 2, 2, 2, "unsigned");
          switch (val) {
            case 0:
              decodedData.dutyCycle = "DISABLED";
              break;
            case 1:
              decodedData.dutyCycle = "ENABLED";
              break;
            default:
              decodedData.dutyCycle = "INVALID";
          }
          val = decodeField(arg, 2, 3, 3, "unsigned");
          switch (val) {
            case 0:
              decodedData.adr = "DISABLED";
              break;
            case 1:
              decodedData.adr = "ENABLED";
              break;
            default:
              decodedData.adr = "INVALID";
          }
          return 2;
        },
      },
      {
        key: [0x12],
        fn(arg) {
          decodedData.drNumber = decodeField(arg, 2, 11, 8, "unsigned");
          decodedData.txPower = decodeField(arg, 2, 3, 0, "unsigned");
          return 2;
        },
      },
      {
        key: [0x13],
        fn(arg) {
          decodedData.frequency = decodeField(arg, 5, 39, 8, "unsigned");
          decodedData.drNumber = decodeField(arg, 5, 7, 0, "unsigned");
          return 5;
        },
      },
      {
        key: [0x19],
        fn(arg) {
          decodedData.loramacNetIdMsb = decodeField(arg, 2, 15, 0, "unsigned");
          return 2;
        },
      },
      {
        key: [0x1a],
        fn(arg) {
          decodedData.loramacNetIdLsb = decodeField(arg, 2, 15, 0, "unsigned");
          return 2;
        },
      },
      {
        key: [0x20],
        fn(arg) {
          decodedData.secondsPerCoreTick = decodeField(
            arg,
            4,
            31,
            0,
            "unsigned",
          );
          return 4;
        },
      },
      {
        key: [0x21],
        fn(arg) {
          decodedData.tickPerBattery = decodeField(arg, 2, 15, 0, "unsigned");
          return 2;
        },
      },
      {
        key: [0x22],
        fn(arg) {
          decodedData.tickPerAmbientTemperature = decodeField(
            arg,
            2,
            15,
            0,
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
            2,
            15,
            0,
            "unsigned",
          );
          return 2;
        },
      },
      {
        key: [0x24],
        fn(arg) {
          decodedData.tickPerReedSwitch = decodeField(
            arg,
            2,
            15,
            0,
            "unsigned",
          );
          return 2;
        },
      },
      {
        key: [0x25],
        fn(arg) {
          decodedData.tickPerLight = decodeField(arg, 2, 15, 0, "unsigned");
          return 2;
        },
      },
      {
        key: [0x26],
        fn(arg) {
          decodedData.tickPerAccelerometer = decodeField(
            arg,
            2,
            15,
            0,
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
            2,
            15,
            0,
            "unsigned",
          );
          return 2;
        },
      },
      {
        key: [0x28],
        fn(arg) {
          decodedData.tickPerPir = decodeField(arg, 2, 15, 0, "unsigned");
          return 2;
        },
      },
      {
        key: [0x29],
        fn(arg) {
          decodedData.tickPerExternalConnector = decodeField(
            arg,
            2,
            15,
            0,
            "unsigned",
          );
          return 2;
        },
      },
      {
        key: [0x2a],
        fn(arg) {
          let val = decodeField(arg, 1, 0, 0, "unsigned");
          switch (val) {
            case 0:
              decodedData.risingEdgeEnabled = "DISABLED";
              break;
            case 1:
              decodedData.risingEdgeEnabled = "ENABLED";
              break;
            default:
              decodedData.risingEdgeEnabled = "INVALID";
          }
          val = decodeField(arg, 1, 1, 1, "unsigned");
          switch (val) {
            case 0:
              decodedData.fallingEdgeEnabled = "DISABLED";
              break;
            case 1:
              decodedData.fallingEdgeEnabled = "ENABLED";
              break;
            default:
              decodedData.fallingEdgeEnabled = "INVALID";
          }
          return 1;
        },
      },
      {
        key: [0x2b],
        fn(arg) {
          decodedData.reedSwitchCountThreshold = decodeField(
            arg,
            2,
            15,
            0,
            "unsigned",
          );
          return 2;
        },
      },
      {
        key: [0x2c],
        fn(arg) {
          let val = decodeField(arg, 1, 0, 0, "unsigned");
          switch (val) {
            case 0:
              decodedData.reportStateEnabled = "OFF";
              break;
            case 1:
              decodedData.reportStateEnabled = "ON";
              break;
            default:
              decodedData.reportStateEnabled = "INVALID";
          }
          val = decodeField(arg, 1, 1, 1, "unsigned");
          switch (val) {
            case 0:
              decodedData.reportCountEnabled = "OFF";
              break;
            case 1:
              decodedData.reportCountEnabled = "ON";
              break;
            default:
              decodedData.reportCountEnabled = "INVALID";
          }
          return 1;
        },
      },
      {
        key: [0x2d],
        fn(arg) {
          let val = decodeField(arg, 1, 0, 0, "unsigned");
          switch (val) {
            case 0:
              decodedData.risingEdgeEnabledEx = "DISABLED";
              break;
            case 1:
              decodedData.risingEdgeEnabledEx = "ENABLED";
              break;
            default:
              decodedData.risingEdgeEnabledEx = "INVALID";
          }
          val = decodeField(arg, 1, 1, 1, "unsigned");
          switch (val) {
            case 0:
              decodedData.fallingEdgeEnabledEx = "DISABLED";
              break;
            case 1:
              decodedData.fallingEdgeEnabledEx = "ENABLED";
              break;
            default:
              decodedData.fallingEdgeEnabledEx = "INVALID";
          }
          val = decodeField(arg, 1, 7, 7, "unsigned");
          switch (val) {
            case 0:
              decodedData.mode = "DIGITAL";
              break;
            case 1:
              decodedData.mode = "ANALOG";
              break;
            default:
              decodedData.mode = "INVALID";
          }
          return 1;
        },
      },
      {
        key: [0x2e],
        fn(arg) {
          decodedData.externalConnectorCountThreshold = decodeField(
            arg,
            2,
            15,
            0,
            "unsigned",
          );
          return 2;
        },
      },
      {
        key: [0x2f],
        fn(arg) {
          let val = decodeField(arg, 1, 0, 0, "unsigned");
          switch (val) {
            case 0:
              decodedData.reportStateEnabledEx = "OFF";
              break;
            case 1:
              decodedData.reportStateEnabledEx = "ON";
              break;
            default:
              decodedData.reportStateEnabledEx = "INVALID";
          }
          val = decodeField(arg, 1, 1, 1, "unsigned");
          switch (val) {
            case 0:
              decodedData.reportCountEnabledEx = "OFF";
              break;
            case 1:
              decodedData.reportCountEnabledEx = "ON";
              break;
            default:
              decodedData.reportCountEnabledEx = "INVALID";
          }
          decodedData.countType = decodeField(arg, 1, 4, 4, "unsigned");
          return 1;
        },
      },
      {
        key: [0x30],
        fn(arg) {
          decodedData.impactEventThreshold = (
            decodeField(arg, 2, 15, 0, "unsigned") * 0.001
          ).toFixed(3);
          return 2;
        },
      },
      {
        key: [0x31],
        fn(arg) {
          decodedData.accelerationEventThreshold = (
            decodeField(arg, 2, 15, 0, "unsigned") * 0.001
          ).toFixed(3);
          return 2;
        },
      },
      {
        key: [0x32],
        fn(arg) {
          let val = decodeField(arg, 1, 0, 0, "unsigned");
          switch (val) {
            case 0:
              decodedData.reportPeriodicAlarmEnabled = "OFF";
              break;
            case 1:
              decodedData.reportPeriodicAlarmEnabled = "ON";
              break;
            default:
              decodedData.reportPeriodicAlarmEnabled = "INVALID";
          }
          val = decodeField(arg, 1, 1, 1, "unsigned");
          switch (val) {
            case 0:
              decodedData.reportPeriodicMagnitudeEnabled = "OFF";
              break;
            case 1:
              decodedData.reportPeriodicMagnitudeEnabled = "ON";
              break;
            default:
              decodedData.reportPeriodicMagnitudeEnabled = "INVALID";
          }
          val = decodeField(arg, 1, 2, 2, "unsigned");
          switch (val) {
            case 0:
              decodedData.reportPeriodicVectorEnabled = "OFF";
              break;
            case 1:
              decodedData.reportPeriodicVectorEnabled = "ON";
              break;
            default:
              decodedData.reportPeriodicVectorEnabled = "INVALID";
          }
          val = decodeField(arg, 1, 4, 4, "unsigned");
          switch (val) {
            case 0:
              decodedData.reportEventMagnitudeEnabled = "OFF";
              break;
            case 1:
              decodedData.reportEventMagnitudeEnabled = "ON";
              break;
            default:
              decodedData.reportEventMagnitudeEnabled = "INVALID";
          }
          val = decodeField(arg, 1, 5, 5, "unsigned");
          switch (val) {
            case 0:
              decodedData.reportEventVectorEnabled = "OFF";
              break;
            case 1:
              decodedData.reportEventVectorEnabled = "ON";
              break;
            default:
              decodedData.reportEventVectorEnabled = "INVALID";
          }
          return 1;
        },
      },
      {
        key: [0x33],
        fn(arg) {
          decodedData.accelerationImpactGracePeriod = decodeField(
            arg,
            2,
            15,
            0,
            "unsigned",
          );
          return 2;
        },
      },
      {
        key: [0x34],
        fn(arg) {
          let val = decodeField(arg, 1, 0, 0, "unsigned");
          switch (val) {
            case 0:
              decodedData.impactThresholdEnabled = "DISABLED";
              break;
            case 1:
              decodedData.impactThresholdEnabled = "ENABLED";
              break;
            default:
              decodedData.impactThresholdEnabled = "INVALID";
          }
          val = decodeField(arg, 1, 1, 1, "unsigned");
          switch (val) {
            case 0:
              decodedData.accelerationThresholdEnabled = "DISABLED";
              break;
            case 1:
              decodedData.accelerationThresholdEnabled = "ENABLED";
              break;
            default:
              decodedData.accelerationThresholdEnabled = "INVALID";
          }
          val = decodeField(arg, 1, 4, 4, "unsigned");
          switch (val) {
            case 0:
              decodedData.xaxisEnabled = "DISABLED";
              break;
            case 1:
              decodedData.xaxisEnabled = "ENABLED";
              break;
            default:
              decodedData.xaxisEnabled = "INVALID";
          }
          val = decodeField(arg, 1, 5, 5, "unsigned");
          switch (val) {
            case 0:
              decodedData.yaxisEnabled = "DISABLED";
              break;
            case 1:
              decodedData.yaxisEnabled = "ENABLED";
              break;
            default:
              decodedData.yaxisEnabled = "INVALID";
          }
          val = decodeField(arg, 1, 6, 6, "unsigned");
          switch (val) {
            case 0:
              decodedData.zaxisEnabled = "DISABLED";
              break;
            case 1:
              decodedData.zaxisEnabled = "ENABLED";
              break;
            default:
              decodedData.zaxisEnabled = "INVALID";
          }
          val = decodeField(arg, 1, 7, 7, "unsigned");
          switch (val) {
            case 0:
              decodedData.powerOn = "OFF";
              break;
            case 1:
              decodedData.powerOn = "ON";
              break;
            default:
              decodedData.powerOn = "INVALID";
          }
          return 1;
        },
      },
      {
        key: [0x35],
        fn(arg) {
          let val = decodeField(arg, 1, 2, 0, "unsigned");
          switch (val) {
            case 1:
              decodedData.accelerometerSampleRate = 1;
              break;
            case 2:
              decodedData.accelerometerSampleRate = 10;
              break;
            case 3:
              decodedData.accelerometerSampleRate = 25;
              break;
            case 4:
              decodedData.accelerometerSampleRate = 50;
              break;
            case 5:
              decodedData.accelerometerSampleRate = 100;
              break;
            case 6:
              decodedData.accelerometerSampleRate = 200;
              break;
            case 7:
              decodedData.accelerometerSampleRate = 400;
              break;
            default:
              decodedData.accelerometerSampleRate = 0;
          }
          val = decodeField(arg, 1, 5, 4, "unsigned");
          switch (val) {
            case 0:
              decodedData.accelerometerMeasurementRange = 2;
              break;
            case 1:
              decodedData.accelerometerMeasurementRange = 4;
              break;
            case 2:
              decodedData.accelerometerMeasurementRange = 8;
              break;
            case 3:
              decodedData.accelerometerMeasurementRange = 16;
              break;
            default:
              decodedData.accelerometerMeasurementRange = 0;
          }
          return 1;
        },
      },
      {
        key: [0x36],
        fn(arg) {
          decodedData.impactAlarmGracePeriod = decodeField(
            arg,
            2,
            15,
            0,
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
            2,
            15,
            0,
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
            2,
            15,
            0,
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
            4,
            31,
            0,
            "unsigned",
          );
          return 4;
        },
      },
      {
        key: [0x3a],
        fn(arg) {
          decodedData.temperatureRelativeHumiditySamplePeriodActive =
            decodeField(arg, 4, 31, 0, "unsigned");
          return 4;
        },
      },
      {
        key: [0x3b],
        fn(arg) {
          decodedData.highTempThreshold = decodeField(arg, 2, 15, 8, "signed");
          decodedData.lowTempThreshold = decodeField(arg, 2, 7, 0, "signed");
          return 2;
        },
      },
      {
        key: [0x3c],
        fn(arg) {
          const val = decodeField(arg, 1, 0, 0, "unsigned");
          switch (val) {
            case 0:
              decodedData.ambientTemperatureThresholdEnabled = "DISABLED";
              break;
            case 1:
              decodedData.ambientTemperatureThresholdEnabled = "ENABLED";
              break;
            default:
              decodedData.ambientTemperatureThresholdEnabled = "INVALID";
          }
          return 1;
        },
      },
      {
        key: [0x3d],
        fn(arg) {
          decodedData.highRhThreshold = decodeField(arg, 2, 15, 8, "unsigned");
          decodedData.lowRhThreshold = decodeField(arg, 2, 7, 0, "unsigned");
          return 2;
        },
      },
      {
        key: [0x3e],
        fn(arg) {
          const val = decodeField(arg, 1, 0, 0, "unsigned");
          switch (val) {
            case 0:
              decodedData.relativeHumidityThresholdEnabled = "DISABLED";
              break;
            case 1:
              decodedData.relativeHumidityThresholdEnabled = "ENABLED";
              break;
            default:
              decodedData.relativeHumidityThresholdEnabled = "INVALID";
          }
          return 1;
        },
      },
      {
        key: [0x40],
        fn(arg) {
          decodedData.mcuTemperatureSamplePeriodIdle = decodeField(
            arg,
            4,
            31,
            0,
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
            4,
            31,
            0,
            "unsigned",
          );
          return 4;
        },
      },
      {
        key: [0x42],
        fn(arg) {
          decodedData.highMcuTempThreshold = decodeField(
            arg,
            2,
            15,
            8,
            "signed",
          );
          decodedData.lowMcuTempThreshold = decodeField(arg, 2, 7, 0, "signed");
          return 2;
        },
      },
      {
        key: [0x43],
        fn(arg) {
          const val = decodeField(arg, 1, 0, 0, "unsigned");
          switch (val) {
            case 0:
              decodedData.mcuTemperatureThresholdEnabled = "DISABLED";
              break;
            case 1:
              decodedData.mcuTemperatureThresholdEnabled = "ENABLED";
              break;
            default:
              decodedData.mcuTemperatureThresholdEnabled = "INVALID";
          }
          return 1;
        },
      },
      {
        key: [0x44],
        fn(arg) {
          decodedData.analogSamplePeriodIdle = decodeField(
            arg,
            4,
            31,
            0,
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
            4,
            31,
            0,
            "unsigned",
          );
          return 4;
        },
      },
      {
        key: [0x46],
        fn(arg) {
          decodedData.highAnalogThreshold = (
            decodeField(arg, 4, 31, 16, "unsigned") * 0.001
          ).toFixed(3);
          decodedData.lowAnalogThreshold = (
            decodeField(arg, 4, 15, 0, "unsigned") * 0.001
          ).toFixed(3);
          return 4;
        },
      },
      {
        key: [0x4a],
        fn(arg) {
          const val = decodeField(arg, 1, 0, 0, "unsigned");
          switch (val) {
            case 0:
              decodedData.analogInputThresholdEnabled = "DISABLED";
              break;
            case 1:
              decodedData.analogInputThresholdEnabled = "ENABLED";
              break;
            default:
              decodedData.analogInputThresholdEnabled = "INVALID";
          }
          return 1;
        },
      },
      {
        key: [0x47],
        fn(arg) {
          decodedData.lightSamplePeriod = decodeField(
            arg,
            4,
            31,
            0,
            "unsigned",
          );
          return 4;
        },
      },
      {
        key: [0x48],
        fn(arg) {
          const val = decodeField(arg, 1, 7, 7, "unsigned");
          switch (val) {
            case 0:
              decodedData.lightThreshold = "DISABLED";
              break;
            case 1:
              decodedData.lightThreshold = "ENABLED";
              break;
            default:
              decodedData.lightThreshold = "INVALID";
          }
          decodedData.thresholdEnabled = decodeField(arg, 1, 5, 0, "unsigned");
          return 1;
        },
      },
      {
        key: [0x49],
        fn(arg) {
          let val = decodeField(arg, 1, 1, 1, "unsigned");
          switch (val) {
            case 0:
              decodedData.lightStateReported = "DISABLED";
              break;
            case 1:
              decodedData.lightStateReported = "ENABLED";
              break;
            default:
              decodedData.lightStateReported = "INVALID";
          }
          val = decodeField(arg, 1, 0, 0, "unsigned");
          switch (val) {
            case 0:
              decodedData.lightIntensityReported = "DISABLED";
              break;
            case 1:
              decodedData.lightIntensityReported = "ENABLED";
              break;
            default:
              decodedData.lightIntensityReported = "INVALID";
          }
          return 1;
        },
      },
      {
        key: [0x50],
        fn(arg) {
          decodedData.pirGracePeriod = decodeField(arg, 2, 15, 0, "unsigned");
          return 2;
        },
      },
      {
        key: [0x51],
        fn(arg) {
          decodedData.pirThreshold = decodeField(arg, 2, 15, 0, "unsigned");
          return 2;
        },
      },
      {
        key: [0x52],
        fn(arg) {
          decodedData.pirThresholdPeriod = decodeField(
            arg,
            2,
            15,
            0,
            "unsigned",
          );
          return 2;
        },
      },
      {
        key: [0x53],
        fn(arg) {
          let val = decodeField(arg, 1, 7, 7, "unsigned");
          switch (val) {
            case 0:
              decodedData.motionCountReported = "DISABLED";
              break;
            case 1:
              decodedData.motionCountReported = "ENABLED";
              break;
            default:
              decodedData.motionCountReported = "INVALID";
          }
          val = decodeField(arg, 1, 6, 6, "unsigned");
          switch (val) {
            case 0:
              decodedData.motionStateReported = "DISABLED";
              break;
            case 1:
              decodedData.motionStateReported = "ENABLED";
              break;
            default:
              decodedData.motionStateReported = "INVALID";
          }
          val = decodeField(arg, 1, 1, 1, "unsigned");
          switch (val) {
            case 0:
              decodedData.eventTransmissionEnabled = "DISABLED";
              break;
            case 1:
              decodedData.eventTransmissionEnabled = "ENABLED";
              break;
            default:
              decodedData.eventTransmissionEnabled = "INVALID";
          }
          val = decodeField(arg, 1, 0, 0, "unsigned");
          switch (val) {
            case 0:
              decodedData.transducerEnabled = "DISABLED";
              break;
            case 1:
              decodedData.transducerEnabled = "ENABLED";
              break;
            default:
              decodedData.transducerEnabled = "INVALID";
          }
          return 1;
        },
      },
      {
        key: [0x54],
        fn(arg) {
          decodedData.postTurnOn = decodeField(arg, 2, 15, 8, "unsigned");
          decodedData.postDisturbance = decodeField(arg, 2, 7, 0, "unsigned");
          return 2;
        },
      },
      {
        key: [0x6f],
        fn(arg) {
          const val = decodeField(arg, 1, 0, 0, "unsigned");
          switch (val) {
            case 0:
              decodedData.respToDlCommandFormat =
                "INVALIDE_WRITE_RESPONSE_FORMAT";
              break;
            case 1:
              decodedData.respToDlCommandFormat = "4_BYTE_CRC";
              break;
            default:
              decodedData.respToDlCommandFormat = "INVALID";
          }
          return 1;
        },
      },
      {
        key: [0x71],
        fn(arg) {
          decodedData.appMajorVersion = decodeField(arg, 7, 55, 48, "unsigned");
          decodedData.appMinorVersion = decodeField(arg, 7, 47, 40, "unsigned");
          decodedData.appRevision = decodeField(arg, 7, 39, 32, "unsigned");
          decodedData.loramacMajorVersion = decodeField(
            arg,
            7,
            31,
            24,
            "unsigned",
          );
          decodedData.loramacMinorVersion = decodeField(
            arg,
            7,
            23,
            16,
            "unsigned",
          );
          decodedData.loramacRevision = decodeField(arg, 7, 15, 8, "unsigned");
          const val = decodeField(arg, 7, 7, 0, "unsigned");
          switch (val) {
            case 0:
              decodedData.region = "EU868";
              break;
            case 1:
              decodedData.region = "US916";
              break;
            case 2:
              decodedData.region = "AS923";
              break;
            case 3:
              decodedData.region = "AU915";
              break;
            case 4:
              decodedData.region = "IN865";
              break;
            case 5:
              decodedData.region = "CN470";
              break;
            case 6:
              decodedData.region = "KR920";
              break;
            case 7:
              decodedData.region = "RU864";
              break;
            case 8:
              decodedData.region = "DN915";
              break;
            default:
              decodedData.region = "Invalid";
          }
          return 7;
        },
      },
    ];
  }
  if (port === 10) {
    decode = [
      {
        key: [0x00, 0xba],
        fn(arg) {
          decodedData.batteryVoltage =
            Math.round(decodeField(arg, 2, 15, 0, "signed") * 0.001 * 100) /
            100;
          return 2;
        },
      },
      {
        key: [0x01, 0x00],
        fn(arg) {
          const val = decodeField(arg, 1, 7, 0, "unsigned");
          switch (val) {
            case 0:
              decodedData.hallEffectState = "MAGNET_PRESENT";
              break;
            case 255:
              decodedData.hallEffectState = "MAGNET_ABSENT";
              break;
            default:
              decodedData.hallEffectState = "INVALID";
          }
          return 1;
        },
      },
      {
        key: [0x08, 0x04],
        fn(arg) {
          decodedData.hallEffectCount = decodeField(arg, 2, 15, 0, "unsigned");
          return 2;
        },
      },
      {
        key: [0x0c, 0x00],
        fn(arg) {
          const val = decodeField(arg, 1, 7, 0, "unsigned");
          switch (val) {
            case 0:
              decodedData.impactAlarm = "IMPACT_ALARM_INACTIVE";
              break;
            case 255:
              decodedData.impactAlarm = "IIMPACT_ALARM_ACTIVE";
              break;
            default:
              decodedData.impactAlarm = "INVALID";
          }
          return 1;
        },
      },
      {
        key: [0x05, 0x02],
        fn(arg) {
          decodedData.impactMagnitude = (
            decodeField(arg, 2, 15, 0, "unsigned") * 0.001
          ).toFixed(3);
          return 2;
        },
      },
      {
        key: [0x07, 0x71],
        fn(arg) {
          decodedData.accelerationXaxis = (
            decodeField(arg, 6, 47, 32, "signed") * 0.001
          ).toFixed(3);
          decodedData.accelerationYaxis = (
            decodeField(arg, 6, 31, 16, "signed") * 0.001
          ).toFixed(3);
          decodedData.accelerationZaxis = (
            decodeField(arg, 6, 15, 0, "signed") * 0.001
          ).toFixed(3);
          return 6;
        },
      },
      {
        key: [0x0e, 0x00],
        fn(arg) {
          const val = decodeField(arg, 1, 7, 0, "unsigned");
          switch (val) {
            case 0:
              decodedData.extConnectorState = "LOW";
              break;
            case 255:
              decodedData.extConnectorState = "HIGH";
              break;
            default:
              decodedData.extConnectorState = "INVALID";
          }
          return 1;
        },
      },
      {
        key: [0x0f, 0x04],
        fn(arg) {
          decodedData.extConnectorCount = decodeField(
            arg,
            2,
            15,
            0,
            "unsigned",
          );
          return 2;
        },
      },
      {
        key: [0x12, 0x04],
        fn(arg) {
          decodedData.extConnectorTotalCount = decodeField(
            arg,
            4,
            31,
            0,
            "unsigned",
          );
          return 4;
        },
      },
      {
        key: [0x11, 0x02],
        fn(arg) {
          decodedData.extConnectorAnalog = (
            decodeField(arg, 2, 15, 0, "signed") * 0.001
          ).toFixed(3);
          return 2;
        },
      },
      {
        key: [0x0b, 0x67],
        fn(arg) {
          decodedData.mcuTemperature = (
            decodeField(arg, 2, 15, 0, "signed") * 0.1
          ).toFixed(1);
          return 2;
        },
      },
      {
        key: [0x03, 0x67],
        fn(arg) {
          decodedData.temperature =
            Math.round(decodeField(arg, 2, 15, 0, "signed") * 0.1 * 100) / 100;
          return 2;
        },
      },
      {
        key: [0x04, 0x68],
        fn(arg) {
          decodedData.humidity =
            Math.round(decodeField(arg, 1, 7, 0, "unsigned") * 0.5 * 100) / 100;
          return 1;
        },
      },
      {
        key: [0x02, 0x00],
        fn(arg) {
          const val = decodeField(arg, 1, 7, 0, "unsigned");
          switch (val) {
            case 0:
              decodedData.lightDetected = "DARK";
              break;
            case 255:
              decodedData.lightDetected = "BRIGHT";
              break;
            default:
              decodedData.lightDetected = "INVALID";
          }
          return 1;
        },
      },
      {
        key: [0x10, 0x02],
        fn(arg) {
          decodedData.lightIntensity = decodeField(arg, 1, 7, 0, "unsigned");
          return 1;
        },
      },
      {
        key: [0x0a, 0x00],
        fn(arg) {
          const val = decodeField(arg, 1, 7, 0, "unsigned");
          switch (val) {
            case 0:
              decodedData.occupancy = 0;
              decodedData.motion = 0;
              decodedData.occupied = false;
              break;
            case 255:
              decodedData.occupancy = 1;
              decodedData.motion = 1;
              decodedData.occupied = true;
              break;
            default:
              decodedData.motion = 0;
          }
          return 1;
        },
      },
      {
        key: [0x0d, 0x04],
        fn(arg) {
          decodedData.motionEventCount = decodeField(arg, 2, 15, 0, "unsigned");
          return 2;
        },
      },
    ];
  }
  if (port === 5) {
    decode = [
      {
        key: [0x40, 0x06],
        fn(arg) {
          const val = decodeField(arg, 5, 39, 32, "unsigned");
          switch (val) {
            case 1:
              decodedData.resetReason = "PUSH_BUTTON_RESET";
              break;
            case 2:
              decodedData.resetReason = "DL_COMMAND_RESET";
              break;
            case 4:
              decodedData.resetReason = "INDEPENDENT_WATCHDOG_RESET";
              break;
            case 8:
              decodedData.resetReason = "POWER_LOSS_RESET";
              break;
            default:
              decodedData.resetReason = "INVALID";
          }
          decodedData.powerLossResetCount = decodeField(
            arg,
            5,
            31,
            24,
            "unsigned",
          );
          decodedData.watchdogResetCount = decodeField(
            arg,
            5,
            23,
            16,
            "unsigned",
          );
          decodedData.dlResetCount = decodeField(arg, 5, 15, 8, "unsigned");
          decodedData.buttonResetCount = decodeField(arg, 5, 7, 0, "unsigned");
          return 5;
        },
      },
    ];
  }
  for (let bytesLeft = bytes.length; bytesLeft > 0;) {
    let found = false;
    for (let i = 0; i < decode.length; i++) {
      const item = decode[i];
      const { key } = item;
      const keylen = key.length;
      const header = slice(bytes, 0, keylen);
      if (isEqual(header, key)) {
        // Header in the data matches to what we expect
        const f = item.fn;
        const consumed = f(slice(bytes, keylen, bytes.length)) + keylen;
        bytesLeft -= consumed;
        bytes = slice(bytes, consumed, bytes.length);
        found = true;
        break;
      }
    }
    if (!found) {
      decodedData.raw = bytes;
      decodedData.port = port;
      return decodedData;
    }
  }

  return decodedData;
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

function consume(event) {
  const payload = event.data.payloadHex;
  const { port } = event.data;
  const data = decoder(Hex.hexToBytes(payload), port);
  const lifecycle = {};
  const occupancy = {};
  const environment = {};

  // Lifecycle
  lifecycle.batteryVoltage = data.batteryVoltage;
  delete data.batteryVoltage;

  // Occupancy
  occupancy.motion = data.motion;
  occupancy.occupancy = data.occupancy;
  occupancy.occupied = data.occupied;
  delete data.motion;
  delete data.occupancy;
  delete data.occupied;

  // Environment
  environment.temperature = data.temperature;
  environment.humidity = data.humidity;
  delete data.temperature;
  delete data.humidity;

  if (deleteUnusedKeys(lifecycle)) {
    emit("sample", { data: lifecycle, topic: "lifecycle" });
  }

  if (deleteUnusedKeys(occupancy)) {
    // Warm desk 
    const time = new Date().getTime();
    const state = event.state || {};
    occupancy.minutesSinceLastOccupancy = 0; // Always give out minutesSinceLastOccupancy for consistancy
    if (occupancy.occupied) {
      delete state.lastOccupancyTimestamp; // Delete last occupancy timestamp
    } else if (state.lastOccupancyTimestamp !== undefined) {
      occupancy.minutesSinceLastOccupancy = Math.round((time - state.lastOccupancyTimestamp) / 1000 / 60); // Get free since
    } else if (state.lastOccupancyValue) { //
      state.lastOccupancyTimestamp = time; // Start with first no occupancy
    }

    if (Number.isNaN(occupancy.minutesSinceLastOccupancy)) {
      occupancy.minutesSinceLastOccupancy = 0;
    }
    state.lastOccupancyValue = occupancy.occupied;
    emit("state", state);
    emit("sample", { data: occupancy, topic: "occupancy" });
  }

  if (deleteUnusedKeys(environment)) {
    emit("sample", { data: environment, topic: "default" });
  }

  if (Object.keys(data).length > 0) {
    emit("sample", {
      data,
      topic: "system",
    });
  }
}
