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
              decodedData.dutyCycle = "DISABLE";
              break;
            case 1:
              decodedData.dutyCycle = "ENABLE";
              break;
            default:
              decodedData.dutyCycle = "INVALID";
          }
          val = decodeField(arg, 2, 3, 3, "unsigned");
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
              decodedData.risingEdgeEnabled = "DISABLE";
              break;
            case 1:
              decodedData.risingEdgeEnabled = "ENABLE";
              break;
            default:
              decodedData.risingEdgeEnabled = "INVALID";
          }
          val = decodeField(arg, 1, 1, 1, "unsigned");
          switch (val) {
            case 0:
              decodedData.fallingEdgeEnabled = "DISABLE";
              break;
            case 1:
              decodedData.fallingEdgeEnabled = "ENABLE";
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
              decodedData.risingEdgeEnabledEx = "DISABLE";
              break;
            case 1:
              decodedData.risingEdgeEnabledEx = "ENABLE";
              break;
            default:
              decodedData.risingEdgeEnabledEx = "INVALID";
          }
          val = decodeField(arg, 1, 1, 1, "unsigned");
          switch (val) {
            case 0:
              decodedData.fallingEdgeEnabledEx = "DISABLE";
              break;
            case 1:
              decodedData.fallingEdgeEnabledEx = "ENABLE";
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
              decodedData.external_values_to_transmit.report_state_enabled_ex =
                "Off";
              break;
            case 1:
              decodedData.external_values_to_transmit.report_state_enabled_ex =
                "On";
              break;
            default:
              decodedData.external_values_to_transmit.report_state_enabled_ex =
                "Invalid";
          }
          val = decodeField(arg, 1, 1, 1, "unsigned");
          switch (val) {
            case 0:
              decodedData.external_values_to_transmit.report_count_enabled_ex =
                "Off";
              break;
            case 1:
              decodedData.external_values_to_transmit.report_count_enabled_ex =
                "On";
              break;
            default:
              decodedData.external_values_to_transmit.report_count_enabled_ex =
                "Invalid";
          }
          decodedData.external_values_to_transmit.count_type = decodeField(
            arg,
            1,
            4,
            4,
            "unsigned",
          );
          return 1;
        },
      },
      {
        key: [0x30],
        fn(arg) {
          decodedData.impact_event_threshold = (
            decodeField(arg, 2, 15, 0, "unsigned") * 0.001
          ).toFixed(3);
          return 2;
        },
      },
      {
        key: [0x31],
        fn(arg) {
          decodedData.acceleration_event_threshold = (
            decodeField(arg, 2, 15, 0, "unsigned") * 0.001
          ).toFixed(3);
          return 2;
        },
      },
      {
        key: [0x32],
        fn(arg) {
          if (!decodedData.hasOwnProperty("values_to_transmit")) {
            decodedData.values_to_transmit = {};
          }
          let val = decodeField(arg, 1, 0, 0, "unsigned");
          switch (val) {
            case 0:
              decodedData.values_to_transmit.report_periodic_alarm_enabled =
                "Off";
              break;
            case 1:
              decodedData.values_to_transmit.report_periodic_alarm_enabled =
                "On";
              break;
            default:
              decodedData.values_to_transmit.report_periodic_alarm_enabled =
                "Invalid";
          }
          val = decodeField(arg, 1, 1, 1, "unsigned");
          switch (val) {
            case 0:
              decodedData.values_to_transmit.report_periodic_magnitude_enabled =
                "Off";
              break;
            case 1:
              decodedData.values_to_transmit.report_periodic_magnitude_enabled =
                "On";
              break;
            default:
              decodedData.values_to_transmit.report_periodic_magnitude_enabled =
                "Invalid";
          }
          val = decodeField(arg, 1, 2, 2, "unsigned");
          switch (val) {
            case 0:
              decodedData.values_to_transmit.report_periodic_vector_enabled =
                "Off";
              break;
            case 1:
              decodedData.values_to_transmit.report_periodic_vector_enabled =
                "On";
              break;
            default:
              decodedData.values_to_transmit.report_periodic_vector_enabled =
                "Invalid";
          }
          val = decodeField(arg, 1, 4, 4, "unsigned");
          switch (val) {
            case 0:
              decodedData.values_to_transmit.report_event_magnitude_enabled =
                "Off";
              break;
            case 1:
              decodedData.values_to_transmit.report_event_magnitude_enabled =
                "On";
              break;
            default:
              decodedData.values_to_transmit.report_event_magnitude_enabled =
                "Invalid";
          }
          val = decodeField(arg, 1, 5, 5, "unsigned");
          switch (val) {
            case 0:
              decodedData.values_to_transmit.report_event_vector_enabled =
                "Off";
              break;
            case 1:
              decodedData.values_to_transmit.report_event_vector_enabled = "On";
              break;
            default:
              decodedData.values_to_transmit.report_event_vector_enabled =
                "Invalid";
          }
          return 1;
        },
      },
      {
        key: [0x33],
        fn(arg) {
          decodedData.acceleration_impact_grace_period = decodeField(
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
          if (!decodedData.hasOwnProperty("acceleration_mode")) {
            decodedData.acceleration_mode = {};
          }
          let val = decodeField(arg, 1, 0, 0, "unsigned");
          switch (val) {
            case 0:
              decodedData.acceleration_mode.impact_threshold_enabled =
                "Disable";
              break;
            case 1:
              decodedData.acceleration_mode.impact_threshold_enabled = "Enable";
              break;
            default:
              decodedData.acceleration_mode.impact_threshold_enabled =
                "Invalid";
          }
          val = decodeField(arg, 1, 1, 1, "unsigned");
          switch (val) {
            case 0:
              decodedData.acceleration_mode.acceleration_threshold_enabled =
                "Disable";
              break;
            case 1:
              decodedData.acceleration_mode.acceleration_threshold_enabled =
                "Enable";
              break;
            default:
              decodedData.acceleration_mode.acceleration_threshold_enabled =
                "Invalid";
          }
          val = decodeField(arg, 1, 4, 4, "unsigned");
          switch (val) {
            case 0:
              decodedData.acceleration_mode.xaxis_enabled = "Disable";
              break;
            case 1:
              decodedData.acceleration_mode.xaxis_enabled = "Enable";
              break;
            default:
              decodedData.acceleration_mode.xaxis_enabled = "Invalid";
          }
          val = decodeField(arg, 1, 5, 5, "unsigned");
          switch (val) {
            case 0:
              decodedData.acceleration_mode.yaxis_enabled = "Disable";
              break;
            case 1:
              decodedData.acceleration_mode.yaxis_enabled = "Enable";
              break;
            default:
              decodedData.acceleration_mode.yaxis_enabled = "Invalid";
          }
          val = decodeField(arg, 1, 6, 6, "unsigned");
          switch (val) {
            case 0:
              decodedData.acceleration_mode.zaxis_enabled = "Disable";
              break;
            case 1:
              decodedData.acceleration_mode.zaxis_enabled = "Enable";
              break;
            default:
              decodedData.acceleration_mode.zaxis_enabled = "Invalid";
          }
          val = decodeField(arg, 1, 7, 7, "unsigned");
          switch (val) {
            case 0:
              decodedData.acceleration_mode.poweron = "Off";
              break;
            case 1:
              decodedData.acceleration_mode.poweron = "On";
              break;
            default:
              decodedData.acceleration_mode.poweron = "Invalid";
          }
          return 1;
        },
      },
      {
        key: [0x35],
        fn(arg) {
          if (!decodedData.hasOwnProperty("sensitivity")) {
            decodedData.sensitivity = {};
          }
          let val = decodeField(arg, 1, 2, 0, "unsigned");
          switch (val) {
            case 1:
              decodedData.sensitivity.accelerometer_sample_rate = "1 Hz";
              break;
            case 2:
              decodedData.sensitivity.accelerometer_sample_rate = "10 Hz";
              break;
            case 3:
              decodedData.sensitivity.accelerometer_sample_rate = "25 Hz";
              break;
            case 4:
              decodedData.sensitivity.accelerometer_sample_rate = "50 Hz";
              break;
            case 5:
              decodedData.sensitivity.accelerometer_sample_rate = "100 Hz";
              break;
            case 6:
              decodedData.sensitivity.accelerometer_sample_rate = "200 Hz";
              break;
            case 7:
              decodedData.sensitivity.accelerometer_sample_rate = "400 Hz";
              break;
            default:
              decodedData.sensitivity.accelerometer_sample_rate = "Invalid";
          }
          val = decodeField(arg, 1, 5, 4, "unsigned");
          switch (val) {
            case 0:
              decodedData.sensitivity.accelerometer_measurement_range = "±2 g";
              break;
            case 1:
              decodedData.sensitivity.accelerometer_measurement_range = "±4 g";
              break;
            case 2:
              decodedData.sensitivity.accelerometer_measurement_range = "±8 g";
              break;
            case 3:
              decodedData.sensitivity.accelerometer_measurement_range = "±16 g";
              break;
            default:
              decodedData.sensitivity.accelerometer_measurement_range =
                "Invalid";
          }
          return 1;
        },
      },
      {
        key: [0x36],
        fn(arg) {
          decodedData.impact_alarm_grace_period = decodeField(
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
          decodedData.impact_alarm_threshold_count = decodeField(
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
          decodedData.impact_alarm_threshold_period = decodeField(
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
          decodedData.temperature_relative_humidity_sample_period_idle =
            decodeField(arg, 4, 31, 0, "unsigned");
          return 4;
        },
      },
      {
        key: [0x3a],
        fn(arg) {
          decodedData.temperature_relative_humidity_sample_period_active =
            decodeField(arg, 4, 31, 0, "unsigned");
          return 4;
        },
      },
      {
        key: [0x3b],
        fn(arg) {
          if (!decodedData.hasOwnProperty("temperature_threshold")) {
            decodedData.temperature_threshold = {};
          }
          decodedData.temperature_threshold.high_temp_threshold = decodeField(
            arg,
            2,
            15,
            8,
            "signed",
          );
          decodedData.temperature_threshold.low_temp_threshold = decodeField(
            arg,
            2,
            7,
            0,
            "signed",
          );
          return 2;
        },
      },
      {
        key: [0x3c],
        fn(arg) {
          const val = decodeField(arg, 1, 0, 0, "unsigned");
          switch (val) {
            case 0:
              decodedData.ambient_temperature_threshold_enabled = "Disable";
              break;
            case 1:
              decodedData.ambient_temperature_threshold_enabled = "Enable";
              break;
            default:
              decodedData.ambient_temperature_threshold_enabled = "Invalid";
          }
          return 1;
        },
      },
      {
        key: [0x3d],
        fn(arg) {
          if (!decodedData.hasOwnProperty("rh_threshold")) {
            decodedData.rh_threshold = {};
          }
          decodedData.rh_threshold.high_rh_threshold = decodeField(
            arg,
            2,
            15,
            8,
            "unsigned",
          );
          decodedData.rh_threshold.low_rh_threshold = decodeField(
            arg,
            2,
            7,
            0,
            "unsigned",
          );
          return 2;
        },
      },
      {
        key: [0x3e],
        fn(arg) {
          const val = decodeField(arg, 1, 0, 0, "unsigned");
          switch (val) {
            case 0:
              decodedData.relative_humidity_threshold_enabled = "Disable";
              break;
            case 1:
              decodedData.relative_humidity_threshold_enabled = "Enable";
              break;
            default:
              decodedData.relative_humidity_threshold_enabled = "Invalid";
          }
          return 1;
        },
      },
      {
        key: [0x40],
        fn(arg) {
          decodedData.mcu_temperature_sample_period_idle = decodeField(
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
          decodedData.mcu_temperature_sample_period_active = decodeField(
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
          if (!decodedData.hasOwnProperty("mcu_temp_threshold")) {
            decodedData.mcu_temp_threshold = {};
          }
          decodedData.mcu_temp_threshold.high_mcu_temp_threshold = decodeField(
            arg,
            2,
            15,
            8,
            "signed",
          );
          decodedData.mcu_temp_threshold.low_mcu_temp_threshold = decodeField(
            arg,
            2,
            7,
            0,
            "signed",
          );
          return 2;
        },
      },
      {
        key: [0x43],
        fn(arg) {
          const val = decodeField(arg, 1, 0, 0, "unsigned");
          switch (val) {
            case 0:
              decodedData.mcu_temperature_threshold_enabled = "Disabled";
              break;
            case 1:
              decodedData.mcu_temperature_threshold_enabled = "Enabled";
              break;
            default:
              decodedData.mcu_temperature_threshold_enabled = "Invalid";
          }
          return 1;
        },
      },
      {
        key: [0x44],
        fn(arg) {
          decodedData.analog_sample_period_idle = decodeField(
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
          decodedData.analog_sample_period_active = decodeField(
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
          if (!decodedData.hasOwnProperty("analog_threshold")) {
            decodedData.analog_threshold = {};
          }
          decodedData.analog_threshold.high_analog_threshold = (
            decodeField(arg, 4, 31, 16, "unsigned") * 0.001
          ).toFixed(3);
          decodedData.analog_threshold.low_analog_threshold = (
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
              decodedData.analog_input_threshold_enabled = "Disabled";
              break;
            case 1:
              decodedData.analog_input_threshold_enabled = "Enabled";
              break;
            default:
              decodedData.analog_input_threshold_enabled = "Invalid";
          }
          return 1;
        },
      },
      {
        key: [0x47],
        fn(arg) {
          decodedData.light_sample_period = decodeField(
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
          if (!decodedData.hasOwnProperty("light_thresholds")) {
            decodedData.light_thresholds = {};
          }
          const val = decodeField(arg, 1, 7, 7, "unsigned");
          switch (val) {
            case 0:
              decodedData.light_thresholds.threshold = "Disabled";
              break;
            case 1:
              decodedData.light_thresholds.threshold = "Enabled";
              break;
            default:
              decodedData.light_thresholds.threshold = "Invalid";
          }
          decodedData.light_thresholds.threshold_enabled = decodeField(
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
        key: [0x49],
        fn(arg) {
          if (!decodedData.hasOwnProperty("light_values_to_transmit")) {
            decodedData.light_values_to_transmit = {};
          }
          let val = decodeField(arg, 1, 1, 1, "unsigned");
          switch (val) {
            case 0:
              decodedData.light_values_to_transmit.state_reported = "Disabled";
              break;
            case 1:
              decodedData.light_values_to_transmit.state_reported = "Enabled";
              break;
            default:
              decodedData.light_values_to_transmit.state_reported = "Invalid";
          }
          val = decodeField(arg, 1, 0, 0, "unsigned");
          switch (val) {
            case 0:
              decodedData.light_values_to_transmit.intensity_reported =
                "Disabled";
              break;
            case 1:
              decodedData.light_values_to_transmit.intensity_reported =
                "Enabled";
              break;
            default:
              decodedData.light_values_to_transmit.intensity_reported =
                "Invalid";
          }
          return 1;
        },
      },
      {
        key: [0x50],
        fn(arg) {
          decodedData.pir_grace_period = decodeField(arg, 2, 15, 0, "unsigned");
          return 2;
        },
      },
      {
        key: [0x51],
        fn(arg) {
          decodedData.pir_threshold = decodeField(arg, 2, 15, 0, "unsigned");
          return 2;
        },
      },
      {
        key: [0x52],
        fn(arg) {
          decodedData.pir_threshold_period = decodeField(
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
          if (!decodedData.hasOwnProperty("pir_mode")) {
            decodedData.pir_mode = {};
          }
          let val = decodeField(arg, 1, 7, 7, "unsigned");
          switch (val) {
            case 0:
              decodedData.pir_mode.motion_count_reported = "Disabled";
              break;
            case 1:
              decodedData.pir_mode.motion_count_reported = "Enabled";
              break;
            default:
              decodedData.pir_mode.motion_count_reported = "Invalid";
          }
          val = decodeField(arg, 1, 6, 6, "unsigned");
          switch (val) {
            case 0:
              decodedData.pir_mode.motion_state_reported = "Disabled";
              break;
            case 1:
              decodedData.pir_mode.motion_state_reported = "Enabled";
              break;
            default:
              decodedData.pir_mode.motion_state_reported = "Invalid";
          }
          val = decodeField(arg, 1, 1, 1, "unsigned");
          switch (val) {
            case 0:
              decodedData.pir_mode.event_transmission_enabled = "Disabled";
              break;
            case 1:
              decodedData.pir_mode.event_transmission_enabled = "Enabled";
              break;
            default:
              decodedData.pir_mode.event_transmission_enabled = "Invalid";
          }
          val = decodeField(arg, 1, 0, 0, "unsigned");
          switch (val) {
            case 0:
              decodedData.pir_mode.transducer_enabled = "Disabled";
              break;
            case 1:
              decodedData.pir_mode.transducer_enabled = "Enabled";
              break;
            default:
              decodedData.pir_mode.transducer_enabled = "Invalid";
          }
          return 1;
        },
      },
      {
        key: [0x54],
        fn(arg) {
          if (!decodedData.hasOwnProperty("hold_off_int")) {
            decodedData.hold_off_int = {};
          }
          decodedData.hold_off_int.post_turn_on = decodeField(
            arg,
            2,
            15,
            8,
            "unsigned",
          );
          decodedData.hold_off_int.post_disturbance = decodeField(
            arg,
            2,
            7,
            0,
            "unsigned",
          );
          return 2;
        },
      },
      {
        key: [0x6f],
        fn(arg) {
          const val = decodeField(arg, 1, 0, 0, "unsigned");
          switch (val) {
            case 0:
              decodedData.resp_to_dl_command_format =
                "Invalid-write response format";
              break;
            case 1:
              decodedData.resp_to_dl_command_format = "4-byte CRC";
              break;
            default:
              decodedData.resp_to_dl_command_format = "Invalid";
          }
          return 1;
        },
      },
      {
        key: [0x71],
        fn(arg) {
          if (!decodedData.hasOwnProperty("metadata")) {
            decodedData.metadata = {};
          }
          decodedData.metadata.app_major_version = decodeField(
            arg,
            7,
            55,
            48,
            "unsigned",
          );
          decodedData.metadata.app_minor_version = decodeField(
            arg,
            7,
            47,
            40,
            "unsigned",
          );
          decodedData.metadata.app_revision = decodeField(
            arg,
            7,
            39,
            32,
            "unsigned",
          );
          decodedData.metadata.loramac_major_version = decodeField(
            arg,
            7,
            31,
            24,
            "unsigned",
          );
          decodedData.metadata.loramac_minor_version = decodeField(
            arg,
            7,
            23,
            16,
            "unsigned",
          );
          decodedData.metadata.loramac_revision = decodeField(
            arg,
            7,
            15,
            8,
            "unsigned",
          );
          const val = decodeField(arg, 7, 7, 0, "unsigned");
          switch (val) {
            case 0:
              decodedData.metadata.region = "EU868";
              break;
            case 1:
              decodedData.metadata.region = "US916";
              break;
            case 2:
              decodedData.metadata.region = "AS923";
              break;
            case 3:
              decodedData.metadata.region = "AU915";
              break;
            case 4:
              decodedData.metadata.region = "IN865";
              break;
            case 5:
              decodedData.metadata.region = "CN470";
              break;
            case 6:
              decodedData.metadata.region = "KR920";
              break;
            case 7:
              decodedData.metadata.region = "RU864";
              break;
            case 8:
              decodedData.metadata.region = "DN915";
              break;
            default:
              decodedData.metadata.region = "Invalid";
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
          decodedData.battery_voltage = (
            decodeField(arg, 2, 15, 0, "signed") * 0.001
          ).toFixed(3);
          return 2;
        },
      },
      {
        key: [0x01, 0x00],
        fn(arg) {
          const val = decodeField(arg, 1, 7, 0, "unsigned");
          switch (val) {
            case 0:
              decodedData.hall_effect_state = "Magnet Present";
              break;
            case 255:
              decodedData.hall_effect_state = "Magnet Absent";
              break;
            default:
              decodedData.hall_effect_state = "Invalid";
          }
          return 1;
        },
      },
      {
        key: [0x08, 0x04],
        fn(arg) {
          decodedData.hall_effect_count = decodeField(
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
        key: [0x0c, 0x00],
        fn(arg) {
          const val = decodeField(arg, 1, 7, 0, "unsigned");
          switch (val) {
            case 0:
              decodedData.impact_alarm = "Impact Alarm Inactive";
              break;
            case 255:
              decodedData.impact_alarm = "Impact Alarm Active";
              break;
            default:
              decodedData.impact_alarm = "Invalid";
          }
          return 1;
        },
      },
      {
        key: [0x05, 0x02],
        fn(arg) {
          decodedData.impact_magnitude = (
            decodeField(arg, 2, 15, 0, "unsigned") * 0.001
          ).toFixed(3);
          return 2;
        },
      },
      {
        key: [0x07, 0x71],
        fn(arg) {
          if (!decodedData.hasOwnProperty("acceleration")) {
            decodedData.acceleration = {};
          }
          decodedData.acceleration.xaxis = (
            decodeField(arg, 6, 47, 32, "signed") * 0.001
          ).toFixed(3);
          decodedData.acceleration.yaxis = (
            decodeField(arg, 6, 31, 16, "signed") * 0.001
          ).toFixed(3);
          decodedData.acceleration.zaxis = (
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
              decodedData.extconnector_state = "Low(short-circuit)";
              break;
            case 255:
              decodedData.extconnector_state = "High(open-circuit)";
              break;
            default:
              decodedData.extconnector_state = "Invalid";
          }
          return 1;
        },
      },
      {
        key: [0x0f, 0x04],
        fn(arg) {
          decodedData.extconnector_count = decodeField(
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
          decodedData.extconnector_total_count = decodeField(
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
          decodedData.extconnector_analog = (
            decodeField(arg, 2, 15, 0, "signed") * 0.001
          ).toFixed(3);
          return 2;
        },
      },
      {
        key: [0x0b, 0x67],
        fn(arg) {
          decodedData.mcu_temperature = (
            decodeField(arg, 2, 15, 0, "signed") * 0.1
          ).toFixed(1);
          return 2;
        },
      },
      {
        key: [0x03, 0x67],
        fn(arg) {
          decodedData.ambient_temperature = (
            decodeField(arg, 2, 15, 0, "signed") * 0.1
          ).toFixed(1);
          return 2;
        },
      },
      {
        key: [0x04, 0x68],
        fn(arg) {
          decodedData.relative_humidity = (
            decodeField(arg, 1, 7, 0, "unsigned") * 0.5
          ).toFixed(1);
          return 1;
        },
      },
      {
        key: [0x02, 0x00],
        fn(arg) {
          const val = decodeField(arg, 1, 7, 0, "unsigned");
          switch (val) {
            case 0:
              decodedData.light_detected = "Dark";
              break;
            case 255:
              decodedData.light_detected = "Bright";
              break;
            default:
              decodedData.light_detected = "Invalid";
          }
          return 1;
        },
      },
      {
        key: [0x10, 0x02],
        fn(arg) {
          decodedData.light_intensity = decodeField(arg, 1, 7, 0, "unsigned");
          return 1;
        },
      },
      {
        key: [0x0a, 0x00],
        fn(arg) {
          const val = decodeField(arg, 1, 7, 0, "unsigned");
          switch (val) {
            case 0:
              decodedData.motion_event_state = "None";
              break;
            case 255:
              decodedData.motion_event_state = "Detected";
              break;
            default:
              decodedData.motion_event_state = "Invalid";
          }
          return 1;
        },
      },
      {
        key: [0x0d, 0x04],
        fn(arg) {
          decodedData.motion_event_count = decodeField(
            arg,
            2,
            15,
            0,
            "unsigned",
          );
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
          if (!decodedData.hasOwnProperty("reset_diagnostics")) {
            decodedData.reset_diagnostics = {};
          }
          const val = decodeField(arg, 5, 39, 32, "unsigned");
          switch (val) {
            case 1:
              decodedData.reset_diagnostics.reset_reason = "Push-button reset";
              break;
            case 2:
              decodedData.reset_diagnostics.reset_reason = "DL command rest";
              break;
            case 4:
              decodedData.reset_diagnostics.reset_reason =
                "Independent watchdog reset";
              break;
            case 8:
              decodedData.reset_diagnostics.reset_reason = "Power loss reset";
              break;
            default:
              decodedData.reset_diagnostics.reset_reason = "Invalid";
          }
          decodedData.reset_diagnostics.power_loss_reset_count = decodeField(
            arg,
            5,
            31,
            24,
            "unsigned",
          );
          decodedData.reset_diagnostics.watchdog_reset_count = decodeField(
            arg,
            5,
            23,
            16,
            "unsigned",
          );
          decodedData.reset_diagnostics.dl_reset_count = decodeField(
            arg,
            5,
            15,
            8,
            "unsigned",
          );
          decodedData.reset_diagnostics.button_reset_count = decodeField(
            arg,
            5,
            7,
            0,
            "unsigned",
          );
          return 5;
        },
      },
    ];
  }
  for (let bytesLeft = bytes.length; bytesLeft > 0; ) {
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
