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
    // PIR
    else if (channelId === 0x03 && channelType === 0x00) {
      data.pir = Number(bytes[i]);
      i += 1;
    }
    // DAYLIGHT
    else if (channelId === 0x04 && channelType === 0x00) {
      data.daylight = bytes[i] === 0 ? "DARK" : "LIGHT";
      i += 1;
    } else {
      break;
    }
  }

  emit("sample", { data: lifecycle, topic: "lifecycle" });
  emit("sample", { data, topic: "button_pressed" });
}
