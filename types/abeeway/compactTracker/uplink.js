// Make sure to adjust other abeeway decoders as well
function valueDecode(value, lo, hi, nbits, nresv) {
  const stepSize = 1.0 / (((1 << nbits) - 1 - nresv) / (hi - lo));
  return (value - nresv / 2) * stepSize + lo;
}

function getGPS(bits) {
  const data = {};
  let pointer = 0;
  let latitude = Bits.bitsToUnsigned(bits.substring(pointer, pointer + 24));
  latitude <<= 8;
  if (latitude > 0x7fffffff) {
    latitude -= 0x100000000;
  }
  data.latitude = latitude / 10e6;
  pointer += 24;

  let longitude = Bits.bitsToUnsigned(bits.substring(pointer, pointer + 24));
  longitude <<= 8;
  if (longitude > 0x7fffffff) {
    longitude -= 0x100000000;
  }
  data.longitude = longitude / 10e6;
  pointer += 24;

  data.horizontalAccuracy = Math.round(
    valueDecode(Bits.bitsToUnsigned(bits.substring(pointer, pointer + 8)), 0, 1000, 8, 0),
  ); // Estimated Horizontal Position Error, expressed in meters
  return data;
}

function getGPSTimeout(bits) {
  const data = {};
  let pointer = 0;

  const cause = Bits.bitsToUnsigned(bits.substring(pointer, pointer + 8));
  if (cause === 0) {
    data.timeoutCause = "DEFAULT_TIMEOUT";
  } else if (cause === 1) {
    data.timeoutCause = "GPS_T0_TIMEOUT";
  } else if (cause === 2) {
    data.timeoutCause = "GPS_FIX_TIMEOUT";
  }
  pointer += 8;
  data.cn0 = valueDecode(
    Bits.bitsToUnsigned(bits.substring(pointer, pointer + 8)),
    0,
    50,
    8,
    0,
  ); // dBm
  pointer += 8;
  data.cn1 = valueDecode(
    Bits.bitsToUnsigned(bits.substring(pointer, pointer + 8)),
    0,
    50,
    8,
    0,
  ); // dBm
  pointer += 8;
  data.cn2 = valueDecode(
    Bits.bitsToUnsigned(bits.substring(pointer, pointer + 8)),
    0,
    50,
    8,
    0,
  ); // dBm
  pointer += 8;
  data.cn3 = valueDecode(
    Bits.bitsToUnsigned(bits.substring(pointer, pointer + 8)),
    0,
    50,
    8,
    0,
  ); // dBm

  return data;
}

function getWifiTimeout(bits) {
  const data = {};
  let pointer = 0;

  data.vBat1 = valueDecode(
    Bits.bitsToUnsigned(bits.substring(pointer, pointer + 8)),
    2.8,
    4.2,
    8,
    2,
  ); // T0
  pointer += 8;
  data.vBat2 = valueDecode(
    Bits.bitsToUnsigned(bits.substring(pointer, pointer + 8)),
    2.8,
    4.2,
    8,
    2,
  ); // T0 + 0.5 sec
  pointer += 8;
  data.vBat3 = valueDecode(
    Bits.bitsToUnsigned(bits.substring(pointer, pointer + 8)),
    2.8,
    4.2,
    8,
    2,
  ); // T0 + 1 sec
  pointer += 8;
  data.vBat4 = valueDecode(
    Bits.bitsToUnsigned(bits.substring(pointer, pointer + 8)),
    2.8,
    4.2,
    8,
    2,
  ); // T0 + 1.5 sec
  pointer += 8;
  data.vBat5 = valueDecode(
    Bits.bitsToUnsigned(bits.substring(pointer, pointer + 8)),
    2.8,
    4.2,
    8,
    2,
  ); // T0 + 2 sec
  pointer += 8;
  data.vBat6 = valueDecode(
    Bits.bitsToUnsigned(bits.substring(pointer, pointer + 8)),
    2.8,
    4.2,
    8,
    2,
  ); // T0 + 2.5 sec

  return data;
}

function getOperatingMode(operatingMode) {
  let op = "NO_OPERATION_MODE";
  switch (operatingMode) {
    case 0:
      op = "STANDBY";
      break;
    case 1:
      op = "MOTION_TRACKING";
      break;
    case 2:
      op = "PERMANENT_TRACKING";
      break;
    case 3:
      op = "MOTION_START_END_TRACKING";
      break;
    case 4:
      op = "ACTIVITY_TRACKING";
      break;
    case 5:
      op = "OFF";
      break;
    default:
      break;
  }

  return op;
}

function getBattery(battery) {
  const data = {};
  data.batteryStatus = "NORMAL";
  data.batteryLevel = 0;
  if (battery === 0) {
    data.batteryStatus = "CHARGING";
  } else if (battery === 255) {
    data.batteryStatus = "ERROR";
  } else {
    data.batteryLevel = battery;
  }

  return data;
}

function consume(event) {
  const payload = event.data.payloadHex;
  const bits = Bits.hexToBits(payload);
  let topic = "default";
  const data = {};
  const lifecycle = {};

  // Header
  const type = Bits.bitsToUnsigned(bits.substring(0, 8));
  lifecycle.demandMessage = !!Bits.bitsToUnsigned(bits.substring(15, 16));
  lifecycle.positionMessage = !!Bits.bitsToUnsigned(bits.substring(14, 15));
  lifecycle.hasMoved = !!Bits.bitsToUnsigned(bits.substring(13, 14));
  // Reserved
  lifecycle.sos = !!Bits.bitsToUnsigned(bits.substring(11, 12));
  lifecycle.operatingMode = getOperatingMode(
    Bits.bitsToUnsigned(bits.substring(8, 11)),
  );

  const battery = getBattery(Bits.bitsToUnsigned(bits.substring(16, 24)));
  Object.assign(lifecycle, battery);

  // prettier-ignore
  lifecycle.temperature = Math.round(valueDecode(Bits.bitsToUnsigned(bits.substring(24, 32)), -44, 85, 8, 0) * 10) / 10;
  lifecycle.acknowledge = false;
  // Reserved 4-8

  switch (type) {
    // Frame pending
    case 0x00:
      lifecycle.acknowledge = !!Bits.bitsToUnsigned(bits.substring(40, 48));
      break;
    // Position
    case 0x03: {
      const position = Bits.bitsToUnsigned(bits.substring(36, 40));
      switch (position) {
        case 0: {
          // prettier-ignore
          data.age = valueDecode(Bits.bitsToUnsigned(bits.substring(40, 48)), 0, 2040, 8, 0); // Seconds
          const gps = getGPS(bits.substring(48, 104));
          Object.assign(data, gps);

          data.gpsMessage = "GPS_FIX";
          topic = "gps";
          break;
        }
        case 1: {
          const gpsTimeout = getGPSTimeout(bits.substring(40, 80));
          Object.assign(data, gpsTimeout);

          topic = "gps_timeout";
          break;
        }
        case 2:
          data.wifiMessage = "ENCRYPTED_WIFI_BSSID";
          topic = "wifi";
          break;
        case 3: {
          const wifiTimeout = getWifiTimeout(bits.substring(40, 88));
          Object.assign(data, wifiTimeout);
          data.wifiMessage = "WIFI_TIMEOUT";
          topic = "wifi";
          break;
        }
        case 4: {
          const wifiTimeout = getWifiTimeout(bits.substring(40, 88));
          Object.assign(data, wifiTimeout);

          const error = Bits.bitsToUnsigned(bits.substring(88, 96));
          if (error === 0) {
            data.error = "WIFI_CONNECTION_FAILURE";
          } else if (error === 1) {
            data.error = "SCAN_FAILURE";
          } else if (error === 2) {
            data.error = "ANTENNA_UNAVAILABLE";
          } else if (error === 3) {
            data.error = "WIFI_NOT_SUPPORTED";
          }
          data.wifiMessage = "WIFI_FAILURE";
          topic = "wifi";
          break;
        }
        case 5:
          data.status = true;
          topic = "lpgps_data";
          break;
        case 6:
          data.status = true;
          topic = "lpgps_data";
          break;
        case 7:
          // prettier-ignore
          data.age = valueDecode(Bits.bitsToUnsigned(bits.substring(40, 48)), 0, 2040, 8, 0); // Seconds
          // prettier-ignore
          data.macAdr0 = `${payload.substring(12, 14)}:${payload.substring(14, 16)}:${payload.substring(16, 18)}:${payload.substring(18, 20)}:${payload.substring(20, 22)}:${payload.substring(22, 24)}`;
          data.rssi0 = Bits.bitsToSigned(bits.substring(96, 104));
          // prettier-ignore
          data.macAdr1 = `${payload.substring(26, 28)}:${payload.substring(28, 30)}:${payload.substring(30, 32)}:${payload.substring(32, 34)}:${payload.substring(34, 36)}:${payload.substring(36, 38)}`;
          data.rssi1 = Bits.bitsToSigned(bits.substring(152, 160));
          // prettier-ignore
          data.macAdr2 = `${payload.substring(40, 42)}:${payload.substring(42, 44)}:${payload.substring(44, 46)}:${payload.substring(46, 48)}:${payload.substring(48, 50)}:${payload.substring(50, 52)}`;
          data.rssi2 = Bits.bitsToSigned(bits.substring(208, 216));
          // prettier-ignore
          data.macAdr3 = `${payload.substring(54, 56)}:${payload.substring(56, 58)}:${payload.substring(58, 60)}:${payload.substring(60, 62)}:${payload.substring(62, 64)}:${payload.substring(64, 66)}`;
          data.rssi3 = Bits.bitsToSigned(bits.substring(264, 272));

          data.bleMessage = "BLE_BEACON_SCAN";
          topic = "ble";
          break;
        case 8: {
          const failure = Bits.bitsToUnsigned(bits.substring(40, 48));
          switch (failure) {
            case 1:
              data.failure = "BLE_NOT_RESPONDING";
              break;
            case 2:
              data.failure = "INTERNAL_ERROR";
              break;
            case 3:
              data.failure = "SHARED_ANTENNA_NOT_AVAILABLE";
              break;
            case 4:
              data.failure = "SCAN_ALREADY_ON_GOING";
              break;
            case 5:
              data.failure = "BLE_BUSY";
              break;
            case 6:
              data.failure = "NO_BEACON_DETECTED";
              break;
            case 255:
              data.failure = "UKNOWN_WRONG_BLE_FIRMWARE";
              break;
            default:
              break;
          }
          data.bleMessage = "BLE_BEACON_FAILURE";
          topic = "ble";
          break;
        }
        case 9:
          // prettier-ignore
          data.age = valueDecode(Bits.bitsToUnsigned(bits.substring(40, 48)), 0, 2040, 8, 0); // Seconds
          if (payload.substring(12, 14) !== "") {
            // prettier-ignore
            data.bssid0 = `${payload.substring(12, 14)}:${payload.substring(14, 16)}:${payload.substring(16, 18)}:${payload.substring(18, 20)}:${payload.substring(20, 22)}:${payload.substring(22, 24)}`;
            data.rssi0 = Bits.bitsToSigned(bits.substring(96, 104));
          }
          if (payload.substring(26, 28) !== "") {
            // prettier-ignore
            data.bssid1 = `${payload.substring(26, 28)}:${payload.substring(28, 30)}:${payload.substring(30, 32)}:${payload.substring(32, 34)}:${payload.substring(34, 36)}:${payload.substring(36, 38)}`;
            data.rssi1 = Bits.bitsToSigned(bits.substring(152, 160));
          }
          if (payload.substring(40, 42) !== "") {
            // prettier-ignore
            data.bssid2 = `${payload.substring(40, 42)}:${payload.substring(42, 44)}:${payload.substring(44, 46)}:${payload.substring(46, 48)}:${payload.substring(48, 50)}:${payload.substring(50, 52)}`;
            data.rssi2 = Bits.bitsToSigned(bits.substring(208, 216));
          }
          if (payload.substring(54, 56) !== "") {
            // prettier-ignore
            data.bssid3 = `${payload.substring(54, 56)}:${payload.substring(56, 58)}:${payload.substring(58, 60)}:${payload.substring(60, 62)}:${payload.substring(62, 64)}:${payload.substring(64, 66)}`;
            data.rssi3 = Bits.bitsToSigned(bits.substring(264, 272));
          }
          data.wifiMessage = "WIFI_BSSID";
          topic = "wifi";
          break;
        case 10:
          // prettier-ignore
          data.age = valueDecode(Bits.bitsToUnsigned(bits.substring(40, 48)), 0, 2040, 8, 0); // Seconds
          // prettier-ignore
          data.shortBID0 = `${payload.substring(12, 14)}:${payload.substring(14, 16)}:${payload.substring(16, 18)}:${payload.substring(18, 20)}:${payload.substring(20, 22)}:${payload.substring(22, 24)}`;
          data.rssi0 = Bits.bitsToSigned(bits.substring(96, 104));
          // prettier-ignore
          data.shortBID1 = `${payload.substring(26, 28)}:${payload.substring(28, 30)}:${payload.substring(30, 32)}:${payload.substring(32, 34)}:${payload.substring(34, 36)}:${payload.substring(36, 38)}`;
          data.rssi1 = Bits.bitsToSigned(bits.substring(152, 160));
          // prettier-ignore
          data.shortBID2 = `${payload.substring(40, 42)}:${payload.substring(42, 44)}:${payload.substring(44, 46)}:${payload.substring(46, 48)}:${payload.substring(48, 50)}:${payload.substring(50, 52)}`;
          data.rssi2 = Bits.bitsToSigned(bits.substring(208, 216));
          // prettier-ignore
          data.shortBID3 = `${payload.substring(54, 56)}:${payload.substring(56, 58)}:${payload.substring(58, 60)}:${payload.substring(60, 62)}:${payload.substring(62, 64)}:${payload.substring(64, 66)}`;
          data.rssi3 = Bits.bitsToSigned(bits.substring(264, 272));

          data.bleMessage = "BLE_BEACON_SHORT";
          topic = "ble";
          break;
        case 11:
          // prettier-ignore
          data.age = valueDecode(Bits.bitsToUnsigned(bits.substring(40, 48)), 0, 2040, 8, 0); // Seconds
          // prettier-ignore
          data.longBID0 = `${payload.substring(12, 14)}:${payload.substring(14, 16)}:${payload.substring(16, 18)}:${payload.substring(18, 20)}:${payload.substring(20, 22)}:
          ${payload.substring(22, 24)}:${payload.substring(24, 26)}:${payload.substring(26, 2)}:${payload.substring(28, 30)}:${payload.substring(30, 32)}:${payload.substring(32, 34)}:
          ${payload.substring(34, 36)}:${payload.substring(36, 38)}:${payload.substring(38, 40)}:${payload.substring(40, 42)}:${payload.substring(42, 44)}:${payload.substring(44, 46)}`;
          data.rssi0 = Bits.bitsToSigned(bits.substring(176, 184));

          data.bleMessage = "BLE_BEACON_LONG";
          topic = "ble";
          break;
        default:
          break;
      }

      break;
      // Energy status
    }
    case 0x04:
      break;
    // Heartbeat
    // Reserved
    case 0x05: {
      const cause = Bits.bitsToUnsigned(bits.substring(40, 48));

      switch (cause) {
        case 0x00:
          data.resetCause = "NO_RESET";
          break;
        case 0x01:
          data.resetCause = "POWER_ON";
          break;
        case 0x02:
          data.resetCause = "UNREGULATED_DOMAIN";
          break;
        case 0x04:
          data.resetCause = "REGULATED_DOMAIN";
          break;
        case 0x08:
          data.resetCause = "EXTERNAL_PIN";
          break;
        case 0x10:
          data.resetCause = "WATCHDOG";
          break;
        case 0x20:
          data.resetCause = "LOCKUP";
          break;
        case 0x40:
          data.resetCause = "SYSTEM_REQUEST";
          break;
        default:
          break;
      }
      data.firmwareVersion = `${Bits.bitsToUnsigned(
        bits.substring(48, 56),
      )}.${Bits.bitsToUnsigned(bits.substring(48, 56))}.${Bits.bitsToUnsigned(
        bits.substring(64, 72),
      )}`;
      data.bleFirmwareVersion = `${Bits.bitsToUnsigned(
        bits.substring(80, 88),
      )}.${Bits.bitsToUnsigned(bits.substring(72, 80))}.${Bits.bitsToUnsigned(
        bits.substring(88, 96),
      )}`;

      data.operationStatus = "HEARTBEAT";
      topic = "operation_status";
      break;
    }
    // Activity Status
    // Configuration
    // Shock detection
    case 0x07: {
      const activity = Bits.bitsToUnsigned(bits.substring(40, 48));

      if (activity === 1) {
        data.activityCounter = Bits.bitsToUnsigned(bits.substring(48, 80));
        topic = "activity_status";
      } else if (activity === 2) {
        // Creating an array here because i dont want a switch case / if else statement with 111 cases

        // prettier-ignore
        const configs = ["ulPeriod", "loraPeriod", "pwStatPeriod", "periodicPosPeriod", "reserved", "geolocSensor", "geolocMethod", "reserved", "motionNbPos", "gpsTimeout", "agpsTimeout",
          "gpsEhpe", "gpsConvergence", "configFlags", "transmitStrat", "bleBeaconCnt", "bleBeaconTimeout", "gpsStandbyTimeout", "confirmedUlBitmap", "confirmedUlRetry",
          "motionSensitivity", "shockDetection", "periodicActivityPeriod", "motionDuration", "geofencingScanPeriod", "geofencingCollectPeriod", "bleRssiFilter", "temperatureHigh",
          "temperatureLow", "temperatureAction", "transmitStratCustom", "networkTimeoutCheck", "networkTimeoutReset", "collectionScanType", "collectionNbEntry", "collectionBleFilterType",
          "collectionBleFilterMain1", "collectionBleFilterMain2", "collectionBleFilterSecValue", "collectionBleFilterSecMask", "batteryCapacity", "reedSwitchConfiguration", "gnssConstellation", "proxScanPwrMin",
          "proxDistanceCoef", "proxScanFrequency", "proxBacktraceMaxAge", "proxDistanceSlidingWindow", "proxExposure50", "proxExposure100", "proxExposure150", "proxExposure200",
          "proxExposure250", "proxExposure300", "proxExposure400", "proxAlarmDistImmediate", "proxAlarmExposure", "proxWarnDistImmediate", "proxWarnExposure", "proxRecordDistImmediate",
          "proxRecordExposure", "proxAlarmBuzDuration", "proxWarnBuzDuration", "proxContactPolicy", "proxScanDuration", "proxScanWindow", "proxScanInterval", "proxAlarmRemanence",
          "proxWarnRemanence", "proxBcnRepeat", "proxBcnTxPower", "proxReminderPeriod", "proxReminderDistance", "proxWarnDisableDist", "proxAlarmDisableDist", "proxMaxSpeedFilter",
          "proxMaxUpdate", "positionBleFilterType", "positionBleFilterMain1", "positionBleFilterMain2", "positionBleFilterSecValue", "positionBleFilterSecMask", "positionBleReportType", "buzzerVolume",
          "angleDetectMode", "angleRefAcq", "angleRefAcq", "angleRefAccY", "angleRefAccZ", "angleCritical", "angleCriticalHyst", "angleReportMode",
          "angleReportPeriod", "angleReportRepeat", "angleRisingTime", "angleFallingTime", "angleLearningTime", "angleAccAccuracy", "angleDeviationDelta", "angleDeviationMinInterval",
          "angleDeviationMaxInterval", "defaultProfile", "password", "gpsT0Timeout", "gpsFixTimeout", "geofencingScanDuration", "beaconingType", "beaconingTxPower",
          "beaconingStaticInterval", "beaconingMotionInterval", "beaconingMotionDuration", "bleCnxAdvDuration"];

        let pointer = 48;
        let flag = 0;
        let value = 0;
        while (pointer !== bits.length) {
          flag = Bits.bitsToUnsigned(bits.substring(pointer, pointer + 8));
          pointer += 8;
          if (flag === 0xfd || flag === 0xfe) {
            pointer += 8;
            data.firmwareVersion = Bits.bitsToUnsigned(bits.substring(pointer, pointer + 8));
            pointer += 8;
            data.firmwareRevision = Bits.bitsToUnsigned(
              bits.substring(pointer, pointer + 8),
            );
            pointer += 8;
            data.firmwareIteration = Bits.bitsToUnsigned(
              bits.substring(pointer, pointer + 8),
            );
            pointer += 8;
          } else if (flag === 0xfa || flag === 0xfb || flag === 0xfc) {
            value = Bits.bitsToSigned(bits.substring(pointer, pointer + 32));
            if (flag === 0xfa) {
              data.xAxis = value;
            } else if (flag === 0xfb) {
              data.yAxis = value;
            } else if (flag === 0xfc) {
              data.zAxis = value;
            }
            pointer += 32;
          } else if (flag === 0xf9) {
            data.operatingMode = getOperatingMode(
              Bits.bitsToUnsigned(bits.substring(pointer, pointer + 32)),
            );
            pointer += 32;
          } else if (flag === 0xf6) {
            value = Bits.bitsToUnsigned(bits.substring(pointer, pointer + 32));
            switch (value) {
              case 0:
                data.dynamicProfile = "NO_PROFILE";
                break;
              case 1:
                data.dynamicProfile = "PROFILE_SLEEP";
                break;
              case 2:
                data.dynamicProfile = "PROFILE_ECONOMIC";
                break;
              case 3:
                data.dynamicProfile = "PROFILE_INTENSIVE";
                break;
              default:
                break;
            }
            pointer += 32;
          } else if (flag === 0xf7) {
            data.powerConsumption = Bits.bitsToUnsigned(
              bits.substring(pointer, pointer + 32),
            );
            pointer += 32;
          } else if (flag === 0xf8) {
            value = Bits.bitsToUnsigned(bits.substring(pointer, pointer + 32));
            switch (value) {
              case 0:
                data.bleBondStatus = "TRACKER_NOT_BONDED";
                break;
              case 1:
                data.bleBondStatus = "TRACKER_BONDED";
                break;
              case 2:
                data.bleBondStatus = "UNKNOWN_STATE";
                break;
              default:
                break;
            }
            pointer += 32;
          } else {
            value = Bits.bitsToUnsigned(bits.substring(pointer, pointer + 32));
            data[configs[flag]] = value;
            pointer += 32;
          }
        }

        topic = "configuration";
      } else if (activity === 3) {
        data.shocks = Bits.bitsToUnsigned(bits.substring(48, 56));
        data.accX = Bits.bitsToSigned(bits.substring(56, 72));
        data.accY = Bits.bitsToSigned(bits.substring(72, 88));
        data.accZ = Bits.bitsToSigned(bits.substring(88, 104));
        topic = "shocks";
      } else if (activity === 4) {
        data.window1 = Bits.bitsToUnsigned(bits.substring(48, 64));
        data.window2 = Bits.bitsToUnsigned(bits.substring(64, 80));
        data.window3 = Bits.bitsToUnsigned(bits.substring(80, 96));
        data.window4 = Bits.bitsToUnsigned(bits.substring(96, 112));
        data.window5 = Bits.bitsToUnsigned(bits.substring(112, 128));
        data.window6 = Bits.bitsToUnsigned(bits.substring(128, 144));

        data.globalCounter = Bits.bitsToUnsigned(bits.substring(142, 174));
        topic = "side_operation";
      }
      break;
    }
    // Shutdown
    case 0x09: {
      const cause = Bits.bitsToUnsigned(bits.substring(40, 48));
      if (cause === 0) {
        data.shutdownCause = "USER_ACTION";
      } else if (cause === 1) {
        data.shutdownCause = "LOW_BATTERY";
      } else if (cause === 2) {
        data.shutdownCause = "DOWNLINK_REQUEST";
      } else if (cause === 3) {
        data.shutdownCause = "BLE_REQUEST";
      }
      data.operationStatus = "SHUTDOWN";
      topic = "operation_status";
      break;
    }
    // Event
    case 0x0a: {
      const eventValue = Bits.bitsToUnsigned(bits.substring(40, 48));
      switch (eventValue) {
        case 0:
          data.operationStatus = "GEOLOCATION_START";
          topic = "operation_status";
          break;
        case 1:
          data.operationStatus = "MOTION_START";
          topic = "operation_status";
          break;
        case 2:
          data.accX = Bits.bitsToSigned(bits.substring(48, 64));
          data.accY = Bits.bitsToSigned(bits.substring(64, 80));
          data.accZ = Bits.bitsToSigned(bits.substring(80, 96));
          data.operationStatus = "MOTION_END";
          topic = "operation_status";
          break;
        case 3:
          data.bleMessage = "BLE_CONNECTED";
          topic = "ble";
          break;
        case 4:
          data.bleMessage = "BLE_DISCONNECTED";
          topic = "ble";
          break;
        case 5: {
          const state = Bits.bitsToUnsigned(bits.substring(48, 56));

          switch (state) {
            case 0:
              data.tempState = "NORMAL_TEMPERATURE";
              break;
            case 1:
              data.tempState = "HIGH_TEMPERATURE";
              break;
            case 2:
              data.tempState = "LOW_TEMPERATURE";
              break;
            case 3:
              data.tempState = "FEATURE_NOT_ACTIVATED";
              break;
            default:
              break;
          }
          if (data.tempState !== "FEATURE_NOT_ACTIVATED") {
            data.maxTemperature = Bits.bitsToSigned(bits.substring(56, 64));
            data.minTemperature = Bits.bitsToSigned(bits.substring(64, 72));
            data.highCounter = Bits.bitsToUnsigned(bits.substring(72, 80));
            data.lowCounter = Bits.bitsToUnsigned(bits.substring(80, 88));
          }
          data.operationStatus = "TEMPERATURE_INFORMATION";
          topic = "operation_status";

          break;
        }
        case 6:
          data.bleMessage = "BLE_BOND_DELETED";
          topic = "ble";
          break;
        case 7:
          data.operationStatus = "SOS_START";
          topic = "operation_status";
          break;
        case 8:
          data.operationStatus = "SOS_STOP";
          topic = "operation_status";
          break;
        case 9: {
          topic = "angle_detection";
          const transition = Bits.bitsToUnsigned(bits.substring(48, 51));
          switch (transition) {
            case 0:
              data.transitionState = "LEARNING_TO_NORMAL";
              break;
            case 1:
              data.transitionState = "NORMAL_TO_LEARNING";
              break;
            case 2:
              data.transitionState = "NORMAL_TO_CRITICAL";
              break;
            case 3:
              data.transitionState = "CRITICAL_TO_NORMAL";
              break;
            case 4:
              data.transitionState = "CRITICAL_TO_LEARNING";
              break;
            default:
              break;
          }

          const trigger = Bits.bitsToUnsigned(bits.substring(51, 53));
          switch (trigger) {
            case 0:
              data.trigger = "CRITICAL_ANGLE_REPORTING";
              break;
            case 1:
              data.trigger = "ANGLE_DEVIATION_REPORTING";
              break;
            case 2:
              data.trigger = "SHOCK_TRIGGER";
              break;
            case 3:
              data.trigger = "RFU";
              break;
            default:
              break;
          }
          data.repetitionCounter = Bits.bitsToUnsigned(bits.substring(53, 56));
          data.age = Bits.bitsToUnsigned(bits.substring(56, 72));

          data.refVectorX = Bits.bitsToSigned(bits.substring(72, 88));
          data.refVectorY = Bits.bitsToSigned(bits.substring(88, 104));
          data.refVectorZ = Bits.bitsToSigned(bits.substring(104, 120));

          data.critVectorX = Bits.bitsToSigned(bits.substring(120, 136));
          data.critVectorY = Bits.bitsToSigned(bits.substring(136, 152));
          data.critVectorZ = Bits.bitsToSigned(bits.substring(152, 168));

          data.angle = Bits.bitsToUnsigned(bits.substring(168, 176));
          break;
        }
        case 10: {
          data.shortID = Bits.bitsToUnsigned(bits.substring(48, 52));

          const notification = Bits.bitsToUnsigned(bits.substring(52, 56));
          switch (notification) {
            case 0:
              data.notification = "SAFE";
              break;
            case 1:
              data.notification = "ENTRY";
              break;
            case 2:
              data.notification = "EXIT";
              break;
            case 3:
              data.notification = "HAZARD";
              break;
            default:
              break;
          }
          data.beaconID = Bits.bitsToUnsigned(bits.substring(56, 80));
          data.bleMessage = "BLE_GEOZONING";
          topic = "ble";
          break;
        }
        default:
          break;
      }
      break;
    }
    // Collection scan
    case 0x0b: {
      // Reserved 1
      const df = !!Bits.bitsToUnsigned(bits.substring(41, 42));
      data.fragmentID = Bits.bitsToUnsigned(bits.substring(42, 48));

      data.cid = Bits.bitsToUnsigned(bits.substring(48, 56));
      data.hash = Bits.bitsToUnsigned(bits.substring(56, 64));

      data.rssi0 = Bits.bitsToUnsigned(bits.substring(64, 72));
      data.rssi1 = Bits.bitsToUnsigned(bits.substring(120, 128));
      data.rssi2 = Bits.bitsToUnsigned(bits.substring(176, 184));
      data.rssi3 = Bits.bitsToUnsigned(bits.substring(232, 240));

      // prettier-ignore
      const v0 = `${payload.substring(18, 20)}:${payload.substring(20, 22)}:${payload.substring(22, 24)}:${payload.substring(24, 26)}:${payload.substring(26, 28)}:${payload.substring(28, 30)}`;
      // prettier-ignore
      const v1 = `${payload.substring(32, 34)}:${payload.substring(34, 36)}:${payload.substring(36, 38)}:${payload.substring(38, 40)}:${payload.substring(40, 42)}:${payload.substring(42, 44)}`;
      // prettier-ignore
      const v2 = `${payload.substring(46, 48)}:${payload.substring(48, 50)}:${payload.substring(50, 52)}:${payload.substring(52, 54)}:${payload.substring(54, 56)}:${payload.substring(56, 58)}`;
      // prettier-ignore
      const v3 = `${payload.substring(60, 62)}:${payload.substring(62, 64)}:${payload.substring(64, 66)}:${payload.substring(66, 68)}:${payload.substring(68, 70)}:${payload.substring(70, 72)}`;

      if (df === true) {
        data.macAdr0 = v0;
        data.macAdr1 = v1;
        data.macAdr2 = v2;
        data.macAdr3 = v3;
      } else {
        data.elementID0 = v0;
        data.elementID1 = v1;
        data.elementID2 = v2;
        data.elementID3 = v3;
      }
      data.wifiMessage = "COLLECTION_SCAN";
      topic = "wifi";
      break;
    }
    // Proximity
    case 0x0c:
      break;

    // Extended Position
    case 0x0e: {
      const position = Bits.bitsToUnsigned(bits.substring(36, 40));
      data.age = Bits.bitsToUnsigned(bits.substring(40, 56)); // Seconds

      switch (position) {
        case 0: {
          const dimensionFix = Bits.bitsToUnsigned(bits.substring(56, 64));
          if (dimensionFix === 1) {
            data.dimensionFix = "3D";
          } else {
            data.dimensionFix = "2D";
          }

          const gps = getGPS(bits.substring(64, 120));
          Object.assign(data, gps);

          data.cog = Bits.bitsToUnsigned(bits.substring(120, 136)) / 100;
          data.sog = Bits.bitsToUnsigned(bits.substring(136, 152));

          data.gpsMessage = "GPS_FIX_EXTENDED";
          topic = "gps";
          break;
        }
        case 1: {
          topic = "gps_timeout";
          const gpsTimeout = getGPSTimeout(bits.substring(56, 96));
          Object.assign(data, gpsTimeout);
          break;
        }
        case 2:
          data.wifiMessage = "ENCRYPTED_WIFI_BSSID";
          topic = "wifi";
          break;
        case 3: {
          const wifiTimeout = getWifiTimeout(bits.substring(56, 104));
          Object.assign(data, wifiTimeout);
          data.wifiMessage = "WIFI_TIMEOUT";
          topic = "wifi";
          break;
        }
        case 4: {
          const wifiTimeout = getWifiTimeout(bits.substring(56, 104));
          Object.assign(data, wifiTimeout);

          const error = Bits.bitsToUnsigned(bits.substring(104, 112));
          if (error === 0) {
            data.error = "WIFI_CONNECTION_FAILURE";
          } else if (error === 1) {
            data.error = "SCAN_FAILURE";
          } else if (error === 2) {
            data.error = "ANTENNA_UNAVAILABLE";
          } else if (error === 3) {
            data.error = "WIFI_NOT_SUPPORTED";
          }
          data.wifiMessage = "WIFI_FAILURE";
          topic = "wifi";
          break;
        }
        case 5:
          data.operationStatus = "LGPS_DATA";
          topic = "operation_status";
          break;
        case 6:
          data.operationStatus = "LGPS_DATA";
          topic = "operation_status";
          break;
        case 7:
          // prettier-ignore
          data.macAdr0 = `${payload.substring(14, 16)}:${payload.substring(16, 18)}:${payload.substring(18, 20)}:${payload.substring(20, 22)}:${payload.substring(22, 24)}:${payload.substring(24, 26)}`;
          data.rssi0 = Bits.bitsToSigned(bits.substring(104, 112));
          // prettier-ignore
          data.macAdr1 = `${payload.substring(28, 30)}:${payload.substring(30, 32)}:${payload.substring(32, 34)}:${payload.substring(34, 36)}:${payload.substring(36, 38)}:${payload.substring(38, 40)}`;
          data.rssi1 = Bits.bitsToSigned(bits.substring(160, 168));
          // prettier-ignore
          data.macAdr2 = `${payload.substring(42, 44)}:${payload.substring(44, 46)}:${payload.substring(46, 48)}:${payload.substring(48, 50)}:${payload.substring(50, 52)}:${payload.substring(52, 54)}`;
          data.rssi2 = Bits.bitsToSigned(bits.substring(216, 224));
          // prettier-ignore
          data.macAdr3 = `${payload.substring(56, 58)}:${payload.substring(58, 60)}:${payload.substring(60, 62)}:${payload.substring(62, 64)}:${payload.substring(64, 66)}:${payload.substring(66, 68)}`;
          data.rssi3 = Bits.bitsToSigned(bits.substring(272, 280));

          data.bleMessage = "BLE_BEACON_SCAN";
          topic = "ble";
          break;
        case 8: {
          const failure = Bits.bitsToUnsigned(bits.substring(56, 64));
          switch (failure) {
            case 1:
              data.failure = "BLE_NOT_RESPONDING";
              break;
            case 2:
              data.failure = "INTERNAL_ERROR";
              break;
            case 3:
              data.failure = "SHARED_ANTENNA_NOT_AVAILABLE";
              break;
            case 4:
              data.failure = "SCAN_ALREADY_ON_GOING";
              break;
            case 5:
              data.failure = "BLE_BUSY";
              break;
            case 6:
              data.failure = "NO_BEACON_DETECTED";
              break;
            case 255:
              data.failure = "UKNOWN_WRONG_BLE_FIRMWARE";
              break;
            default:
              break;
          }
          data.bleMessage = "BLE_BEACON_FAILURE";
          topic = "ble";
          break;
        }
        case 9:
          // prettier-ignore
          data.bssid0 = `${payload.substring(14, 16)}:${payload.substring(16, 18)}:${payload.substring(18, 20)}:${payload.substring(20, 22)}:${payload.substring(22, 24)}:${payload.substring(24, 26)}`;
          data.rssi0 = Bits.bitsToSigned(bits.substring(104, 112));
          // prettier-ignore
          data.bssid1 = `${payload.substring(28, 30)}:${payload.substring(30, 32)}:${payload.substring(32, 34)}:${payload.substring(34, 36)}:${payload.substring(36, 38)}:${payload.substring(38, 40)}`;
          data.rssi1 = Bits.bitsToSigned(bits.substring(160, 168));
          // prettier-ignore
          data.bssid2 = `${payload.substring(42, 44)}:${payload.substring(44, 2)}:${payload.substring(46, 48)}:${payload.substring(48, 50)}:${payload.substring(50, 52)}:${payload.substring(52, 54)}`;
          data.rssi2 = Bits.bitsToSigned(bits.substring(216, 224));
          // prettier-ignore
          data.bssid3 = `${payload.substring(56, 58)}:${payload.substring(58, 60)}:${payload.substring(60, 62)}:${payload.substring(62, 64)}:${payload.substring(64, 66)}:${payload.substring(66, 68)}`;
          data.rssi3 = Bits.bitsToSigned(bits.substring(272, 280));

          data.wifiMessage = "WIFI_BSSID";
          topic = "wifi";
          break;
        case 10:
          // prettier-ignore
          data.shortBID0 = `${payload.substring(14, 16)}:${payload.substring(16, 18)}:${payload.substring(18, 20)}:${payload.substring(20, 22)}:${payload.substring(22, 24)}:${payload.substring(24, 26)}`;
          data.rssi0 = Bits.bitsToSigned(bits.substring(104, 112));
          // prettier-ignore
          data.shortBID1 = `${payload.substring(28, 30)}:${payload.substring(30, 32)}:${payload.substring(32, 34)}:${payload.substring(34, 36)}:${payload.substring(36, 38)}:${payload.substring(38, 40)}`;
          data.rssi1 = Bits.bitsToSigned(bits.substring(160, 168));
          // prettier-ignore
          data.shortBID2 = `${payload.substring(42, 44)}:${payload.substring(44, 46)}:${payload.substring(46, 48)}:${payload.substring(48, 50)}:${payload.substring(50, 52)}:${payload.substring(52, 54)}`;
          data.rssi2 = Bits.bitsToSigned(bits.substring(216, 224));
          // prettier-ignore
          data.shortBID3 = `${payload.substring(56, 58)}:${payload.substring(58, 60)}:${payload.substring(60, 62)}:${payload.substring(62, 64)}:${payload.substring(64, 66)}:${payload.substring(66, 68)}`;
          data.rssi3 = Bits.bitsToSigned(bits.substring(272, 280));

          data.bleMessage = "BLE_BEACON_SHORT";
          topic = "ble";
          break;
        case 11:
          data.longBID0 = `${payload.substring(56, 58)}:${payload.substring(
            58,
            60
          )}:${payload.substring(60, 62)}:${payload.substring(62, 64)}:${payload.substring(
            64,
            66
          )}:${payload.substring(66, 68)}:${payload.substring(68, 70)}:${payload.substring(
            70,
            72
          )}:${payload.substring(72, 74)}:${payload.substring(74, 76)}:${payload.substring(
            76,
            78
          )}:${payload.substring(78, 80)}:${payload.substring(80, 82)}:${payload.substring(
            82,
            84
          )}:${payload.substring(78, 80)}:${payload.substring(84, 86)}:${payload.substring(
            86,
            88
          )}:${payload.substring(78, 80)}:${payload.substring(88, 90)}`;
          data.rssi0 = Bits.bitsToSigned(bits.substring(176, 184));

          data.bleMessage = "BLE_BEACON_LONG";
          topic = "ble";
          break;
        default:
          break;
      }

      break;
    }
    case 0x0f:
      data.hex = payload;
      topic = "debug";
      break;

    default:
      break;
  }

  emit("sample", { data: lifecycle, topic: "lifecycle" });
  emit("sample", { data, topic });
}
