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

function readUInt8(bytes) {
  return bytes & 0xff;
}

function includes(datas, value) {
  const size = datas.length;
  for (let i = 0; i < size; i++) {
    if (datas[i] === value) {
      return true;
    }
  }
  return false;
}

function isEmpty(obj) {
  return Object.keys(obj).length === 0;
}

const totalInChns = [0x03, 0x06, 0x09, 0x0c];
const totalOutChns = [0x04, 0x07, 0x0a, 0x0d];
const periodChns = [0x05, 0x08, 0x0b, 0x0e];

function consume(event) {
  const payload = event.data.payloadHex;
  const bytes = Hex.hexToBytes(payload);
  const decoded = {};

  for (let i = 0; i < bytes.length; ) {
    const channelId = bytes[i++];
    const channelType = bytes[i++];

    // LINE TOTAL IN
    if (includes(totalInChns, channelId) && channelType === 0xd2) {
      const channelInName = `line_${(channelId - totalInChns[0]) / 3 + 1}`;
      decoded[channelInName] = decoded[channelInName] || {};
      decoded[channelInName].totalCounterIn = readUInt32LE(
        bytes.slice(i, i + 4),
      );
      i += 4;
    }
    // LINE TOTAL OUT
    else if (includes(totalOutChns, channelId) && channelType === 0xd2) {
      const channelOutName = `line_${(channelId - totalOutChns[0]) / 3 + 1}`;
      decoded[channelOutName] = decoded[channelOutName] || {};
      decoded[channelOutName].totalCounterOut = readUInt32LE(
        bytes.slice(i, i + 4),
      );
      i += 4;
    }
    // LINE PERIOD
    else if (includes(periodChns, channelId) && channelType === 0xcc) {
      const channelPeriodName = `line_${(channelId - periodChns[0]) / 3 + 1}`;
      decoded[channelPeriodName] = decoded[channelPeriodName] || {};
      decoded[channelPeriodName].periodicCounterIn = readUInt16LE(
        bytes.slice(i, i + 2),
      );
      decoded[channelPeriodName].periodicCounterOut = readUInt16LE(
        bytes.slice(i + 2, i + 4),
      );
      i += 4;
    } // REGION COUNT
    else if (channelId === 0x0f && channelType === 0xe3) {
      decoded.regionCount = decoded.regionCount || {};
      decoded.regionCount.region1count = readUInt8(bytes[i]);
      decoded.regionCount.region2count = readUInt8(bytes[i + 1]);
      decoded.regionCount.region3count = readUInt8(bytes[i + 2]);
      decoded.regionCount.region4count = readUInt8(bytes[i + 3]);
      i += 4;
    }
    // REGION DWELL TIME
    else if (channelId === 0x10 && channelType === 0xe4) {
      decoded.dwellTime = decoded.dwellTime || {};
      const dwellChannelName = `region${bytes[i]}`;
      decoded.dwellTime[`${dwellChannelName}avgDwell`] = readUInt16LE(
        bytes.slice(i + 1, i + 3),
      );
      decoded.dwellTime[`${dwellChannelName}maxDwell`] = readUInt16LE(
        bytes.slice(i + 3, i + 5),
      );
      i += 5;
    } else {
      break;
    }
  }

  if (decoded.regionCount !== undefined && !isEmpty(decoded.regionCount)) {
    emit("sample", { data: decoded.regionCount, topic: "region_count" });
  }

  if (decoded.dwellTime !== undefined && !isEmpty(decoded.dwellTime)) {
    emit("sample", { data: decoded.dwellTime, topic: "dwell_time" });
  }

  if (decoded.line_1 !== undefined && !isEmpty(decoded.line_1)) {
    emit("sample", { data: decoded.line_1, topic: "line_1" });
  }

  if (decoded.line_2 !== undefined && !isEmpty(decoded.line_2)) {
    emit("sample", { data: decoded.line_2, topic: "line_2" });
  }

  if (decoded.line_3 !== undefined && !isEmpty(decoded.line_3)) {
    emit("sample", { data: decoded.line_3, topic: "line_3" });
  }

  if (decoded.line_4 !== undefined && !isEmpty(decoded.line_4)) {
    emit("sample", { data: decoded.line_4, topic: "line_4" });
  }
}
