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

function consume(event) {
  const payload = event.data.payloadHex;
  const { port } = event.data;
  const bits = Bits.hexToBits(payload);
  const decoded = {};
  const lifecycle = {};

  const messageId = Bits.bitsToUnsigned(bits.substr(0, 4)); // 10
  const messageVersion = Bits.bitsToUnsigned(bits.substr(4, 4));
  switch ((port << 8) | (messageId << 4) | messageVersion) {
    case 0xe10:
      decoded.transmitterChargeUsed = float16ToNumber(bits.substr(8, 15));
      decoded.sensorChargeUsed = float16ToNumber(bits.substr(23, 15));
      decoded.averageTemperature = float16ToNumber(bits.substr(38, 16));
      decoded.batteryLevel = Bits.bitsToUnsigned(bits.substr(54, 8));
      // Reserved 2

      emit("sample", { data: decoded, topic: "lifecycle" });
      break;
    case 0xe30:
      emit("sample", { data: { "response": true }, topic: "lifecycle_response" });
      break;
    case 0xb00:
      decoded.tag = (payload.substr(2, 8));
      decoded.type = enums.device_configuration_type_v0.values[(Bits.bitsToUnsigned(bits.substr(40, 12)))];
      decoded.status = enums.configuration_update_status_v0.values[(Bits.bitsToUnsigned(bits.substr(52, 4)))];
      emit("sample", { data: decoded, topic: "configuration" });
      break;
    case 0xc00:
      decoded.port = Bits.bitsToUnsigned(bits.substr(8, 8));
      decoded.uplinkSize = Bits.bitsToUnsigned(bits.substr(16, 16));
      decoded.fragmentSize = Bits.bitsToUnsigned(bits.substr(32, 8));
      decoded.crc = Bits.bitsToUnsigned(bits.substr(40, 32));
      emit("sample", { data: decoded, topic: "fragment_start" });
      break;
    case 0xc10:
      decoded.index = Bits.bitsToUnsigned(bits.substr(8, 16));
      decoded.decoded = [];
      for (let i = 24; i < bits.length; i += 8) {
        decoded.decoded.push(Bits.bitsToUnsigned(bits.substr(i, 8)));
      }
      emit("sample", { data: decoded, topic: "fragment" });
      break;
    case 0xe20:
      emit("sample", { data: { "response": true }, topic: "factory_reset" });
      break;
    case 0x1000:
      decoded.rebootReason = enums.reboot_reason_v0.values[Bits.bitsToUnsigned(bits.substr(8, 16))];
      emit("sample", { data: decoded, topic: "boot" });
      break;
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
      emit("sample", { data: decoded, topic: "status" });
      break;
    case 0x1030:
      decoded.deactivationReason = enums.deactivation_reason_v0.values[Bits.bitsToUnsigned(bits.substr(8, 8))];
      emit("sample", { data: decoded, topic: "deactivation" });
      break;
    case 0x1100:
      decoded.rebootReason = enums.reboot_reason_v0.values[Bits.bitsToUnsigned(bits.substr(8, 16))];
      emit("sample", { data: decoded, topic: "boot" });
      break;
    case 0x1110:
      // Reserved short timestamp 16
      decoded.axis = enums.vb_axis_v0.values[Bits.bitsToUnsigned(bits.substr(24, 2))];
      decoded.temperature = Bits.bitsToSigned(bits.substr(26, 8));
      decoded.peakAcceleration = float16ToNumber(bits.substr(34, 16));
      decoded.rmwAcceleration = float16ToNumber(bits.substr(50, 16));
      decoded.rmsVelocity = float16ToNumber(bits.substr(66, 16));
      // Reserved 6
      emit("sample", { data: decoded, topic: "default" });
      break;
    case 0x1120:
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
      emit("sample", { data: decoded, topic: "alert" });
      break;
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

      emit("sample", { data: decoded, topic: "machine_fault" });
      break;
    } case 0x1140:
      decoded.selection = enums.vb_statistics_selection_v0.values[Bits.bitsToUnsigned(bits.substr(8, 4))];
      decoded.min = float16ToNumber(bits.substr(12, 16));
      decoded.max = float16ToNumber(bits.substr(28, 16));
      decoded.avg = float16ToNumber(bits.substr(44, 16));
      // Reserved short timestamp 16
      // Reserved 4

      emit("sample", { data: decoded, topic: "statistics" });
      break;
    case 0x1150: {
      // Reserved timestamp 32
      decoded.axis = enums.vb_axis_v0.values[Bits.bitsToUnsigned(bits.substr(40, 2))];
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

      emit("sample", { data: decoded, topic: "spectrum" });
      break;
    } default:
      emit("sample", { data: { "error": "UNKNOWN_MESSAGE" }, topic: "error" });
  }
}