// bytes to number
function readUInt16LE(bytes) {
  const value = (bytes[1] << 8) + bytes[0];
  return value & 0xffff;
}

function readUInt32LE(bytes) {
  const value =
    (bytes[3] << 24) + (bytes[2] << 16) + (bytes[1] << 8) + bytes[0];
  return value & 0xffffffff;
}

// bytes to version
function readVersion(bytes) {
  const temp = [];
  for (let idx = 0; idx < bytes.length; idx++) {
    temp.push((bytes[idx] & 0xff).toString(10));
  }
  return temp.join(".");
}

// bytes to string
function readString(bytes) {
  const temp = [];
  for (let idx = 0; idx < bytes.length; idx++) {
    temp.push(`0${(bytes[idx] & 0xff).toString(16)}`.slice(-2));
  }
  return temp.join("");
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

    // PROTOCOL VESION
    if (channelId === 0xff && channelType === 0x01) {
      lifecycle.protocolVersion = bytes[i];
      i += 1;
    }
    // SERIAL NUMBER
    else if (channelId === 0xff && channelType === 0x16) {
      lifecycle.sn = readString(Array.from(bytes).slice(i, i + 8));
      i += 8;
    }
    // HARDWARE VERSION
    else if (channelId === 0xff && channelType === 0x09) {
      lifecycle.hardwareVersion = readVersion(
        Array.from(bytes).slice(i, i + 2),
      );
      i += 2;
    }
    // FIRMWARE VERSION
    else if (channelId === 0xff && channelType === 0x1f) {
      lifecycle.firmwareVersion = readVersion(
        Array.from(bytes).slice(i, i + 4),
      );
      i += 4;
    }
    // TOTAL COUNTER IN
    else if (channelId === 0x03 && channelType === 0xd2) {
      decoded.totalCounterIn = readUInt32LE(Array.from(bytes).slice(i, i + 4));
      i += 4;
    }
    // TOTAL COUNTER OUT
    else if (channelId === 0x04 && channelType === 0xd2) {
      decoded.totalCounterOut = readUInt32LE(Array.from(bytes).slice(i, i + 4));
      i += 4;
    }
    // PERIODIC COUNTER
    else if (channelId === 0x05 && channelType === 0xcc) {
      decoded.periodicCounterIn = readUInt16LE(
        Array.from(bytes).slice(i, i + 2),
      );
      decoded.periodicCounterOut = readUInt16LE(
        Array.from(bytes).slice(i + 2, i + 4),
      );
      i += 4;
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
