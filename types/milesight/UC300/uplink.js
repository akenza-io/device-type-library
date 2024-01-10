// refer to: https://github.com/Milesight-IoT/SensorDecoders/blob/main/UC_Series/UC300/UC300_TTN.js

function numToBits(num, bitCount) {
  const bits = [];
  for (let i = 0; i < bitCount; i++) {
    bits.push((num >> i) & 1);
  }
  return bits;
}

function readUInt8(bytes) {
  return bytes & 0xff;
}

function readInt8(bytes) {
  const ref = readUInt8(bytes);
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
  return (value & 0xffffffff) >>> 0;
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

  const n = Number(f.toFixed(2));
  return n;
}

function readFloat16LE(bytes) {
  const bits = (bytes[1] << 8) | bytes[0];
  const sign = bits >>> 15 === 0 ? 1.0 : -1.0;
  const e = (bits >>> 10) & 0x1f;
  const m = e === 0 ? (bits & 0x3ff) << 1 : (bits & 0x3ff) | 0x400;
  const f = sign * m * Math.pow(2, e - 25);

  const n = Number(f.toFixed(2));
  return n;
}

function readAscii(bytes) {
  let str = "";
  for (let i = 0; i < bytes.length; i++) {
    str += String.fromCharCode(bytes[i]);
  }
  return str;
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

function readHardwareVersion(bytes) {
  const major = bytes[0] & 0xff;
  const minor = (bytes[1] & 0xff) >> 4;
  return `v${major}.${minor}`;
}

function readFirmwareVersion(bytes) {
  const major = bytes[0] & 0xff;
  const minor = bytes[1] & 0xff;
  return `v${major}.${minor}`;
}

function readSerialNumber(bytes) {
  const temp = [];
  for (let idx = 0; idx < bytes.length; idx++) {
    temp.push(`0${(bytes[idx] & 0xff).toString(16)}`.slice(-2));
  }
  return temp.join("");
}

const gpio_in_chns = [0x03, 0x04, 0x05, 0x06];
const gpio_out_chns = [0x07, 0x08];
const pt100_chns = [0x09, 0x0a];
const ai_chns = [0x0b, 0x0c];
const av_chns = [0x0d, 0x0e];

function isEmpty(obj) {
  return Object.keys(obj).length === 0;
}

function consume(event) {
  const payload = event.data.payloadHex;
  const bytes = Hex.hexToBytes(payload);
  const decoded = {};
  const lifecycle = {};
  let topic = "default";

  for (let i = 0; i < bytes.length; ) {
    const channelId = bytes[i++];
    const channelType = bytes[i++];

    // PROTOCOL VESION
    if (channelId === 0xff && channelType === 0x01) {
      lifecycle.protocolVersion = bytes[i];
      i += 1;
    }
    // POWER ON
    else if (channelId === 0xff && channelType === 0x0b) {
      lifecycle.power = "on";
      i += 1;
    }
    // SERIAL NUMBER
    else if (channelId === 0xff && channelType === 0x16) {
      lifecycle.sn = readSerialNumber(bytes.slice(i, i + 8));
      i += 8;
    }
    // HARDWARE VERSION
    else if (channelId === 0xff && channelType === 0x09) {
      lifecycle.hardwareVersion = readHardwareVersion(bytes.slice(i, i + 2));
      i += 2;
    }
    // FIRMWARE VERSION
    else if (channelId === 0xff && channelType === 0x0a) {
      lifecycle.firmwareVersion = readFirmwareVersion(bytes.slice(i, i + 2));
      i += 2;
    }
    // GPIO INPUT
    else if (includes(gpio_in_chns, channelId) && channelType === 0x00) {
      const id = channelId - gpio_in_chns[0] + 1;
      const gpioInName = `gpioIn${id}`;
      decoded[gpioInName] = bytes[i] === 0 ? "off" : "on";
      topic = "gpio";
      i += 1;
    }
    // GPIO OUTPUT
    else if (includes(gpio_out_chns, channelId) && channelType === 0x01) {
      const id = channelId - gpio_out_chns[0] + 1;
      const gpioOutName = `gpioOut${id}`;
      decoded[gpioOutName] = bytes[i] === 0 ? "off" : "on";
      topic = "gpio";
      i += 1;
    }
    // GPIO AS COUNTER
    else if (includes(gpio_in_chns, channelId) && channelType === 0xc8) {
      const id = channelId - gpio_in_chns[0] + 1;
      const counterName = `counter${id}`;
      decoded[counterName] = readUInt32LE(bytes.slice(i, i + 4));
      topic = "gpio";
      i += 4;
    }
    // PT100
    else if (includes(pt100_chns, channelId) && channelType === 0x67) {
      const id = channelId - pt100_chns[0] + 1;
      const pt100Name = `temperature${id}`;
      decoded[pt100Name] = readInt16LE(bytes.slice(i, i + 2)) / 10;
      i += 2;
      topic = "temperature";
    }
    // ADC CHANNEL
    else if (includes(ai_chns, channelId) && channelType === 0x02) {
      const id = channelId - ai_chns[0] + 1;
      const adcName = `adc${id}`;
      decoded[adcName] = readUInt32LE(bytes.slice(i, i + 4)) / 100;
      i += 4;
      topic = "adc";
    }
    // ADC CHANNEL FOR VOLTAGE
    else if (includes(av_chns, channelId) && channelType === 0x02) {
      const id = channelId - av_chns[0] + 1;
      const adv_name = `adv${id}`;
      decoded[adv_name] = readUInt32LE(bytes.slice(i, i + 4)) / 100;
      i += 4;
      topic = "adc";
    }
    // MODBUS
    else if (channelId === 0xff && channelType === 0x19) {
      const modbus_chn_id = bytes[i++] + 1;
      const data_length = bytes[i++];
      const data_type = bytes[i++];
      const sign = (data_type >>> 7) & 0x01;
      const type = data_type & 0x7f; // 0b01111111
      const chn = `chn${modbus_chn_id}`;
      topic = "modbus";
      switch (type) {
        case 0:
          decoded[chn] = bytes[i] ? "on" : "off";
          i += 1;
          break;
        case 1:
          decoded[chn] = sign
            ? readInt8(bytes.slice(i, i + 1))
            : readUInt8(bytes.slice(i, i + 1));
          i += 1;
          break;
        case 2:
        case 3:
          decoded[chn] = sign
            ? readInt16LE(bytes.slice(i, i + 2))
            : readUInt16LE(bytes.slice(i, i + 2));
          i += 2;
          break;
        case 4:
        case 6:
          decoded[chn] = sign
            ? readInt32LE(bytes.slice(i, i + 4))
            : readUInt32LE(bytes.slice(i, i + 4));
          i += 4;
          break;
        case 8:
        case 10:
          decoded[chn] = sign
            ? readInt16LE(bytes.slice(i, i + 2))
            : readUInt16LE(bytes.slice(i, i + 2));
          i += 4;
          break;
        case 9:
        case 11:
          decoded[chn] = sign
            ? readInt16LE(bytes.slice(i + 2, i + 4))
            : readUInt16LE(bytes.slice(i + 2, i + 4));
          i += 4;
          break;
        case 5:
        case 7:
          decoded[chn] = readFloatLE(bytes.slice(i, i + 4));
          i += 4;
          break;
        default:
          break;
      }
    }
    // MODBUS READ ERROR
    else if (channelId === 0xff && channelType === 0x15) {
      const modbus_chn_id = bytes[i] + 1;
      const channel_name = `channel${modbus_chn_id}error`;
      decoded[channel_name] = "read error";
      topic = "error";
      i += 1;
    }
    // ANALOG INPUT STATISTICS
    else if (includes(ai_chns, channelId) && channelType === 0xe2) {
      const id = channelId - ai_chns[0] + 1;
      const adcName = `adc${id}`;
      decoded[adcName] = readFloat16LE(bytes.slice(i, i + 2));
      decoded[`${adcName}Max`] = readFloat16LE(bytes.slice(i + 2, i + 4));
      decoded[`${adcName}Min`] = readFloat16LE(bytes.slice(i + 4, i + 6));
      decoded[`${adcName}Avg`] = readFloat16LE(bytes.slice(i + 6, i + 8));
      topic = "adc_statistics";
      i += 8;
    }
    // ANALOG VOLTAGE STATISTICS
    else if (includes(av_chns, channelId) && channelType === 0xe2) {
      const id = channelId - av_chns[0] + 1;
      const adcName = `adv${id}`;
      decoded[adcName] = readFloat16LE(bytes.slice(i, i + 2));
      decoded[`${adcName}Max`] = readFloat16LE(bytes.slice(i + 2, i + 4));
      decoded[`${adcName}Min`] = readFloat16LE(bytes.slice(i + 4, i + 6));
      decoded[`${adcName}Avg`] = readFloat16LE(bytes.slice(i + 6, i + 8));
      topic = "adv_statistics";
      i += 8;
    }
    // PT100 ARGS
    else if (includes(pt100_chns, channelId) && channelType === 0xe2) {
      const ptChnId = channelId - pt100_chns[0] + 1;
      const pt100Name = `pt100${ptChnId}`;
      decoded[pt100Name] = readFloat16LE(bytes.slice(i, i + 2));
      decoded[`${pt100Name}Max`] = readFloat16LE(bytes.slice(i + 2, i + 4));
      decoded[`${pt100Name}Min`] = readFloat16LE(bytes.slice(i + 4, i + 6));
      decoded[`${pt100Name}Avg`] = readFloat16LE(bytes.slice(i + 6, i + 8));
      topic = "pt100_args";
      i += 8;
    }
    // CHANNEL HISTORICAL DATA
    else if (channelId === 0x20 && channelType === 0xdc) {
      const timestamp = readUInt32LE(bytes.slice(i, i + 4));
      topic = "channel_history";
      const channel_mask = numToBits(
        readUInt16LE(bytes.slice(i + 4, i + 6)),
        16,
      );
      i += 6;

      const data = { timestamp };
      for (let j = 0; j < channel_mask.length; j++) {
        // SKIP UNUSED CHANNELS
        if (channel_mask[j] !== 1) continue;

        // GPIO INPUT
        if (j < 4) {
          const type = bytes[i++];
          // AS GPIO INPUT
          if (type === 0) {
            const name = `gpioIn${j + 1}`;
            data[name] =
              readUInt32LE(bytes.slice(i, i + 4)) === 0 ? "off" : "on";
            i += 4;
          }
          // AS COUNTER
          else {
            const name = `counter${j + 1}`;
            data[name] = readUInt32LE(bytes.slice(i, i + 4));
            i += 4;
          }
        }
        // GPIO OUTPUT
        else if (j < 6) {
          const name = `gpioOut${j - 4 + 1}`;
          data[name] = bytes[i] ? "on" : "off";
          i += 1;
        }
        // PT100
        else if (j < 8) {
          const name = `temperature${j - 6 + 1}`;
          data[name] = readFloat16LE(bytes.slice(i, i + 2));
          i += 2;
        }
        // ADC
        else if (j < 10) {
          const name = `adc${j - 8 + 1}`;
          data[name] = readFloat16LE(bytes.slice(i, i + 2));
          data[`${name}Max`] = readFloat16LE(bytes.slice(i + 2, i + 4));
          data[`${name}Min`] = readFloat16LE(bytes.slice(i + 4, i + 6));
          data[`${name}Avg`] = readFloat16LE(bytes.slice(i + 6, i + 8));
          i += 8;
        }
        // ADV
        else if (j < 12) {
          const name = `adv${j - 10 + 1}`;
          data[name] = readFloat16LE(bytes.slice(i, i + 2));
          data[`${name}Max`] = readFloat16LE(bytes.slice(i + 2, i + 4));
          data[`${name}Min`] = readFloat16LE(bytes.slice(i + 4, i + 6));
          data[`${name}Avg`] = readFloat16LE(bytes.slice(i + 6, i + 8));
          i += 8;
        }
        // CUSTOM MESSAGE
        else if (j < 13) {
          data.text = readAscii(bytes.slice(i, 48));
          i += 48;
        }
      }

      decoded.channelHistoryData = decoded.channelHistoryData || [];
      decoded.channelHistoryData.push(data);
    }
    // MODBUS HISTORICAL DATA
    else if (channelId === 0x20 && channelType === 0xdd) {
      const timestamp = readUInt32LE(bytes.slice(i, i + 4));
      topic = "modbus_history";
      const modbus_chn_mask = numToBits(
        readUInt32LE(bytes.slice(i + 4, i + 8)),
        32,
      );
      i += 8;

      const data = { timestamp };
      for (let j = 0; j < modbus_chn_mask.length; j++) {
        if (modbus_chn_mask[j] !== 1) continue;

        const chn = `chn${j + 1}`;
        const data_type = bytes[i++];
        const sign = (data_type >>> 7) & 0x01;
        const type = data_type & 0x7f; // 0b01111111
        switch (type) {
          case 0: // MB_COIL
            decoded[chn] = bytes[i] ? "on" : "off";
            break;
          case 1: // MB_DISCRETE
            data[chn] = sign
              ? readInt8(bytes.slice(i, i + 1))
              : readUInt8(bytes.slice(i, i + 1));
            break;
          case 2: // MB_INPUT_INT16
          case 3: // MB_HOLDING_INT16
            data[chn] = sign
              ? readInt16LE(bytes.slice(i, i + 2))
              : readUInt16LE(bytes.slice(i, i + 2));
            break;
          case 4: // MB_HOLDING_INT32
          case 6: // MB_INPUT_INT32
            data[chn] = sign
              ? readInt32LE(bytes.slice(i, i + 4))
              : readUInt32LE(bytes.slice(i, i + 4));
            break;
          case 8: // MB_INPUT_INT32_AB
          case 10: // MB_HOLDING_INT32_AB
            data[chn] = sign
              ? readInt16LE(bytes.slice(i, i + 2))
              : readUInt16LE(bytes.slice(i, i + 2));
            break;
          case 9: // MB_INPUT_INT32_CD
          case 11: // MB_HOLDING_INT32_CD
            data[chn] = sign
              ? readInt16LE(bytes.slice(i + 2, i + 4))
              : readUInt16LE(bytes.slice(i + 2, i + 4));
            break;
          case 5: // MB_HOLDING_FLOAT
          case 7: // MB_INPUT_FLOAT
            data[chn] = readFloatLE(bytes.slice(i, i + 4));
            break;
          default:
            break;
        }
        i += 4;
      }

      decoded.modbusHistoryData = decoded.modbusHistoryData || [];
      decoded.modbusHistoryData.push(data);
    }
    // TEXT
    else {
      decoded.text = readAscii(bytes.slice(i - 2, bytes.length));
      i = bytes.length;
      topic = "alarm_report";
    }
  }

  if (!isEmpty(decoded)) {
    emit("sample", { data: decoded, topic });
  }

  if (!isEmpty(lifecycle)) {
    emit("sample", { data: lifecycle, topic: "lifecycle" });
  }
}
