function cToF(celsius) {
  return Math.round(((celsius * 9) / 5 + 32) * 10) / 10;
}

const currentTotalChns = [0x03, 0x05, 0x07];
const currentChns = [0x04, 0x06, 0x08];
const currentAlarmChns = [0x84, 0x86, 0x88];

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

function includes(items, value) {
  const size = items.length;
  for (let i = 0; i < size; i++) {
    if (items[i] === value) {
      return true;
    }
  }
  return false;
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

function readTslVersion(bytes) {
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

function readCurrentAlarm(type) {
  const alarm = [];
  if ((type >> 0) & 0x01) {
    alarm.push("THRESHOLD_ALARM");
  }
  if ((type >> 1) & 0x01) {
    alarm.push("THRESHOLD_ALARM_RELEASE");
  }
  if ((type >> 2) & 0x01) {
    alarm.push("OVER_RANGE_ALARM");
  }
  if ((type >> 3) & 0x01) {
    alarm.push("OVER_RANGE_ALARM_RELEASE");
  }
  return alarm;
}

function readTemperatureAlarm(type) {
  switch (type) {
    case 0x00:
      return "THRESHOLD_ALARM_RELEASE";
    case 0x01:
      return "THRESHOLD_ALARM";
    default:
      return "UNKNOWN";
  }
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

  const temperature = {};
  const system = {};
  const channels = { channel1: {}, channel2: {}, channel3: {} };

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
    // LORAWAN CLASS TYPE
    else if (channelId === 0xff && channelType === 0x0f) {
      i += 1;
    }
    // TSL VERSION
    else if (channelId === 0xff && channelType === 0xff) {
      system.tslVersion = readTslVersion(bytes.slice(i, i + 2));
      i += 2;
    }
    // TEMPERATURE
    else if (channelId === 0x09 && channelType === 0x67) {
      const temperatureValue = readUInt16LE(bytes.slice(i, i + 2));
      if (temperatureValue === 0xfffd) {
        temperature.temperatureException = "OVER_RANGE_ALARM";
      } else if (temperatureValue === 0xffff) {
        temperature.temperatureException = "READ_FAILED";
      } else {
        temperature.temperature = readInt16LE(bytes.slice(i, i + 2)) / 10;
        temperature.temperatureF = cToF(temperature.temperature);
      }
      i += 2;
    }
    // TOTAL CURRENT
    else if (includes(currentTotalChns, channelId) && channelType === 0x97) {
      const currentChannel = currentTotalChns.indexOf(channelId) + 1;
      channels[`channel${currentChannel}`].totalCurrent =
        readUInt32LE(bytes.slice(i, i + 4)) / 100;
      i += 4;
    }
    // CURRENT
    else if (includes(currentChns, channelId) && channelType === 0x99) {
      const currentChannel = currentTotalChns.indexOf(channelId) + 1;
      const currentValue = readUInt16LE(bytes.slice(i, i + 2));
      if (currentValue === 0xffff) {
        channels[`channel${currentChannel}`].exception = "READ_FAILED";
      } else {
        channels[`channel${currentChannel}`].current = currentValue / 10;
      }
      i += 2;
    }
    // CURRENT ALARM
    else if (includes(currentAlarmChns, channelId) && channelType === 0x99) {
      const currentChannel = currentAlarmChns.indexOf(channelId) + 1;
      channels[`channel${currentChannel}`].currentMax =
        readUInt16LE(bytes.slice(i, i + 2)) / 10;
      channels[`channel${currentChannel}`].currentMin =
        readUInt16LE(bytes.slice(i + 2, i + 4)) / 10;
      channels[`channel${currentChannel}`].current =
        readUInt16LE(bytes.slice(i + 4, i + 6)) / 10;
      channels[`channel${currentChannel}`].alarm = readCurrentAlarm(
        bytes[i + 6],
      );
      i += 7;
    }
    // TEMPERATURE ALARM
    else if (channelId === 0x89 && channelType === 0x67) {
      temperature.temperature = readInt16LE(bytes.slice(i, i + 2)) / 10;
      temperature.temperatureF = cToF(temperature.temperature);
      temperature.temperatureAlarm = readTemperatureAlarm(bytes[i + 2]);
      temperature.temperatureAlarmF = cToF(temperature.temperatureAlarm);
      i += 3;
    } else {
      break;
    }
  }

  if (!isEmpty(system)) {
    emit("sample", { data: system, topic: "system" });
  }

  if (!isEmpty(temperature)) {
    emit("sample", { data: temperature, topic: "temperature" });
  }

  if (!isEmpty(channels.channel1)) {
    emit("sample", { data: channels.channel1, topic: "channel1" });
  }

  if (!isEmpty(channels.channel2)) {
    emit("sample", { data: channels.channel2, topic: "channel2" });
  }

  if (!isEmpty(channels.channel3)) {
    emit("sample", { data: channels.channel3, topic: "channel3" });
  }
}
