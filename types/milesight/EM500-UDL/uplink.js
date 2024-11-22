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
      i += 1;
    }
    // DISTANCE
    else if (channelId === 0x03 && channelType === 0x82) {
      decoded.distance = readUInt16LE(Array.from(bytes).slice(i, i + 2));
      const fillLevel = getFillLevel(event.device, decoded.distance);
      if (fillLevel !== undefined) {
        decoded.fillLevel = fillLevel;
      }
      i += 2;
    } else {
      break;
    }
  }

  if (!isEmpty(lifecycle)) {
    emit("sample", { data: lifecycle, topic: "lifecycle" });
  }

  if (!isEmpty(decoded)) {
    emit("sample", { data: decoded, topic: "default" });
  }
}
