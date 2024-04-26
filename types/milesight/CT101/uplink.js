// Parse Hex Byte Array
function parseHexString(str) {
  const result = [];
  while (str.length >= 2) {
    result.push(parseInt(str.substring(0, 2), 16));
    str = str.substring(2, str.length);
  }
  return result;
}

function readUInt16LE(bytes) {
  const value = (bytes[1] << 8) + bytes[0];
  return value & 0xffff;
}

function readUInt32LE(bytes) {
  const value =
    (bytes[3] << 24) + (bytes[2] << 16) + (bytes[1] << 8) + bytes[0];
  return (value & 0xffffffff) >>> 0;
}

function readProtocolVersion(bytes) {
  const major = (bytes & 0xf0) >> 4;
  const minor = bytes & 0x0f;
  return `${major}.${minor}`;
}

function readHardwareVersion(bytes) {
  const major = bytes[0] & 0xff;
  const minor = (bytes[1] & 0xff) >> 4;
  return `${major}.${minor}`;
}

function readFirmwareVersion(bytes) {
  const major = bytes[0] & 0xff;
  const minor = bytes[1] & 0xff;
  return `${major}.${minor}`;
}

function readSerialNumber(bytes) {
  const temp = [];
  for (let idx = 0; idx < bytes.length; idx++) {
    temp.push(`0${(bytes[idx] & 0xff).toString(16)}`.slice(-2));
  }
  return temp.join("");
}

function isEmpty(obj) {
  return Object.keys(obj).length === 0;
}

function consume(event) {
  const payload = event.data.payloadHex;
  const bytes = parseHexString(payload);

  const decoded = {};
  const system = {};
  const alarm = {};
  const totalCurrent = {};

  for (let i = 0; i < bytes.length; ) {
    const channelId = bytes[i++];
    const channelType = bytes[i++];

    // POWER STATE
    if (channelId === 0xff && channelType === 0x0b) {
      system.powerOn = true;
      i += 1;
    }
    // IPSO VERSION
    else if (channelId === 0xff && channelType === 0x01) {
      system.ipsoVersion = readProtocolVersion(bytes[i]);
      i += 1;
    }
    // PRODUCT SERIAL NUMBER
    else if (channelId === 0xff && channelType === 0x16) {
      system.sn = readSerialNumber(bytes.slice(i, i + 8));
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
    // TOTAL CURRENT
    else if (channelId === 0x03 && channelType === 0x97) {
      totalCurrent.totalCurrent = readUInt32LE(bytes.slice(i, i + 4)) / 100;
      i += 4;
    }
    // CURRENT
    else if (channelId === 0x04 && channelType === 0x98) {
      const value = readUInt16LE(bytes.slice(i, i + 2));
      if (value === 0xffff) {
        alarm.readAlarm = true;
      } else {
        decoded.current = value / 100;
      }
      i += 2;
    }
    // CURRENT ALARM
    else if (channelId === 0x84 && channelType === 0x98) {
      decoded.currentMax = readUInt16LE(bytes.slice(i, i + 2)) / 100;
      decoded.currentMin = readUInt16LE(bytes.slice(i + 2, i + 4)) / 100;
      decoded.current = readUInt16LE(bytes.slice(i + 4, i + 6)) / 100;

      const alarmByte = bytes[i + 6];
      alarm.thresholdAlarm = false;
      alarm.thresholdAlarmRelease = false;
      alarm.overRangeAlarm = false;
      alarm.overRangeAlarmRelease = false;

      if ((alarmByte >> 0) & 0x01) {
        alarm.thresholdAlarm = true;
      }
      if ((alarmByte >> 1) & 0x01) {
        alarm.thresholdAlarmRelease = true;
      }
      if ((alarmByte >> 2) & 0x01) {
        alarm.overRangeAlarm = true;
      }
      if ((alarmByte >> 3) & 0x01) {
        alarm.overRangeAlarmRelease = true;
      }
      i += 7;
    } else {
      break;
    }
  }

  if (!isEmpty(system)) {
    emit("sample", { data: system, topic: "system" });
  }

  if (!isEmpty(decoded)) {
    emit("sample", { data: decoded, topic: "default" });
  }

  if (!isEmpty(alarm)) {
    emit("sample", { data: alarm, topic: "alarm" });
  }

  if (!isEmpty(totalCurrent)) {
    emit("sample", { data: totalCurrent, topic: "totalCurrent" });
  }
}
