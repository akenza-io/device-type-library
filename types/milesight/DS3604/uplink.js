const RAW_VALUE = 0x00;

function fromUtf8Bytes(bytes) {
  return decodeURIComponent(
    bytes.map((ch) => `%${ch < 16 ? "0" : ""}${ch.toString(16)}`).join(""),
  );
}

function getValue(map, key) {
  if (RAW_VALUE) return key;

  let value = map[key];
  if (!value) value = "unknown";
  return value;
}

function readProtocolVersion(bytes) {
  const major = (bytes & 0xf0) >> 4;
  const minor = bytes & 0x0f;
  return `${major}.${minor}`;
}

function readHardwareVersion(bytes) {
  const major = bytes[0] & 0xff;
  const minor = (bytes[1] & 0xff) >> 4;
  return `${major}.${minor}`;
}

function readFirmwareVersion(bytes) {
  const major = bytes[0] & 0xff;
  const minor = bytes[1] & 0xff;
  return `${major}.${minor}`;
}

function readTslVersion(bytes) {
  const major = bytes[0] & 0xff;
  const minor = bytes[1] & 0xff;
  return `${major}.${minor}`;
}

function readSerialNumber(bytes) {
  const temp = [];
  for (let idx = 0; idx < bytes.length; idx++) {
    temp.push((`0${(bytes[idx] & 0xff).toString(16)}`).slice(-2));
  }
  return temp.join("");
}

function readBlockType(type) {
  const blockType = { 0: "TEXT", 1: "QRCODE", 2: "IMAGE", 3: "BATTERY_STATUS", 4: "CONNECTION_STATUS" };
  return getValue(blockType, type);
}

function readBorderType(type) {
  const borderTypeMap = { 0: "NO", 1: "YES" };
  return getValue(borderTypeMap, type);
}

function readHorizontal(type) {
  const horizontalMap = { 0: "LEFT", 1: "CENTER", 2: "RIGHT" };
  return getValue(horizontalMap, type);
}

function readVertical(type) {
  const verticalMap = { 0: "TOP", 1: "CENTER", 2: "BOTTOM" };
  return getValue(verticalMap, type);
}

function readColor(type) {
  const colorMap = { 0: "WHITE", 1: "BLACK", 2: "RED" };
  return getValue(colorMap, type);
}

function readFontType(type) {
  const fontTypeMap = { 1: "SONG", 2: "FANG", 3: "BLACK", 4: "KAI", 5: "FT_ASCII", 6: "DZ_ASCII", 7: "CH_ASCII", 8: "BX_ASCII", 9: "BZ_ASCII", 10: "FX_ASCII", 11: "GD_ASCII", 12: "HZ_ASCII", 13: "MS_ASCII", 14: "SX_ASCII", 15: "ZY_ASCII", 16: "TM_ASCII", 17: "YJ_LATIN", 18: "CYRILLIC", 19: "KSC5601", 20: "JIS0208_HT", 21: "ARABIC", 22: "THAI", 23: "GREEK", 24: "HEBREW" };
  return getValue(fontTypeMap, type);
}

function readWrapType(type) {
  const wrapMap = { 0: "DISABLE", 1: "ENABLE" };
  return getValue(wrapMap, type);
}

function readFontStyle(type) {
  const fontStyleMap = { 0: "NORMAL", 1: "BOLD" };
  return getValue(fontStyleMap, type);
}

/* eslint-disable */
function readUInt8(bytes) {
  return bytes & 0xff;
}

function readInt8(bytes) {
  var ref = readUInt8(bytes);
  return ref > 0x7f ? ref - 0x100 : ref;
}

function readUInt16LE(bytes) {
  var value = (bytes[1] << 8) + bytes[0];
  return value & 0xffff;
}

function readInt16LE(bytes) {
  var ref = readUInt16LE(bytes);
  return ref > 0x7fff ? ref - 0x10000 : ref;
}

function readBlockConfig(block_id, bytes) {
  const offset = 0;

  const templateConfig = {};
  templateConfig.enable = readEnableStatus(bytes[offset]);
  templateConfig.type = readBlockType(bytes[offset + 1]);
  templateConfig.startX = readUInt16LE(bytes.slice(offset + 2, offset + 4));
  templateConfig.startY = readUInt16LE(bytes.slice(offset + 4, offset + 6));
  templateConfig.endX = readUInt16LE(bytes.slice(offset + 6, offset + 8));
  templateConfig.endY = readUInt16LE(bytes.slice(offset + 8, offset + 10));
  templateConfig.border = readBorderType(bytes[offset + 10]);
  templateConfig.horizontal = readHorizontal(bytes[offset + 11]);
  templateConfig.vertical = readVertical(bytes[offset + 12]);
  templateConfig.background = readColor(bytes[offset + 13]);
  templateConfig.foreground = readColor(bytes[offset + 14]);
  // reserved 1 byte
  templateConfig.layer = readUInt8(bytes[offset + 16]);
  // reserved 4 bytes

  // text
  if (block_id < 10) {
    templateConfig.fontType = readFontType(bytes[offset + 21]);
    templateConfig.fontSize = readUInt8(bytes[offset + 22]);
    templateConfig.wrap = readWrapType(bytes[offset + 23]);
    templateConfig.fontStyle = readFontStyle(bytes[offset + 24]);
  }

  return templateConfig;
}

function handleDownlinkResponse(channelType, bytes, offset) {
  var decoded = {};

  switch (channelType) {
    case 0x03:
      decoded.reportInterval = readUInt16LE(bytes.slice(offset, offset + 2));
      offset += 2;
      break;
    case 0x10:
      decoded.reboot = readYesNoStatus(1);
      offset += 1;
      break;
    case 0x25:
      decoded.buttonEnable = readEnableStatus(bytes[offset]);
      offset += 1;
      break;
    case 0x27:
      var data = readUInt8(bytes[offset]);
      decoded.clearImage = {};
      decoded.clearImage.backgroundImage = readYesNoStatus((data >> 4) & 0x01);
      decoded.clearImage.logo1 = readYesNoStatus((data >> 5) & 0x01);
      decoded.clearImage.logo2 = readYesNoStatus((data >> 5) & 0x02);
      offset += 1;
      break;
    case 0x28:
      var data = readUInt8(bytes[offset]);
      if (data === 0x00) {
        decoded.reportBattery = readYesNoStatus(1);
      } else if (data === 0x01) {
        decoded.reportBuzzer = readYesNoStatus(1);
      } else if (data === 0x02) {
        decoded.reportCurrentTemplate = readYesNoStatus(1);
      } else if (data === 0x03) {
        decoded.reportCurrentDisplay = readYesNoStatus(1);
      }
      offset += 1;
      break;
    case 0x3e:
      decoded.buzzerEnable = readEnableStatus(bytes[offset]);
      offset += 1;
      break;
    case 0x3d:
      var data = readUInt8(bytes[offset]);
      if (data === 0x01) {
        decoded.beep = readYesNoStatus(1);
      } else if (data === 0x02) {
        decoded.refreshDisplay = readYesNoStatus(1);
      }
      offset += 1;
      break;
    case 0x66:
      decoded.buttonVisible = readButtonVisibleStatus(bytes[offset]);
      offset += 1;
      break;
    case 0x73:
      decoded.currentTemplateId = readUInt8(bytes[offset]) + 1;
      offset += 1;
      break;
    case 0x82:
      decoded.multicastConfig = readMulticastConfig(bytes[offset]);
      offset += 1;
      break;
    case 0x89:
      // skip 1 byte
      decoded.blockVisible = readBlockVisibleStatus(bytes.slice(offset + 1, offset + 3));
      offset += 3;
      break;
    case 0x90:
      decoded.switchTemplateButtonEnable = readEnableStatus(bytes[offset]);
      offset += 1;
      break;
    default:
      decoded.error = "UNKNOWN_DOWNLINK";
      offset = bytes.length;
  }

  return { data: decoded, offset: offset };
}

function isEmpty(obj) {
  if (obj === undefined) {
    return true;
  }
  return Object.keys(obj).length === 0;
}

function consume(event) {
  const payload = event.data.payloadHex;
  const bytes = Hex.hexToBytes(payload);

  const lifecycle = {};
  const template = {};
  const system = {};
  const button = {};
  const config = {};
  const update = {};
  const downlink = {};

  for (let i = 0; i < bytes.length;) {
    const channelId = bytes[i++];
    const channelType = bytes[i++];

    // IPSO VERSION
    if (channelId === 0xff && channelType === 0x01) {
      system.ipsoVersion = readProtocolVersion(bytes[i]);
      i += 1;
    }
    // HARDWARE VERSION
    else if (channelId === 0xff && channelType === 0x09) {
      system.hardwareVersion = readHardwareVersion(bytes.slice(i, i + 2));
      i += 2;
    }
    // FIRMWARE VERSION
    else if (channelId === 0xff && channelType === 0x0a) {
      system.firmwareVersion = readFirmwareVersion(bytes.slice(i, i + 2));
      i += 2;
    }
    // TSL VERSION
    else if (channelId === 0xff && channelType === 0xff) {
      system.tslVersion = readTslVersion(bytes.slice(i, i + 2));
      i += 2;
    }
    // SERIAL NUMBER
    else if (channelId === 0xff && channelType === 0x16) {
      system.sn = readSerialNumber(bytes.slice(i, i + 8));
      i += 8;
    }
    // LORAWAN CLASS TYPE
    else if (channelId === 0xff && channelType === 0x0f) {
      i += 1;
    }
    // RESET EVENT
    else if (channelId === 0xff && channelType === 0xfe) {
      system.resetEvent = "RESET";
      i += 1;
    }
    // DEVICE STATUS
    else if (channelId === 0xff && channelType === 0x0b) {
      system.deviceStatus = "ON";
      i += 1;
    }
    // BATTERY
    if (channelId === 0x01 && channelType === 0x75) {
      lifecycle.batteryLevel = bytes[i];
      i += 1;
    }
    // BUTTON
    else if (channelId === 0xff && channelType === 0x2e) {
      switch (bytes[i]) {
        case 0:
          button.button = "SINGLE_CLICK"
          button.buttonNumeric = 1;
          break;
        case 1:
          button.button = "DOUBLE_CLICK"
          button.buttonNumeric = 2;
          break;
        case 2:
          button.button = "SHORT_PRESS"
          button.buttonNumeric = 3;
          break;
        case 3:
          button.button = "LONG_PRESS"
          button.buttonNumeric = 4;
          break;
        default:
          break;
      }
      i += 1;
    }
    // TEMPLATE
    else if (channelId === 0xff && channelType === 0x73) {
      template.templateId = bytes[i] + 1;
      i += 1;
    }
    // TEMPLATE BLOCK CHANNEL DATA
    else if (channelId === 0xfb && channelType === 0x01) {
      const templateId = (bytes[i] >> 6) + 1;
      const blockId = bytes[i++] & 0x3f;
      if (blockId < 10) {
        const blockName = `text${blockId + 1}`;
        const blockLength = bytes[i++];
        template[blockName] = fromUtf8Bytes(bytes.slice(i, i + blockLength));
        i += blockLength;
      } else if (blockId === 10) {
        const blockName = "qrCode";
        const blockLength = bytes[i++];
        template[blockName] = fromUtf8Bytes(bytes.slice(i, i + blockLength));
        i += blockLength;
      }
      template.templateId = templateId;
    }
    // IMAGE DATA
    else if (channelId === 0xfb && channelType === 0x02) {
      // No decoding at the moment
      break;
    }
    // TEMPLATE CONFIG
    else if (channelId === 0xfb && channelType === 0x03) {
      const data = bytes[i];
      const dataLength = bytes[i + 1];

      const templateId = (data >> 6) + 1;
      const blockId = data & 0x3f;
      const templateName = `template${templateId}config`;
      const blockOffset = { 0: "text1", 1: "text2", 2: "text3", 3: "text4", 4: "text5", 5: "text6", 6: "text7", 7: "text8", 8: "text9", 9: "text10", 10: "qrcode", 11: "image1", 12: "image2", 13: "batteryStatus", 14: "connectStatus" };
      const blockName = blockOffset[blockId];

      config[templateName] = decoded[templateName] || {};
      config[templateName][blockName] = readBlockConfig(blockId, bytes.slice(i + 2, i + 2 + dataLength));
      i += dataLength;
    }
    // UPDATE CONTENT RESULT
    else if (channelId === 0xfa && channelType === 0x01) {
      var data = readUInt8(bytes[i]);
      var templateId = (data >> 6) + 1;
      var blockId = data & 0x3f;

      var templateName = `template${templateId}`;
      var blockName;
      if (blockId < 10) {
        blockName = `text${blockId + 1}`;
      } else if (blockId == 10) {
        blockName = "qrcode";
      }

      const updateContentResult = {};
      updateContentResult.templateId = templateId;
      updateContentResult.blockId = blockId;
      updateContentResult.blockName = blockName;
      updateContentResult.result = readResultType(readUInt8(bytes[i + 1]));
      i += 2;

      update.updateContentResult = decoded.updateContentResult || [];
      update.updateContentResult.push(updateContentResult);
    }
    // UPDATE IMAGE RESULT
    else if (channelId === 0xfa && channelType === 0x02) {
      var data = readUInt8(bytes[i]);
      var templateId = (data >> 6) + 1;
      var blockId = data & 0x3f;

      var templateName = `template${templateId}`;
      const imageName = `image${blockId}`;
      const dataFrame = bytes[i + 1];

      const receiveImageDataResult = {};
      receiveImageDataResult.templateId = templateId;
      receiveImageDataResult.blockId = blockId;
      receiveImageDataResult.blockName = imageName;
      receiveImageDataResult.dataFrame = dataFrame;
      i += 2;

      update.receiveImageDataResult = decoded.receiveImageDataResult || [];
      update.receiveImageDataResult.push(receiveImageDataResult);
    }
    // UPDATE TEMPLATE RESULT
    else if (channelId === 0xfa && channelType === 0x03) {
      var data = readUInt8(bytes[i]);
      var templateId = (data >> 6) + 1;
      var blockId = data & 0x3f;

      var templateName = `template${templateId}`;
      const blockNameOffset = { 0: "text1", 1: "text2", 2: "text3", 3: "text4", 4: "text5", 5: "text6", 6: "text7", 7: "text8", 8: "text9", 9: "text10", 10: "qrcode", 11: "image1", 12: "image2", 13: "batteryStatus", 14: "connectStatus" };
      var blockName = blockNameOffset[blockId];

      const updateTemplateResult = {};
      updateTemplateResult.templateId = templateId;
      updateTemplateResult.blockId = blockId;
      updateTemplateResult.blockName = blockName;
      updateTemplateResult.result = readResultType(readUInt8(bytes[i + 1]));
      i += 2;

      update.updateTemplateResult = decoded.updateTemplateResult || [];
      update.updateTemplateResult.push(updateTemplateResult);
    }
    // DOWNLINK RESPONSE // TODO rewrite this
    else if (channelId === 0xfe || channelId === 0xff) {
      const result = handleDownlinkResponse(channelType, bytes, i);
      downlink = Object.assign(downlink, result.data);
      i = result.offset;
    } else {
      break;
    }
  }

  if (!isEmpty(lifecycle)) {
    emit("sample", { data: lifecycle, topic: "lifecycle" });
  }

  if (!isEmpty(template)) {
    emit("sample", { data: template, topic: "template" });
  }

  if (!isEmpty(system)) {
    emit("sample", { data: system, topic: "system" });
  }

  if (!isEmpty(button)) {
    emit("sample", { data: button, topic: "button" });
  }

  if (!isEmpty(config)) {
    emit("sample", { data: config, topic: "config" });
  }

  if (!isEmpty(update)) {
    emit("sample", { data: update, topic: "update" });
  }

  if (!isEmpty(downlink)) {
    emit("sample", { data: downlink, topic: "downlink_response" });
  }
}
