function readUInt8(bytes) {
  return bytes & 0xff;
}

function readInt8(bytes) {
  const ref = readUInt8(bytes);
  return ref > 0x7f ? ref - 0x100 : ref;
}

function readUInt16LE(bytes) {
  const value = (bytes[1] << 8) + bytes[0];
  return value & 0xffff;
}

function readInt16LE(bytes) {
  const ref = readUInt16LE(bytes);
  return ref > 0x7fff ? ref - 0x10000 : ref;
}

function readUInt32LE(bytes) {
  const value = (bytes[3] << 24) + (bytes[2] << 16) + (bytes[1] << 8) + bytes[0];
  return (value & 0xffffffff) >>> 0;
}

function readProtocolVersion(bytes) {
  const major = (bytes & 0xf0) >> 4;
  const minor = bytes & 0x0f;
  return `v${major}.${minor}`;
}

function readHardwareVersion(bytes) {
  const major = bytes[0] & 0xff;
  const minor = (bytes[1] & 0xff) >> 4;
  return `v${major}.${minor}`;
}

function readFirmwareVersion(bytes) {
  const major = bytes[0] & 0xff;
  const minor = bytes[1] & 0xff;
  return `v${major}.${minor}`;
}

function readSerialNumber(bytes) {
  const temp = [];
  for (let idx = 0; idx < bytes.length; idx++) {
    temp.push((`0${(bytes[idx] & 0xff).toString(16)}`).slice(-2));
  }
  return temp.join("");
}

function readD2DCommand(bytes) {
  return (`0${(bytes[1] & 0xff).toString(16)}`).slice(-2) + (`0${(bytes[0] & 0xff).toString(16)}`).slice(-2);
}


function readTemperatureAlarm(type) {
  // 1: emergency heating timeout alarm, 2: auxiliary heating timeout alarm, 3: persistent low temperature alarm, 4: persistent low temperature alarm release,
  // 5: persistent high temperature alarm, 6: persistent high temperature alarm release, 7: freeze protection alarm, 8: freeze protection alarm release,
  // 9: threshold alarm, 10: threshold alarm release
  switch (type) {
    case 0x01:
      return "EMERGENCY_HEATING_TIMEOUT_ALARM";
    case 0x02:
      return "AUXILIARY_HEATING_TIMEOUT_ALARM";
    case 0x03:
      return "PERSISTENT_LOW_TEMPERATURE_ALARM";
    case 0x04:
      return "PERSISTENT_LOW_TEMPERATURE_ALARM_RELEASE";
    case 0x05:
      return "PERSISTENT_HIGH_TEMPERATURE_ALARM";
    case 0x06:
      return "PERSISTENT_HIGH_TEMPERATURE_ALARM_RELEASE";
    case 0x07:
      return "FREEZE_PROTECTION_ALARM";
    case 0x08:
      return "FREEZE_PROTECTION_ALARM_RELEASE";
    case 0x09:
      return "THRESHOLD_ALARM";
    case 0x0a:
      return "THRESHOLD_ALARM_RELEASE";
    default:
      return "UKNOWN";
  }
}

function readException(type) {
  switch (type) {
    case 0x01:
      return "READ_FAILED";
    case 0x02:
      return "OUT_OF_RANGE";
    default:
      return "UKNOWN";
  }
}

function readPlanEvent(type) {
  // 0: not executed, 1: wake, 2: away, 3: home, 4: sleep
  switch (type) {
    case 0x00:
      return "NOT_EXCECUTED";
    case 0x01:
      return "WAKE";
    case 0x02:
      return "AWAY";
    case 0x03:
      return "HOME";
    case 0x04:
      return "SLEEP";
    default:
      return "UKNOWN";
  }
}

function readPlanType(type) {
  // 0: wake, 1: away, 2: home, 3: sleep
  switch (type) {
    case 0x00:
      return "WAKE";
    case 0x01:
      return "AWAY";
    case 0x02:
      return "HOME";
    case 0x03:
      return "SLEEP";
    default:
      return "UKNOWN";
  }
}

function readFanMode(type) {
  // 0: auto, 1: on, 2: circulate, 3: disable
  switch (type) {
    case 0x00:
      return "AUTO";
    case 0x01:
      return "ON";
    case 0x02:
      return "CIRCULATE";
    case 0x03:
      return "DISABLE";
    default:
      return "UKNOWN";
  }
}

function readFanStatus(type) {
  // 0: standby, 1: high speed, 2: low speed, 3: on
  switch (type) {
    case 0x00:
      return "STANDBY";
    case 0x01:
      return "HIGH_SPEED";
    case 0x02:
      return "LOW_SPEED";
    case 0x03:
      return "ON";
    default:
      return "UKNOWN";
  }
}

function readSystemStatus(type) {
  // 0: off, 1: on
  switch (type) {
    case 0x00:
      return "OFF";
    case 0x01:
      return "ON";
    default:
      return "UKNOWN";
  }
}

function readTemperatureCtlMode(type) {
  // 0: heat, 1: em heat, 2: cool, 3: auto
  switch (type) {
    case 0x00:
      return "HEAT";
    case 0x01:
      return "EM_HEAT";
    case 0x02:
      return "COOL";
    case 0x03:
      return "AUTO";
    default:
      return "UKNOWN";
  }
}

function readTemperatureCtlStatus(type) {
  // 0: standby, 1: stage-1 heat, 2: stage-2 heat, 3: stage-3 heat, 4: stage-4 heat, 5: em heat, 6: stage-1 cool, 7: stage-2 cool
  switch (type) {
    case 0x00:
      return "STANDBY";
    case 0x01:
      return "STAGE_1_HEAT";
    case 0x02:
      return "STAGE_2_HEAT";
    case 0x03:
      return "STAGE_3_HEAT";
    case 0x04:
      return "STAGE_4_HEAT";
    case 0x05:
      return "EM_HEAT";
    case 0x06:
      return "STAGE_1_COOL";
    case 0x07:
      return "STAGE_2_COOL";
    default:
      return "UKNOWN";
  }
}

function readWires(wire1, wire2, wire3) {
  const wire = [];
  if ((wire1 >>> 0) & 0x03) {
    wire.push("Y1");
  }
  if ((wire1 >>> 2) & 0x03) {
    wire.push("GH");
  }
  if ((wire1 >>> 4) & 0x03) {
    wire.push("OB");
  }
  if ((wire1 >>> 6) & 0x03) {
    wire.push("W1");
  }
  if ((wire2 >>> 0) & 0x03) {
    wire.push("E");
  }
  if ((wire2 >>> 2) & 0x03) {
    wire.push("DI");
  }
  if ((wire2 >>> 4) & 0x03) {
    wire.push("PEK");
  }
  const w2AuxWire = (wire2 >>> 6) & 0x03;
  switch (w2AuxWire) {
    case 1:
      wire.push("W2");
      break;
    case 2:
      wire.push("AUX");
      break;
    default:
      break;
  }
  const y2GlWire = (wire3 >>> 0) & 0x03;
  switch (y2GlWire) {
    case 1:
      wire.push("Y2");
      break;
    case 2:
      wire.push("GL");
      break;
    default:
      break;
  }

  return wire;
}

function readWiresRelay(status) {
  const relay = {};

  relay.y1Status = (status >>> 0) & 0x01;
  relay.y2GlStatus = (status >>> 1) & 0x01;
  relay.w1Status = (status >>> 2) & 0x01;
  relay.w2AuxStatus = (status >>> 3) & 0x01;
  relay.eStatus = (status >>> 4) & 0x01;
  relay.gStatus = (status >>> 5) & 0x01;
  relay.obStatus = (status >>> 6) & 0x01;

  return relay;
}

function readObMode(type) {
  // 0: cool, 1: heat
  switch (type) {
    case 0x00:
      return "COOL";
    case 0x01:
      return "HEAT";
    default:
      return "UNKNOWN";
  }
}

function readTemperatureCtlModeEnable(type) {
  // bit0: heat, bit1: em heat, bit2: cool, bit3: auto
  const enable = [];
  if ((type >>> 0) & 0x01) {
    enable.push("HEAT");
  }
  if ((type >>> 1) & 0x01) {
    enable.push("EM_HEAT");
  }
  if ((type >>> 2) & 0x01) {
    enable.push("COOL");
  }
  if ((type >>> 3) & 0x01) {
    enable.push("AUTO");
  }
  return enable;
}

function readTemperatureCtlStatusEnable(heatMode, coolMode) {
  // bit0: stage-1 heat, bit1: stage-2 heat, bit2: stage-3 heat, bit3: stage-4 heat, bit4: aux heat
  const enable = [];
  if ((heatMode >>> 0) & 0x01) {
    enable.push("STAGE_1_HEAT");
  }
  if ((heatMode >>> 1) & 0x01) {
    enable.push("STAGE_2_HEAT");
  }
  if ((heatMode >>> 2) & 0x01) {
    enable.push("STAGE_3_HEAT");
  }
  if ((heatMode >>> 3) & 0x01) {
    enable.push("STAGE_4_HEAT");
  }
  if ((heatMode >>> 4) & 0x01) {
    enable.push("AUX_HEAT");
  }

  // bit0: stage-1 cool, bit1: stage-2 cool
  if ((coolMode >>> 0) & 0x03) {
    enable.push("STAGE_1_COOL");
  }
  if ((coolMode >>> 1) & 0x03) {
    enable.push("STAGE_2_COOL");
  }
  return enable;
}

function readWeekRecycleSettings(type) {
  // bit1: "mon", bit2: "tues", bit3: "wed", bit4: "thur", bit5: "fri", bit6: "sat", bit7: "sun"
  const weekEnable = [];
  if ((type >>> 1) & 0x01) {
    weekEnable.push("MON");
  }
  if ((type >>> 2) & 0x01) {
    weekEnable.push("TUE");
  }
  if ((type >>> 3) & 0x01) {
    weekEnable.push("WED");
  }
  if ((type >>> 4) & 0x01) {
    weekEnable.push("THUR");
  }
  if ((type >>> 5) & 0x01) {
    weekEnable.push("FRI");
  }
  if ((type >>> 6) & 0x01) {
    weekEnable.push("SAT");
  }
  if ((type >>> 7) & 0x01) {
    weekEnable.push("SUN");
  }
  return weekEnable;
}

function handleDownlinkResponse(channelType, bytes, offset) {
  const decoded = {};

  switch (channelType) {
    case 0x02: // collection_interval
      decoded.collection_interval = readUInt16LE(bytes.slice(offset, offset + 2));
      offset += 2;
      break;
    case 0x03:
      decoded.outside_temperature = readInt16LE(bytes.slice(offset, offset + 2)) / 10;
      offset += 2;
      break;
    case 0x06: // temperature_threshold_config
      var ctl = readUInt8(bytes[offset]);
      var condition = ctl & 0x07;
      var alarm_type = (ctl >>> 3) & 0x07;

      var data = { condition, alarm_type };

      if (condition === 1 || condition === 3 || condition === 4) {
        data.min = readInt16LE(bytes.slice(offset + 1, offset + 3)) / 10;
      }
      if (condition === 2 || condition === 3 || condition === 4) {
        data.max = readInt16LE(bytes.slice(offset + 3, offset + 5)) / 10;
      }
      data.lock_time = readInt16LE(bytes.slice(offset + 5, offset + 7));
      data.continue_time = readInt16LE(bytes.slice(offset + 7, offset + 9));
      offset += 9;

      decoded.temperature_threshold_config = decoded.temperature_threshold_config || [];
      decoded.temperature_threshold_config.push(data);
      break;
    case 0x25:
      var masked = readUInt8(bytes[offset]);
      var status = readUInt8(bytes[offset + 1]);

      decoded.child_lock_config = decoded.child_lock_config || {};
      if ((masked >> 0) & 0x01) {
        decoded.child_lock_config.power_button = (status >> 0) & 0x01;
      }
      if ((masked >> 1) & 0x01) {
        decoded.child_lock_config.up_button = (status >> 1) & 0x01;
      }
      if ((masked >> 2) & 0x01) {
        decoded.child_lock_config.down_button = (status >> 2) & 0x01;
      }
      if ((masked >> 3) & 0x01) {
        decoded.child_lock_config.fan_button = (status >> 3) & 0x01;
      }
      if ((masked >> 4) & 0x01) {
        decoded.child_lock_config.mode_button = (status >> 4) & 0x01;
      }
      if ((masked >> 5) & 0x01) {
        decoded.child_lock_config.reset_button = (status >> 5) & 0x01;
      }

      offset += 2;
      break;
    case 0x82:
      decoded.multicast_group_config = {};
      var value = readUInt8(bytes[offset]);
      var mask = value >>> 4;
      var enabled = value & 0x0f;
      if (((mask >> 0) & 0x01) === 1) {
        decoded.multicast_group_config.group1_enable = enabled & 0x01;
      }
      if (((mask >> 1) & 0x01) === 1) {
        decoded.multicast_group_config.group2_enable = (enabled >> 1) & 0x01;
      }
      if (((mask >> 2) & 0x01) === 1) {
        decoded.multicast_group_config.group3_enable = (enabled >> 2) & 0x01;
      }
      if (((mask >> 3) & 0x01) === 1) {
        decoded.multicast_group_config.group4_enable = (enabled >> 3) & 0x01;
      }
      offset += 1;
      break;
    case 0x83:
      var config = {};
      config.id = readUInt8(bytes[offset]) + 1;
      config.enable = readUInt8(bytes[offset + 1]);
      if (config.enable === 1) {
        config.d2d_cmd = readD2DCommand(bytes.slice(offset + 2, offset + 4));
        config.action_type = (readUInt8(bytes[offset + 4]) >>> 4) & 0x0f;
        config.action = readUInt8(bytes[offset + 4]) & 0x0f;
      }
      offset += 5;

      decoded.d2d_slave_config = decoded.d2d_slave_config || [];
      decoded.d2d_slave_config.push(config);
      break;
    case 0x96:
      var config = {};
      config.mode = readUInt8(bytes[offset]);
      config.enable = readUInt8(bytes[offset + 1]);
      if (config.enable === 1) {
        config.uplink_enable = readUInt8(bytes[offset + 2]);
        config.d2d_cmd = readD2DCommand(bytes.slice(offset + 3, offset + 5));
        config.time_enable = readUInt8(bytes[offset + 7]);
        if (config.time_enable === 1) {
          config.time = readUInt16LE(bytes.slice(offset + 5, offset + 7));
        }
      }
      offset += 8;

      decoded.d2d_master_config = decoded.d2d_master_config || [];
      decoded.d2d_master_config.push(config);
      break;
    case 0x4a: // sync_time
      decoded.sync_time = 1;
      offset += 1;
      break;
    case 0x8e: // report_interval
      // ignore the first byte
      decoded.report_interval = readUInt16LE(bytes.slice(offset + 1, offset + 3));
      offset += 3;
      break;
    case 0xab:
      decoded.temperature_calibration = {};
      decoded.temperature_calibration.enable = readUInt8(bytes[offset]);
      if (decoded.temperature_calibration.enable === 1) {
        decoded.temperature_calibration.temperature = readInt16LE(bytes.slice(offset + 1, offset + 3)) / 10;
      }
      offset += 3;
      break;
    case 0xb0:
      decoded.freeze_protection_config = decoded.freeze_protection_config || {};
      decoded.freeze_protection_config.enable = readUInt8(bytes[offset]);
      if (decoded.freeze_protection_config.enable === 1) {
        decoded.freeze_protection_config.temperature = readInt16LE(bytes.slice(offset + 1, offset + 3)) / 10;
      }
      offset += 3;
      break;
    case 0xb5: // ob_mode
      decoded.ob_mode = readUInt8(bytes[offset]);
      offset += 1;
      break;
    case 0xb6:
      decoded.fan_mode = readUInt8(bytes[offset]);
      offset += 1;
      break;
    case 0xb7:
      decoded.temperature_control_mode = readUInt8(bytes[offset]);
      var t = readUInt8(bytes[offset + 1]);
      decoded.temperature_target = t & 0x7f;
      decoded.temperature_unit = (t >>> 7) & 0x01;
      offset += 2;
      break;
    case 0xb8: // temperature_tolerance
      decoded.temperature_tolerance = {};
      decoded.temperature_tolerance.temperature_error = readUInt8(bytes[offset]) / 10;
      decoded.temperature_tolerance.auto_control_temperature_error = readUInt8(bytes[offset + 1]) / 10;
      offset += 2;
      break;
    case 0xb9:
      decoded.temperature_level_up_condition = {};
      decoded.temperature_level_up_condition.type = readUInt8(bytes[offset]);
      decoded.temperature_level_up_condition.time = readUInt8(bytes[offset + 1]);
      decoded.temperature_level_up_condition.temperature_error = readInt16LE(bytes.slice(offset + 2, offset + 4)) / 10;
      offset += 4;
      break;
    case 0xba:
      decoded.dst_config = {};
      decoded.dst_config.enable = readUInt8(bytes[offset]);
      if (decoded.dst_config.enable === 1) {
        decoded.dst_config.offset = readUInt8(bytes[offset + 1]);
        decoded.dst_config.start_time = {};
        decoded.dst_config.start_time.month = readUInt8(bytes[offset + 2]);
        const start_day = readUInt8(bytes[offset + 3]);
        decoded.dst_config.start_time.week = (start_day >>> 4) & 0x0f;
        decoded.dst_config.start_time.weekday = start_day & 0x0f;
        const start_time = readUInt16LE(bytes.slice(offset + 4, offset + 6));
        decoded.dst_config.start_time.time = `${Math.floor(start_time / 60)}:${(`0${start_time % 60}`).slice(-2)}`;
        decoded.dst_config.end_time = {};
        decoded.dst_config.end_time.month = readUInt8(bytes[offset + 6]);
        const end_day = readUInt8(bytes[offset + 7]);
        decoded.dst_config.end_time.week = (end_day >>> 4) & 0x0f;
        decoded.dst_config.end_time.weekday = end_day & 0x0f;
        const end_time = readUInt16LE(bytes.slice(offset + 8, offset + 10));
        decoded.dst_config.end_time.time = `${Math.floor(end_time / 60)}:${(`0${end_time % 60}`).slice(-2)}`;
      }
      offset += 10;
      break;
    case 0xbd: // timezone
      decoded.timezone = readInt16LE(bytes.slice(offset, offset + 2)) / 60;
      offset += 2;
      break;
    case 0xc1:
      decoded.card_config = {};
      decoded.card_config.enable = readUInt8(bytes[offset]);
      if (decoded.card_config.enable === 1) {
        decoded.card_config.action_type = readUInt8(bytes[offset + 1]);
        if (decoded.card_config.action_type === 1) {
          const action = readUInt8(bytes[offset + 2]);
          decoded.card_config.in_plan_type = (action >>> 4) & 0x0f;
          decoded.card_config.out_plan_type = action & 0x0f;
        }
        decoded.card_config.invert = readUInt8(bytes[offset + 3]);
      }
      offset += 4;
      break;
    case 0xc2:
      decoded.plan_mode = readUInt8(bytes[offset]);
      offset += 1;
      break;
    case 0xc4:
      decoded.outside_temperature_control_config = decoded.outside_temperature_control_config || {};
      decoded.outside_temperature_control_config.enable = readUInt8(bytes[offset]);
      if (decoded.outside_temperature_control_config.enable === 1) {
        decoded.outside_temperature_control_config.timeout = readUInt8(bytes[offset + 1]);
      }
      offset += 2;
      break;
    case 0xc5:
      decoded.temperature_control_enable = readUInt8(bytes[offset]);
      offset += 1;
      break;
    case 0xc7:
      var data = readUInt8(bytes[offset]);
      offset += 1;

      var mask = data >>> 4;
      var status = data & 0x0f;

      if ((mask >> 0) & 0x01) {
        decoded.d2d_master_enable = status & 0x01;
      }
      if ((mask >> 1) & 0x01) {
        decoded.d2d_slave_enable = (status >> 1) & 0x01;
      }
      break;
    case 0xc8:
      decoded.plan_config = decoded.plan_config || {};
      decoded.plan_config.type = readUInt8(bytes[offset]);
      decoded.plan_config.temperature_control_mode = readUInt8(bytes[offset + 1]);
      decoded.plan_config.fan_mode = readUInt8(bytes[offset + 2]);
      var t = readInt8(bytes[offset + 3]);
      decoded.plan_config.temperature_target = t & 0x7f;
      decoded.temperature_unit = (t >>> 7) & 0x01;
      decoded.plan_config.temperature_error = readInt8(bytes[offset + 4]) / 10;
      offset += 5;
      break;
    case 0xc9:
      var schedule = {};
      schedule.type = bytes[offset];
      schedule.id = bytes[offset + 1] + 1;
      schedule.enable = bytes[offset + 2];
      schedule.week_recycle = readWeekRecycleSettings(bytes[offset + 3]);
      var time_mins = readUInt16LE(bytes.slice(offset + 4, offset + 6));
      schedule.time = `${Math.floor(time_mins / 60)}:${(`0${time_mins % 60}`).slice(-2)}`;
      offset += 6;

      decoded.plan_schedule = decoded.plan_schedule || [];
      decoded.plan_schedule.push(schedule);
      break;
    case 0xca:
      decoded.wires = readWires(bytes[offset], bytes[offset + 1], bytes[offset + 2]);
      decoded.ob_mode = (bytes[offset + 2] >>> 2) & 0x03;
      offset += 3;
      break;
    case 0xf6:
      decoded.control_permissions = readUInt8(bytes[offset]);
      offset += 1;
      break;
    case 0xf7:
      var wire_relay_bit_offset = { y1: 0, y2_gl: 1, w1: 2, w2_aux: 3, e: 4, g: 5, ob: 6 };
      var mask = readUInt16LE(bytes.slice(offset, offset + 2));
      var status = readUInt16LE(bytes.slice(offset + 2, offset + 4));
      offset += 4;

      decoded.wires_relay_config = {};
      for (const key in wire_relay_bit_offset) {
        if ((mask >>> wire_relay_bit_offset[key]) & 0x01) {
          decoded.wires_relay_config[key] = (status >>> wire_relay_bit_offset[key]) & 0x01;
        }
      }
      break;
    case 0xf8: // offline_control_mode
      decoded.offline_control_mode = readUInt8(bytes[offset]);
      break;
    case 0xf9: // humidity_calibration
      decoded.humidity_calibration = {};
      decoded.humidity_calibration.enable = readUInt8(bytes[offset]);
      if (decoded.humidity_calibration.enable === 1) {
        decoded.humidity_calibration.humidity = readInt16LE(bytes.slice(offset + 1, offset + 3)) / 10;
      }
      offset += 3;
      break;
    case 0xfa:
      decoded.temperature_control_mode = readUInt8(bytes[offset]);
      decoded.temperature_target = readInt16LE(bytes.slice(offset + 1, offset + 3)) / 10;
      offset += 3;
      break;
    case 0xfb:
      decoded.temperature_control_mode = readUInt8(bytes[offset]);
      offset += 1;
      break;
    default:
      throw new Error("unknown downlink response");
  }

  return { data: decoded, offset };
}

function handleDownlinkResponseExt(channelType, bytes, offset) {
  const decoded = {};

  switch (channelType) {
    case 0x05:
      const fanDelayControlResult = readUInt8(bytes[offset + 2]);
      if (fanDelayControlResult === 0) {
        decoded.fan_delay_enable = readUInt8(bytes[offset]);
        decoded.fan_delay_time = readUInt8(bytes[offset + 1]);
      } else {
        throw new Error("FAN_DELAY_CONTOL_FAILED");
      }
      offset += 3;
      break;
    case 0x06:
      const fanExecuteResult = readUInt8(bytes[offset + 1]);
      if (fanExecuteResult === 0) {
        decoded.fan_execute_time = readUInt8(bytes[offset]);
      } else {
        throw new Error("FAN_EXCECUTION_CONTOL_FAILED");
      }

      offset += 2;
      break;
    case 0x07:
      const dehumidifyControlResult = readUInt8(bytes[offset + 2]);
      if (dehumidifyControlResult === 0) {
        decoded.fanDehumidify = {};
        decoded.fanDehumidify.enable = readUInt8(bytes[offset]);
        if (decoded.fanDehumidify.enable === 1) {
          decoded.fanDehumidify.execute_time = readUInt8(bytes[offset + 1]);
        }
      }
      offset += 3;
      break;
    case 0x09:
      const humidityRangeResult = readUInt8(bytes[offset + 2]);
      if (humidityRangeResult === 0) {
        decoded.humidityRange = {};
        decoded.humidityRange.min = readUInt8(bytes[offset]);
        decoded.humidityRange.max = readUInt8(bytes[offset + 1]);
      } else {
        throw new Error("HUMIDITY_RANGE_CONTROL_FAILED");
      }
      offset += 3;
      break;
    case 0x0a:
      const dehumidifyResult = readUInt8(bytes[offset + 2]);
      if (dehumidifyResult === 0) {
        decoded.temperatureDehumidify = {};
        decoded.temperatureDehumidify.enable = readUInt8(bytes[offset]);
        if (decoded.temperatureDehumidify.enable === 1) {
          const value = readUInt8(bytes[offset + 1]);
          if (value !== 0xff) {
            decoded.temperatureDehumidify.temperatureTolerance = readUInt8(bytes[offset + 1]) / 10;
          }
        }
      } else {
        throw new Error("dehumidify control failed");
      }
      offset += 3;
      break;
    default:
      throw new Error("unknown downlink response");
  }

  return { data: decoded, offset };
}

function isEmpty(obj) {
  if (obj === undefined) {
    return true;
  }
  return Object.keys(obj).length === 0;
}

function consume(event) {
  const payload = event.data.payloadHex;
  const bytes = Hex.hexToBytes(payload);

  const decoded = {};
  const system = {};
  let wires = {};
  const alert = {};

  for (let i = 0; i < bytes.length;) {
    const channelId = bytes[i++];
    const channelType = bytes[i++];

    // IPSO VERSION
    if (channelId === 0xff && channelType === 0x01) {
      system.ipsoVersion = readProtocolVersion(bytes[i]);
      i += 1;
    }
    // HARDWARE VERSION
    else if (channelId === 0xff && channelType === 0x09) {
      system.hardwareVersion = readHardwareVersion(bytes.slice(i, i + 2));
      i += 2;
    }
    // FIRMWARE VERSION
    else if (channelId === 0xff && channelType === 0x0a) {
      system.firmwareVersion = readFirmwareVersion(bytes.slice(i, i + 2));
      i += 2;
    }
    // DEVICE STATUS
    else if (channelId === 0xff && channelType === 0x0b) {
      system.deviceStatus = 1;
      i += 1;
    }
    // LORAWAN CLASS TYPE
    else if (channelId === 0xff && channelType === 0x0f) {
      i += 1;
    }
    // PRODUCT SERIAL NUMBER
    else if (channelId === 0xff && channelType === 0x16) {
      system.serialNumber = readSerialNumber(bytes.slice(i, i + 8));
      i += 8;
    }
    // TSL VERSION
    else if (channelId === 0xff && channelType === 0xff) {
      system.tslVersion = readFirmwareVersion(bytes.slice(i, i + 2));
      i += 2;
    }
    // TEMPERATURE
    else if (channelId === 0x03 && channelType === 0x67) {
      decoded.temperature = readInt16LE(bytes.slice(i, i + 2)) / 10;
      i += 2;
    }
    // TEMPERATURE TARGET
    else if (channelId === 0x04 && channelType === 0x67) {
      decoded.temperatureTarget = readInt16LE(bytes.slice(i, i + 2)) / 10;
      i += 2;
    }
    // TEMPERATURE CONTROL
    else if (channelId === 0x05 && channelType === 0xe7) {
      const temperatureControl = bytes[i];
      decoded.temperatureControlMode = readTemperatureCtlMode(temperatureControl & 0x03);
      decoded.temperatureControlStatus = readTemperatureCtlStatus((temperatureControl >>> 4) & 0x0f);
      i += 1;
    }
    // FAN CONTROL
    else if (channelId === 0x06 && channelType === 0xe8) {
      const value = bytes[i];
      decoded.fanMode = readFanMode(value & 0x03);
      decoded.fanStatus = readFanStatus((value >>> 2) & 0x03);
      i += 1;
    }
    // PLAN EVENT
    else if (channelId === 0x07 && channelType === 0xbc) {
      const value = bytes[i];
      decoded.planEvent = readPlanEvent(value & 0x0f);
      i += 1;
    }
    // SYSTEM STATUS
    else if (channelId === 0x08 && channelType === 0x8e) {
      system.systemStatus = readSystemStatus(bytes[i]);
      i += 1;
    }
    // HUMIDITY
    else if (channelId === 0x09 && channelType === 0x68) {
      decoded.humidity = readUInt8(bytes[i]) / 2;
      i += 1;
    }
    // RELAY STATUS
    else if (channelId === 0x0a && channelType === 0x6e) {
      wires = readWiresRelay(bytes[i]);
      i += 1;
    }
    // PLAN
    else if (channelId === 0xff && channelType === 0xc9) {
      const plan = {};
      plan.type = readPlanType(bytes[i]);
      plan.index = bytes[i + 1] + 1;
      plan.planEnabled = ["DISABLED", "ENABLED"][bytes[i + 2]];
      plan.weekRecycle = readWeekRecycleSettings(bytes[i + 3]);
      const timeMins = readUInt16LE(bytes.slice(i + 4, i + 6));
      plan.time = `${Math.floor(timeMins / 60)}:${(`0${timeMins % 60}`).slice(-2)}`;
      i += 6;

      emit("sample", { data: plan, topic: "plan" });
    }
    // PLAN SETTINGS
    else if (channelId === 0xff && channelType === 0xc8) {
      const planSetting = {};
      planSetting.type = readPlanType(bytes[i]);
      planSetting.temperatureCtlMode = readTemperatureCtlMode(bytes[i + 1]);
      planSetting.fanMode = readFanMode(bytes[i + 2]);
      planSetting.targetTemperature = readUInt8(bytes[i + 3] & 0x7f);
      // planSetting.temperatureUnit = readTemperatureUnit(bytes[i + 3] >>> 7);
      planSetting.temperatureError = readUInt8(bytes[i + 4]) / 10;
      i += 5;

      emit("sample", { data: planSetting, topic: "plan_setting" });
    }
    // WIRES
    else if (channelId === 0xff && channelType === 0xca) {
      wires.wires = readWires(bytes[i], bytes[i + 1], bytes[i + 2]);
      wires.obMode = readObMode((bytes[i + 2] >>> 2) & 0x03);
      i += 3;
    }
    // TEMPERATURE MODE SUPPORT
    else if (channelId === 0xff && channelType === 0xcb) {
      system.temperatureControlModeEnabled = readTemperatureCtlModeEnable(bytes[i]);
      system.temperatureControlStatusEnabled = readTemperatureCtlStatusEnable(bytes[i + 1], bytes[i + 2]);
      i += 3;
    }
    // CONTROL PERMISSIONS
    else if (channelId === 0xff && channelType === 0xf6) {
      system.controlPermissions = bytes[i] === 1 ? "REMOTE_CONTROL" : "THERMOSTAT";
      i += 1;
    }
    // TEMPERATURE ALARM
    else if (channelId === 0x83 && channelType === 0x67) {
      decoded.temperature = readInt16LE(bytes.slice(i, i + 2)) / 10;
      alert.temperatureAlarm = readTemperatureAlarm(bytes[i + 2]);
      i += 2;
    }
    // TEMPERATURE EXCEPTION
    else if (channelId === 0xb3 && channelType === 0x67) {
      decoded.temperatureException = readException(bytes[i]);
      i += 1;
    }
    // HUMIDITY EXCEPTION
    else if (channelId === 0xb9 && channelType === 0x68) {
      decoded.humidityException = readException(bytes[i]);
      i += 1;
    }
    // HISTORICAL DATA
    else if (channelId === 0x20 && channelType === 0xce) {
      const data = {};
      const timestamp = new Date(readUInt32LE(bytes.slice(i, i + 4)) * 1000);
      const value1 = readUInt16LE(bytes.slice(i + 4, i + 6));
      const value2 = readUInt16LE(bytes.slice(i + 6, i + 8));

      data.fanMode = readFanMode(value1 & 0x03);
      data.fanStatus = readFanStatus((value1 >>> 2) & 0x03);
      data.systemStatus = readSystemStatus((value1 >>> 4) & 0x01);
      const temperature = ((value1 >>> 5) & 0x7ff) / 10 - 100;
      data.temperature = Number(temperature.toFixed(1));

      data.temperatureCtlMode = readTemperatureCtlMode(value2 & 0x03);
      data.temperatureCtlStatus = readTemperatureCtlStatus((value2 >>> 2) & 0x07);
      const temperatureTarget = ((value2 >>> 5) & 0x7ff) / 10 - 100;
      data.temperatureTarget = Number(temperatureTarget.toFixed(1));
      i += 8;

      emit("sample", { data, topic: "default", timestamp });
    }
    // DOWNLINK RESPONSE
    else if (channelId === 0xfe) {
      const downlinkResponse = handleDownlinkResponse(channelType, bytes, i);
      emit("sample", { data: downlinkResponse.data, topic: "downlink_response" });
      i = downlinkResponse.offset;
    } else if (channelId === 0xf8) {
      const downlinkResponse = handleDownlinkResponseExt(channelType, bytes, i);
      emit("sample", { data: downlinkResponse.data, topic: "downlink_response" });
      i = downlinkResponse.offset;
    } else {
      break;
    }
  }

  if (!isEmpty(decoded)) {
    emit("sample", { data: decoded, topic: "default" });
  }

  if (!isEmpty(alert)) {
    emit("sample", { data: alert, topic: "alert" });
  }

  if (!isEmpty(system)) {
    emit("sample", { data: system, topic: "system" });
  }

  if (!isEmpty(wires)) {
    emit("sample", { data: wires, topic: "wires" });
  }
}

