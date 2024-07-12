function readUInt8LE(bytes) {
  return bytes & 0xff;
}

function readInt8LE(bytes) {
  const ref = readUInt8LE(bytes);
  return ref > 0x7f ? ref - 0x100 : ref;
}

function readUInt16LE(bytes) {
  const value = (bytes[1] << 8) + bytes[0];
  return value & 0xffff;
}

function readInt16LE(bytes) {
  const ref = readUInt16LE(bytes);
  return ref > 0x7fff ? ref - 0x10000 : ref;
}

function readUInt32LE(bytes) {
  const value =
    (bytes[3] << 24) + (bytes[2] << 16) + (bytes[1] << 8) + bytes[0];
  return value & 0xffffffff;
}

function readInt32LE(bytes) {
  const ref = readUInt32LE(bytes);
  return ref > 0x7fffffff ? ref - 0x100000000 : ref;
}

function readFloatLE(bytes) {
  // JavaScript bitwise operators yield a 32 bits integer, not a float.
  // Assume LSB (least significant byte first).
  const bits = (bytes[3] << 24) | (bytes[2] << 16) | (bytes[1] << 8) | bytes[0];
  const sign = bits >>> 31 === 0 ? 1.0 : -1.0;
  const e = (bits >>> 23) & 0xff;
  const m = e === 0 ? (bits & 0x7fffff) << 1 : (bits & 0x7fffff) | 0x800000;
  const f = sign * m * Math.pow(2, e - 150);
  return f;
}
function isEmpty(obj) {
  if (obj === undefined) {
    return true;
  }
  return Object.keys(obj).length === 0;
}

const gpioInChns = [0x03, 0x04, 0x05, 0x06];
const gpioOutChns = [0x07, 0x08];
const pt100Chns = [0x09, 0x0a];
const aiChns = [0x0b, 0x0c];
const avChns = [0x0d, 0x0e];

function consume(event) {
  const payload = event.data.payloadHex;
  const bytes = Hex.hexToBytes(payload);

  const adc = {};
  const error = {};
  const gpio = {};
  const modbus = {};
  const temperature = {};

  for (let i = 0; i < bytes.length; ) {
    const channelId = bytes[i++];
    const channelType = bytes[i++];

    // GPIO Input
    if (gpioInChns.includes(channelId) && channelType === 0x00) {
      const id = channelId - gpioInChns[0] + 1;
      gpio[`gpioIn${id}`] = bytes[i] === 0 ? "OFF" : "ON";
      i += 1;
    }
    // GPIO Output
    else if (gpioOutChns.includes(channelId) && channelType === 0x01) {
      const id = channelId - gpioOutChns[0] + 1;
      gpio[`gpioOut${id}`] = bytes[i] === 0 ? "OFF" : "ON";
      i += 1;
    }
    // GPIO AS counter
    else if (gpioInChns.includes(channelId) && channelType === 0xc8) {
      const id = channelId - gpioInChns[0] + 1;
      gpio[`counter${id}`] = readUInt32LE(bytes.slice(i, i + 4));
      i += 4;
    }
    // PT100
    else if (pt100Chns.includes(channelId) && channelType === 0x67) {
      const id = channelId - pt100Chns[0] + 1;
      temperature[`temperature${id}`] = readInt16LE(bytes.slice(i, i + 2)) / 10;
      i += 2;
    }
    // ADC CHANNEL
    else if (aiChns.includes(channelId) && channelType === 0x02) {
      const id = channelId - aiChns[0] + 1;
      adc[`adc${id}`] = readUInt32LE(bytes.slice(i, i + 2)) / 100;
      i += 4;
    }
    // ADC CHANNEL for voltage
    else if (avChns.includes(channelId) && channelType === 0x02) {
      const id = channelId - avChns[0] + 1;
      adc[`adv${id}`] = readUInt32LE(bytes.slice(i, i + 2)) / 100;
      i += 4;
    }
    // MODBUS
    else if (channelId === 0xff && channelType === 0x19) {
      const modbusChnId = bytes[i++] + 1;
      const dataLength = bytes[i++];
      const dataType = bytes[i++];
      const chn = `chn${modbusChnId}`;
      switch (dataType) {
        case 0:
          modbus[chn] = bytes[i] ? "ON" : "OFF";
          i += 1;
          break;
        case 1:
          modbus[chn] = bytes[i];
          i += 1;
          break;
        case 2:
        case 3:
          modbus[chn] = readUInt16LE(bytes.slice(i, i + 2));
          i += 2;
          break;
        case 4:
        case 6:
        case 8:
        case 9:
        case 10:
        case 11:
          modbus[chn] = readUInt32LE(bytes.slice(i, i + 4));
          i += 4;
          break;
        case 5:
        case 7:
          modbus[chn] = readFloatLE(bytes.slice(i, i + 4));
          i += 4;
          break;
        default:
          break;
      }
    }
    // MODBUS READ ERROR
    else if (channelId === 0xff && channelType === 0x15) {
      const modbusChnId = bytes[i] + 1;
      const channelName = `channel${modbusChnId}error`;
      error[channelName] = true;
      i += 1;
    } else {
      break;
    }
  }

  if (!isEmpty(adc)) {
    emit("sample", { data: adc, topic: "adc" });
  }
  if (!isEmpty(error)) {
    emit("sample", { data: error, topic: "error" });
  }
  if (!isEmpty(gpio)) {
    emit("sample", { data: gpio, topic: "gpio" });
  }
  if (!isEmpty(modbus)) {
    emit("sample", { data: modbus, topic: "modbus" });
  }
  if (!isEmpty(temperature)) {
    emit("sample", { data: temperature, topic: "temperature" });
  }
}
