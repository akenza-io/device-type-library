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

function toHexString(byteArray) {
  const arr = [];
  for (let i = 0; i < byteArray.length; ++i) {
    arr.push(`0${(byteArray[i] & 0xff).toString(16)}`.slice(-2));
  }
  return arr.join("");
}

function slice(a, f, t) {
  const res = [];
  for (let i = 0; i < t - f; i++) {
    res[i] = a[f + i];
  }
  return res;
}

function extractBytes(chunk, startBit, endBit) {
  const totalBits = endBit - startBit + 1;
  const totalBytes =
    totalBits % 8 === 0 ? toUint(totalBits / 8) : toUint(totalBits / 8) + 1;
  const offsetInByte = startBit % 8;
  const endBitChunk = totalBits % 8;
  const arr = new Array(totalBytes);
  for (byte = 0; byte < totalBytes; ++byte) {
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

function applyDataType(bytes, dataType) {
  let output = 0;
  if (dataType === "unsigned") {
    for (var i = 0; i < bytes.length; ++i) {
      output = toUint(output << 8) | bytes[i];
    }
    return output;
  }
  if (dataType === "signed") {
    for (var i = 0; i < bytes.length; ++i) {
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

function decoder(bytes, port) {
  // bytes - Array of bytes (signed)

  let decodedData = {};
  let decode = [];

  if (port === 10) {
    decode = [
      {
        key: [0x00, 0xba],
        fn(arg) {
          decodedData.batteryLife =
            decodeField(arg, 0, 6, "unsigned") * 0.01 + 2.5;
          return 1;
        },
      },
      {
        key: [0x00, 0xba],
        fn(arg) {
          decodedData.eosAlert = decodeField(arg, 7, 7, "unsigned") * 0.01;
          return 1;
        },
      },
      {
        key: [0x01, 0x04],
        fn(arg) {
          decodedData.input1Frequency =
            decodeField(arg, 0, 15, "unsigned") * 1000;
          return 2;
        },
      },
      {
        key: [0x02, 0x02],
        fn(arg) {
          decodedData.input2Voltage =
            decodeField(arg, 0, 15, "unsigned") * 0.001;
          return 2;
        },
      },
      {
        key: [0x03, 0x02],
        fn(arg) {
          decodedData.input3Voltage =
            decodeField(arg, 0, 15, "unsigned") * 0.001;
          return 2;
        },
      },
      {
        key: [0x04, 0x02],
        fn(arg) {
          decodedData.input4Voltage =
            decodeField(arg, 0, 15, "unsigned") * 0.001;
          return 2;
        },
      },
      {
        key: [0x05, 0x04],
        fn(arg) {
          decodedData.watermark1Raw = decodeField(arg, 0, 15, "unsigned");
          // convertion done as per the communication from the Tektelic sensor team on Jan 13, 2020 - contact: Mark Oevering - details absent in the TRM
          if (decodedData.watermark1Raw > 6430) {
            decodedData.watermark1 = 0;
          } else if (decodedData.watermark1Raw > 4330) {
            decodedData.watermark1 =
              (9 - (decodedData.watermark1Raw - 4330) * 0.004286) * 1000;
          } else if (decodedData.watermark1Raw > 2820) {
            decodedData.watermark1 =
              (15 - (decodedData.watermark1Raw - 2820) * 0.003974) * 1000;
          } else if (decodedData.watermark1Raw > 1110) {
            decodedData.watermark1 =
              (35 - (decodedData.watermark1Raw - 1110) * 0.0117) * 1000;
          } else if (decodedData.watermark1Raw > 770) {
            decodedData.watermark1 =
              (55 - (decodedData.watermark1Raw - 770) * 0.05884) * 1000;
          } else if (decodedData.watermark1Raw > 600) {
            decodedData.watermark1 =
              (75 - (decodedData.watermark1Raw - 600) * 0.1176) * 1000;
          } else if (decodedData.watermark1Raw > 485) {
            decodedData.watermark1 =
              (100 - (decodedData.watermark1Raw - 485) * 0.2174) * 1000;
          } else if (decodedData.watermark1Raw > 293) {
            decodedData.watermark1 =
              (200 - (decodedData.watermark1Raw - 293) * 0.5208) * 1000;
          } else {
            decodedData.watermark1 = 200 * 1000;
          }
          return 2;
        },
      },
      {
        key: [0x06, 0x04],
        fn(arg) {
          decodedData.watermark2Raw = decodeField(arg, 0, 15, "unsigned");
          // convertion done as per the communication from the Tektelic sensor team on Jan 13, 2020 - contact: Mark Oevering - details absent in the TRM
          if (decodedData.watermark2 > 6430) {
            decodedData.watermark2 = 0;
          } else if (decodedData.watermark2Raw > 4330) {
            decodedData.watermark2 =
              (9 - (decodedData.watermark2Raw - 4330) * 0.004286) * 1000;
          } else if (decodedData.watermark2Raw > 2820) {
            decodedData.watermark2 =
              (15 - (decodedData.watermark2Raw - 2820) * 0.003974) * 1000;
          } else if (decodedData.watermark2Raw > 1110) {
            decodedData.watermark2 =
              (35 - (decodedData.watermark2Raw - 1110) * 0.0117) * 1000;
          } else if (decodedData.watermark2Raw > 770) {
            decodedData.watermark2 =
              (55 - (decodedData.watermark2Raw - 770) * 0.05884) * 1000;
          } else if (decodedData.watermark2Raw > 600) {
            decodedData.watermark2 =
              (75 - (decodedData.watermark2Raw - 600) * 0.1176) * 1000;
          } else if (decodedData.watermark2Raw > 485) {
            decodedData.watermark2 =
              (100 - (decodedData.watermark2Raw - 485) * 0.2174) * 1000;
          } else if (decodedData.watermark2Raw > 293) {
            decodedData.watermark2 =
              (200 - (decodedData.watermark2Raw - 293) * 0.5208) * 1000;
          } else {
            decodedData.watermark2 = 200 * 1000;
          }
          return 2;
        },
      },
      {
        key: [0x09, 0x65],
        fn(arg) {
          decodedData.lightIntensity = decodeField(arg, 0, 15, "unsigned");
          return 2;
        },
      },
      {
        key: [0x09, 0x00],
        fn(arg) {
          decodedData.lightDetected = decodeField(arg, 0, 7, "unsigned");
          return 1;
        },
      },
      {
        key: [0x0a, 0x71],
        fn(arg) {
          decodedData["acceleration.xaxis"] =
            decodeField(arg, 32, 47, "signed") * 0.001;
          decodedData["acceleration.yaxis"] =
            decodeField(arg, 16, 31, "signed") * 0.001;
          decodedData["acceleration.zaxis"] =
            decodeField(arg, 0, 15, "signed") * 0.001;
          return 6;
        },
      },
      {
        key: [0x0a, 0x02],
        fn(arg) {
          decodedData.impactMagnitude =
            decodeField(arg, 0, 15, "unsigned") * 0.001;
          return 2;
        },
      },
      {
        key: [0x0a, 0x00],
        fn(arg) {
          decodedData.impactAlarm = decodeField(arg, 0, 7, "unsigned");
          return 1;
        },
      },
      {
        key: [0x0b, 0x67],
        fn(arg) {
          decodedData.ambientTemperature =
            decodeField(arg, 0, 15, "signed") * 0.1;
          return 2;
        },
      },
      {
        key: [0x0b, 0x68],
        fn(arg) {
          // Ambient RH
          decodedData.relativeHumidity =
            decodeField(arg, 0, 7, "unsigned") * 0.5;
          return 1;
        },
      },
      {
        key: [0x0c, 0x67],
        fn(arg) {
          decodedData.mcuTemperature = decodeField(arg, 0, 15, "signed") * 0.1;
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
          decodedData.deviceEui = decodeField(arg, 0, 63, "hexstring");
          return 8;
        },
      },
      {
        key: [0x01],
        fn(arg) {
          decodedData.appEui = decodeField(arg, 0, 63, "hexstring");
          return 8;
        },
      },
      {
        key: [0x02],
        fn(arg) {
          decodedData.appKey = decodeField(arg, 0, 127, "hexstring");
          return 16;
        },
      },
      {
        key: [0x03],
        fn(arg) {
          decodedData.deviceAddress = decodeField(arg, 0, 31, "hexstring");
          return 4;
        },
      },
      {
        key: [0x04],
        fn(arg) {
          decodedData.networkSessionKey = decodeField(arg, 0, 127, "hexstring");
          return 16;
        },
      },
      {
        key: [0x05],
        fn(arg) {
          decodedData.appSessionKey = decodeField(arg, 0, 127, "hexstring");
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
          decodedData.tickPerLight = decodeField(arg, 0, 15, "unsigned");
          return 2;
        },
      },
      {
        key: [0x25],
        fn(arg) {
          decodedData.tickPerInput1 = decodeField(arg, 0, 15, "unsigned");
          return 2;
        },
      },
      {
        key: [0x26],
        fn(arg) {
          decodedData.tickPerInput2 = decodeField(arg, 0, 15, "unsigned");
          return 2;
        },
      },
      {
        key: [0x29],
        fn(arg) {
          decodedData.tickPerWatermark1 = decodeField(arg, 0, 15, "unsigned");
          return 2;
        },
      },
      {
        key: [0x2a],
        fn(arg) {
          decodedData.tickPerWatermark2 = decodeField(arg, 0, 15, "unsigned");
          return 2;
        },
      },
      {
        key: [0x2c],
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
        key: [0x2d],
        fn(arg) {
          decodedData.tickPerOrientationAlarm = decodeField(
            arg,
            0,
            15,
            "unsigned",
          );
          return 2;
        },
      },
      {
        key: [0x2e],
        fn(arg) {
          decodedData.tickPerMcuTempearture = decodeField(
            arg,
            0,
            15,
            "unsigned",
          );
          return 2;
        },
      },
      {
        key: [0x30],
        fn(arg) {
          decodedData.temperatureRelativeHumidityIdle = decodeField(
            arg,
            0,
            31,
            "unsigned",
          );
          return 4;
        },
      },
      {
        key: [0x31],
        fn(arg) {
          decodedData.temperatureRelativeHumidityActive = decodeField(
            arg,
            0,
            31,
            "unsigned",
          );
          return 4;
        },
      },
      {
        key: [0x32],
        fn(arg) {
          decodedData["ambientTemperatureThreshold.high"] = decodeField(
            arg,
            0,
            7,
            "unsigned",
          );
          decodedData["ambientTemperatureThreshold.low"] = decodeField(
            arg,
            8,
            15,
            "unsigned",
          );
          return 2;
        },
      },
      {
        key: [0x33],
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
        key: [0x34],
        fn(arg) {
          decodedData["relativeHumidityThreshold.high"] = decodeField(
            arg,
            0,
            7,
            "unsigned",
          );
          decodedData["relativeHumidityThreshold.low"] = decodeField(
            arg,
            8,
            15,
            "unsigned",
          );
          return 2;
        },
      },
      {
        key: [0x35],
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
        key: [0x36],
        fn(arg) {
          decodedData.inputSamplePeriodIdle = decodeField(
            arg,
            0,
            31,
            "unsigned",
          );
          return 4;
        },
      },
      {
        key: [0x37],
        fn(arg) {
          decodedData.inputSamplePeriodActive = decodeField(
            arg,
            0,
            31,
            "unsigned",
          );
          return 4;
        },
      },
      {
        key: [0x38],
        fn(arg) {
          decodedData["input1Threshold.high"] =
            decodeField(arg, 0, 15, "unsigned") * 1000;
          decodedData["input1Threshold.low"] =
            decodeField(arg, 16, 31, "unsigned") * 1000;
          return 4;
        },
      },
      {
        key: [0x39],
        fn(arg) {
          decodedData["input2Threshold.high"] =
            decodeField(arg, 0, 15, "unsigned") * 0.001;
          decodedData["input2Threshold.low"] =
            decodeField(arg, 16, 31, "unsigned") * 0.001;
          return 4;
        },
      },
      {
        key: [0x3c],
        fn(arg) {
          decodedData["moisture1Threshold.high"] =
            decodeField(arg, 0, 15, "unsigned") * 1000;
          decodedData["moisture1Threshold.low"] =
            decodeField(arg, 16, 31, "unsigned") * 1000;
          return 4;
        },
      },
      {
        key: [0x3d],
        fn(arg) {
          decodedData["moisture2Threshold.high"] =
            decodeField(arg, 0, 15, "unsigned") * 1000;
          decodedData["moisture2Threshold.low"] =
            decodeField(arg, 16, 31, "unsigned") * 1000;
          return 4;
        },
      },
      {
        key: [0x3f],
        fn(arg) {
          decodedData["thresholdEnabled.input1"] = decodeField(
            arg,
            0,
            0,
            "unsigned",
          );
          decodedData["thresholdEnabled.input2"] = decodeField(
            arg,
            1,
            1,
            "unsigned",
          );
          decodedData["thresholdEnabled.input5"] = decodeField(
            arg,
            4,
            4,
            "unsigned",
          );
          decodedData["thresholdEnabled.input6"] = decodeField(
            arg,
            5,
            5,
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
            "unsigned",
          );
          decodedData["mcuTemperatureThreshold.low"] = decodeField(
            arg,
            8,
            15,
            "unsigned",
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
        key: [0x48],
        fn(arg) {
          decodedData.interruptEnabled = decodeField(arg, 0, 0, "unsigned");
          return 1;
        },
      },
      {
        key: [0x49],
        fn(arg) {
          decodedData.upperThreshold = decodeField(arg, 0, 31, "unsigned");
          return 4;
        },
      },
      {
        key: [0x4a],
        fn(arg) {
          decodedData.lowerThreshold = decodeField(arg, 0, 31, "unsigned");
          return 4;
        },
      },
      {
        key: [0x4b],
        fn(arg) {
          decodedData.thresholdTimer = decodeField(arg, 0, 7, "unsigned") * 0.1;
          return 1;
        },
      },
      {
        key: [0x4c],
        fn(arg) {
          decodedData.lightSamplePeriodActive = decodeField(
            arg,
            0,
            31,
            "unsigned",
          );
          return 4;
        },
      },
      {
        key: [0x4d],
        fn(arg) {
          decodedData["alsTx.lightAlarmReported"] = decodeField(
            arg,
            0,
            0,
            "unsigned",
          );
          decodedData["alsTx.lightIntensityReported"] = decodeField(
            arg,
            1,
            1,
            "unsigned",
          );
          return 1;
        },
      },
      {
        key: [0x50],
        fn(arg) {
          decodedData.orientationAlarmThreshold = decodeField(
            arg,
            0,
            0,
            "unsigned",
          );
          return 2;
        },
      },
      {
        key: [0x51],
        fn(arg) {
          decodedData["accelerometerTx.orientationAlarmReported"] = decodeField(
            arg,
            0,
            0,
            "unsigned",
          );
          decodedData["accelerometerTx.orientationVectorReported"] =
            decodeField(arg, 5, 5, "unsigned");
          return 1;
        },
      },
      {
        key: [0x52],
        fn(arg) {
          decodedData["mode.orientationAlarmEnabled"] = decodeField(
            arg,
            0,
            0,
            "unsigned",
          );
          decodedData["mode.accelerometerPowerOn"] = decodeField(
            arg,
            7,
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
      decodedData = {};
      decodedData.raw = JSON.stringify(byteToArray(bytes));
      decodedData.port = port;
      return decodedData;
    }
  }

  return decodedData;
}

function hexToBytes(hex) {
  for (var bytes = [], c = 0; c < hex.length; c += 2) {
    bytes.push(parseInt(hex.substr(c, 2), 16));
  }
  return bytes;
}

function consume(event) {
  const payload = event.data.payloadHex;
  const { port } = event.data;
  const data = decoder(hexToBytes(payload), port);
  const topic = "default";

  /*
  if (data.voltage !== undefined) {
    emit("sample", { data: { voltage: data.voltage }, topic: "lifecycle" });
    delete data.voltage;
  }

  if (data.reedCount !== undefined) {
    topic = "reed";
  } else if (data.occupancy !== undefined) {
    topic = "occupancy";
  }
  */

  emit("sample", { data, topic });
}
