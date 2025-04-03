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
const shutdownTypeArray = ["Bluetooth command to turn off the device", "LoRaWAN command to turn off the device", "Magnetic to turn off the device"];
const eventTypeArray = [
  "START_OF_MOVEMENT",
  "IN_MOVEMENT",
  "END_OF_MOVEMENT",
  "DOWNLINK"
];

function bytesToHexString(bytes, start, len) {
  const char = [];
  for (let i = 0; i < len; i++) {
    const data = bytes[start + i].toString(16);
    const dataHexStr = (`0x${data}`) < 0x10 ? (`0${data}`) : data;
    char.push(dataHexStr);
  }
  return char.join("");
}

function bytesToInt(bytes, start, len) {
  let value = 0;
  for (let i = 0; i < len; i++) {
    const m = ((len - 1) - i) * 8;
    value |= bytes[start + i] << m;
  }
  // var value = ((bytes[start] << 24) | (bytes[start + 1] << 16) | (bytes[start + 2] << 8) | (bytes[start + 3]));
  return value;
}

function substringBytes(bytes, start, len) {
  const char = [];
  for (let i = 0; i < len; i++) {
    char.push(`0x${bytes[start + i].toString(16)}` < 0X10 ? (`0${bytes[start + i].toString(16)}`) : bytes[start + i].toString(16));
  }
  return char.join("");
}

function signedHexToInt(hexStr) {
  let twoStr = parseInt(hexStr, 16).toString(2); // 将十六转十进制，再转2进制
  const bitNum = hexStr.length * 4; // 1个字节 = 8bit ，0xff 一个 "f"就是4位
  if (twoStr.length < bitNum) {
    while (twoStr.length < bitNum) {
      twoStr = `0${twoStr}`;
    }
  }
  if (twoStr.substring(0, 1) === "0") {
    // 正数
    twoStr = parseInt(twoStr, 2); // 二进制转十进制
    return twoStr;
  }
  // 负数
  let twoStrUnsign = "";
  twoStr = parseInt(twoStr, 2) - 1; // 补码：(负数)反码+1，符号位不变；相对十进制来说也是 +1，但这里是负数，+1就是绝对值数据-1
  twoStr = twoStr.toString(2);
  twoStrUnsign = twoStr.substring(1, bitNum); // 舍弃首位(符号位)
  // 去除首字符，将0转为1，将1转为0   反码
  twoStrUnsign = twoStrUnsign.replace(/0/g, "z");
  twoStrUnsign = twoStrUnsign.replace(/1/g, "0");
  twoStrUnsign = twoStrUnsign.replace(/z/g, "1");
  twoStr = parseInt(-twoStrUnsign, 2);
  return twoStr;
}

function hexStringToBytes(hexString) {
  // 移除可能存在的空格或其他分隔符
  hexString = hexString.replace(/\s/g, '');

  // 检查字符串长度是否为偶数
  if (hexString.length % 2 !== 0) {
    throw new Error('Hex string must have an even length');
  }

  // 创建一个Uint8Array来存储字节
  const bytes = new Uint8Array(hexString.length / 2);

  // 将每两个字符转换为一个字节
  for (let i = 0; i < hexString.length; i += 2) {
    bytes[i / 2] = parseInt(hexString.substr(i, 2), 16);
  }

  return bytes;
}

function consume(event) {
  let { port } = event.data;
  let bytes = hexStringToBytes(event.data.payloadHex);
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

  // common frame head
  if (port <= 10) {
    lifecycle.lowBattery = !(bytes[0] & 0x04 === 0);
    lifecycle.operationMode = operationModeArray[bytes[0] & 0x03];
    lifecycle.tamperAlarm = !(bytes[0] & 0x08 === 0);
    lifecycle.mandown = !(bytes[0] & 0x10 === 0);
    lifecycle.motionSinceLastPaylaod = !(bytes[0] & 0x20 === 0);

    if (port === 2 || port === 3) {
      lifecycle.positioningType = bytes[0] & 0x40 === 0 ? "NORMAL" : "DOWNLINK_FOR_POSITION";
    }

    lifecycle.temperature = signedHexToInt(bytesToHexString(bytes, 1, 1));
    lifecycle.acknowledgeByte = bytes[2] & 0x0f;
    lifecycle.batteryVoltage = (22 + ((bytes[2] >> 4) & 0x0f)) / 10;
  }

  if (port === 1) {
    const rebootReasonCode = bytesToInt(bytes, 3, 1);
    reboot.rebootReason = rebootReasonArray[rebootReasonCode];

    const majorVersion = (bytes[4] >> 6) & 0x03;
    const minorVersion = (bytes[4] >> 4) & 0x03;
    const patchVersion = bytes[4] & 0x0f;
    reboot.firmwareVersion = `V${majorVersion}.${minorVersion}.${patchVersion}`;
    reboot.activityCount = bytesToInt(bytes, 5, 4);

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
      let lat = bytesToInt(bytes, parseLen, 4);
      parseLen += 4;
      let lon = bytesToInt(bytes, parseLen, 4);
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
    const failedTypeCode = bytesToInt(bytes, parseLen++, 1);
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
    shutdown.shutdownType = shutdownTypeArray[bytesToInt(bytes, 3, 1)];
  } else if (port === 5) {
    vibration.numberOfShocks = bytesToInt(bytes, 3, 2);
  } else if (port === 6) {
    mandown.totalIdleTime = bytesToInt(bytes, 3, 2);
  } else if (port === 7) {
    let parseLen = 3; // common head is 3 byte
    const year = bytesToInt(bytes, parseLen, 2);
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
    const eventTypeCode = bytesToInt(bytes, 3, 1);
    movement.eventType = eventTypeArray[eventTypeCode];
  } else if (port === 9) {
    let parseLen = 3;
    system.gpsWorkTime = bytesToInt(bytes, parseLen, 4);
    parseLen += 4;
    system.wifiWorkTime = bytesToInt(bytes, parseLen, 4);
    parseLen += 4;
    system.bleScanWorkTime = bytesToInt(bytes, parseLen, 4);
    parseLen += 4;
    system.bleAdvWorkTime = bytesToInt(bytes, parseLen, 4);
    parseLen += 4;
    system.loraWorkTime = bytesToInt(bytes, parseLen, 4);
    parseLen += 4;
  } else if (port === 11) {
    let tempIndex = 2;
    const currentTime = `${bytes[tempIndex++] * 256 + bytes[tempIndex++]}/${bytes[tempIndex++]}/${bytes[tempIndex++]} ${bytes[tempIndex++]}:${bytes[tempIndex++]}:${bytes[tempIndex++]}`;
    const timezone = signedHexToInt(bytesToHexString(bytes, tempIndex, 1));
    tempIndex += 1;

    time.currentTime = currentTime;
    time.timezone = timezone;

    port = bytesToInt(bytes, tempIndex, 1);
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
    let lat = bytesToInt(bytes, parseLen, 4);
    parseLen += 4;
    let lon = bytesToInt(bytes, parseLen, 4);
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