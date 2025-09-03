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

function readSerialNumber(bytes) {
  const temp = [];
  for (let idx = 0; idx < bytes.length; idx++) {
    temp.push((`0${(bytes[idx] & 0xff).toString(16)}`).slice(-2));
  }
  return temp.join("");
}

function consume(event) {
  const bytes = Hex.hexToBytes(event.data.payloadHex);
  const climateData = {};
  const lifecycleData = {};
  const systemData = {};

  for (let i = 0; i < bytes.length;) {
    const channelId = bytes[i++];
    const channelType = bytes[i++];

    // HARDWARE VERSION
    if (channelId === 0xff && channelType === 0x09) {
      systemData.hardwareVersion = `v${bytes[i]}.${bytes[i + 1] >> 4}`;
      i += 2;
    }
    // FIRMWARE VERSION
    else if (channelId === 0xff && channelType === 0x0a) {
      systemData.firmwareVersion = `v${bytes[i]}.${bytes[i + 1]}`;
      i += 2;
    }
    // SERIAL NUMBER
    else if (channelId === 0xff && channelType === 0x16) {
      systemData.sn = readSerialNumber(bytes.slice(i, i + 8));
      i += 8;
    }
    // DEVICE STATUS (POWER ON)
    else if (channelId === 0xff && channelType === 0x0b) {
      systemData.deviceStatus = "on"; // Presence indicates 'on'
      i += 1;
    }
    // SENSOR STATUS
    else if (channelId === 0xff && channelType === 0x18) {
      const statusByte = bytes[i + 1];
      systemData.temperatureEnabled = !!(statusByte & 0b00000001);
      systemData.humidityEnabled = !!(statusByte & 0b00000010);
      i += 2;
    }
    // BATTERY
    else if (channelId === 0x01 && channelType === 0x75) {
      lifecycleData.batteryLevel = bytes[i];
      i += 1;
    }
    // TEMPERATURE
    else if (channelId === 0x03 && channelType === 0x67) {
      climateData.temperature = readInt16LE(bytes.slice(i, i + 2)) / 10;
      i += 2;
    }
    // HUMIDITY
    else if (channelId === 0x04 && channelType === 0x68) {
      climateData.humidity = bytes[i] / 2;
      i += 1;
    }
    // HISTORICAL DATA
    else if (channelId === 0x20 && channelType === 0xce) {
      const ts = readUInt32LE(bytes.slice(i, i + 4));
      const historicalReading = {
        temperature: readInt16LE(bytes.slice(i + 4, i + 6)) / 10,
        humidity: bytes[i + 6] / 2,
      };

      // AM102 historical data is always 7 bytes long
      i += 7;

      emit("sample", {
        data: historicalReading,
        topic: "default",
        timestamp: new Date(ts * 1000),
      });
    } else {
      // Unknown channel, stop processing to avoid errors
      break;
    }
  }

  if (Object.keys(climateData).length > 0) {
    emit("sample", {
      data: climateData,
      topic: "default",
    });
  }
  if (Object.keys(lifecycleData).length > 0) {
    emit("sample", {
      data: lifecycleData,
      topic: "lifecycle",
    });
  }
  if (Object.keys(systemData).length > 0) {
    emit("sample", {
      data: systemData,
      topic: "system",
    });
  }
}

