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

function readUInt32LE(bytes) {
  const value =
    (bytes[3] << 24) + (bytes[2] << 16) + (bytes[1] << 8) + bytes[0];
  return (value & 0xffffffff) >>> 0;
}

function readUInt16LE(bytes) {
  const value = (bytes[1] << 8) + bytes[0];
  return value & 0xffff;
}

function readInt16LE(bytes) {
  const ref = readUInt16LE(bytes);
  return ref > 0x7fff ? ref - 0x10000 : ref;
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
  return Object.keys(obj).length === 0;
}

function consume(event) {
  const payload = event.data.payloadHex;
  const bytes = parseHexString(payload);
  const lifecycle = {};
  const regionCounter = {};

  for (let i = 0; i < bytes.length; ) {
    const channelId = bytes[i++];
    const channelType = bytes[i++];
    const decoded = {};

    // PROTOCOL VESION
    if (channelId === 0xff && channelType === 0x01) {
      lifecycle.protocolVersion = bytes[i];
      i += 1;
    }
    // SERIAL NUMBER
    else if (channelId === 0xff && channelType === 0x08) {
      lifecycle.sn = readString(Array.from(bytes).slice(i, i + 6));
      i += 6;
    }
    // HARDWARE VERSION
    else if (channelId === 0xff && channelType === 0x09) {
      lifecycle.hardwareVersion = readVersion(
        Array.from(bytes).slice(i, i + 2),
      );
      i += 2;
    }
    // FIRMWARE VERSION
    else if (channelId === 0xff && channelType === 0x0a) {
      lifecycle.firmwareVersion = readVersion(
        Array.from(bytes).slice(i, i + 4),
      );
      i += 4;
    }
    // PEOPLE COUNTER
    else if (channelId === 0x04 && channelType === 0xc9) {
      decoded.peopleCounterAll = bytes[i];
      decoded.regionCount = bytes[i + 1];
      const region = readUInt16BE(Array.from(bytes).slice(i + 2, i + 4));
      for (let idx = 0; idx < decoded.regionCount; idx++) {
        const tmp = `region${idx}`;
        decoded[tmp] = (region >> idx) & 1;
      }
      i += 4;
      emit("sample", { data: decoded, topic: "count" });
    }
    // PEOPLE IN/OUT
    else if (channelId === 0x05 && channelType === 0xcc) {
      decoded.in = readInt16LE(Array.from(bytes).slice(i, i + 2));
      decoded.out = readInt16LE(Array.from(bytes).slice(i + 2, i + 4));
      i += 4;
      emit("sample", { data: decoded, topic: "people" });
    }
    // PEOPLE MAX
    else if (channelId === 0x06 && channelType === 0xcd) {
      decoded.peopleMax = bytes[i];
      i += 1;
      emit("sample", { data: decoded, topic: "people_max" });
    }
    // REGION COUNTER
    else if (channelId === 0x07 && channelType === 0xd5) {
      regionCounter.region1count = bytes[i];
      regionCounter.region2count = bytes[i + 1];
      regionCounter.region3count = bytes[i + 2];
      regionCounter.region4count = bytes[i + 3];
      regionCounter.region5count = bytes[i + 4];
      regionCounter.region6count = bytes[i + 5];
      regionCounter.region7count = bytes[i + 6];
      regionCounter.region8count = bytes[i + 7];
      i += 8;
    }
    // REGION COUNTER
    else if (channelId === 0x08 && channelType === 0xd5) {
      regionCounter.region9count = bytes[i];
      regionCounter.region10count = bytes[i + 1];
      regionCounter.region11count = bytes[i + 2];
      regionCounter.region12count = bytes[i + 3];
      regionCounter.region13count = bytes[i + 4];
      regionCounter.region14count = bytes[i + 5];
      regionCounter.region15count = bytes[i + 6];
      regionCounter.region16count = bytes[i + 7];
      i += 8;
    }
    // A FLOW
    else if (channelId === 0x09 && channelType === 0xda) {
      decoded.aToA = readUInt16LE(bytes.slice(i, i + 2));
      decoded.aToB = readUInt16LE(bytes.slice(i + 2, i + 4));
      decoded.aToC = readUInt16LE(bytes.slice(i + 4, i + 6));
      decoded.aToD = readUInt16LE(bytes.slice(i + 6, i + 8));
      i += 8;
      emit("sample", { data: decoded, topic: "a_flow" });
    }
    // B FLOW
    else if (channelId === 0x0a && channelType === 0xda) {
      decoded.bToA = readUInt16LE(bytes.slice(i, i + 2));
      decoded.bToB = readUInt16LE(bytes.slice(i + 2, i + 4));
      decoded.bToC = readUInt16LE(bytes.slice(i + 4, i + 6));
      decoded.bToD = readUInt16LE(bytes.slice(i + 6, i + 8));
      i += 8;
      emit("sample", { data: decoded, topic: "b_flow" });
    }
    // C FLOW
    else if (channelId === 0x0b && channelType === 0xda) {
      decoded.cToA = readUInt16LE(bytes.slice(i, i + 2));
      decoded.cToB = readUInt16LE(bytes.slice(i + 2, i + 4));
      decoded.cToC = readUInt16LE(bytes.slice(i + 4, i + 6));
      decoded.cToD = readUInt16LE(bytes.slice(i + 6, i + 8));
      i += 8;
      emit("sample", { data: decoded, topic: "c_flow" });
    }
    // D FLOW
    else if (channelId === 0x0c && channelType === 0xda) {
      decoded.dToA = readUInt16LE(bytes.slice(i, i + 2));
      decoded.dToB = readUInt16LE(bytes.slice(i + 2, i + 4));
      decoded.dToC = readUInt16LE(bytes.slice(i + 4, i + 6));
      decoded.dToD = readUInt16LE(bytes.slice(i + 6, i + 8));
      i += 8;
      emit("sample", { data: decoded, topic: "d_flow" });
    }
    // TOTAL IN/OUT
    else if (channelId === 0x0d && channelType === 0xcc) {
      decoded.peopleTotalIn = readUInt16LE(bytes.slice(i, i + 2));
      decoded.peopleTotalOut = readUInt16LE(bytes.slice(i + 2, i + 4));
      i += 4;
      emit("sample", { data: decoded, topic: "total" });
    }
    // DWELL TIME
    else if (channelId === 0x0e && channelType === 0xe4) {
      decoded.region = bytes[i];
      decoded.dwellTimeAvg = readUInt16LE(bytes.slice(i + 1, i + 3));
      decoded.dwellTimeMax = readUInt16LE(bytes.slice(i + 3, i + 5));
      i += 5;
      emit("sample", { data: decoded, topic: "dwell_time" });
    }
    // TIMESTAMP
    else if (channelId === 0x0f && channelType === 0x85) {
      /*
      // We probably do not need that atm
      decoded.timestamp = readUInt32LE(bytes.slice(i, i + 4));
      i += 4;
      emit("sample", { data: decoded, topic: "timestamp" });
      */
    } else {
      break;
    }
  }

  if (!isEmpty(lifecycle)) {
    emit("sample", { data: lifecycle, topic: "lifecycle" });
  }

  if (!isEmpty(regionCounter)) {
    emit("sample", { data: regionCounter, topic: "region_counter" });
  }
}
