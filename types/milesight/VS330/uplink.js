function readUInt16LE(bytes) {
  const value = (bytes[1] << 8) + bytes[0];
  return value & 0xffff;
}

function isEmpty(obj) {
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

    // BATTERY
    if (channelId === 0x01 && channelType === 0x75) {
      lifecycle.batteryLevel = bytes[i];
      i += 1;
    }
    // DISTANCE
    else if (channelId === 0x02 && channelType === 0x82) {
      lifecycle.distance = readUInt16LE(bytes.slice(i, i + 2));
      i += 2;
    }
    // OCCUPANCY
    else if (channelId === 0x03 && channelType === 0x8e) {
      decoded.occupied = bytes[i] !== 0;
      decoded.occupancy = Number(decoded.occupied);
      i += 1;
    }
    // CALIBRATION
    else if (channelId === 0x04 && channelType === 0x8e) {
      lifecycle.calibration = bytes[i] === 0 ? "FAILED" : "SUCCESS";
      i += 1;
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
