// Parse Hex Byte Array
function parseHexString(str) {
  const result = [];
  while (str.length >= 2) {
    result.push(parseInt(str.substring(0, 2), 16));
    str = str.substring(2, str.length);
  }
  return result;
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
      i++;
    }
    // POWER ON
    else if (channelId === 0xff && channelType === 0x0b) {
      lifecycle.powerOn = true;
      i++;
    }
    // PROTOCOL VERSION
    else if (channelId === 0xff && channelType === 0x01) {
      lifecycle.protocolVersion = bytes[i];
      i++;
    }
    // DEVICE SN
    else if (channelId === 0xff && channelType === 0x16) {
      lifecycle.serialNumber = payload.substr(i * 2, 16);
      i += 8;
    }
    // HARDWARE VERSION
    else if (channelId === 0xff && channelType === 0x09) {
      lifecycle.hardwareVersion = `${bytes[i]}.${bytes[++i]}`;
      i++;
    }
    // SOFTWARE VERSION
    else if (channelId === 0xff && channelType === 0x0a) {
      lifecycle.softwareVersion = `${bytes[i]}.${bytes[++i]}`;
      i++;
    }
    // PRESS STATE
    else if (channelId === 0xff && channelType === 0x34) {
      data.buttonNumber = bytes[i];
      data.command = Hex.hexLittleEndianToBigEndian(payload.substr(++i * 2, 4), false);
      i += 1;
    } else {
      break;
    }
  }

  if (!isEmpty(lifecycle)) {
    emit("sample", { data: lifecycle, topic: "lifecycle" });
  }

  if (!isEmpty(data)) {
    emit("sample", { data, topic: "button_pressed" });
  }
}
