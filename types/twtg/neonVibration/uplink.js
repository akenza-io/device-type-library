/**
 * A class to calculate the CRC-32 checksum for an array of bytes.
 * This implementation uses a pre-computed lookup table for performance.
 */
class Crc32Checker {
  constructor() {
    this.crcTable = new Uint32Array(256);
    this.generateTable();
  }

  generateTable() {
    // The standard CRC-32 polynomial, reversed
    const polynomial = 0xEDB88320;

    for (let i = 0; i < 256; i++) {
      let c = i;
      for (let j = 0; j < 8; j++) {
        // If the last bit is 1, right-shift and XOR with the polynomial
        if (c & 1) {
          c = (c >>> 1) ^ polynomial;
        } else {
          // Otherwise, just right-shift
          c >>>= 1;
        }
      }
      this.crcTable[i] = c;
    }
  }

  checksum(byteArray) {
    // Start with an inverted CRC value
    let crc = 0xFFFFFFFF;

    for (let i = 0; i < byteArray.length; i++) {
      const byte = byteArray[i];
      // The core CRC calculation step
      // 1. XOR the current CRC's low byte with the next data byte.
      // 2. Use the result to look up a value in the table.
      // 3. XOR that table value with the CRC, shifted right by 8 bits.
      crc = (crc >>> 8) ^ this.crcTable[(crc ^ byte) & 0xFF];
    }

    // Final step: invert the result and ensure it's a 32-bit unsigned integer
    return (crc ^ 0xFFFFFFFF) >>> 0;
  }
}

const enums = {
  device_configuration_type_v0: {
    id: 'device_configuration_type_v0',
    size: 12,
    default: 'unknown',
    values: {
      '0': 'TWTG_REGION',
      '1': 'TRANSMITTER',
      '2': 'SCHEDULE',
      '3': 'VB_ALERT',
      '4': 'VB_SPECTRUM_ALERT',
      '5': 'VB_ASSET',
      '6': 'TWTG_TRANSMITTER'
    }
  },
  configuration_update_status_v0: {
    id: 'configuration_update_status_v0',
    size: 4,
    default: 'unknown',
    values: {
      '0': 'SUCCESS',
      '1': 'REJECTED_UNSUPPORTED_CONFIGURATION_TYPE',
      '2': 'REJECTED_UNSUPPORTED_CONFIGURATION_VERSION',
      '3': 'REJECTED_INVALID_CONFIGURATION_VALUES',
      '4': 'REJECTED_DECODING_FAILED',
      '5': 'REJECTED_SCHEDULE_TYPE_LIMIT',
      '6': 'SENSOR_COMMUNICATION_FAILURE'
    }
  },
  reboot_reason_v0: {
    id: 'reboot_reason_v0',
    size: 16,
    default: 'unknown',
    values: {
      '0': 'NONE',
      '1': 'CONFIGURATION_UPDATE',
      '2': 'FIRMWARE_UPDATE_SUCCESS',
      '3': 'FIRMWARE_UPDATE_REJECTED',
      '4': 'FIRMWARE_UPDATE_ERROR',
      '5': 'FIRMWARE_UPDATE_IN_PROGRESS',
      '6': 'BUTTON_RESET',
      '7': 'POWER_BLACK_OUT',
      '8': 'POWER_BROWN_OUT',
      '9': 'POWER_SAFE_STATE',
      '10': 'SYSTEM_FAILURE',
      '11': 'FACTORY_RESET',
      '12': 'REBOOT_REQUEST'
    }
  },
  deactivation_reason_v0: {
    id: 'deactivation_reason_v0',
    size: 8,
    default: 'unknown',
    values: {
      '0': 'USER_TRIGGERED',
      '1': 'ACTIVIATION_SENSOR_COMM_FAIL'
    }
  },
  vb_axis_v0: {
    id: 'vb_axis_v0',
    size: 2,
    default: 'unknown',
    values: {
      '0': 'X',
      '1': 'Y',
      '2': 'Z'
    }
  },
  vb_fault_type_v0: {
    id: 'vb_fault_type_v0',
    size: 2,
    default: 'unknown',
    values: {
      '0': 'COMMON_FAULT',
      '1': 'BEARING_FAULT'
    }
  },
  vb_fault_category_v0: {
    id: 'vb_fault_category_v0',
    size: 6,
    default: 'unknown',
    values: {
      '0': 'NONE',
      '1': 'ONE_X',
      '2': 'TWO_X',
      '3': 'N_X',
      '4': 'BEARING'
    }
  },
  vb_statistics_selection_v0: {
    id: 'vb_statistics_selection_v0',
    size: 4,
    default: 'unknown',
    values: {
      '0': 'X_RMS_VELOCITY',
      '1': 'X_RMS_ACCELERATION',
      '2': 'X_PEAK_ACCELERATION',
      '3': 'Y_RMS_VELOCITY',
      '4': 'Y_RMS_ACCELERATION',
      '5': 'Y_PEAK_ACCELERATION',
      '6': 'Z_RMS_VELOCITY',
      '7': 'Z_RMS_ACCELERATION',
      '8': 'Z_PEAK_ACCELERATION',
      '9': 'TEMPERATURE'
    }
  },
  vb_spectrum_type_v0: {
    id: 'vb_spectrum_type_v0',
    size: 2,
    default: 'unknown',
    values: {
      '0': 'ACCELERATION',
      '1': 'VELOCITY',
      '2': 'ENVELOPE'
    }
  },
  vb_config_axis_v0: {
    id: 'vb_config_axis_v0',
    size: 2,
    default: 'unknown',
    values: {
      '0': 'X',
      '1': 'Y',
      '2': 'Z',
      '3': 'ALL'
    }
  },
  vb_range_v0: {
    id: 'vb_range_v0',
    size: 2,
    default: 'unknown',
    values: {
      '0': 'GSCALE_2',
      '1': 'GSCALE_4',
      '2': 'GSCALE_8',
      '3': 'GSCALE_16'
    }
  },
  vb_send_condition_v0: {
    id: 'vb_send_condition_v0',
    size: 4,
    default: 'unknown',
    values: {
      '0': 'ALWAYS',
      '1': 'PEAK_ACCELERATION_ABOVE',
      '2': 'RMS_ACCELERATION_ABOVE',
      '3': 'RMS_VELOCITY_ABOVE',
      '4': 'TEMPERATURE_ABOVE',
      '5': 'TEMPERATURE_BELOW'
    }
  },
  schedule_set_command_v0: {
    id: 'schedule_set_command_v0',
    size: 4,
    default: 'unknown',
    values: {
      '0': 'SET',
      '1': 'REPLACE',
      '2': 'EXECUTE',
      '3': 'RESET',
      '4': 'REMOVE'
    }
  },
  vb_alert_selection_v0: {
    id: 'vb_alert_selection_v0',
    size: 4,
    default: 'unknown',
    values: {
      '0': 'OFF',
      '1': 'X_RMS_VELOCITY_ABOVE',
      '2': 'X_RMS_ACCELERATION_ABOVE',
      '3': 'X_PEAK_ACCELERATION_ABOVE',
      '4': 'Y_RMS_VELOCITY_ABOVE',
      '5': 'Y_RMS_ACCELERATION_ABOVE',
      '6': 'Y_PEAK_ACCELERATION_ABOVE',
      '7': 'Z_RMS_VELOCITY_ABOVE',
      '8': 'Z_RMS_ACCELERATION_ABOVE',
      '9': 'Z_PEAK_ACCELERATION_ABOVE',
      '10': 'TEMPERATURE_ABOVE',
      '11': 'TEMPERATURE_BELOW'
    }
  },
  vb_spectrum_alert_selection_v0: {
    id: 'vb_spectrum_alert_selection_v0',
    size: 5,
    default: 'unknown',
    values: {
      '0': 'OFF',
      '1': 'PEAK_VELOCITY_X',
      '2': 'PEAK_VELOCITY_Y',
      '3': 'PEAK_VELOCITY_Z',
      '4': 'PEAK_ACCELERATION_X',
      '5': 'PEAK_ACCELERATION_Y',
      '6': 'PEAK_ACCELERATION_Z',
      '7': 'PEAK_ENVELOPE_X',
      '8': 'PEAK_ENVELOPE_Y',
      '9': 'PEAK_ENVELOPE_Z',
      '10': 'RMS_VELOCITY_X',
      '11': 'RMS_VELOCITY_Y',
      '12': 'RMS_VELOCITY_Z',
      '13': 'RMS_ACCELERATION_X',
      '14': 'RMS_ACCELERATION_Y',
      '15': 'RMS_ACCELERATION_Z',
      '16': 'RMS_ENVELOPE_X',
      '17': 'RMS_ENVELOPE_Y',
      '18': 'RMS_ENVELOPE_Z',
      '19': 'MACHINE_FAULT_1X',
      '20': 'MACHINE_FAULT_2X',
      '21': 'MACHINE_FAULT_NX',
      '22': 'MACHINE_FAULT_BEARING',
      '23': 'MACHINE_FAULT_ANY'
    }
  },
  schedule_type_v0: {
    id: 'schedule_type_v0',
    size: 12,
    default: 'unknown',
    values: {
      '0': 'TRANSMITTER_STATUS',
      '1': 'VB_MEASUREMENT',
      '2': 'VB_MACHINE_FAULT_INDICATOR',
      '3': 'VB_SPECTRUM',
      '4': 'TWTG_VB_RAW',
      '5': 'VB_STATISTICS_X_RMS_VELOCITY',
      '6': 'VB_STATISTICS_X_RMS_ACCELERATION',
      '7': 'VB_STATISTICS_X_PEAK_ACCELERATION',
      '8': 'VB_STATISTICS_Y_RMS_VELOCITY',
      '9': 'VB_STATISTICS_Y_RMS_ACCELERATION',
      '10': 'VB_STATISTICS_Y_PEAK_ACCELERATION',
      '11': 'VB_STATISTICS_Z_RMS_VELOCITY',
      '12': 'VB_STATISTICS_Z_RMS_ACCELERATION',
      '13': 'VB_STATISTICS_Z_PEAK_ACCELERATION',
      '14': 'VB_STATISTICS_TEMPERATURE',
      '15': 'TRANSMITTER_BATTERY'
    }
  }
};

function float16ToNumber(encoded) {
  const hex = Bits.bitsToUnsigned(encoded);
  const sign = hex & 0x8000 ? -1 : 1;
  const exp = (hex & 0x7c00) >> 10;
  const fraction = hex & 0x03ff;
  if (exp === 0) {
    return sign * 5.960464477539063e-8 * fraction; // 2^-24
  }
  if (exp === 31) {
    return fraction ? NaN : sign * Infinity;
  }
  return sign * Math.pow(2, exp - 15) * (1 + fraction * 0.0009765625); // 2^-10
}

function float32ToNumber(encoded) {
  const hex = Bits.bitsToUnsigned(encoded);
  const sign = hex & 0x80000000 ? -1 : 1;
  const exp = (hex & 0x7f800000) >> 23;
  const fraction = hex & 0x7fffff;
  if (exp === 0) {
    return sign * 1.401298464324817e-45 * fraction; // 2^-149
  }
  if (exp === 255) {
    return fraction ? NaN : sign * Infinity;
  }
  return sign * Math.pow(2, exp - 127) * (1 + fraction * 1.1920928955078125e-7); // 2^-23
}

function decode(payload, bits, port, state) {
  const decoded = {};
  const messageId = Bits.bitsToUnsigned(bits.substr(0, 4));
  const messageVersion = Bits.bitsToUnsigned(bits.substr(4, 4));
  switch ((port << 8) | (messageId << 4) | messageVersion) {
    case 0xe10: {
      decoded.transmitterChargeUsed = float16ToNumber(bits.substr(8, 15));
      decoded.sensorChargeUsed = float16ToNumber(bits.substr(23, 15));
      decoded.averageTemperature = float16ToNumber(bits.substr(38, 16));
      let batteryLevel = Bits.bitsToUnsigned(bits.substr(54, 8));
      if (batteryLevel == 0) {
        decoded.batteryLevel = 100;
        // 255 means not available
      } else if (batteryLevel < 255) {
        decoded.batteryLevel = Math.round(batteryLevel / 2.55)
      }
      // Reserved 2

      return { data: decoded, topic: "lifecycle" };
    } case 0xe30:
      return { data: { "response": true }, topic: "lifecycle_response" };
    case 0xb00:
      decoded.tag = (payload.substr(2, 8));
      decoded.deviceConfiguration = enums.device_configuration_type_v0.values[(Bits.bitsToUnsigned(bits.substr(40, 12)))];
      decoded.updateStatus = enums.configuration_update_status_v0.values[(Bits.bitsToUnsigned(bits.substr(52, 4)))];
      return { data: decoded, topic: "configuration" };
    case 0xc00:
      // Check if theres still an active session
      if (state.streamingFragments !== undefined) {
        if (state.streamingFragments && state.streamingNonRedundant) {
          // Should notifiy but not stop the new fragment stream
          emit("log", { data: { "error": "MULTIPLE_FRAGMENT_STREAMS" }, topic: "error" });
        }
      }
      // Instate helpers here, they should be reused for each session
      state.streamingFragments = true;
      state.streamingNonRedundant = true;

      decoded.port = Bits.bitsToUnsigned(bits.substr(8, 8));
      decoded.uplinkSize = Bits.bitsToUnsigned(bits.substr(16, 16));
      decoded.fragmentSize = Bits.bitsToUnsigned(bits.substr(32, 8)); // I do not think this matters for now
      decoded.crc = Bits.bitsToUnsigned(bits.substr(40, 32));

      // Pass checksum and uplink parameters so they can be used later
      state.crc = decoded.crc;
      state.uplinkSize = decoded.uplinkSize;
      state.port = decoded.port;
      state.concatedPayload = "";

      return { data: decoded, topic: "fragment_start", state };
    case 0xc10:
      // Break if there is no active session
      if (state.streamingFragments === undefined || !state.streamingFragments) {
        return { data: { "error": "NO_STARTING_FRAGMENT" }, topic: "error" };
      }

      decoded.index = Bits.bitsToUnsigned(bits.substr(8, 16));
      decoded.fragmentType = "PLAIN";
      for (let i = 6; i < payload.length; i += 2) {
        // Add bytes till the payload is complete
        if (state.concatedPayload.length / 2 < state.uplinkSize) {
          state.concatedPayload += payload.substr(i, 2);
        } else {
          if (state.streamingNonRedundant) {
            state.streamingNonRedundant = false;

            const checker = new Crc32Checker();
            const byteArray = Hex.hexToBytes(state.concatedPayload);
            const crcValue = checker.checksum(byteArray);

            // Check CRC
            if (state.crc === crcValue) {
              // Initiate new consume for the reconstructed payload
              return { data: { "payloadHex": state.concatedPayload, "port": state.port }, "state": state, topic: "reinvoke" };
            } else {
              return { data: { "error": "CRC_DID_NOT_MATCH_ABORTING" }, topic: "error" };
            }
          } else {
            decoded.fragmentType = "REDUNDANT";
          }
          // Ignore redundant for now
          return;
        }
      }

      return { data: decoded, topic: "fragment", state };
    case 0xe20:
      return { data: { "response": true }, topic: "factory_reset" };
    case 0x1000:
      decoded.rebootReason = enums.reboot_reason_v0.values[Bits.bitsToUnsigned(bits.substr(8, 16))];
      return { data: decoded, topic: "boot" };
    case 0x1010:
      decoded.temperature = Bits.bitsToSigned(bits.substr(8, 8));
      decoded.rssi = Bits.bitsToSigned(bits.substr(16, 8));
      decoded.loraTxCounter = Bits.bitsToUnsigned(bits.substr(24, 16));
      decoded.powerSupply = !!Bits.bitsToUnsigned(bits.substr(40, 1));
      decoded.configuration = !!Bits.bitsToUnsigned(bits.substr(41, 1));
      decoded.sensorConnection = !!Bits.bitsToUnsigned(bits.substr(42, 1));
      decoded.sensorPaired = !!Bits.bitsToUnsigned(bits.substr(43, 1));
      decoded.flashMemory = !!Bits.bitsToUnsigned(bits.substr(44, 1));
      decoded.internalTemperatureSensor = !!Bits.bitsToUnsigned(bits.substr(45, 1));
      decoded.timeSynchronized = !!Bits.bitsToUnsigned(bits.substr(46, 1));
      // Reserved 1
      return { data: decoded, topic: "status" };
    case 0x1030:
      decoded.deactivationReason = enums.deactivation_reason_v0.values[Bits.bitsToUnsigned(bits.substr(8, 8))];
      return { data: decoded, topic: "deactivation" };
    case 0x1100:
      decoded.rebootReason = enums.reboot_reason_v0.values[Bits.bitsToUnsigned(bits.substr(8, 16))];
      return { data: decoded, topic: "boot" };
    case 0x1110: {
      // Reserved short timestamp 16
      const axis = enums.vb_axis_v0.values[Bits.bitsToUnsigned(bits.substr(24, 2))];
      decoded.temperature = Bits.bitsToSigned(bits.substr(26, 8));
      decoded.peakAcceleration = float16ToNumber(bits.substr(34, 16));
      decoded.rmsAcceleration = float16ToNumber(bits.substr(50, 16));
      decoded.rmsVelocity = float16ToNumber(bits.substr(66, 16));
      // Reserved 6
      return { data: decoded, topic: `axis_${String(axis).toLowerCase()}` };
    } case 0x1120:
      // Reserved short timestamp 16
      decoded.sensorAlert0 = !!Bits.bitsToSigned(bits.substr(24, 1));
      decoded.sensorAlert1 = !!Bits.bitsToSigned(bits.substr(25, 1));
      decoded.sensorAlert2 = !!Bits.bitsToSigned(bits.substr(26, 1));
      decoded.sensorAlert3 = !!Bits.bitsToSigned(bits.substr(27, 1));
      decoded.sensorAlert4 = !!Bits.bitsToSigned(bits.substr(28, 1));
      decoded.sensorAlert5 = !!Bits.bitsToSigned(bits.substr(29, 1));
      decoded.sensorAlert6 = !!Bits.bitsToSigned(bits.substr(30, 1));
      decoded.sensorAlert7 = !!Bits.bitsToSigned(bits.substr(31, 1));
      decoded.spectrumAlert0 = !!Bits.bitsToSigned(bits.substr(32, 1));
      decoded.spectrumAlert1 = !!Bits.bitsToSigned(bits.substr(33, 1));
      decoded.spectrumAlert2 = !!Bits.bitsToSigned(bits.substr(34, 1));
      decoded.spectrumAlert3 = !!Bits.bitsToSigned(bits.substr(35, 1));
      decoded.spectrumAlert4 = !!Bits.bitsToSigned(bits.substr(36, 1));
      // Reserved 3
      return { data: decoded, topic: "alert" };
    case 0x1130: {
      // Reserved short timestamp 16
      decoded.axis = enums.vb_axis_v0.values[Bits.bitsToUnsigned(bits.substr(24, 2))];
      decoded.faultType = enums.vb_fault_type_v0.values[Bits.bitsToUnsigned(bits.substr(26, 2))];
      decoded.faultCategory = enums.vb_fault_category_v0.values[Bits.bitsToUnsigned(bits.substr(28, 6))];
      const frequencyFirstHarmonic = float16ToNumber(bits.substr(34, 15));
      const amplitudeFirstHarmonic = float16ToNumber(bits.substr(49, 15));

      const relativeNthHarmonicAmplitudes = [];
      for (let i = 64; i < bits.length; i += 8) {
        relativeNthHarmonicAmplitudes.push(Bits.bitsToUnsigned(bits.substr(i, 8)));
      }

      decoded.harmonicFrequencies = [];
      for (let i = 1; i < relativeNthHarmonicAmplitudes.length + 2; i++) {
        decoded.harmonicFrequencies.push(frequencyFirstHarmonic * i)
      }

      decoded.harmonicAmplitudes = [];
      decoded.harmonicAmplitudes.push(amplitudeFirstHarmonic);
      relativeNthHarmonicAmplitudes.forEach(element => {
        decoded.harmonicAmplitudes.push((2.5 * amplitudeFirstHarmonic * element) / 255)
      });

      return { data: decoded, topic: "machine_fault" };
    } case 0x1140:
      decoded.selection = enums.vb_statistics_selection_v0.values[Bits.bitsToUnsigned(bits.substr(8, 4))];
      decoded.min = float16ToNumber(bits.substr(12, 16));
      decoded.max = float16ToNumber(bits.substr(28, 16));
      decoded.avg = float16ToNumber(bits.substr(44, 16));
      // Reserved short timestamp 16
      // Reserved 4

      return { data: decoded, topic: "statistics" };
    case 0x1150: {
      // Reserved timestamp 32
      const axis = enums.vb_axis_v0.values[Bits.bitsToUnsigned(bits.substr(40, 2))];
      decoded.spectrumType = enums.vb_spectrum_type_v0.values[Bits.bitsToUnsigned(bits.substr(42, 2))];
      decoded.temperature = Bits.bitsToSigned(bits.substr(44, 8));
      const df = float16ToNumber(bits.substr(52, 16));
      const fMin = float16ToNumber(bits.substr(68, 16));
      decoded.peakAcceleration = float16ToNumber(bits.substr(84, 16));
      decoded.rmsAcceleration = float16ToNumber(bits.substr(100, 16));
      decoded.rmsVelocity = float16ToNumber(bits.substr(116, 16));
      decoded.rpm = float32ToNumber(bits.substr(132, 32));
      const magnitudesScaling = float16ToNumber(bits.substr(164, 15));
      // Reserved 5
      const magnitudeValues = [];
      for (let i = 184; i < bits.length; i += 10) {
        magnitudeValues.push(Bits.bitsToUnsigned(bits.substr(i, 10)));
      }
      decoded.frequencies = [];
      for (let i = 0; i < magnitudeValues.length; i++) {
        decoded.frequencies.push(fMin + df * i);
      }
      decoded.magnitudes = [];
      magnitudeValues.forEach(element => {
        decoded.magnitudes.push(element * magnitudesScaling);
      });

      return { data: decoded, topic: `axis_${String(axis).toLowerCase()}_spectrum` };
    } default: {
      emit("log", { debugging: { "payload": payload, "port": port } });
      return { data: { "error": "UNKNOWN_MESSAGE" }, topic: "error" };
    }
  }
}

function consume(event) {
  let payload = event.data.payloadHex;
  let { port } = event.data;
  let bits = Bits.hexToBits(payload);
  let state = event.state || {};

  let decoded = decode(payload, bits, port, state);
  if (decoded !== undefined) {
    // Run concated payload
    if (decoded.topic == "reinvoke") {
      payload = decoded.data.payloadHex;
      bits = Bits.hexToBits(payload);
      port = decoded.data.port;
      state = decoded.state;
      decoded = decode(payload, bits, port, state);
    }

    emit("sample", { data: decoded.data, topic: decoded.topic });
    emit("state", state);
  }
}