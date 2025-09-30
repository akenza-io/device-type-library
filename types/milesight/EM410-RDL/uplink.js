function cToF(celsius) {
  return Math.round(((celsius * 9) / 5 + 32) * 10) / 10;
}

function readUInt8(bytes) {
  return bytes & 0xff;
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
  const value =
    (bytes[3] << 24) + (bytes[2] << 16) + (bytes[1] << 8) + bytes[0];
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

function readTslVersion(bytes) {
  const major = bytes[0] & 0xff;
  const minor = bytes[1] & 0xff;
  return `v${major}.${minor}`;
}

function readSerialNumber(bytes) {
  const temp = [];
  for (let idx = 0; idx < bytes.length; idx++) {
    temp.push(`0${(bytes[idx] & 0xff).toString(16)}`.slice(-2));
  }
  return temp.join("");
}

function readPositionStatus(status) {
  switch (status) {
    case 0:
      return "NORMAL";
    case 1:
      return "TILT";
    default:
      return "UNKNOWN";
  }
}

function readDistanceAlarm(status) {
  switch (status) {
    case 0:
      return "THRESHOLD_ALARM_RELEASE";
    case 1:
      return "THRESHOLD_ALARM";
    case 2:
      return "MUTATION_ALARM";
    default:
      return "UNKNOWN";
  }
}

function readDistanceException(status) {
  switch (status) {
    case 0:
      return "BLIND_SPOT_ALARM_RELEASE";
    case 1:
      return "BLIND_SPOT_ALARM";
    case 2:
      return "NO_TARGET";
    case 3:
      return "SENSOR_EXCEPTION";
    default:
      return "UNKNOWN";
  }
}

function readHistoryEvent(status) {
  const event = [];

  if (((status >>> 0) & 0x01) === 0x01) {
    event.push("THRESHOLD_ALARM");
  }
  if (((status >>> 1) & 0x01) === 0x01) {
    event.push("THRESHOLD_ALARM_RELEASE");
  }
  if (((status >>> 2) & 0x01) === 0x01) {
    event.push("BLIND_SPOT_ALARM");
  }
  if (((status >>> 3) & 0x01) === 0x01) {
    event.push("BLIND_SPOT_ALARM_RELEASE");
  }
  if (((status >>> 4) & 0x01) === 0x01) {
    event.push("MUTATION_ALARM");
  }
  if (((status >>> 5) & 0x01) === 0x01) {
    event.push("TILT_ALARM");
  }

  return event;
}

// 0xFE
function handleDownlinkResponse(channelType, bytes, offset) {
  const decoded = {};

  switch (channelType) {
    case 0x06: {
      // distance_alarm
      const data = readUInt8(bytes[offset]);
      const min = readInt16LE(bytes.slice(offset + 1, offset + 3));
      const max = readInt16LE(bytes.slice(offset + 3, offset + 5));
      // skip 4 bytes (reserved)
      offset += 9;

      const alarmType = data & 0x07;
      const id = (data >>> 3) & 0x07;
      const alarmReleaseReportEnable = data >>> 7;

      if (alarmType === 5 && id === 2) {
        decoded.distanceMutationAlarm = {};
        decoded.distanceMutationAlarm.alarmReleaseReportEnable =
          alarmReleaseReportEnable;
        decoded.distanceMutationAlarm.mutation = max;
      } else {
        decoded.distanceAlarm = {};
        decoded.distanceAlarm.condition = alarmType;
        decoded.distanceAlarm.alarmReleaseReportEnable =
          alarmReleaseReportEnable;
        decoded.distanceAlarm.min = min;
        decoded.distanceAlarm.max = max;
      }
      break;
    }
    case 0x1b: // distance_range
      decoded.distanceRange = {};
      decoded.distanceRange.mode = readUInt8(bytes[offset]);
      // skip 2 bytes (reserved)
      decoded.distanceRange.max = readUInt16LE(
        bytes.slice(offset + 3, offset + 5),
      );
      offset += 5;
      break;
    case 0x1c:
      decoded.recollectionCounts = readUInt8(bytes[offset]);
      decoded.recollectionInterval = readUInt8(bytes[offset + 1]);
      offset += 2;
      break;
    case 0x2a: {
      // radar calibration
      const calibrateType = readUInt8(bytes[offset]);
      offset += 1;

      switch (calibrateType) {
        case 0:
          decoded.radarCalibration = 1;
          break;
        case 1:
          decoded.radarBlindCalibration = 1;
          break;
      }
      break;
    }
    case 0x3e: // tilt_distance_link
      decoded.tiltDistanceLink = readUInt8(bytes[offset]);
      offset += 1;
      break;
    case 0x4a: // sync_time
      decoded.syncTime = 1;
      offset += 1;
      break;
    case 0x68: // history_enable
      decoded.historyEnable = readUInt8(bytes[offset]);
      offset += 1;
      break;
    case 0x69: // retransmit_enable
      decoded.retransmitEnable = readUInt8(bytes[offset]);
      offset += 1;
      break;
    case 0x6a: {
      const intervalType = readUInt8(bytes[offset]);
      switch (intervalType) {
        case 0:
          decoded.retransmitInterval = readUInt16LE(
            bytes.slice(offset + 1, offset + 3),
          );
          break;
        case 1:
          decoded.resendInterval = readUInt16LE(
            bytes.slice(offset + 1, offset + 3),
          );
          break;
        default:
          break;
      }
      offset += 3;
      break;
    }
    case 0x8e: // report_interval
      // ignore the first byte
      decoded.reportInterval = readUInt16LE(
        bytes.slice(offset + 1, offset + 3),
      );
      offset += 3;
      break;
    case 0xab: // distance_calibration
      decoded.distanceCalibration = {};
      decoded.distanceCalibration.enable = readUInt8(bytes[offset]);
      decoded.distanceCalibration.distance = readInt16LE(
        bytes.slice(offset + 1, offset + 3),
      );
      offset += 3;
      break;
    case 0xbd: // timezone
      decoded.timezone = readInt16LE(bytes.slice(offset, offset + 2)) / 60;
      offset += 2;
      break;
    case 0xf2: // alarm_counts
      decoded.alarmCounts = readUInt16LE(bytes.slice(offset, offset + 2));
      offset += 2;
      break;
    default:
      throw new Error("UNKNOWN_DOWNLINK_RESPONSE");
  }

  return { data: decoded, offset };
}

// 0xF8
function handleDownlinkResponseExt(channelType, bytes, offset) {
  const decoded = {};

  switch (channelType) {
    case 0x12: {
      // distance_mode
      const distanceModeResult = readUInt8(bytes[offset + 1]);
      if (distanceModeResult === 0) {
        decoded.distanceMode = readUInt8(bytes[offset]);
      }
      offset += 2;
      break;
    }
    case 0x13: {
      // blind_detection_enable
      const blindDetectionEnableResult = readUInt8(bytes[offset + 1]);
      if (blindDetectionEnableResult === 0) {
        decoded.blindDetectionEnable = readUInt8(bytes[offset]);
      }
      offset += 2;
      break;
    }
    case 0x14: {
      // signal_quality
      const signalQualityResult = readUInt8(bytes[offset + 2]);
      if (signalQualityResult === 0) {
        decoded.signalQuality = readInt16LE(bytes.slice(offset, offset + 2));
      }
      offset += 3;
      break;
    }
    case 0x15: {
      // distance_threshold_sensitive
      const distanceThresholdSensitiveResult = readUInt8(bytes[offset + 2]);
      if (distanceThresholdSensitiveResult === 0) {
        decoded.distanceThresholdSensitive =
          readInt16LE(bytes.slice(offset, offset + 2)) / 10;
      }
      offset += 3;
      break;
    }
    case 0x16: {
      // peak_sorting
      const peakSortingResult = readUInt8(bytes[offset + 1]);
      if (peakSortingResult === 0) {
        decoded.peakSorting = readUInt8(bytes[offset]);
      }
      offset += 2;
      break;
    }
    case 0x0d: {
      // retransmit_config
      const retransmitConfigResult = readUInt8(bytes[offset + 3]);
      if (retransmitConfigResult === 0) {
        decoded.retransmitConfig = {};
        decoded.retransmitConfig.enable = readUInt8(bytes[offset]);
        decoded.retransmitConfig.retransmitInterval = readUInt16LE(
          bytes.slice(offset + 1, offset + 3),
        );
      }
      offset += 4;
      break;
    }
    case 0x39: {
      // collection_interval
      const collectionIntervalResult = readUInt8(bytes[offset + 2]);
      if (collectionIntervalResult === 0) {
        decoded.collectionInterval = readUInt16LE(
          bytes.slice(offset, offset + 2),
        );
      }
      offset += 3;
      break;
    }
    default:
      throw new Error("UNKNOWN_DOWNLINK_RESPONSE");
  }

  return { data: decoded, offset };
}

if (!Object.assign) {
  Object.defineProperty(Object, "assign", {
    enumerable: false,
    configurable: true,
    writable: true,
    value(target) {
      if (target == null) {
        // TypeError if undefined or null
        throw new TypeError("CANNOT_CONVERT_FIRST_ARGUMENT_TO_OBJECT");
      }

      const to = Object(target);
      for (let i = 1; i < arguments.length; i++) {
        let nextSource = arguments[i];
        if (nextSource == null) {
          // Skip over if undefined or null
          continue;
        }
        nextSource = Object(nextSource);

        const keysArray = Object.keys(Object(nextSource));
        for (
          let nextIndex = 0, len = keysArray.length;
          nextIndex < len;
          nextIndex++
        ) {
          const nextKey = keysArray[nextIndex];
          const desc = Object.getOwnPropertyDescriptor(nextSource, nextKey);
          if (desc !== undefined && desc.enumerable) {
            to[nextKey] = nextSource[nextKey];
          }
        }
      }
      return to;
    },
  });
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
  const lifecycle = {};
  const system = {};
  const alert = {};

  for (let i = 0; i < bytes.length; ) {
    const channelId = bytes[i++];
    const channelType = bytes[i++];

    // DEVICE STATUS
    if (channelId === 0xff && channelType === 0x0b) {
      system.deviceStatus = bytes[i];
      i += 1;
    }
    // IPSO VERSION
    else if (channelId === 0xff && channelType === 0x01) {
      system.ipsoVersion = readProtocolVersion(bytes[i]);
      i += 1;
    }
    // SERIAL NUMBER
    else if (channelId === 0xff && channelType === 0x16) {
      system.serialNumber = readSerialNumber(bytes.slice(i, i + 8));
      i += 8;
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
    // LORAWAN CLASS TYPE
    else if (channelId === 0xff && channelType === 0x0f) {
      i += 1;
    }
    // TSL VERSION
    else if (channelId === 0xff && channelType === 0xff) {
      system.tslVersion = readTslVersion(bytes.slice(i, i + 2));
      i += 2;
    }
    // DEVICE RESET EVENT
    else if (channelId === 0xff && channelType === 0xfe) {
      lifecycle.resetEvent = true;
      i += 1;
    }
    // BATTERY
    else if (channelId === 0x01 && channelType === 0x75) {
      lifecycle.batteryLevel = readUInt8(bytes[i]);
      i += 1;
    }
    // TEMPERATURE
    else if (channelId === 0x03 && channelType === 0x67) {
      decoded.temperature = readInt16LE(bytes.slice(i, i + 2)) / 10;
      decoded.temperatureF = cToF(decoded.temperature);
      i += 2;
    }
    // DISTANCE
    else if (channelId === 0x04 && channelType === 0x82) {
      decoded.distance = readInt16LE(bytes.slice(i, i + 2));
      i += 2;
    }
    // POSITION
    else if (channelId === 0x05 && channelType === 0x00) {
      decoded.position = readPositionStatus(bytes[i]);
      i += 1;
    }
    // RADAR SIGNAL STRENGTH
    else if (channelId === 0x06 && channelType === 0xc7) {
      decoded.radarSignalRssi = readInt16LE(bytes.slice(i, i + 2)) / 100;
      i += 2;
    }
    // DISTANCE ALARM
    else if (channelId === 0x84 && channelType === 0x82) {
      decoded.distance = readInt16LE(bytes.slice(i, i + 2));
      alert.distanceAlarm = readDistanceAlarm(bytes[i + 2]);
      i += 3;
    }
    // DISTANCE MUTATION ALARM
    else if (channelId === 0x94 && channelType === 0x82) {
      decoded.distance = readInt16LE(bytes.slice(i, i + 2));
      decoded.distanceMutation = readInt16LE(bytes.slice(i + 2, i + 4));
      alert.distanceAlarm = readDistanceAlarm(bytes[i + 4]);
      i += 5;
    }
    // DISTANCE EXCEPTION ALARM
    else if (channelId === 0xb4 && channelType === 0x82) {
      const distanceRawData = readUInt16LE(bytes.slice(i, i + 2));
      const distanceValue = readInt16LE(bytes.slice(i, i + 2));
      const distanceException = readDistanceException(bytes[i + 2]);
      i += 3;

      if (distanceRawData === 0xfffd || distanceRawData === 0xffff) {
        // IGNORE NO TARGET AND SENSOR EXCEPTION
      } else {
        decoded.distance = distanceValue;
      }
      alert.distanceException = distanceException;
    }
    // HISTORY
    else if (channelId === 0x20 && channelType === 0xce) {
      const timestamp = new Date(readUInt32LE(bytes.slice(i, i + 4)) * 1000);
      const distanceRawData = readUInt16LE(bytes.slice(i + 4, i + 6));
      const distanceValue = readInt16LE(bytes.slice(i + 4, i + 6));
      const temperatureRawData = readUInt16LE(bytes.slice(i + 6, i + 8));
      const temperatureValue = readInt16LE(bytes.slice(i + 6, i + 8)) / 10;
      const mutation = readInt16LE(bytes.slice(i + 8, i + 10));
      const eventValue = readUInt8(bytes[i + 10]);
      i += 11;

      const historicData = {};
      const historicAlert = {};
      if (distanceRawData === 0xfffd) {
        historicAlert.distanceException = "NO_TARGET";
      } else if (distanceRawData === 0xffff) {
        historicAlert.distanceException = "SENSOR_EXCEPTION";
      } else if (distanceRawData === 0xfffe) {
        historicAlert.distanceException = "DISABLED";
      } else {
        historicData.distance = distanceValue;
      }

      if (temperatureRawData === 0xfffe) {
        historicAlert.temperatureException = "DISABLED";
        historicAlert.temperatureF = cToF(historicAlert.temperature);
      } else if (temperatureRawData === 0xffff) {
        historicAlert.temperatureException = "SENSOR_EXCEPTION";
        historicAlert.temperatureF = cToF(historicAlert.temperature);
      } else {
        historicData.temperature = temperatureValue;
        historicData.temperatureF = cToF(historicData.temperature);
      }

      const historicEvent = readHistoryEvent(eventValue);
      if (historicEvent.length > 0) {
        historicAlert.historicEvent = historicEvent;
      }
      if (historicEvent.indexOf("MUTATION_ALARM") !== -1) {
        historicData.distanceMutation = mutation;
      }

      if (!isEmpty(historicAlert)) {
        emit("sample", { data: historicAlert, topic: "alert", timestamp });
      }

      if (!isEmpty(historicData)) {
        emit("sample", { data: historicData, topic: "default", timestamp });
      }
    }
    // DOWNLINK RESPONSE
    else if (channelId === 0xfe) {
      const result = handleDownlinkResponse(channelType, bytes, i);
      i = result.offset;
      emit("sample", { data: result.data, topic: "downlink_response" });
    }
    // DOWNLINK RESPONSE
    else if (channelId === 0xf8) {
      const result = handleDownlinkResponseExt(channelType, bytes, i);
      i = result.offset;
      emit("sample", { data: result.data, topic: "downlink_response" });
    } else {
      break;
    }
  }

  if (!isEmpty(decoded)) {
    emit("sample", { data: decoded, topic: "default" });
  }
}
