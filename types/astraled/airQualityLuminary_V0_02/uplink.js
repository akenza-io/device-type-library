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
  var bits_float = bytes;
  var sign = (bits_float >>> 31 === 0) ? 1.0 : -1.0;
  var e = bits_float >>> 23 & 0xff;
  var m = (e === 0) ? (bits_float & 0x7fffff) << 1 : (bits_float & 0x7fffff) | 0x800000;
  var f = sign * m * Math.pow(2, e - 150);
  return f;
}

function get_byte(buff, nr) {
  return Bits.bitsToUnsigned(buff.substr(nr * 8, 8));
}

function get_word(buff, nr) {
  return swap16(Bits.bitsToUnsigned(buff.substr(nr * 8, 16)));
}

function get_long(buff, nr) {
  return swap32(Bits.bitsToUnsigned(buff.substr(nr * 8, 32)));
}

function get_float(buff, nr) {
  return bytesToFloat(get_long(buff, nr));
}

function consume(event) {

  var payload_hex = event.data.payload_hex;
  var buff = Bits.hexToBits(payload_hex);

  var data_size = payload_hex.length / 2;

  var data = {};
  var lifecycle = {};

  var rd_pos = 0;

  do {
    var para_size = get_byte(buff, rd_pos++) & 0x3F;  // get size
    var para_type = get_byte(buff, rd_pos++);  // get type

    switch (para_type) {
      case 1:
        lifecycle.protocol_version = "Version: " + get_byte(buff, rd_pos + 1) + "." + get_byte(buff, rd_pos);
        break;
      case 2:
        lifecycle.app_version = "Version: " + get_byte(buff, rd_pos + 2) + "." + get_byte(buff, rd_pos + 1) + "p" + get_byte(buff, rd_pos);
        break;
      case 3:
        lifecycle.lora_stack_version = "Version: " + get_byte(buff, rd_pos + 2) + "." + get_byte(buff, rd_pos + 1) + "." + get_byte(buff, rd_pos);
        break;
      case 4:
        lifecycle.lora_version = "Version: " + get_byte(buff, rd_pos + 2) + "." + get_byte(buff, rd_pos + 1) + "." + get_byte(buff, rd_pos);
        break;
      case 6:
        switch (get_byte(buff, rd_pos)) {
          case 1: lifecycle.msg_cycle_time_1 = get_word(buff, rd_pos + 1); break;
          case 2: lifecycle.msg_cycle_time_2 = get_word(buff, rd_pos + 1); break;
          case 3: lifecycle.msg_cycle_time_3 = get_word(buff, rd_pos + 1); break;
          case 4: lifecycle.msg_cycle_time_4 = get_word(buff, rd_pos + 1); break;
          case 5: lifecycle.msg_cycle_time_5 = get_word(buff, rd_pos + 1); break;
          case 6: lifecycle.msg_cycle_time_6 = get_word(buff, rd_pos + 1); break;
          case 7: lifecycle.msg_cycle_time_7 = get_word(buff, rd_pos + 1); break;
          case 8: lifecycle.msg_cycle_time_8 = get_word(buff, rd_pos + 1); break;
        }
        break;
      case 7:
        lifecycle.group_address = get_byte(buff, rd_pos);
        break;
      case 8:
        lifecycle.serial_number = get_long(buff, rd_pos);
        break;
      case 9:
        data.temperature = get_word(buff, rd_pos) / 100;
        break;
      case 10:
        data.humidity = get_word(buff, rd_pos) / 10;
        break;
      case 11:
        data.voc = get_word(buff, rd_pos);
        break;
      case 12:
        data.co2 = get_word(buff, rd_pos);
        break;
      case 13:
        data.eco2 = get_word(buff, rd_pos);
        break;
      case 14:
        lifecycle.iaq_state_int = get_byte(buff, rd_pos);
        break;
      case 15:
        lifecycle.iaq_state_ext = get_byte(buff, rd_pos);
        break;
      case 16:
        data.pm1_0 = get_float(buff, rd_pos);
        break;
      case 17:
        data.pm2_5 = get_float(buff, rd_pos);
        break;
      case 18:
        data.pm4_0 = get_float(buff, rd_pos);
        break;
      case 19:
        data.pm10 = get_float(buff, rd_pos);
        break;
      case 20:
        lifecycle.iaq_particel_typ_size = get_float(buff, rd_pos);
        break;
      case 21:
        lifecycle.iaq_threshold_co2_good = get_word(buff, rd_pos);
        lifecycle.iaq_threshold_voc_good = get_word(buff, rd_pos + 2);
        break;
      case 22:
        lifecycle.iaq_threshold_co2_still_ok = get_word(buff, rd_pos);
        lifecycle.iaq_threshold_voc_still_ok = get_word(buff, rd_pos + 2);
        break;
      case 23:
        lifecycle.iaq_threshold_co2_bad = get_word(buff, rd_pos);
        lifecycle.iaq_threshold_voc_bad = get_word(buff, rd_pos + 2);
        break;
      case 24:
        lifecycle.iaq_filter_time = get_byte(buff, rd_pos);
        lifecycle.iaq_hysteresis_co2 = get_byte(buff, rd_pos + 1);
        lifecycle.iaq_hysteresis_voc = get_byte(buff, rd_pos + 2);
        break;
      case 25:
        lifecycle.iaq_rgbw_good_red = get_byte(buff, rd_pos);
        lifecycle.iaq_rgbw_good_green = get_byte(buff, rd_pos + 1);
        lifecycle.iaq_rgbw_good_blue = get_byte(buff, rd_pos + 2);
        break;
      case 26:
        lifecycle.iaq_rgbw_still_ok_red = get_byte(buff, rd_pos);
        lifecycle.iaq_rgbw_still_ok_green = get_byte(buff, rd_pos + 1);
        lifecycle.iaq_rgbw_still_ok_blue = get_byte(buff, rd_pos + 2);
        break;
      case 27:
        lifecycle.iaq_rgbw_bad_red = get_byte(buff, rd_pos);
        lifecycle.iaq_rgbw_bad_green = get_byte(buff, rd_pos + 1);
        lifecycle.iaq_rgbw_bad_blue = get_byte(buff, rd_pos + 2);
        break;
      case 28:
        lifecycle.iaq_rgbw_deadly_red = get_byte(buff, rd_pos);
        lifecycle.iaq_rgbw_deadly_green = get_byte(buff, rd_pos + 1);
        lifecycle.iaq_rgbw_deadly_blue = get_byte(buff, rd_pos + 2);
        break;
      case 29:
        lifecycle.iaq_rgbw_warmup_red = get_byte(buff, rd_pos);
        lifecycle.iaq_rgbw_warmup_green = get_byte(buff, rd_pos + 1);
        lifecycle.iaq_rgbw_warmup_blue = get_byte(buff, rd_pos + 2);
        break;
      case 30:
        lifecycle.iaq_rgbw_dimming = get_byte(buff, rd_pos);
        break;
      case 31:
        lifecycle.iaq_visualisation = get_byte(buff, rd_pos);
        break;
      case 32:
        data.altitude = get_word(buff, rd_pos);
        break;
      case 33:
        data.latitude = get_float(buff, rd_pos);
        break;
      case 34:
        data.longitude = get_float(buff, rd_pos);
        break;
      case 35:
        data.light_state = get_byte(buff, rd_pos);
        break;
      case 37:
        lifecycle.light_set_cct = get_word(buff, rd_pos);
        break;
      case 38:
        lifecycle.light_set_lux = get_word(buff, rd_pos);
        break;
      case 39:
        lifecycle.light_light_level = get_word(buff, rd_pos);
        break;
      case 40:
        lifecycle.device_temperature = get_byte(buff, rd_pos);
        break;
      case 41:
        lifecycle.error = get_long(buff, rd_pos);
        break;
      case 42:
        lifecycle.act_pwr = get_float(buff, rd_pos);
        break;
      case 43:
        lifecycle.energy = get_float(buff, rd_pos);
        break;
      case 44:
        lifecycle.sensor_ambient_light = get_word(buff, rd_pos);
        break;
      case 45:
        lifecycle.sensor_cct = get_word(buff, rd_pos);
        break;
      case 48:
        lifecycle.iaq_tempature_comp_off = get_word(buff, rd_pos);
        lifecycle.iaq_tempature_comp_on = get_word(buff, rd_pos + 2);
        break;
      default:
        break;
    }

    rd_pos += para_size;

  } while (rd_pos < data_size);


  if (lifecycle != {}) {
    emit('sample', { data: lifecycle, topic: "lifecycle" });
  }

  if (data != {}) {
    emit('sample', { data: data, topic: "default" });
  }
}