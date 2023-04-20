// Parse Hex Byte Array
function parseHexString(str) {
  const result = [];
  while (str.length >= 2) {
    result.push(parseInt(str.substring(0, 2), 16));
    str = str.substring(2, str.length);
  }
  return result;
}

function readFrequecyWeightType(bytes) {
  let type = "";

  const bits = bytes & 0x03;
  switch (bits) {
    case 0:
      type = "Z";
      break;
    case 1:
      type = "A";
      break;
    case 2:
      type = "C";
      break;
    default:
      break;
  }

  return type;
}

function readTimeWeightType(bytes) {
  let type = "";

  const bits = (bytes[0] >> 2) & 0x03;
  switch (bits) {
    case 0:
      type = "IMPULSE";
      break;
    case 1:
      type = "FAST";
      break;
    case 2:
      type = "SLOW";
      break;
    default:
      break;
  }

  return type;
}

function readUInt16LE(bytes) {
  const value = (bytes[1] << 8) + bytes[0];
  return value & 0xffff;
}

function isEmpty(obj) {
  return Object.keys(obj).length === 0;
}

function consume(event) {
  const payload = event.data.payloadHex;
  const bytes = parseHexString(payload);

  const data = {};
  const lifecycle = {};

  for (let i = 0; i < bytes.length; ) {
    const channelId = bytes[i++];
    const channelType = bytes[i++];
    // BATTERY
    if (channelId === 0x01 && channelType === 0x75) {
      lifecycle.batteryLevel = bytes[i];
      i += 1;
    }
    // SOUND
    else if (channelId === 0x05 && channelType === 0x5b) {
      data.freqWeight = readFrequecyWeightType(bytes[i]);
      data.timeWeight = readTimeWeightType(bytes[i]);
      data.la = readUInt16LE(Array.from(bytes).slice(i + 1, i + 3)) / 10;
      data.laeq = readUInt16LE(Array.from(bytes).slice(i + 3, i + 5)) / 10;
      data.lamax = readUInt16LE(Array.from(bytes).slice(i + 5, i + 7)) / 10;
      i += 7;
    }
    // LoRaWAN Class Type
    else if (channelId === 0xff && channelType === 0x0f) {
      i += 1;
      break;
    } else {
      break;
    }
  }

  if (!isEmpty(lifecycle)) {
    emit("sample", { data: lifecycle, topic: "lifecycle" });
  }

  if (!isEmpty(data)) {
    emit("sample", { data, topic: "default" });
  }
}
