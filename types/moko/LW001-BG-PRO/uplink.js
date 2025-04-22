const operationModeArray = ["STANDBY", "PERIODIC", "TIMING", "MOTION"];
const rebootReasonArray = ["Restart after power failure", "Bluetooth command request", "LoRaWAN command request", "Power on after normal power off"];
const posFailedReasonArray = [
  "WIFI positioning time is not enough (The location payload reporting interval is set too short, please increase the report interval of the current working mode via MKLoRa app)"
  , "WIFI positioning strategies timeout (Please increase the WIFI positioning timeout via MKLoRa app)"
  , "WIFI module is not detected, the WIFI module itself works abnormally"
  , "Bluetooth positioning time is not enough (The location payload reporting interval is set too short, please increase the report interval of the current working mode via MKLoRa app)"
  , "Bluetooth positioning strategies timeout (Please increase the Bluetooth positioning timeout via MKLoRa app)"
  , "Bluetooth broadcasting in progress (Please reduce the Bluetooth broadcast timeout or avoid Bluetooth positioning when Bluetooth broadcasting in process via MKLoRa app)"
  , "GPS position time budget over (Pls increase the GPS budget via MKLoRa app)"
  , "GPS coarse positioning timeout (Pls increase coarse positioning timeout or increase coarse accuracy target via MKLoRa app)"
  , "GPS fine positioning timeout (Pls increase fine positioning timeout or increase fine accuracy target via MKLoRa app)"
  , "GPS positioning time is not enough (The location payload reporting interval is set too short, please increase the report interval of the current working mode via MKLoRa app)"
  , "GPS aiding positioning timeout (Please adjust GPS autonomous latitude and autonomous longitude)"
  , "GPS cold start positioning timeout (The gps signal current environment isn't very good, please leave the device in a more open area)"
  , "Interrupted by Downlink for Position"
  , "Interrupted positioning at start of movement(the movement ends too quickly, resulting in not enough time to complete the positioning)"
  , "Interrupted positioning at end of movement(the movement restarted too quickly, resulting in not enough time to complete the positioning)"
];
const shutdownTypeArray = ["BLUETOOTH_COMMAND", "LORAWAN_COMMAND", "MAGNETIC"];
const eventTypeArray = [
  "START_OF_MOVEMENT",
  "IN_MOVEMENT",
  "END_OF_MOVEMENT",
  "DOWNLINK"
];

function substringBytes(bytes, start, len) {
  const char = [];
  for (let i = 0; i < len; i++) {
    char.push(`0x${bytes[start + i].toString(16)}` < 0X10 ? (`0${bytes[start + i].toString(16)}`) : bytes[start + i].toString(16));
  }
  return char.join("");
}

function consume(event) {
  const { port } = event.data;
  const { payloadHex } = event.data;
  let bytes = Hex.hexToBytes(payloadHex);
  const bits = Bits.hexToBits(payloadHex);

  const lifecycle = {};
  const reboot = {};
  const failure = {};
  const wifi = {};
  const bluetooth = {};
  const gps = {};
  const shutdown = {};
  const vibration = {};
  const mandown = {};
  const tamper = {};
  const movement = {};
  const system = {};
  const time = {};

  // Common frame head
  if (port <= 10) {
    lifecycle.lowBattery = !(bytes[0] & 0x04 === 0);
    lifecycle.operationMode = operationModeArray[bytes[0] & 0x03];
    lifecycle.tamperAlarm = !(bytes[0] & 0x08 === 0);
    lifecycle.mandown = !(bytes[0] & 0x10 === 0);
    lifecycle.motionSinceLastPaylaod = !(bytes[0] & 0x20 === 0);

    if (port === 2 || port === 3) {
      lifecycle.positioningType = bytes[0] & 0x40 === 0 ? "NORMAL" : "DOWNLINK_FOR_POSITION";
    }

    lifecycle.temperature = Bits.bitsToSigned(bits.substr(8, 8));
    lifecycle.acknowledgeByte = bytes[2] & 0x0f;
    lifecycle.batteryVoltage = (22 + ((bytes[2] >> 4) & 0x0f)) / 10;
  }

  if (port === 1) {
    const rebootReasonCode = Bits.bitsToUnsigned(bits.substr(16, 8));
    reboot.rebootReason = rebootReasonArray[rebootReasonCode];

    const majorVersion = (bytes[4] >> 6) & 0x03;
    const minorVersion = (bytes[4] >> 4) & 0x03;
    const patchVersion = bytes[4] & 0x0f;
    reboot.firmwareVersion = `V${majorVersion}.${minorVersion}.${patchVersion}`;
    reboot.activityCount = Bits.bitsToUnsigned(bits.substr(32, 16));

  } else if (port === 2) {
    let parseLen = 3; // common head is 3 byte
    const datas = [];
    const positionTypeCode = bytes[parseLen++];

    const year = bytes[parseLen] * 256 + bytes[parseLen + 1];
    parseLen += 2;
    const mon = bytes[parseLen++];
    const days = bytes[parseLen++];
    const hour = bytes[parseLen++];
    const minute = bytes[parseLen++];
    const sec = bytes[parseLen++];
    const timezone = bytes[parseLen++];
    let timestamp = `${year}-${mon}-${days} ${hour}:${minute}:${sec} TZ:${timezone}`;

    if (timezone > 0x80) {
      timestamp = `${year}-${mon}-${days} ${hour}:${minute}:${sec} TZ:${timezone - 0x100}`;
    }

    const datalen = bytes[parseLen++];
    if (positionTypeCode === 0 || positionTypeCode === 1) {
      for (let i = 0; i < (datalen / 7); i++) {
        const tempData = {};
        tempData.mac = substringBytes(bytes, parseLen, 6);
        parseLen += 6;
        tempData.rssi = bytes[parseLen++] - 256;
        datas.push(tempData);
      }
      if (positionTypeCode === 0) {
        wifi.macData = datas;
        wifi.timestamp = timestamp;
      } else {
        bluetooth.macData = datas;
        bluetooth.timestamp = timestamp;
      }
    } else {
      let lat = Bits.bitsToUnsigned(bits.substr(parseLen * 8, 32));
      parseLen += 4;
      let lon = Bits.bitsToUnsigned(bits.substr(parseLen * 8, 32));
      parseLen += 4;

      if (lat > 0x80000000) {
        lat -= 0x100000000;
      }

      if (lon > 0x80000000) {
        lon -= 0x100000000;
      }

      gps.latitude = lat / 10000000;
      gps.longitude = lon / 10000000;
      gps.pdop = bytes[parseLen] / 10;
      gps.timestamp = timestamp;
    }
  } else if (port === 3) {
    let parseLen = 3;
    const datas = [];
    const failedTypeCode = Bits.bitsToUnsigned(bits.substr(parseLen * 8, 8));
    failure.reasonsForPositioningFailure = posFailedReasonArray[failedTypeCode];
    const datalen = bytes[parseLen++];
    // wifi and ble reason
    if (failedTypeCode <= 5) {
      if (datalen) {
        for (let i = 0; i < (datalen / 7); i++) {
          const item = {};
          item.mac = substringBytes(bytes, parseLen, 6);
          parseLen += 6;
          item.rssi = bytes[parseLen++] - 256;
          datas.push(item);
        }
        failure.macData = datas;
      }
      // gps reason
    } else if (failedTypeCode <= 11) {
      const pdop = bytes[parseLen++];
      if (pdop !== 0xff) {
        failure.pdop = pdop / 10
      } else {
        failure.pdop = "UNKNOWN";
      }
      failure.gpsSatelliteCn = `${bytes[parseLen]}-${bytes[parseLen + 1]}-${bytes[parseLen + 2]}-${bytes[parseLen + 3]}`;
    }
  } else if (port === 4) {
    shutdown.shutdownType = shutdownTypeArray[Bits.bitsToUnsigned(bits.substr(16, 8))];
  } else if (port === 5) {
    vibration.numberOfShocks = Bits.bitsToUnsigned(bits.substr(16, 16));
  } else if (port === 6) {
    mandown.totalIdleTime = Bits.bitsToUnsigned(bits.substr(16, 16));
  } else if (port === 7) {
    let parseLen = 3; // common head is 3 byte
    const year = Bits.bitsToUnsigned(bits.substr(parseLen * 8, 16));
    parseLen += 2;
    const mon = bytes[parseLen++];
    const days = bytes[parseLen++];
    const hour = bytes[parseLen++];
    const minute = bytes[parseLen++];
    const sec = bytes[parseLen++];
    const timezone = bytes[parseLen++];

    if (timezone > 0x80) {
      tamper.timestamp = `${year}-${mon}-${days} ${hour}:${minute}:${sec}  TZ:${timezone - 0x100}`;
    }
    else {
      tamper.timestamp = `${year}-${mon}-${days} ${hour}:${minute}:${sec}  TZ:${timezone}`;
    }
    tamper.tamperAlarm = true;
  } else if (port === 8) {
    const eventTypeCode = Bits.bitsToUnsigned(bits.substr(16, 8));
    movement.eventType = eventTypeArray[eventTypeCode];
  } else if (port === 9) {
    let parseLen = 3;
    system.gpsWorkTime = Bits.bitsToUnsigned(bits.substr(parseLen * 8, 32));
    parseLen += 4;
    system.wifiWorkTime = Bits.bitsToUnsigned(bits.substr(parseLen * 8, 32));
    parseLen += 4;
    system.bleScanWorkTime = Bits.bitsToUnsigned(bits.substr(parseLen * 8, 32));
    parseLen += 4;
    system.bleAdvWorkTime = Bits.bitsToUnsigned(bits.substr(parseLen * 8, 32));
    parseLen += 4;
    system.loraWorkTime = Bits.bitsToUnsigned(bits.substr(parseLen * 8, 32));
    parseLen += 4;
  } else if (port === 11) {
    let tempIndex = 2;
    const currentTime = `${bytes[tempIndex++] * 256 + bytes[tempIndex++]}/${bytes[tempIndex++]}/${bytes[tempIndex++]} ${bytes[tempIndex++]}:${bytes[tempIndex++]}:${bytes[tempIndex++]}`;
    const timezone = Bits.bitsToUnsigned(bits.substr(tempIndex * 8, 8));
    tempIndex += 1;

    time.currentTime = currentTime;
    time.timezone = timezone;
    tempIndex += 1;

    bytes = bytes.slice(tempIndex);
  } else if (port === 12) {
    lifecycle.operationMode = operationModeArray[bytes[0] & 0x03];
    lifecycle.lowBattery = !(bytes[0] & 0x04 === 0);
    lifecycle.tamperAlarm = !(bytes[0] & 0x08 === 0);
    lifecycle.mandown = !(bytes[0] & 0x10 === 0);
    lifecycle.motionSinceLastPaylaod = !(bytes[0] & 0x20 === 0);
    lifecycle.positioningType = bytes[0] & 0x40 === 0 ? "NORMAL" : "DOWNLINK_FOR_POSITION";

    lifecycle.lorawanDownlinkCount = bytes[1] & 0x0f;
    lifecycle.batteryVoltage = (22 + ((bytes[1] >> 4) & 0x0f)) / 10;

    let parseLen = 2;
    let lat = Bits.bitsToUnsigned(bits.substr(parseLen * 8, 32));
    parseLen += 4;
    let lon = Bits.bitsToUnsigned(bits.substr(parseLen * 8, 32));
    parseLen += 4;

    if (lat > 0x80000000) {
      lat -= 0x100000000;
    }

    if (lon > 0x80000000) {
      lon -= 0x100000000;
    }

    gps.latitude = lat / 10000000;
    gps.longitude = lon / 10000000;
    gps.pdop = bytes[parseLen] / 10;
  }

  if (Object.keys(lifecycle).length > 0) {
    emit("sample", { data: lifecycle, topic: "lifecycle" });
  }

  if (Object.keys(reboot).length > 0) {
    emit("sample", { data: reboot, topic: "reboot" });
  }

  if (Object.keys(failure).length > 0) {
    emit("sample", { data: failure, topic: "fix_failure" });
  }

  if (Object.keys(wifi).length > 0) {
    emit("sample", { data: wifi, topic: "wifi" });
  }

  if (Object.keys(bluetooth).length > 0) {
    emit("sample", { data: bluetooth, topic: "bluetooth" });
  }

  if (Object.keys(gps).length > 0) {
    emit("sample", { data: gps, topic: "gps" });
  }

  if (Object.keys(vibration).length > 0) {
    emit("sample", { data: vibration, topic: "vibration" });
  }

  if (Object.keys(mandown).length > 0) {
    emit("sample", { data: mandown, topic: "mandown" });
  }

  if (Object.keys(shutdown).length > 0) {
    emit("sample", { data: shutdown, topic: "shutdown" });
  }

  if (Object.keys(tamper).length > 0) {
    emit("sample", { data: tamper, topic: "tamper" });
  }

  if (Object.keys(movement).length > 0) {
    emit("sample", { data: movement, topic: "movement" });
  }

  if (Object.keys(system).length > 0) {
    emit("sample", { data: system, topic: "system" });
  }

  if (Object.keys(time).length > 0) {
    emit("sample", { data: time, topic: "time" });
  }
}