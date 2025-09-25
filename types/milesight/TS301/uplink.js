function cToF(celsius) { 
 return Math.round(((celsius * 9) / 5 + 32) * 10) / 10; 
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

function readAlarmType(type) {
  switch (type) {
    case 0:
      return "THRESHOLD_RELEASE";
    case 1:
      return "THRESHOLD";
    case 2:
      return "MUTATION";
    default:
      return "UNKNOWN";
  }
}

function isEmpty(obj) {
  let empty = true;
  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined && value !== null) {
      empty = false;
    }
  }
  return empty;
}

function consume(event) {
  const payload = event.data.payloadHex;
  const bytes = Hex.hexToBytes(payload);
  const climate = { temperatureChannel1: null, temperatureChannel2: null };
  const magnet = { magnetChannel1: null, magnetChannel2: null };
  const alarm = { alarmChannel1: null, alarmChannel2: null };
  const lifecycle = { batteryLevel: null };
  let timestamp = new Date();

  for (let i = 0; i < bytes.length; ) {
    const channelId = bytes[i++];
    const channelType = bytes[i++];

    if (channelId === 0x01 && channelType === 0x75) {
      lifecycle.batteryLevel = bytes[i];
      i += 1;
    }
    // TEMPERATURE(CHANNEL 1 SENSOR)
    else if (channelId === 0x03 && channelType === 0x67) {
      climate.temperatureChannel1 = readInt16LE(bytes.slice(i, i + 2)) / 10;
 climate.temperatureChannel1F = cToF(climate.temperatureChannel1);
      i += 2;
    }
    // MAGNET STATUS(CHANNEL 1 SENSOR)
    else if (channelId === 0x03 && channelType === 0x00) {
      magnet.magnetChannel1 = bytes[i] === 0;
      i += 1;
    }
    // TEMPERATURE(CHANNEL 2 SENSOR)
    else if (channelId === 0x04 && channelType === 0x67) {
      climate.temperatureChannel2 = readInt16LE(bytes.slice(i, i + 2)) / 10;
 climate.temperatureChannel2F = cToF(climate.temperatureChannel2);
      i += 2;
    }
    // MAGNET STATUS(CHANNEL 2 SENSOR)
    else if (channelId === 0x04 && channelType === 0x00) {
      magnet.magnetChannel2 = bytes[i] === 0;
      i += 1;
    }
    // TEMPERATURE(CHANNEL 1 SENSOR) ALARM
    else if (channelId === 0x83 && channelType === 0x67) {
      climate.temperatureChannel1 = readInt16LE(bytes.slice(i, i + 2)) / 10;
 climate.temperatureChannel1F = cToF(climate.temperatureChannel1);
      alarm.alarmChannel1 = readAlarmType(bytes[i + 2]);
      i += 3;
    }
    // TEMPERATURE(CHANNEL 1 SENSOR) ALARM
    else if (channelId === 0x93 && channelType === 0xd7) {
      climate.temperatureChannel1 = readInt16LE(bytes.slice(i, i + 2)) / 10;
 climate.temperatureChannel1F = cToF(climate.temperatureChannel1);
      climate.temperatureChannel1Change =
        readInt16LE(bytes.slice(i + 2, i + 4)) / 100;
 climate.temperatureChannel1ChangeF = cToF(climate.temperatureChannel1Change);
 climate.temperatureChannel1F = cToF(climate.temperatureChannel1);
      alarm.alarmChannel1 = readAlarmType(bytes[i + 4]);
      i += 5;
    }
    // TEMPERATURE(CHANNEL 2 SENSOR) ALARM
    else if (channelId === 0x84 && channelType === 0x67) {
      climate.temperatureChannel2 = readInt16LE(bytes.slice(i, i + 2)) / 10;
 climate.temperatureChannel2F = cToF(climate.temperatureChannel2);
      alarm.alarmChannel2 = readAlarmType(bytes[i + 2]);
      i += 3;
    }
    // TEMPERATURE(CHANNEL 2 SENSOR) ALARM
    else if (channelId === 0x94 && channelType === 0xd7) {
      climate.temperatureChannel2 = readInt16LE(bytes.slice(i, i + 2)) / 10;
 climate.temperatureChannel2F = cToF(climate.temperatureChannel2);
      climate.temperatureChannel2Change =
        readInt16LE(bytes.slice(i + 2, i + 4)) / 100;
 climate.temperatureChannel2ChangeF = cToF(climate.temperatureChannel2Change);
 climate.temperatureChannel2F = cToF(climate.temperatureChannel2);
      alarm.alarmChannel2 = readAlarmType(bytes[i + 4]);
      i += 5;
    }
    // HISTORICAL DATA
    else if (channelId === 0x20 && channelType === 0xce) {
      timestamp = new Date(readUInt32LE(bytes.slice(i, i + 4)));
      const mask = bytes[i + 4];
      i += 5;

      const chn1Mask = mask >>> 4;
      const chn2Mask = mask & 0x0f;
      switch (chn1Mask) {
        case 0x01:
          climate.temperatureChannel1 = readInt16LE(bytes.slice(i, i + 2)) / 10;
 climate.temperatureChannel1F = cToF(climate.temperatureChannel1);
          alarm.alarmChannel1 = "THRESHOLD";
          break;
        case 0x02:
          climate.temperatureChannel1 = readInt16LE(bytes.slice(i, i + 2)) / 10;
 climate.temperatureChannel1F = cToF(climate.temperatureChannel1);
          alarm.alarmChannel1 = "THRESHOLD_RELEASE";
          break;
        case 0x03:
          climate.temperatureChannel1 = readInt16LE(bytes.slice(i, i + 2)) / 10;
 climate.temperatureChannel1F = cToF(climate.temperatureChannel1);
          alarm.alarmChannel1 = "MUTATION";
          break;
        case 0x04:
          climate.temperatureChannel1 = readInt16LE(bytes.slice(i, i + 2)) / 10;
 climate.temperatureChannel1F = cToF(climate.temperatureChannel1);
          break;
        case 0x05:
          magnet.magnetChannel1 = readInt16LE(bytes.slice(i, i + 2)) === 0;
          alarm.alarmChannel1 = "THRESHOLD";
          break;
        case 0x06:
          magnet.magnetChannel1 = readInt16LE(bytes.slice(i, i + 2)) === 0;
          break;
        default:
          break;
      }
      i += 2;

      switch (chn2Mask) {
        case 0x01:
          climate.temperatureChannel2 = readInt16LE(bytes.slice(i, i + 2)) / 10;
 climate.temperatureChannel2F = cToF(climate.temperatureChannel2);
          alarm.alarmChannel2 = "THRESHOLD";
          break;
        case 0x02:
          climate.temperatureChannel2 = readInt16LE(bytes.slice(i, i + 2)) / 10;
 climate.temperatureChannel2F = cToF(climate.temperatureChannel2);
          alarm.alarmChannel2 = "THRESHOLD_RELEASE";
          break;
        case 0x03:
          climate.temperatureChannel2 = readInt16LE(bytes.slice(i, i + 2)) / 10;
 climate.temperatureChannel2F = cToF(climate.temperatureChannel2);
          alarm.alarmChannel2 = "MUTATION";
          break;
        case 0x04:
          climate.temperatureChannel2 = readInt16LE(bytes.slice(i, i + 2)) / 10;
 climate.temperatureChannel2F = cToF(climate.temperatureChannel2);
          break;
        case 0x05:
          magnet.magnetChannel2 = readInt16LE(bytes.slice(i, i + 2)) === 0;
          alarm.alarmChannel2 = "THRESHOLD";
          break;
        case 0x06:
          magnet.magnetChannel2 = readInt16LE(bytes.slice(i, i + 2)) === 0;
          break;
        default:
          break;
      }
      i += 2;
    } else {
      break;
    }
  }

  // Pimp is empty to exclude null values
  if (!isEmpty(climate)) {
    emit("sample", { data: climate, topic: "climate", timestamp });
  }

  if (!isEmpty(magnet)) {
    emit("sample", { data: magnet, topic: "magnet", timestamp });
  }

  if (!isEmpty(alarm)) {
    emit("sample", { data: alarm, topic: "alarm", timestamp });
  }

  if (!isEmpty(lifecycle)) {
    emit("sample", { data: lifecycle, topic: "lifecycle", timestamp });
  }
}
