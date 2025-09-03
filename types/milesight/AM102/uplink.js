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
  let temp = [];
  for (let idx = 0; idx < bytes.length; idx++) {
    temp.push(("0" + (bytes[idx] & 0xff).toString(16)).slice(-2));
  }
  return temp.join("");
}

function consume(event) {
  const bytes = Hex.hexToBytes(event.data.payloadHex);
  const decoded = {};
  const climateData = {};
  const lifecycleData = {};
  const systemData = {};

  for (let i = 0; i < bytes.length;) {
    const channel_id = bytes[i++];
    const channel_type = bytes[i++];

    // HARDWARE VERSION
    if (channel_id === 0xff && channel_type === 0x09) {
      const major = bytes[i];
      const minor = bytes[i + 1] >> 4;
      systemData.hardware_version = "v" + major + "." + minor;
      i += 2;
    }
    // FIRMWARE VERSION
    else if (channel_id === 0xff && channel_type === 0x0a) {
      const major = bytes[i];
      const minor = bytes[i + 1];
      systemData.firmware_version = "v" + major + "." + minor;
      i += 2;
    }
    // SERIAL NUMBER
    else if (channel_id === 0xff && channel_type === 0x16) {
      systemData.sn = readSerialNumber(bytes.slice(i, i + 8));
      i += 8;
    }
    // DEVICE STATUS
    else if (channel_id === 0xff && channel_type === 0x0b) {
      systemData.device_status = "on"; // Presence of this channel indicates 'on'
      i += 1;
    }
    // BATTERY
    else if (channel_id === 0x01 && channel_type === 0x75) {
      lifecycleData.battery = bytes[i];
      i += 1;
    }
    // TEMPERATURE
    else if (channel_id === 0x03 && channel_type === 0x67) {
      climateData.temperature = readInt16LE(bytes.slice(i, i + 2)) / 10;
      i += 2;
    }
    // HUMIDITY
    else if (channel_id === 0x04 && channel_type === 0x68) {
      climateData.humidity = bytes[i] / 2;
      i += 1;
    }
    // HISTORY DATA
    else if (channel_id === 0x20 && channel_type === 0xce) {
      const ts = readUInt32LE(bytes.slice(i, i + 4));
      const temp = readInt16LE(bytes.slice(i + 4, i + 6)) / 10;
      const hum = bytes[i + 6] / 2;

      const historicalData = {
        temperature: temp,
        humidity: hum
      };
      emit("sample", {
        data: historicalData,
        topic: "climate",
        timestamp: new Date(ts * 1000),
      });

      i += 7;
    } else {
      // To prevent infinite loops on malformed payloads, we skip the rest of the payload
      emit("log", {
        level: "warning",
        message: `Unknown channel/type: ${channel_id}/${channel_type}`,
      });
      break;
    }
  }

  if (Object.keys(climateData).length > 0) {
    emit("sample", {
      data: climateData,
      topic: "climate"
    });
  }
  if (Object.keys(lifecycleData).length > 0) {
    emit("sample", {
      data: lifecycleData,
      topic: "lifecycle"
    });
  }
  if (
    systemData.firmware_version &&
    systemData.hardware_version &&
    systemData.device_status &&
    systemData.sn
  ) {
    emit("sample", {
      data: systemData,
      topic: "system"
    });
  }
}