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
      decoded[channelInName].total_in = readUInt32LE(bytes.slice(i, i + 4));
      i += 4;
    }
    // LINE TOTAL OUT
    else if (includes(totalOutChns, channelId) && channelType === 0xd2) {
      const channelOutName = `line_${(channelId - totalOutChns[0]) / 3 + 1}`;
      decoded[channelOutName] = decoded[channelOutName] || {};
      decoded[channelOutName].total_out = readUInt32LE(bytes.slice(i, i + 4));
      i += 4;
    }
    // LINE PERIOD
    else if (includes(periodChns, channelId) && channelType === 0xcc) {
      const channelPeriodName = `line_${(channelId - periodChns[0]) / 3 + 1}`;
      decoded[channelPeriodName] = decoded[channelPeriodName] || {};
      decoded[channelPeriodName].period_in = readUInt16LE(
        bytes.slice(i, i + 2),
      );
      decoded[channelPeriodName].period_out = readUInt16LE(
        bytes.slice(i + 2, i + 4),
      );
      i += 4;
    } else {
      break;
    }
  }

  Object.keys(decoded).forEach((key) => {
    console.log(key, obj[key]);
  });

  if (!isEmpty(decoded)) {
    emit("sample", { data: decoded, topic: "default" });
  }
}
