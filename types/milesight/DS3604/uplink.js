function fromUtf8Bytes(bytes) {
  return decodeURIComponent(
    bytes.map((ch) => `%${ch < 16 ? "0" : ""}${ch.toString(16)}`).join(""),
  );
}

function isEmpty(obj) {
  return Object.keys(obj).length === 0;
}

function consume(event) {
  const payload = event.data.payloadHex;
  const bytes = Hex.hexToBytes(payload);

  const decoded = {};
  const lifecycle = {};

  for (let i = 0; i < bytes.length; ) {
    const channelId = bytes[i++];
    const channelType = bytes[i++];

    // BATTERY
    if (channelId === 0x01 && channelType === 0x75) {
      lifecycle.batteryLevel = bytes[i];
      i += 1;
    }
    // TEMPLATE
    else if (channelId === 0xff && channelType === 0x73) {
      decoded.templateId = bytes[i] + 1;
      i += 1;
    }
    // TEMPLATE BLOCK CHANNEL DATA
    else if (channelId === 0xfb && channelType === 0x01) {
      const templateId = (bytes[i] >> 6) + 1;
      const blockId = bytes[i++] & 0x3f;
      if (blockId < 10) {
        const blockName = `text${blockId + 1}`;
        const blockLength = bytes[i++];
        decoded[blockName] = fromUtf8Bytes(bytes.slice(i, i + blockLength));
        i += blockLength;
      } else if (blockId === 10) {
        const blockName = "qrCode";
        const blockLength = bytes[i++];
        decoded[blockName] = fromUtf8Bytes(bytes.slice(i, i + blockLength));
        i += blockLength;
      }
      decoded.templateId = templateId;
    } else {
      break;
    }
  }

  if (!isEmpty(decoded)) {
    emit("sample", { data: decoded, topic: "default" });
  }

  if (!isEmpty(lifecycle)) {
    emit("sample", { data: lifecycle, topic: "lifecycle" });
  }
}
