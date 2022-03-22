// Parse Hex Byte Array
function parseHexString(str) {
  const result = [];
  while (str.length >= 2) {
    result.push(parseInt(str.substring(0, 2), 16));
    str = str.substring(2, str.length);
  }
  return result;
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
    // DOOR / WINDOW STATE
    else if (channelId === 0x03 && channelType === 0x00) {
      data.open = !!bytes[i];
      i += 1;
    }
    //
    else if (channelId === 0x04 && channelType === 0x00) {
      data.install = !bytes[i];
      i += 1;
    } else {
      break;
    }
  }

  emit("sample", { data: lifecycle, topic: "lifecycle" });
  emit("sample", { data, topic: "button_pressed" });
}
