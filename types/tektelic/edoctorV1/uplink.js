// https://github.com/TektelicCommunications/data-converters/blob/master/Tektelic%20v2/edoctor/edoctor-v1-decoder.js

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

// Converts array of bytes to hex string
function toHexString(byteArray) {
  const arr = [];
  for (let i = 0; i < byteArray.length; ++i) {
    arr.push(`0${(byteArray[i] & 0xff).toString(16)}`.slice(-2));
  }
  return arr.join(" ");
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

// Converts array of bytes to 8 bit array
function convertToUint8Array(byteArray) {
  const arr = [];
  for (let i = 0; i < byteArray.length; i++) {
    arr.push(toUint(byteArray[i]) & 0xff);
  }
  return arr;
}

function decode(bytes, port) {
  const decodedData = {};
  let decoderArray = [];
  const errors = [];
  bytes = convertToUint8Array(bytes);

  if (port === 101) {
    decoderArray = [
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
    decoderArray = [
      {
        key: [0x00],
        fn(arg) {
          // decodedData.deviceEui = decodeField(arg, 8, 63, 0, "hexstring");
          return 8;
        },
      },
      {
        key: [0x01],
        fn(arg) {
          // decodedData.appEui = decodeField(arg, 8, 63, 0, "hexstring");
          return 8;
        },
      },
      {
        key: [0x02],
        fn(arg) {
          // decodedData.appKey = decodeField(arg, 16, 127, 0, "hexstring");
          return 16;
        },
      },
      {
        key: [0x03],
        fn(arg) {
          // decodedData.deviceAddress = decodeField(arg, 4, 31, 0, "hexstring");
          return 4;
        },
      },
      {
        key: [0x04],
        fn(arg) {
          // decodedData.networkSessionKey = decodeField( arg, 16, 127, 0, "hexstring");
          return 16;
        },
      },
      {
        key: [0x05],
        fn(arg) {
          // decodedData.appSessionKey = decodeField(arg, 16, 127, 0, "hexstring");
          return 16;
        },
      },
      {
        key: [0x10],
        fn(arg) {
          const val = decodeField(arg, 2, 7, 7, "unsigned");

          switch (val) {
            case 0:
              decodedData.joinMode = "ABP";
              break;
            case 1:
              decodedData.joinMode = "OTAA";
              break;
            default:
              decodedData.joinMode = "INVALID";
          }
          return 2;
        },
      },
      {
        key: [0x11],
        fn(arg) {
          var val = decodeField(arg, 2, 3, 3, "unsigned");
          switch (val) {
            case 0:
              decodedData.adr = "DISABLE";
              break;
            case 1:
              decodedData.adr = "ENABLE";
              break;
            default:
              decodedData.adr = "INVALID";
          }
          var val = decodeField(arg, 2, 2, 2, "unsigned");
          switch (val) {
            case 0:
              decodedData.dutyCycle = "DISABLE";
              break;
            case 1:
              decodedData.dutyCycle = "ENABLE";
              break;
            default:
              decodedData.dutyCycle = "INVALID";
          }
          var val = decodeField(arg, 2, 1, 1, "unsigned");
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
          var val = decodeField(arg, 2, 0, 0, "unsigned");
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
          return 2;
        },
      },
      {
        key: [0x13],
        fn(arg) {
          decodedData.drNumber = decodeField(arg, 5, 7, 0, "unsigned");
          decodedData.frequency = decodeField(arg, 5, 39, 8, "unsigned");
          return 5;
        },
      },
      {
        key: [0x12],
        fn(arg) {
          decodedData.txPower = decodeField(arg, 2, 3, 0, "unsigned");
          return 2;
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
          decodedData.normalReportPeriod = decodeField(
            arg,
            1,
            7,
            0,
            "unsigned",
          );
          return 1;
        },
      },
      {
        key: [0x21],
        fn(arg) {
          decodedData.uaReportPeriod = decodeField(arg, 1, 7, 0, "unsigned");
          return 1;
        },
      },
      {
        key: [0x22],
        fn(arg) {
          decodedData.restReportPeriod = decodeField(arg, 1, 7, 0, "unsigned");
          return 1;
        },
      },
      {
        key: [0x23],
        fn(arg) {
          decodedData.metadataReportPeriod = decodeField(
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
          const val = decodeField(arg, 1, 0, 0, "unsigned");
          switch (val) {
            case 0:
              decodedData.enabled = "DISABLE";
              break;
            case 1:
              decodedData.enabled = "ENABLE";
              break;
            default:
              decodedData.enabled = "INVALID";
          }
          return 1;
        },
      },
      {
        key: [0x2b],
        fn(arg) {
          decodedData.gamma = decodeField(arg, 2, 15, 8, "unsigned");
          decodedData.beta = decodeField(arg, 2, 7, 4, "unsigned");
          decodedData.alpha = decodeField(arg, 2, 3, 0, "unsigned");
          return 2;
        },
      },
      {
        key: [0x2c],
        fn(arg) {
          decodedData.transitionThresholdPeriod = decodeField(
            arg,
            1,
            7,
            0,
            "unsigned",
          );
          return 1;
        },
      },
      {
        key: [0x34],
        fn(arg) {
          decodedData.a0 = decodeField(arg, 4, 31, 0, "double");
          return 4;
        },
      },
      {
        key: [0x35],
        fn(arg) {
          decodedData.a1 = decodeField(arg, 4, 31, 0, "double");
          return 4;
        },
      },
      {
        key: [0x36],
        fn(arg) {
          decodedData.a2 = decodeField(arg, 4, 31, 0, "double");
          return 4;
        },
      },
      {
        key: [0x37],
        fn(arg) {
          decodedData.btCountThreshold = decodeField(arg, 1, 7, 0, "unsigned");
          return 1;
        },
      },
      {
        key: [0x38],
        fn(arg) {
          decodedData.btLimitsHigh = decodeField(arg, 2, 15, 8, "unsigned");
          decodedData.btLimitsLow = decodeField(arg, 2, 7, 0, "unsigned");
          return 2;
        },
      },
      {
        key: [0x39],
        fn(arg) {
          decodedData.btMaLen = decodeField(arg, 1, 7, 0, "unsigned");
          return 1;
        },
      },
      {
        key: [0x3b],
        fn(arg) {
          decodedData.rrWindowSize = decodeField(arg, 1, 7, 0, "unsigned");
          return 1;
        },
      },
      {
        key: [0x3c],
        fn(arg) {
          decodedData.rrLimitsHigh = decodeField(arg, 2, 15, 8, "unsigned");
          decodedData.rrLimitsLow = decodeField(arg, 2, 7, 0, "unsigned");
          return 2;
        },
      },
      {
        key: [0x3d],
        fn(arg) {
          decodedData.ceConversionFactor = decodeField(arg, 4, 31, 0, "double");
          return 4;
        },
      },
      {
        key: [0x3e],
        fn(arg) {
          decodedData.ceStatFunction = decodeField(arg, 1, 7, 0, "unsigned");
          return 1;
        },
      },
      {
        key: [0x40],
        fn(arg) {
          var val = decodeField(arg, 1, 2, 0, "unsigned"); // Hz
          switch (val) {
            case 1:
              decodedData.sampleRate = 1;
              break;
            case 2:
              decodedData.sampleRate = 10;
              break;
            case 3:
              decodedData.sampleRate = 25;
              break;
            case 4:
              decodedData.sampleRate = 50;
              break;
            case 5:
              decodedData.sampleRate = 100;
              break;
            case 6:
              decodedData.sampleRate = 200;
              break;
            case 7:
              decodedData.sampleRate = 400;
              break;
            default:
              decodedData.sampleRate = "INVALID";
          }
          var val = decodeField(arg, 1, 5, 4, "unsigned"); // g
          switch (val) {
            case 0:
              decodedData.measurementRange = 2;
              break;
            case 1:
              decodedData.measurementRange = 4;
              break;
            case 2:
              decodedData.measurementRange = 8;
              break;
            case 3:
              decodedData.measurementRange = 16;
              break;
            default:
              decodedData.measurementRange = "INVALID";
          }
          return 1;
        },
      },
      {
        key: [0x4a],
        fn(arg) {
          decodedData.timePercentage = decodeField(arg, 1, 7, 4, "unsigned");
          decodedData.intensity = decodeField(arg, 1, 0, 3, "unsigned");
          return 1;
        },
      },
      {
        key: [0x50],
        fn(arg) {
          decodedData.rToRwindowAveraging = decodeField(
            arg,
            1,
            3,
            0,
            "unsigned",
          );
          return 1;
        },
      },
      {
        key: [0x51],
        fn(arg) {
          decodedData.rToRgain = decodeField(arg, 1, 3, 0, "unsigned");
          return 1;
        },
      },
      {
        key: [0x52],
        fn(arg) {
          decodedData.rToRpeakAveragingWeightFactor = decodeField(
            arg,
            1,
            1,
            0,
            "unsigned",
          );
          return 1;
        },
      },
      {
        key: [0x53],
        fn(arg) {
          decodedData.rToRpeakThresholdScalingFactor = decodeField(
            arg,
            1,
            3,
            0,
            "unsigned",
          );
          return 1;
        },
      },
      {
        key: [0x54],
        fn(arg) {
          decodedData.rToRminimumHoldOff = decodeField(
            arg,
            1,
            5,
            0,
            "unsigned",
          );
          return 1;
        },
      },
      {
        key: [0x55],
        fn(arg) {
          decodedData.rToRintervalAveragingWeightFactor = decodeField(
            arg,
            1,
            1,
            0,
            "unsigned",
          );
          return 1;
        },
      },
      {
        key: [0x56],
        fn(arg) {
          decodedData.rToRintervalHoldOffScalingFactor = decodeField(
            arg,
            1,
            2,
            0,
            "unsigned",
          );
          return 1;
        },
      },
      {
        key: [0x57],
        fn(arg) {
          decodedData.hrWindowSize = decodeField(arg, 1, 7, 0, "unsigned");
          return 1;
        },
      },
      {
        key: [0x58],
        fn(arg) {
          decodedData.hrStepLimitM = decodeField(arg, 2, 15, 8, "unsigned");
          decodedData.hrStepLimitS = decodeField(arg, 2, 7, 0, "unsigned");
          return 2;
        },
      },
      {
        key: [0x71],
        fn(arg) {
          decodedData.appMajorVersion = decodeField(arg, 4, 31, 24, "unsigned");
          decodedData.appMinorVersion = decodeField(arg, 4, 23, 16, "unsigned");
          decodedData.appRevision = decodeField(arg, 4, 15, 8, "unsigned");
          const val = decodeField(arg, 4, 7, 0, "unsigned");
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
              decodedData.region = "INVALID";
          }
          return 4;
        },
      },
    ];
  }
  if (port === 10) {
    decoderArray = [
      {
        key: [],
        fn(arg) {
          decodedData.batteryVoltage = (
            decodeField(arg, 9, 71, 64, "unsigned") * 0.391304348 +
            0.608695652
          ).toFixed(2);
          decodedData.st = (
            decodeField(arg, 9, 63, 56, "unsigned") * 0.05 +
            30
          ).toFixed(2); // ?
          decodedData.respiratoryRate = decodeField(arg, 9, 55, 48, "unsigned");
          decodedData.uaModeActive = !!decodeField(arg, 9, 47, 47, "unsigned");

          decodedData.ce = (
            decodeField(arg, 9, 45, 40, "unsigned") * 0.2
          ).toFixed(2);
          decodedData.af = decodeField(arg, 9, 31, 31, "unsigned");
          decodedData.position = decodeField(arg, 9, 30, 24, "unsigned");
          decodedData.heartRate = decodeField(arg, 9, 23, 16, "unsigned");
          decodedData.st2 = (
            decodeField(arg, 9, 15, 8, "unsigned") * 0.05 +
            30
          ).toFixed(2);
          decodedData.af2 = (
            decodeField(arg, 9, 7, 0, "unsigned") * 0.01
          ).toFixed(2);
          return 9;
        },
      },
    ];
  }
  if (port === 12) {
    decoderArray = [
      {
        key: [],
        fn(arg) {
          decodedData.erModeConfig = decodeField(arg, 1, 7, 0, "unsigned");
          return 1;
        },
      },
    ];
  }

  try {
    for (let bytesLeft = bytes.length; bytesLeft > 0; ) {
      let found = false;
      let header = "";
      for (let i = 0; i < decoderArray.length; i++) {
        const item = decoderArray[i];
        const { key } = item;
        const keylen = key.length;
        header = slice(bytes, 0, keylen);
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
        errors.push(
          `Unable to decode header ${toHexString(header).toUpperCase()}`,
        );
        break;
      }
    }
  } catch (error) {
    return { errors };
  }

  return decodedData;
}

function consume(event) {
  const payload = event.data.payloadHex;
  const { port } = event.data;
  const data = decode(Hex.hexToBytes(payload), port);
  let topic = "default";

  if (data.errors !== undefined) {
    topic = "error";
  } else if (port === 10) {
    emit("sample", {
      data: { batteryVoltage: data.batteryVoltage },
      topic: "lifecycle",
    });
    delete data.batteryVoltage;
  } else if (port === 100) {
    topic = "system";
  } else if (port === 101) {
    topic = "command";
  }
  emit("sample", { data, topic });
}
