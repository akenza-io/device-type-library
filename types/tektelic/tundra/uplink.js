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

  function slice(a, f, t) {
    const res = [];
    for (let i = 0; i < t - f; i++) {
      res[i] = a[f + i];
    }
    return res;
  }

  if (port === 32) {
    bytes = slice(bytes, 2, bytes.length);
    port = 10;
  }

  let decodedData = {};
  let decode = [];

  if (port === 10) {
    decode = [
      {
        key: [0x03, 0x67],
        fn(arg) {
          decodedData.ambientTemperature =
            decodeField(arg, 0, 15, "signed") * 0.1;
          decodedData.ambientTemperature =
            Math.round(decodedData.ambientTemperature * 10) / 10;
          return 2;
        },
      },
      {
        key: [0x04, 0x68],
        fn(arg) {
          decodedData.relativeHumidity =
            decodeField(arg, 0, 7, "unsigned") * 0.5;
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
        key: [0x0f, 0x04],
        fn(arg) {
          decodedData.extconnectorCount = decodeField(arg, 0, 15, "unsigned");
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
        key: [0x00, 0xff],
        fn(arg) {
          decodedData.batteryVoltage = decodeField(arg, 0, 15, "signed") * 0.01;
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
        key: [0x24],
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
        key: [0x25],
        fn(arg) {
          decodedData.tickPerBleDefault = decodeField(arg, 0, 15, "unsigned");
          return 2;
        },
      },
      {
        key: [0x26],
        fn(arg) {
          decodedData.tickPerBleStillness = decodeField(arg, 0, 15, "unsigned");
          return 2;
        },
      },
      {
        key: [0x27],
        fn(arg) {
          decodedData.tickPerBleMobility = decodeField(arg, 0, 15, "unsigned");
          return 2;
        },
      },
      {
        key: [0x28],
        fn(arg) {
          decodedData.tickPerTemperature = decodeField(arg, 0, 15, "unsigned");
          return 2;
        },
      },
      {
        key: [0x2a],
        fn(arg) {
          decodedData["mode.reedEventType"] = decodeField(
            arg,
            7,
            7,
            "unsigned",
          );
          decodedData["mode.batteryVoltageReport"] = decodeField(
            arg,
            8,
            8,
            "unsigned",
          );
          decodedData["mode.accelerationVectorReport"] = decodeField(
            arg,
            9,
            9,
            "unsigned",
          );
          decodedData["mode.temperatureReport"] = decodeField(
            arg,
            10,
            10,
            "unsigned",
          );
          decodedData["mode.bleReport"] = decodeField(arg, 11, 11, "unsigned");
          return 2;
        },
      },
      {
        key: [0x2b],
        fn(arg) {
          decodedData["eventType1.mValue"] = decodeField(arg, 0, 3, "unsigned");
          decodedData["eventType1.nValue"] = decodeField(arg, 4, 7, "unsigned");
          return 1;
        },
      },
      {
        key: [0x2c],
        fn(arg) {
          decodedData["eventType2.tValue"] = decodeField(arg, 0, 3, "unsigned");
          return 1;
        },
      },
      {
        key: [0x40],
        fn(arg) {
          decodedData["accelerometer.xaxisEnabled"] = decodeField(
            arg,
            0,
            0,
            "unsigned",
          );
          decodedData["accelerometer.yaxisEnabled"] = decodeField(
            arg,
            1,
            1,
            "unsigned",
          );
          decodedData["accelerometer.zaxisEnabled"] = decodeField(
            arg,
            2,
            2,
            "unsigned",
          );
          return 1;
        },
      },
      {
        key: [0x41],
        fn(arg) {
          // }
          decodedData["sensitivity.accelerometerSampleRate"] =
            decodeField(arg, 0, 2, "unsigned") * 1;
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
            decodeField(arg, 4, 5, "unsigned") * 1;
          switch (
            decodedData["decodedData.sensitivity.accelerometerMeasurementRange"]
          ) {
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
        key: [0x42],
        fn(arg) {
          decodedData.accelerationAlarmThresholdCount = decodeField(
            arg,
            0,
            15,
            "unsigned",
          );
          return 2;
        },
      },
      {
        key: [0x43],
        fn(arg) {
          decodedData.accelerationAlarmThresholdPeriod = decodeField(
            arg,
            0,
            15,
            "unsigned",
          );
          return 2;
        },
      },
      {
        key: [0x44],
        fn(arg) {
          decodedData.accelerationAlarmThreshold =
            decodeField(arg, 0, 15, "unsigned") * 0.001;
          return 2;
        },
      },
      {
        key: [0x45],
        fn(arg) {
          decodedData.accelerationAlarmGracePeriod = decodeField(
            arg,
            0,
            15,
            "unsigned",
          );
          return 2;
        },
      },
      {
        key: [0x46],
        fn(arg) {
          decodedData["accelerometerTx.reportPeriodicEnabled"] = decodeField(
            arg,
            0,
            0,
            "unsigned",
          );
          decodedData["accelerometerTx.reportAlarmEnabled"] = decodeField(
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
          decodedData.bleMode = decodeField(arg, 7, 7, "unsigned");
          return 1;
        },
      },
      {
        key: [0x51],
        fn(arg) {
          decodedData.bleScanInterval =
            decodeField(arg, 0, 15, "unsigned") * 0.001;
          return 2;
        },
      },
      {
        key: [0x52],
        fn(arg) {
          decodedData.bleScanWindow =
            decodeField(arg, 0, 15, "unsigned") * 0.001;
          return 2;
        },
      },
      {
        key: [0x53],
        fn(arg) {
          decodedData.bleScanDuration = decodeField(arg, 0, 15, "unsigned");
          return 2;
        },
      },
      {
        key: [0x54],
        fn(arg) {
          decodedData.bleReportedDevices = decodeField(arg, 0, 7, "unsigned");
          return 1;
        },
      },
      {
        key: [0x60],
        fn(arg) {
          decodedData.temperatureSamplePeriodIdle = decodeField(
            arg,
            0,
            31,
            "unsigned",
          );
          return 4;
        },
      },
      {
        key: [0x61],
        fn(arg) {
          decodedData.temperatureSamplePeriodActive = decodeField(
            arg,
            0,
            31,
            "unsigned",
          );
          return 4;
        },
      },
      {
        key: [0x62],
        fn(arg) {
          decodedData["temperatureThreshold.high"] = decodeField(
            arg,
            0,
            7,
            "unsigned",
          );
          decodedData["temperatureThreshold.low"] = decodeField(
            arg,
            8,
            15,
            "unsigned",
          );
          return 2;
        },
      },
      {
        key: [0x63],
        fn(arg) {
          decodedData.temperatureThresholdEnabled = decodeField(
            arg,
            0,
            0,
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

  if (port === 25) {
    decode = [
      {
        key: [0x0a],
        fn(arg) {
          // RSSI to beacons
          let count = 0;
          for (let i = 0; i < arg.length * 8; i += 7 * 8) {
            const devId = decodeField(arg, i, i + 6 * 8 - 1, "hexstring");
            decodedData[devId] = decodeField(
              arg,
              i + 6 * 8,
              i + 7 * 8 - 1,
              "signed",
            );
            count += 7;
          }
          return count;
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
