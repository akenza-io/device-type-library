// Parse Hex Byte Array
function parseHexString(str) {
  const result = [];
  while (str.length >= 2) {
    result.push(parseInt(str.substring(0, 2), 16));
    str = str.substring(2, str.length);
  }
  return result;
}

// bytes to number
function readUInt16BE(bytes) {
  const value = (bytes[0] << 8) + bytes[1];
  return value & 0xffff;
}

function readInt16LE(bytes) {
  const ref = readUInt16LE(bytes);
  return ref > 0x7fff ? ref - 0x10000 : ref;
}

function readUInt16LE(bytes) {
  const value = (bytes[1] << 8) + bytes[0];
  return value & 0xffff;
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

function consume(event) {
  const payload = event.data.payloadHex;
  const bytes = parseHexString(payload);

  const decoded = {};
  let topic = "default";

  for (let i = 0; i < bytes.length; ) {
    const channelId = bytes[i++];
    const channelType = bytes[i++];

    // PROTOCOL VESION
    if (channelId === 0xff && channelType === 0x01) {
      decoded.protocolVersion = bytes[i];
      i += 1;
      topic = "lifecycle";
    }
    // SERIAL NUMBER
    else if (channelId === 0xff && channelType === 0x08) {
      decoded.sn = readString(bytes.slice(i, i + 6));
      i += 6;
      topic = "lifecycle";
    }
    // HARDWARE VERSION
    else if (channelId === 0xff && channelType === 0x09) {
      decoded.hardwareVersion = readVersion(bytes.slice(i, i + 2));
      i += 2;
      topic = "lifecycle";
    }
    // FIRMWARE VERSION
    else if (channelId === 0xff && channelType === 0x0a) {
      decoded.firmwareVersion = readVersion(bytes.slice(i, i + 4));
      i += 4;
      topic = "lifecycle";
    }
    // PEOPLE COUNTER
    else if (channelId === 0x04 && channelType === 0xc9) {
      decoded.peopleCounterAll = bytes[i];
      decoded.regionCount = bytes[i + 1];
      const region = readUInt16BE(bytes.slice(i + 2, i + 4));
      for (let idx = 0; idx < decoded.regionCount; idx++) {
        const tmp = `region${idx}`;
        decoded[tmp] = (region >> idx) & 1;
      }
      i += 4;
      topic = "count";
    }
    // PEOPLE IN/OUT
    else if (channelId === 0x05 && channelType === 0xcc) {
      decoded.in = readInt16LE(bytes.slice(i, i + 2));
      decoded.out = readInt16LE(bytes.slice(i + 2, i + 4));
      i += 4;
      topic = "people";
    }
    // PEOPLE MAX
    else if (channelId === 0x06 && channelType === 0xcd) {
      decoded.peopleMax = bytes[i];
      i += 1;
      topic = "people_max";
    } else {
      break;
    }
  }

  emit("sample", { data: decoded, topic });
}
