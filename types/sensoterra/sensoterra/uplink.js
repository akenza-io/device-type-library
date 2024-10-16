const FPort = {
  CURRENT_MEASUREMENT: 11,
  HISTORICAL_MEASUREMENT: 12,
  KPI1_REPORT: 100,
  KPI2_REPORT: 101,
  KPI3_REPORT: 102,
  KPI4_REPORT: 103,
  KPI5_REPORT: 104,
  KPI6_REPORT: 105,
  KPI7_REPORT: 106,
  KPI8_REPORT: 107,
  KPI9_REPORT: 108,
  KPI10_REPORT: 109,
  KPI11_REPORT: 110,
  KPI12_REPORT: 111,
};

const ResetReason = {
  POWER_ON: 0,
  PIN_RESET: 1,
  BROWN_OUT: 2,
  SOFTWARE: 3,
  WATCHDOG: 4,
};

function ResetReasonMap() {
  // nothing to do
}

ResetReasonMap.get = function (reason_id) {
  switch (reason_id) {
    case ResetReason.POWER_ON:
      return 'POWER_ON';
    case ResetReason.PIN_RESET:
      return 'PIN_RESET';
    case ResetReason.BROWN_OUT:
      return 'BROWN_OUT';
    case ResetReason.SOFTWARE:
      return 'SOFTWARE';
    case ResetReason.WATCHDOG:
      return 'WATCHDOG';
    default:
      return 'UNKNOWN';
  }
};

ResetReasonMap.has = function (reason_id) {
  return this.get(reason_id) !== 'UNKNOWN';
};

const ResetContext = {
  UNKNOWN: 0,
  DEEP_SLEEP: 1,
  SOIL_MEASUREMENT: 2,
  TEMPERATURE_MEASUREMENT: 3,
  VOLTAGE_MEASUREMENT: 4,
  JOINING_NETWORK: 5,
  SENDING_UPLINK_CONFIRMED: 6,
  SENDING_UPLINK_UNCONFIRMED: 7,
  RECEIVING_DOWNLINK: 8,
  APPLYING_ADR: 9,
  OTHER: 15,
};

function ResetContextMap() {
  // nothing to do
}

ResetContextMap.get = function (context_id) {
  switch (context_id) {
    case ResetContext.UNKNOWN:
      return 'UNKNOWN';
    case ResetContext.DEEP_SLEEP:
      return 'DEEP_SLEEP';
    case ResetContext.SOIL_MEASUREMENT:
      return 'SOIL_MEASUREMENT';
    case ResetContext.TEMPERATURE_MEASUREMENT:
      return 'TEMPERATURE_MEASUREMENT';
    case ResetContext.VOLTAGE_MEASUREMENT:
      return 'VOLTAGE_MEASUREMENT';
    case ResetContext.JOINING_NETWORK:
      return 'JOINING_NETWORK';
    case ResetContext.SENDING_UPLINK_CONFIRMED:
      return 'SENDING_UPLINK_CONFIRMED';
    case ResetContext.SENDING_UPLINK_UNCONFIRMED:
      return 'SENDING_UPLINK_UNCONFIRMED';
    case ResetContext.RECEIVING_DOWNLINK:
      return 'RECEIVING_DOWNLINK';
    case ResetContext.APPLYING_ADR:
      return 'APPLYING_ADR';
    case ResetContext.OTHER:
      return 'OTHER';
    default:
      return 'UNKNOWN';
  }
};

ResetContextMap.has = function (context_id) {
  return this.get(context_id) !== 'UNKNOWN';
};

function DepthMap() {
  this.depth_bit_mask_list = [];
  this.depth_bit_mask_list.push({ bit_mask: 1 << 0, depth: 10 });
  this.depth_bit_mask_list.push({ bit_mask: 1 << 1, depth: 20 });
  this.depth_bit_mask_list.push({ bit_mask: 1 << 2, depth: 30 });
  this.depth_bit_mask_list.push({ bit_mask: 1 << 3, depth: 45 });
  this.depth_bit_mask_list.push({ bit_mask: 1 << 4, depth: 60 });
  this.depth_bit_mask_list.push({ bit_mask: 1 << 5, depth: 90 });
}

DepthMap.prototype.list = function () {
  return this.depth_bit_mask_list;
};

function ProbeModeMap() {
  // nothing to do
}

ProbeModeMap.get = function (is_local_mode) {
  return is_local_mode ? 'LOCAL' : 'CLOUD';
};

function LinkCheckModeMap() {
  // nothing to do
}

LinkCheckModeMap.get = function (is_confirmed_uplinks) {
  return is_confirmed_uplinks ? 'CONFIRMED_UPLINKS' : 'LINK_CHECKS';
};

const DataType = {
  MEASUREMENT: 'Measurement',
  REPORT1: 'Report_1',
  REPORT2: 'Report_2',
  REPORT3: 'Report_3',
  REPORT4: 'Report_4',
  REPORT5: 'Report_5',
  REPORT6: 'Report_6',
  SOIL_CALIBRATION: 'Soil_Calibration',
};

function pad(pad_str, str, padLeft) {
  if (typeof str === 'undefined') { return pad_str; }
  if (padLeft) {
    return (pad_str + str).slice(-pad_str.length);
  }

  return (str + pad_str).substring(0, pad_str.length);

}

function formatString(theString, argumentArray) {
  const regex = /%s/;
  const _r = function (p, c) {
    return p.replace(regex, c);
  };
  return argumentArray.reduce(_r, theString);
}

function bytesToFloat16(byte_value) {
  let result = NaN;
  const sign = (byte_value & 0x8000) >> 15;
  const exponent = (byte_value & 0x7C00) >> 10;
  const precision = byte_value & 0x03FF;

  if (exponent === 0) {
    result = (sign ? -1 : 1) * Math.pow(2, -14) * (precision / Math.pow(2, 10));
  }
  else if (exponent == 0x1F) {
    return (precision === 0) ? NaN : ((sign ? -1 : 1) * Infinity);
  }
  else {
    return (sign ? -1 : 1) * Math.pow(2, exponent - 15) * (1 + (precision / Math.pow(2, 10)));
  }

  return result;
}

function toHexString(byte_array) {
  return Array.prototype.map
    .call(
      byte_array,
      (byte) => (`0${(byte & 0xFF).toString(16)}`).slice(-2)
    )
    .join('');
}

function decodeMeasurementPayload(payload) {
  const result = {
    type: DataType.MEASUREMENT,
    data: {},
    warnings: null,
    errors: null,
  };
  result.data = {
    readings: null,
    saturation_point_overshot: null,
  };

  if (payload.length < 9) {
    result.errors = ['Payload is too short'];
    return result;
  }

  const bit_mask = 0xff;
  const nof_readings = 7;
  let bit_mask_shift = 0;
  let byte_index = 0;

  result.data.readings = [];

  for (let reading_index = 0; reading_index < nof_readings; reading_index++) {
    const reading_value =
      ((payload[byte_index + 1] & (bit_mask >>> (8 - bit_mask_shift - 2))) << (8 - bit_mask_shift)) |
      ((payload[byte_index] & (bit_mask << bit_mask_shift)) >>> bit_mask_shift);

    let entry = null;
    if (reading_index < 6) {
      entry = {
        value: reading_value == 1023 ? 0.0 : reading_value / 10.0,
        type: 'volumetric_moisture',
        unit: '%',
        error_flag: reading_value === 1023,
      };
    } else {
      let temperature_reading = 0;

      if (reading_value === 0) {
        // minimum measurable temperature
        temperature_reading = -30.0;

        if (!result.warnings) {
          result.warnings = [];
        }
        result.warnings.push('Temperature is too low. Value capped at -30.0 ℃');
      } else if (reading_value == 1021) {
        // maximum measurable temperature
        temperature_reading = 70.0;

        if (!result.warnings) {
          result.warnings = [];
        }
        result.warnings.push('Temperature is too high. Value capped at 70.0 ℃');
      } else {
        temperature_reading = (reading_value - 300) / 10.0;
      }

      entry = {
        value: temperature_reading,
        type: 'temperature',
        unit: '℃',
        error_flag: reading_value === 1023,
      };
    }

    result.data.readings.push(entry);

    bit_mask_shift += 2;

    if (bit_mask_shift == 8) {
      byte_index++;
      bit_mask_shift = 0;
    }

    byte_index++;
  }

  const calibration_flag_mask = 0x40;
  result.data.saturation_point_overshot = (payload[8] & calibration_flag_mask) !== 0;

  if (result.data.saturation_point_overshot) {
    if (!result.warnings) {
      result.warnings = [];
    }
    result.warnings.push('Saturation point overshot detected. Perhaps soil calibration needs re-evaluation');
  }

  return result;
}

function decodeKPI1Payload(payload) {
  const result = {
    type: DataType.REPORT1,
    data: {},
    warnings: null,
    errors: null,
  };

  if (payload.length < 9) {
    result.errors = ['Payload is too short'];
    return result;
  }

  const voltage_reference = 1.7;
  const esp_reference = -220;

  result.data.battery_voltage = {
    value: Math.round((((payload[0] >>> 0) / 125.0) + voltage_reference) * 100) / 100.0,
    unit: 'V',
  };

  // Parsing ESP
  result.data.estimated_signal_power = {
    value: (payload[1] >>> 0) + esp_reference,
    unit: 'dBm',
  };
  if (result.data.estimated_signal_power.value < -135) {
    result.data.estimated_signal_power.status = 'WEAK';
  } else if (result.data.estimated_signal_power.value < -125) {
    result.data.estimated_signal_power.status = 'AVERAGE';
  } else {
    result.data.estimated_signal_power.status = 'GOOD';
  }

  // Parsing saturation overshot
  const saturation_bit_mask = payload[2];

  result.data.saturation_point_overshot_depth = [];
  const depth_map = new DepthMap();
  for (let index = 0; index < depth_map.list().length; index++) {
    const item = depth_map.list()[index];

    if ((saturation_bit_mask & item.bit_mask) !== 0) {
      result.data.saturation_point_overshot_depth.push(item.depth);
    }
  }

  const is_single_depth = (saturation_bit_mask & 0x80) === 0;

  if (is_single_depth && result.data.saturation_point_overshot_depth.length > 1) {
    if (!result.errors) {
      result.errors = [];
    }
    result.errors.push('Multiple depth sensor saturation bit mask returned from a single depth sensor');
  }
  else if (is_single_depth) {
    result.data.saturation_point_overshot_depth = [0];
  }

  const is_major_minor_patch = payload[4] & (1 << 7);
  if (!is_major_minor_patch) {
    result.data.firmware_version = formatString('%s', [((payload[4] >>> 0) << 8) | (payload[3] >>> 0)]);
  }
  else {
    result.data.firmware_version = formatString('%s.%s.%s', [
      ((payload[4] & 0x7F) >>> 2),
      (((payload[4] & 0x03) << 3) | (payload[3] >>> 5)),
      (payload[3] & 0x1F),
    ]);
  }

  const reset_context_id = (payload[5] & 0xF0) >>> 4;
  const reset_reason_id = (payload[5] & 0x0F) >>> 0;
  result.data.reset = {
    context: ResetContextMap.get(reset_context_id),
    reason: ResetReasonMap.get(reset_reason_id),
  };

  result.data.uptime = {
    value: (payload[8] << 16) | (payload[7] << 8) | (payload[6]),
    unit: 's',
  };

  return result;
}

function decodeKPI2Payload(payload) {
  const result = {
    type: DataType.REPORT2,
    data: {},
    warnings: null,
    errors: null,
  };

  if (payload.length < 6) {
    result.errors = ['Payload is too short'];
    return result;
  }

  result.data = {
    history_enabled: ((payload[0] & (1 << 3)) !== 0),
    probe_mode: ProbeModeMap.get((payload[0] & (1 << 2)) !== 0),
    watchdog_enabled: (payload[0] & (1 << 1)) !== 0,
    link_check_mode: LinkCheckModeMap.get((payload[0] & 0x01) !== 0),
    network_check_counter_interval: payload[3] >>> 0,
    network_check_counter_threshold: payload[4] >>> 0,
    number_retransmissions: payload[5] >>> 0,
  };

  result.data.sleep_interval = {
    value: ((payload[2] >>> 0) << 8) | (payload[1] >>> 0),
    unit: 'min',
  };

  return result;
}

function decodeKPI3Payload(payload) {
  const result = {
    type: DataType.REPORT3,
    data: {},
    warnings: null,
    errors: null,
  };

  result.data = {
    channel_mask: toHexString(payload),
  };

  return result;
}

function decodeKPI4Payload(payload) {
  const result = {
    type: DataType.REPORT4,
    data: {},
    warnings: null,
    errors: null,
  };

  if (payload.length < 9) {
    result.errors = ['Payload is too short'];
    return result;
  }

  result.data = {
    total_number_resets: (payload[4] >>> 0) << 8 | (payload[3] >>> 0),
    total_number_successful_join_sessions: (payload[6] >>> 0) << 8 | (payload[5] >>> 0),
    total_number_failed_join_sessions: (payload[8] >>> 0) << 8 | (payload[7] >>> 0),
  };

  result.data.total_time_on_air = {
    value: (payload[2] >>> 0) << 16 | (payload[1] >>> 0) << 8 | (payload[0] >>> 0),
    unit: 's'
  };

  return result;
}

function decodeKPI5Payload(payload) {
  const result = {
    type: DataType.REPORT5,
    data: {},
    warnings: null,
    errors: null,
  };

  if (payload.length < 9) {
    result.errors = ['Payload is too short'];
    return result;
  }

  result.data = {
    total_number_uplinks: (payload[2] >>> 0) << 16 | (payload[1] >>> 0) << 8 | (payload[0] >>> 0),
    total_number_uplinks_sf12: ((payload[4] >>> 0) << 8 | (payload[3] >>> 0)) * 10,
    total_number_uplinks_sf11: ((payload[6] >>> 0) << 8 | (payload[5] >>> 0)) * 10,
    total_number_uplinks_sf10: ((payload[8] >>> 0) << 8 | (payload[7] >>> 0)) * 10,
  };

  return result;
}

function decodeKPI6Payload(payload) {
  const result = {
    type: DataType.REPORT6,
    data: {},
    warnings: null,
    errors: null,
  };

  if (payload.length < 5) {
    result.errors = ['Payload is too short'];
    return result;
  }

  let probe_id = 0;

  for (let index = 0; index < 4; index++) {
    probe_id |= ((payload[index] >>> 0) << (8 * index));
  }

  const product_number = payload[4] >>> 0;

  result.data.serial_number = formatString('%s%s', [product_number, pad('000000000', probe_id.toString(), true)]);

  return result;
}

function decodeSoilCalibrationPayload(payload) {
  const result = {
    type: DataType.SOIL_CALIBRATION,
    data: {},
    warnings: null,
    errors: null,
  };

  if (payload.length < 9) {
    result.errors = ['Payload is too short'];
    return result;
  }

  const is_single_depth = (payload[0] & 0x80) === 0;
  if (is_single_depth && (payload[0] & 0x7F) !== 1) {
    if (!result.errors) {
      result.errors = [];
    }
    result.errors.push('Invalid bit mask for single depth sensor');
  }
  else if (is_single_depth) {
    result.data.depth_cm = 0;  // to indicate is single depth
  }
  else {
    const depth_map = new DepthMap();
    let depth_counter = 0;
    for (let index = 0; index < depth_map.list().length; index++) {
      const item = depth_map.list()[index];
      if (payload[0] & item.bit_mask) {
        result.data.depth_cm = item.depth;
        depth_counter++;
      }
    }
    if (depth_counter > 1) {
      if (!result.errors) {
        result.errors = [];
      }
      result.data = null;
      result.errors.push('Multiple depth bit mask for soil calibration retrieval shall contain only one depth');
    }
  }
  if (!result.errors) {
    result.data.a = bytesToFloat16((payload[2] << 8) | payload[1]);
    result.data.b = bytesToFloat16((payload[4] << 8) | payload[3]);
    result.data.c = bytesToFloat16((payload[6] << 8) | payload[5]);
    result.data.sp = bytesToFloat16((payload[8] << 8) | payload[7]);
  }

  return result;
}

/**
*
* @param {int} fport Uplink fport
* @param {number[]} payload Payload to be decoded
* @returns Decoded payload
*/
function decodePayload(fport, payload) {
  const result = { data: {}, topic: "default" };

  if (!payload) {
    result.errors = ['Payload is empty'];
    // Skip historical measurements // || fport === FPort.HISTORICAL_MEASUREMENT
  } else if (fport === FPort.CURRENT_MEASUREMENT) {
    const decoded = decodeMeasurementPayload(payload).data;

    let volNumber = 0;
    let tempNumber = 0;
    decoded.readings.forEach(dataPoint => {
      if (dataPoint.type === "volumetric_moisture" && dataPoint.error_flag === false) {
        if (volNumber === 0) {
          result.data.moisture = dataPoint.value;
        } else {
          result.data[`moisture${volNumber}`] = dataPoint.value;
        }
        volNumber++;
      }

      if (dataPoint.type === "temperature" && dataPoint.error_flag === false) {
        if (tempNumber === 0) {
          result.data.temperature = dataPoint.value;
        } else {
          result.data[`moisture${tempNumber}`] = dataPoint.value;
        }
        tempNumber++;
      }
    });

    result.topic = "default";
  } else if (fport === FPort.KPI1_REPORT) {
    const decoded = decodeKPI1Payload(payload).data;
    result.data.batteryVoltage = decoded.battery_voltage.value;
    result.data.estimatedSignalPower = decoded.estimated_signal_power;
    result.data.saturationPointOvershotDepth = decoded.saturation_point_overshot_depth;
    result.data.firmwareVersion = decoded.firmware_version;
    result.data.reset = decoded.reset.context;
    result.data.uptime = decoded.uptime.value;

    result.topic = "lifecycle";
  } else if (fport === FPort.KPI2_REPORT) {
    const decoded = decodeKPI2Payload(payload);
    result.data.historyEnabled = decoded.history_enabled;
    result.data.probeMode = decoded.probe_mode;
    result.data.watchdogEnabled = decoded.watchdog_enabled;
    result.data.linkCheckMode = decoded.link_check_mode;
    result.data.networkCheckCounterInterval = decoded.network_check_counter_interval;
    result.data.networkCheckCounterThreshold = decoded.network_check_counter_threshold;
    result.data.numberRetransmissions = decoded.number_retransmissions;
    result.data.sleepInterval = decoded.sleep_interval.value;

    result.topic = "system";
  } else if (fport === FPort.KPI3_REPORT) {
    const decoded = decodeKPI3Payload(payload);
    result.data.channelMask = decoded.channel_mask;

    result.topic = "channel";
  } else if (fport === FPort.KPI4_REPORT) {
    const decoded = decodeKPI4Payload(payload);
    result.data.totalNumberResets = decoded.total_number_resets;
    result.data.totalNumberSuccessfulJoinSessions = decoded.total_number_successful_join_sessions;
    result.data.totalNumberFailedJoinSessions = decoded.total_number_failed_join_sessions;
    result.data.totalTimeOnAir = decoded.total_time_on_air;

    result.topic = "reset";
  } else if (fport === FPort.KPI5_REPORT) {
    const decoded = decodeKPI5Payload(payload);
    result.data.totalNumberUplinks = decoded.total_number_uplinks;
    result.data.totalNumberUplinksSF12 = decoded.total_number_uplinks_sf12;
    result.data.totalNumberUplinksSF11 = decoded.total_number_uplinks_sf11;
    result.data.totalNumberUplinksSF10 = decoded.total_number_uplinks_sf10;

    result.topic = "uplink";
  } else if (fport === FPort.KPI6_REPORT) {
    const decoded = decodeKPI6Payload(payload);
    result.data.serialNumber = decoded.serial_number;
    result.topic = "serial";
  } else if (FPort.KPI7_REPORT <= fport && fport <= FPort.KPI12_REPORT) {
    const decoded = decodeSoilCalibrationPayload(payload);
    result.data.depthCM = decoded.depth_cm;
    result.data.channelA = decoded.a;
    result.data.channelB = decoded.b;
    result.data.channelC = decoded.c;
    result.data.channelSP = decoded.sp;

    result.topic = "calibration";
  }

  return result;
}


function consume(event) {
  const payload = event.data.payloadHex;
  const bytes = Hex.hexToBytes(payload);
  const { port } = event.data;
  const data = {};
  const topic = "default";


  const result = decodePayload(port, bytes);
  if (Object.keys(result.data).length > 0) {
    emit("sample", { data: result.data, topic: result.topic });
  }
}
