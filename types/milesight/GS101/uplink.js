function readUInt32LE(bytes) {
  const value =
    (bytes[3] << 24) + (bytes[2] << 16) + (bytes[1] << 8) + bytes[0];
  return (value & 0xffffffff) >>> 0;
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
  const decoded = {};
  const lifecycle = {};

  for (let i = 0; i < bytes.length; ) {
    const channelId = bytes[i++];
    const channelType = bytes[i++];

    // Gas status
    if (channelId === 0x05 && channelType === 0x8e) {
      decoded.gasState = bytes[i] === 0 ? "NORMAL" : "ABNORMAL";
      i += 1;
    }
    // Vale
    else if (channelId === 0x06 && channelType === 0x01) {
      decoded.valve = bytes[i] === 0 ? "CLOSED" : "OPENED";
      i += 1;
    }
    // Relay
    else if (channelId === 0x07 && channelType === 0x01) {
      decoded.relay = bytes[i] === 0 ? "CLOSED" : "OPENED";
      i += 1;
    }
    // Remained life time for the sensor
    else if (channelId === 0x08 && channelType === 0x90) {
      lifecycle.remainingLifetime = `${readUInt32LE(bytes.slice(i, i + 4))}s`;
      i += 4;
    }
    // Alarm info
    else if (channelId === 0xff && channelType === 0x3f) {
      const alarmType = bytes[i];
      switch (alarmType) {
        case 0:
          lifecycle.alarm = "POWER_DOWN";
          i += 1;
          break;
        case 1:
          lifecycle.alarm = "POWER_ON";
          i += 1;
          break;
        case 2:
          lifecycle.alarm = "SENSOR_FAILURE";
          i += 1;
          break;
        case 3:
          lifecycle.alarm = "SENSOR_RECOVER";
          i += 1;
          break;
        case 4:
          lifecycle.alarm = "SENSOR_ABOUT_TO_FAIL";
          i += 1;
          break;
        case 5:
          lifecycle.alarm = "SENSOR_FAILED";
          i += 1;
          break;
        default:
          break;
      }
    } else {
      break;
    }
  }

  if (!isEmpty(decoded)) {
    emit("sample", { data: decoded, topic: "default" });
  }

  if (!isEmpty(lifecycle)) {
    emit("sample", { data: lifecycle, topic: "lifecycle" });
  }
}
