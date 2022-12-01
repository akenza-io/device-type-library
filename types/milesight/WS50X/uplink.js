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

  const decoded = {};

  for (let i = 0; i < bytes.length; ) {
    const channelId = bytes[i++];
    const channelType = bytes[i++];

    // SWITCH STATE
    if (channelId === 0xff && channelType === 0x29) {
      decoded.switch1 = (bytes[i] & 1) === 1 ? "OPEN" : "CLOSE";
      decoded.switch1change = ((bytes[i] >> 4) & 1) === 1;

      decoded.switch2 = ((bytes[i] >> 1) & 1) === 1 ? "OPEN" : "CLOSE";
      decoded.switch2change = ((bytes[i] >> 5) & 1) === 1;

      decoded.switch3 = ((bytes[i] >> 2) & 1) === 1 ? "OPEN" : "CLOSE";
      decoded.switch3change = ((bytes[i] >> 6) & 1) === 1;
      emit("sample", { data: decoded, topic: "default" });
      i += 1;
    } else {
      break;
    }
  }
}
