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
  if (obj === undefined) {
    return true;
  }
  return Object.keys(obj).length === 0;
}

function consume(event) {
  const payload = event.data.payloadHex;
  const bytes = parseHexString(payload);
  const lifecycle = {};
  const count = {};
  const people = {};
  const peopleMax = {};
  const regionCount = {};
  const aFlow = {};
  const bFlow = {};
  const cFlow = {};
  const dFlow = {};
  const total = {};
  const dwellTime = {};

  for (let i = 0; i < bytes.length; ) {
    const channelId = bytes[i++];
    const channelType = bytes[i++];

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
      count.peopleCounterAll = bytes[i];
      count.regionCount = bytes[i + 1];
      const region = readUInt16BE(Array.from(bytes).slice(i + 2, i + 4));
      for (let idx = 0; idx < count.regionCount; idx++) {
        const tmp = `region${idx}`;
        count[tmp] = (region >> idx) & 1;
      }
      i += 4;
    }
    // PEOPLE IN/OUT
    else if (channelId === 0x05 && channelType === 0xcc) {
      people.in = readInt16LE(Array.from(bytes).slice(i, i + 2));
      people.out = readInt16LE(Array.from(bytes).slice(i + 2, i + 4));
      i += 4;
    }
    // PEOPLE MAX
    else if (channelId === 0x06 && channelType === 0xcd) {
      peopleMax.peopleMax = bytes[i];
      i += 1;
    }
    // REGION COUNTER
    else if (channelId === 0x07 && channelType === 0xd5) {
      regionCount.region1count = bytes[i];
      regionCount.region2count = bytes[i + 1];
      regionCount.region3count = bytes[i + 2];
      regionCount.region4count = bytes[i + 3];
      regionCount.region5count = bytes[i + 4];
      regionCount.region6count = bytes[i + 5];
      regionCount.region7count = bytes[i + 6];
      regionCount.region8count = bytes[i + 7];
      i += 8;
    }
    // REGION COUNTER
    else if (channelId === 0x08 && channelType === 0xd5) {
      regionCount.region9count = bytes[i];
      regionCount.region10count = bytes[i + 1];
      regionCount.region11count = bytes[i + 2];
      regionCount.region12count = bytes[i + 3];
      regionCount.region13count = bytes[i + 4];
      regionCount.region14count = bytes[i + 5];
      regionCount.region15count = bytes[i + 6];
      regionCount.region16count = bytes[i + 7];
      i += 8;
    }
    // A FLOW
    else if (channelId === 0x09 && channelType === 0xda) {
      aFlow.aToA = readUInt16LE(bytes.slice(i, i + 2));
      aFlow.aToB = readUInt16LE(bytes.slice(i + 2, i + 4));
      aFlow.aToC = readUInt16LE(bytes.slice(i + 4, i + 6));
      aFlow.aToD = readUInt16LE(bytes.slice(i + 6, i + 8));
      i += 8;
    }
    // B FLOW
    else if (channelId === 0x0a && channelType === 0xda) {
      bFlow.bToA = readUInt16LE(bytes.slice(i, i + 2));
      bFlow.bToB = readUInt16LE(bytes.slice(i + 2, i + 4));
      bFlow.bToC = readUInt16LE(bytes.slice(i + 4, i + 6));
      bFlow.bToD = readUInt16LE(bytes.slice(i + 6, i + 8));
      i += 8;
    }
    // C FLOW
    else if (channelId === 0x0b && channelType === 0xda) {
      cFlow.cToA = readUInt16LE(bytes.slice(i, i + 2));
      cFlow.cToB = readUInt16LE(bytes.slice(i + 2, i + 4));
      cFlow.cToC = readUInt16LE(bytes.slice(i + 4, i + 6));
      cFlow.cToD = readUInt16LE(bytes.slice(i + 6, i + 8));
      i += 8;
    }
    // D FLOW
    else if (channelId === 0x0c && channelType === 0xda) {
      dFlow.dToA = readUInt16LE(bytes.slice(i, i + 2));
      dFlow.dToB = readUInt16LE(bytes.slice(i + 2, i + 4));
      dFlow.dToC = readUInt16LE(bytes.slice(i + 4, i + 6));
      dFlow.dToD = readUInt16LE(bytes.slice(i + 6, i + 8));
      i += 8;
    }
    // TOTAL IN/OUT
    else if (channelId === 0x0d && channelType === 0xcc) {
      total.peopleTotalIn = readUInt16LE(bytes.slice(i, i + 2));
      total.peopleTotalOut = readUInt16LE(bytes.slice(i + 2, i + 4));
      i += 4;
    }
    // DWELL TIME
    else if (channelId === 0x0e && channelType === 0xe4) {
      const region = bytes[i];
      dwellTime[`region${region}AvgDwell`] = readUInt16LE(
        bytes.slice(i + 1, i + 3),
      );
      dwellTime[`region${region}MaxDwell`] = readUInt16LE(
        bytes.slice(i + 3, i + 5),
      );
      i += 5;
    } else {
      break;
    }
  }

  if (!isEmpty(lifecycle)) {
    emit("sample", { data: lifecycle, topic: "lifecycle" });
  }

  if (!isEmpty(count)) {
    emit("sample", { data: count, topic: "count" });
  }

  if (!isEmpty(people)) {
    emit("sample", { data: people, topic: "people" });
  }

  if (!isEmpty(peopleMax)) {
    emit("sample", { data: peopleMax, topic: "people_max" });
  }

  if (!isEmpty(regionCount)) {
    emit("sample", { data: regionCount, topic: "region_count" });
  }

  if (!isEmpty(aFlow)) {
    emit("sample", { data: aFlow, topic: "a_flow" });
  }

  if (!isEmpty(bFlow)) {
    emit("sample", { data: bFlow, topic: "b_flow" });
  }

  if (!isEmpty(cFlow)) {
    emit("sample", { data: cFlow, topic: "c_flow" });
  }

  if (!isEmpty(dFlow)) {
    emit("sample", { data: dFlow, topic: "d_flow" });
  }

  if (!isEmpty(total)) {
    emit("sample", { data: total, topic: "total" });
  }

  if (!isEmpty(dwellTime)) {
    emit("sample", { data: dwellTime, topic: "dwell_time" });
  }
}
