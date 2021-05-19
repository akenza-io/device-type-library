// Decoder Gateway Protocol Version 0.02
function swap16(val) {
  return ((val & 0xFF) << 8) |
    ((val >> 8) & 0xFF);
}

function swap32(val) {
  return (((val << 24) & 0xff000000) |
    ((val << 8) & 0x00ff0000) |
    ((val >> 8) & 0x0000ff00) |
    ((val >> 24) & 0x000000ff));
}

function bytesToFloat(bytes) {
  const bitsFloat = bytes;
  const sign = (bitsFloat >>> 31 === 0) ? 1.0 : -1.0;
  const e = bitsFloat >>> 23 & 0xff;
  const m = (e === 0) ? (bitsFloat & 0x7fffff) << 1 : (bitsFloat & 0x7fffff) | 0x800000;
  const f = sign * m * Math.pow(2, e - 150);
  return f;
}

function getByte(buff, nr) {
  return Bits.bitsToUnsigned(buff.substr(nr * 8, 8));
}

function getWord(buff, nr) {
  return swap16(Bits.bitsToUnsigned(buff.substr(nr * 8, 16)));
}

function getLong(buff, nr) {
  return swap32(Bits.bitsToUnsigned(buff.substr(nr * 8, 32)));
}

function getFloat(buff, nr) {
  return bytesToFloat(getLong(buff, nr));
}

function consume(event) {
  const {payload_hex} = event.data;
  const buff = Bits.hexToBits(payload_hex);

  const dataSize = payload_hex.length / 2;

  const data = {};
  const lifecycle = {};

  let rdPos = 0;

  do {
    const paraSize = getByte(buff, rdPos++) & 0x3F;  // get size
    const paraType = getByte(buff, rdPos++);  // get type

    switch (paraType) {
      case 1:
        lifecycle.protocol_version = `Version: ${  getByte(buff, rdPos + 1)  }.${  getByte(buff, rdPos)}`;
        break;
      case 2:
        lifecycle.app_version = `Version: ${  getByte(buff, rdPos + 2)  }.${  getByte(buff, rdPos + 1)  }p${  getByte(buff, rdPos)}`;
        break;
      case 3:
        lifecycle.lora_stack_version = `Version: ${  getByte(buff, rdPos + 2)  }.${  getByte(buff, rdPos + 1)  }.${  getByte(buff, rdPos)}`;
        break;
      case 4:
        lifecycle.lora_version = `Version: ${  getByte(buff, rdPos + 2)  }.${  getByte(buff, rdPos + 1)  }.${  getByte(buff, rdPos)}`;
        break;
      case 6:
        switch (getByte(buff, rdPos)) {
          case 1: lifecycle.msg_cycle_time_1 = getWord(buff, rdPos + 1); break;
          case 2: lifecycle.msg_cycle_time_2 = getWord(buff, rdPos + 1); break;
          case 3: lifecycle.msg_cycle_time_3 = getWord(buff, rdPos + 1); break;
          case 4: lifecycle.msg_cycle_time_4 = getWord(buff, rdPos + 1); break;
          case 5: lifecycle.msg_cycle_time_5 = getWord(buff, rdPos + 1); break;
          case 6: lifecycle.msg_cycle_time_6 = getWord(buff, rdPos + 1); break;
          case 7: lifecycle.msg_cycle_time_7 = getWord(buff, rdPos + 1); break;
          case 8: lifecycle.msg_cycle_time_8 = getWord(buff, rdPos + 1); break;
        }
        break;
      case 7:
        lifecycle.group_address = getByte(buff, rdPos);
        break;
      case 8:
        lifecycle.serial_number = getLong(buff, rdPos);
        break;
      case 9:
        data.temperature = getWord(buff, rdPos) / 100;
        break;
      case 10:
        data.humidity = getWord(buff, rdPos) / 10;
        break;
      case 11:
        data.voc = getWord(buff, rdPos);
        break;
      case 12:
        data.co2 = getWord(buff, rdPos);
        break;
      case 13:
        data.eco2 = getWord(buff, rdPos);
        break;
      case 14:
        lifecycle.iaq_state_int = getByte(buff, rdPos);
        break;
      case 15:
        lifecycle.iaq_state_ext = getByte(buff, rdPos);
        break;
      case 16:
        data.pm1_0 = getFloat(buff, rdPos);
        break;
      case 17:
        data.pm2_5 = getFloat(buff, rdPos);
        break;
      case 18:
        data.pm4_0 = getFloat(buff, rdPos);
        break;
      case 19:
        data.pm10 = getFloat(buff, rdPos);
        break;
      case 20:
        lifecycle.iaq_particel_typ_size = getFloat(buff, rdPos);
        break;
      case 21:
        lifecycle.iaq_threshold_co2_good = getWord(buff, rdPos);
        lifecycle.iaq_threshold_voc_good = getWord(buff, rdPos + 2);
        break;
      case 22:
        lifecycle.iaq_threshold_co2_still_ok = getWord(buff, rdPos);
        lifecycle.iaq_threshold_voc_still_ok = getWord(buff, rdPos + 2);
        break;
      case 23:
        lifecycle.iaq_threshold_co2_bad = getWord(buff, rdPos);
        lifecycle.iaq_threshold_voc_bad = getWord(buff, rdPos + 2);
        break;
      case 24:
        lifecycle.iaq_filter_time = getByte(buff, rdPos);
        lifecycle.iaq_hysteresis_co2 = getByte(buff, rdPos + 1);
        lifecycle.iaq_hysteresis_voc = getByte(buff, rdPos + 2);
        break;
      case 25:
        lifecycle.iaq_rgbw_good_red = getByte(buff, rdPos);
        lifecycle.iaq_rgbw_good_green = getByte(buff, rdPos + 1);
        lifecycle.iaq_rgbw_good_blue = getByte(buff, rdPos + 2);
        break;
      case 26:
        lifecycle.iaq_rgbw_still_ok_red = getByte(buff, rdPos);
        lifecycle.iaq_rgbw_still_ok_green = getByte(buff, rdPos + 1);
        lifecycle.iaq_rgbw_still_ok_blue = getByte(buff, rdPos + 2);
        break;
      case 27:
        lifecycle.iaq_rgbw_bad_red = getByte(buff, rdPos);
        lifecycle.iaq_rgbw_bad_green = getByte(buff, rdPos + 1);
        lifecycle.iaq_rgbw_bad_blue = getByte(buff, rdPos + 2);
        break;
      case 28:
        lifecycle.iaq_rgbw_deadly_red = getByte(buff, rdPos);
        lifecycle.iaq_rgbw_deadly_green = getByte(buff, rdPos + 1);
        lifecycle.iaq_rgbw_deadly_blue = getByte(buff, rdPos + 2);
        break;
      case 29:
        lifecycle.iaq_rgbw_warmup_red = getByte(buff, rdPos);
        lifecycle.iaq_rgbw_warmup_green = getByte(buff, rdPos + 1);
        lifecycle.iaq_rgbw_warmup_blue = getByte(buff, rdPos + 2);
        break;
      case 30:
        lifecycle.iaq_rgbw_dimming = getByte(buff, rdPos);
        break;
      case 31:
        lifecycle.iaq_visualisation = getByte(buff, rdPos);
        break;
      case 32:
        data.altitude = getWord(buff, rdPos);
        break;
      case 33:
        data.latitude = getFloat(buff, rdPos);
        break;
      case 34:
        data.longitude = getFloat(buff, rdPos);
        break;
      case 35:
        data.lightState = getByte(buff, rdPos);
        break;
      case 37:
        lifecycle.light_set_cct = getWord(buff, rdPos);
        break;
      case 38:
        lifecycle.light_set_lux = getWord(buff, rdPos);
        break;
      case 39:
        lifecycle.light_light_level = getWord(buff, rdPos);
        break;
      case 40:
        lifecycle.device_temperature = getByte(buff, rdPos);
        break;
      case 41:
        lifecycle.error = getLong(buff, rdPos);
        break;
      case 42:
        lifecycle.act_pwr = getFloat(buff, rdPos);
        break;
      case 43:
        lifecycle.energy = getFloat(buff, rdPos);
        break;
      case 44:
        lifecycle.sensor_ambient_light = getWord(buff, rdPos);
        break;
      case 45:
        lifecycle.sensor_cct = getWord(buff, rdPos);
        break;
      case 48:
        lifecycle.iaq_tempature_comp_off = getWord(buff, rdPos);
        lifecycle.iaq_tempature_comp_on = getWord(buff, rdPos + 2);
        break;
      default:
        break;
    }

    rdPos += paraSize;

  } while (rdPos < dataSize);


  if (lifecycle !== {}) {
    emit('sample', { data: lifecycle, topic: "lifecycle" });
  }

  if (data !== {}) {
    emit('sample', { data, topic: "default" });
  }
}