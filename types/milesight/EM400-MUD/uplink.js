function cToF(celsius) {
  return Math.round(((celsius * 9) / 5 + 32) * 10) / 10;
}

function getFillLevel(device, distance) {
  if (device !== undefined && distance !== undefined) {
    if (device.customFields !== undefined) {
      const { customFields } = device;
      let scaleLength = null;
      let sensorDistance = 0;

      if (customFields.containerHeight !== undefined) {
        scaleLength = Number(device.customFields.containerHeight);
      }

      if (customFields.installationOffset !== undefined) {
        sensorDistance = Number(device.customFields.installationOffset);
      }

      if (scaleLength !== null) {
        const percentExact =
          (100 / scaleLength) * (scaleLength - (distance - sensorDistance));
        let fillLevel = Math.round(percentExact);
        if (fillLevel > 100) {
          fillLevel = 100;
        } else if (fillLevel < 0) {
          fillLevel = 0;
        }
        return fillLevel;
      }
    }
  }
  return undefined;
}

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

function readInt16LE(bytes) {
  const ref = readUInt16LE(bytes);
  return ref > 0x7fff ? ref - 0x10000 : ref;
}
function isEmpty(obj) {
  if (obj === undefined) {
    return true;
  }
  return Object.keys(obj).length === 0;
}

function consume(event) {
  const payload = event.data.payloadHex;
  const bytes = parseHexString(payload);

  const decoded = {};
  const lifecycle = {};

  for (let i = 0; i < bytes.length; ) {
    const channelId = bytes[i++];
    const channelType = bytes[i++];
    // BATTERY
    if (channelId === 0x01 && channelType === 0x75) {
      lifecycle.batteryLevel = bytes[i];
      emit("sample", { data: lifecycle, topic: "lifecycle" });
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
      decoded.distance = readUInt16LE(bytes.slice(i, i + 2));
      const fillLevel = getFillLevel(event.device, decoded.distance);
      if (fillLevel !== undefined) {
        decoded.fillLevel = fillLevel;
      }
      i += 2;
    }
    // POSITION
    else if (channelId === 0x05 && channelType === 0x00) {
      decoded.tilt = !!bytes[i];
      i += 1;
    }
    // TEMPERATURE WITH ABNORMAL
    else if (channelId === 0x83 && channelType === 0x67) {
      decoded.temperature = readInt16LE(bytes.slice(i, i + 2)) / 10;
      decoded.temperatureF = cToF(decoded.temperature);
      decoded.temperatureAbnormal = bytes[i + 2] !== 0;
      decoded.temperatureF = cToF(decoded.temperature);
      i += 3;
    }
    // DISTANCE WITH ALARMING
    else if (channelId === 0x84 && channelType === 0x82) {
      decoded.distance = readUInt16LE(bytes.slice(i, i + 2));
      const fillLevel = getFillLevel(event.device, decoded.distance);
      if (fillLevel !== undefined) {
        decoded.fillLevel = fillLevel;
      }
      decoded.distanceAlarming = bytes[i + 2] !== 0;
      i += 3;
    } else {
      break;
    }
  }

  if (!isEmpty(decoded)) {
    emit("sample", { data: decoded, topic: "default" });
  }
}
