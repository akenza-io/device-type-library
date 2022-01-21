function stepSize(lo, hi, nbits, nresv) {
  return 1.0 / (((1 << nbits) - 1 - nresv) / (hi - lo));
}

function valueDecode(value, lo, hi, nbits, nresv) {
  return (value - nresv / 2) * stepSize(lo, hi, nbits, nresv) + lo;
}

function consume(event) {
  const payload = event.data.payloadHex; // 0500647ad001020200030202
  const bits = Bits.hexToBits(payload);
  let topic = "default";
  const data = {};
  const lifecycle = {};

  // Header
  const type = Bits.bitsToUnsigned(bits.substr(0, 8));
  lifecycle.demandMessage = Bits.bitsToUnsigned(bits.substr(15, 1));
  lifecycle.positionMessage = Bits.bitsToUnsigned(bits.substr(14, 1));
  lifecycle.hasMoved = Bits.bitsToUnsigned(bits.substr(13, 1));
  // Reserved
  lifecycle.sos = Bits.bitsToUnsigned(bits.substr(11, 1));
  const operatingMode = Bits.bitsToUnsigned(bits.substr(8, 3));

  switch (operatingMode) {
    case 0:
      lifecycle.operatingMode = "STANDBY";
      break;
    case 1:
      lifecycle.operatingMode = "MOTION_TRACKING";
      break;
    case 2:
      lifecycle.operatingMode = "PERMANENT_TRACKING";
      break;
    case 3:
      lifecycle.operatingMode = "MOTION_START_END_TRACKING";
      break;
    case 4:
      lifecycle.operatingMode = "ACTIVITY_TRACKING";
      break;
    case 5:
      lifecycle.operatingMode = "OFF";
      break;
    default:
      break;
  }

  const batteryLevel = Bits.bitsToUnsigned(bits.substr(16, 8));
  if (batteryLevel === 0) {
    lifecycle.batteryStatus = "CHARGING";
  } else if (batteryLevel === 255) {
    lifecycle.batteryStatus = "ERROR";
  } else {
    lifecycle.batteryLevel = batteryLevel;
  }
  lifecycle.temperature =
    valueDecode(Bits.bitsToUnsigned(bits.substr(24, 8)), -44, 85, 8, 0) * 0.5;
  // Reserved 4-8

  switch (type) {
    // Frame pending
    case 0x00:
      break;
    // Position
    case 0x03: {
      const position = Bits.bitsToUnsigned(bits.substr(36, 4));
      switch (position) {
        case 0: {
          topic = "gps_fix";
          // prettier-ignore
          data.age = valueDecode(Bits.bitsToUnsigned(bits.substr(40, 8)), 0, 2040, 8, 0) * 8; // Seconds
          let latitude = Bits.bitsToUnsigned(bits.substr(48, 24));
          latitude <<= 8;
          if (latitude > 0x7fffffff) {
            latitude -= 0x100000000;
          }
          data.latitude = latitude / 10e7;

          let longitude = Bits.bitsToUnsigned(bits.substr(72, 24));
          longitude <<= 8;
          if (longitude > 0x7fffffff) {
            longitude -= 0x100000000;
          }
          data.longitude = longitude / 10e7;
          // prettier-ignore
          data.ehpe = valueDecode(Bits.bitsToUnsigned(bits.substr(40, 8)), 0, 1000, 8, 0) * 3.9; // Estimated Horizontal Position Error, expressed in meters
          break;
        }
        case 1: {
          topic = "gps_timeout";
          const cause = Bits.bitsToUnsigned(bits.substr(40, 8));
          if (cause === 0) {
            data.timeoutCause = "DEFAULT_TIMEOUT";
          } else if (cause === 1) {
            data.timeoutCause = "GPS_T0_TIMEOUT";
          } else if (cause === 2) {
            data.timeoutCause = "GPS_FIX_TIMEOUT";
          }
          // prettier-ignore
          data.cn0 = valueDecode( Bits.bitsToUnsigned(bits.substr(48, 8)), 0, 50, 8, 0) * 0.2; // dBm
          // prettier-ignore
          data.cn1 = valueDecode( Bits.bitsToUnsigned(bits.substr(56, 8)), 0, 50, 8, 0) * 0.2; // dBm
          // prettier-ignore
          data.cn2 = valueDecode( Bits.bitsToUnsigned(bits.substr(64, 8)), 0, 50, 8, 0) * 0.2; // dBm
          // prettier-ignore
          data.cn3 = valueDecode( Bits.bitsToUnsigned(bits.substr(72, 8)), 0, 50, 8, 0) * 0.2; // dBm
          break;
        }
        case 2:
          topic = "encrypted_wifi_bssid";
          break;
        case 3: {
          topic = "gps_timeout";
          // prettier-ignore
          data.vBat1 = valueDecode( Bits.bitsToUnsigned(bits.substr(40, 8)), 2.8, 4.2, 8, 2) * 5.5; // T0
          // prettier-ignore
          data.vBat2 = valueDecode( Bits.bitsToUnsigned(bits.substr(48, 8)), 2.8, 4.2, 8, 2) * 5.5; // T0 + 0.5 sec
          // prettier-ignore
          data.vBat3 = valueDecode( Bits.bitsToUnsigned(bits.substr(56, 8)), 2.8, 4.2, 8, 2) * 5.5; // T0 + 1 sec
          // prettier-ignore
          data.vBat4 = valueDecode( Bits.bitsToUnsigned(bits.substr(64, 8)), 2.8, 4.2, 8, 2) * 5.5; // T0 + 1.5 sec
          // prettier-ignore
          data.vBat5 = valueDecode( Bits.bitsToUnsigned(bits.substr(72, 8)), 2.8, 4.2, 8, 2) * 5.5; // T0 + 2 sec
          // prettier-ignore
          data.vBat6 = valueDecode( Bits.bitsToUnsigned(bits.substr(80, 8)), 2.8, 4.2, 8, 2) * 5.5; // T0 + 2.5 sec
          break;
        }
        case 4: {
          topic = "wifi_failure";
          // prettier-ignore
          data.vBat1 = valueDecode( Bits.bitsToUnsigned(bits.substr(40, 8)), 2.8, 4.2, 8, 2) * 5.5; // T0
          // prettier-ignore
          data.vBat2 = valueDecode( Bits.bitsToUnsigned(bits.substr(48, 8)), 2.8, 4.2, 8, 2) * 5.5; // T0 + 0.5 sec
          // prettier-ignore
          data.vBat3 = valueDecode( Bits.bitsToUnsigned(bits.substr(56, 8)), 2.8, 4.2, 8, 2) * 5.5; // T0 + 1 sec
          // prettier-ignore
          data.vBat4 = valueDecode( Bits.bitsToUnsigned(bits.substr(64, 8)), 2.8, 4.2, 8, 2) * 5.5; // T0 + 1.5 sec
          // prettier-ignore
          data.vBat5 = valueDecode( Bits.bitsToUnsigned(bits.substr(72, 8)), 2.8, 4.2, 8, 2) * 5.5; // T0 + 2 sec
          // prettier-ignore
          data.vBat6 = valueDecode( Bits.bitsToUnsigned(bits.substr(80, 8)), 2.8, 4.2, 8, 2) * 5.5; // T0 + 2.5 sec

          const error = Bits.bitsToUnsigned(bits.substr(88, 8));
          if (error === 0) {
            data.error = "WIFI_CONNECTION_FAILURE";
          } else if (error === 1) {
            data.error = "SCAN_FAILURE";
          } else if (error === 2) {
            data.error = "ANTENNA_UNAVAILABLE";
          } else if (error === 3) {
            data.error = "WIFI_NOT_SUPPORTED";
          }
          break;
        }
        case 5:
          topic = "lpgps_data";
          break;
        case 6:
          topic = "lpgps_data";
          break;
        case 7:
          // prettier-ignore
          data.age = valueDecode(Bits.bitsToUnsigned(bits.substr(40, 8)), 0, 2040, 8, 0) * 8; // Seconds
          data.maxAdr0 = Bits.bitsToUnsigned(bits.substr(48, 48));
          data.rssid0 = Bits.bitsToSigned(bits.substr(96, 8));
          data.maxAdr1 = Bits.bitsToUnsigned(bits.substr(104, 48));
          data.rssid1 = Bits.bitsToSigned(bits.substr(152, 8));
          data.maxAdr2 = Bits.bitsToUnsigned(bits.substr(160, 48));
          data.rssid2 = Bits.bitsToSigned(bits.substr(208, 8));
          data.maxAdr3 = Bits.bitsToUnsigned(bits.substr(216, 48));
          data.rssid3 = Bits.bitsToSigned(bits.substr(264, 8));

          topic = "ble_beacon_scan";
          break;
        case 8: {
          const failure = Bits.bitsToUnsigned(bits.substr(40, 8));
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
          topic = "ble_beacon_failure";
          break;
        }
        case 9:
          // prettier-ignore
          data.age = valueDecode(Bits.bitsToUnsigned(bits.substr(40, 8)), 0, 2040, 8, 0) * 8; // Seconds
          data.bsssid0 = Bits.bitsToUnsigned(bits.substr(48, 48));
          data.rssid0 = Bits.bitsToSigned(bits.substr(96, 8));
          data.bsssid1 = Bits.bitsToUnsigned(bits.substr(104, 48));
          data.rssid1 = Bits.bitsToSigned(bits.substr(152, 8));
          data.bsssid2 = Bits.bitsToUnsigned(bits.substr(160, 48));
          data.rssid2 = Bits.bitsToSigned(bits.substr(208, 8));
          data.bsssid3 = Bits.bitsToUnsigned(bits.substr(216, 48));
          data.rssid3 = Bits.bitsToSigned(bits.substr(264, 8));

          topic = "wifi_bssid";
          break;
        case 10:
          // prettier-ignore
          data.age = valueDecode(Bits.bitsToUnsigned(bits.substr(40, 8)), 0, 2040, 8, 0) * 8; // Seconds
          data.shortBID0 = Bits.bitsToUnsigned(bits.substr(48, 48));
          data.rssid0 = Bits.bitsToSigned(bits.substr(96, 8));
          data.shortBID1 = Bits.bitsToUnsigned(bits.substr(104, 48));
          data.rssid1 = Bits.bitsToSigned(bits.substr(152, 8));
          data.shortBID2 = Bits.bitsToUnsigned(bits.substr(160, 48));
          data.rssid2 = Bits.bitsToSigned(bits.substr(208, 8));
          data.shortBID3 = Bits.bitsToUnsigned(bits.substr(216, 48));
          data.rssid3 = Bits.bitsToSigned(bits.substr(264, 8));

          topic = "ble_beacon_short";
          break;
        case 11:
          // prettier-ignore
          data.age = valueDecode(Bits.bitsToUnsigned(bits.substr(40, 8)), 0, 2040, 8, 0) * 8; // Seconds
          data.longBID0 = Bits.bitsToUnsigned(bits.substr(48, 128));
          data.rssid0 = Bits.bitsToSigned(bits.substr(176, 8));

          topic = "ble_beacon_long";
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
      topic = "heartbeat";
      const cause = Bits.bitsToUnsigned(bits.substr(40, 8));

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
        bits.substr(48, 8),
      )}.${Bits.bitsToUnsigned(bits.substr(48, 8))}.${Bits.bitsToUnsigned(
        bits.substr(64, 8),
      )}`;
      data.bleFirmwareVersion = `${Bits.bitsToUnsigned(
        bits.substr(80, 8),
      )}.${Bits.bitsToUnsigned(bits.substr(72, 8))}.${Bits.bitsToUnsigned(
        bits.substr(88, 8),
      )}`;

      break;
    }
    // Activity Status
    // Configuration
    // Shock detection
    case 0x07:
      break;
    // Shutdown
    case 0x09:
      break;

    // Event
    case 0x0a:
      break;

    // Collection scan
    case 0x0b:
      break;

    // Proximity
    case 0x0c:
      break;

    // Extended Position
    case 0x0e:
      break;

    // Debug
    case 0x0f:
      break;

    default:
      break;
  }

  // console.log(result);

  emit("sample", { data: lifecycle, topic: "lifecycle" });
  emit("sample", { data, topic });
}

consume({
  data: {
    port: 1,
    payloadHex: "0500647ad001020200030202",
  },
});
