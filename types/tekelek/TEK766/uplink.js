function getValues(bits, data, pointer, loops, currentTopic) {
  // i = 1 for beauty :p
  for (var i = 1; i < loops; i++) {

    var ull1 = Bits.bitsToUnsigned(bits.substr(pointer, 8)); pointer += 8;
    var ull2 = Bits.bitsToUnsigned(bits.substr(pointer, 8)); pointer += 8;
    data["ullage" + i] = (ull1 * 256) + ull2;

    var temp = Bits.bitsToUnsigned(bits.substr(pointer, 8)); pointer += 8;
    var base = 0;
    if (temp > 50) {
      base = 256;
    }
    data["temp" + i] = - (base - temp);

    data["SRC" + i] = Bits.bitsToUnsigned(bits.substr(pointer, 4)); pointer += 4;
    data["SRSSI" + i] = Bits.bitsToUnsigned(bits.substr(pointer, 4)); pointer += 4;

    if (i == 1 && currentTopic != "none") {
      emit('sample', { data: JSON.parse(JSON.stringify(data)), topic: currentTopic });
    }
  }
  return data;
}


function consume(event) {
  var payload = event.data.payload_hex;
  var port = event.data.port;
  var bits = Bits.hexToBits(payload);
  var data = {};
  var topic = "default";
  var type = Bits.bitsToUnsigned(bits.substr(0, 8));
  if (Bits.bitsToUnsigned(bits.substr(8, 8)) == 0) {
    var prodId = "TEK 766";
  }

  if (type == 16 || type == 69) {
    data.limit1 = (bits.substr(23, 1) == "1");
    data.limit2 = (bits.substr(22, 1) == "1");
    data.limit3 = (bits.substr(21, 1) == "1");
    // 24 reserved
    if (type == 16) {
      topic = "measurement";
      data = getValues(bits, data, 32, 5, 'current');
    } else {
      topic = "alarm";
      data = getValues(bits, data, 32, 3, 'currentAlarm');
    }

  } else if (type == 48) {
    // 16 reserved
    data.hardwareID = Bits.bitsToUnsigned(bits.substr(24, 8));
    data.firmwareVersion = Bits.bitsToUnsigned(bits.substr(32, 8)) + "." + Bits.bitsToUnsigned(bits.substr(40, 8));
    var contactReason = Bits.bitsToUnsigned(bits.substr(54, 2));
    switch (contactReason) {
      case 0:
        data.contactReason = "Reset";
        break;
      case 1:
        data.contactReason = "Scheduled";
        break;
      case 2:
        data.contactReason = "Manual";
        break;
      case 3:
        data.contactReason = "Activation";
        break;
      default:
        break;
    }

    var systemRequestReset = Bits.bitsToUnsigned(bits.substr(51, 3));
    switch (systemRequestReset) {
      case 0:
        data.systemRequestReset = "Power on reset";
        break;
      case 1:
        data.systemRequestReset = "Brown out reset";
        break;
      case 2:
        data.systemRequestReset = "External reset";
        break;
      case 3:
        data.systemRequestReset = "Watchdog reset";
        break;
      case 4:
        data.systemRequestReset = "Cortex-M3 lockup reset";
        break;
      case 5:
        data.systemRequestReset = "Cortex-M3 system request reset";
        break;
      case 6:
        data.systemRequestReset = "EM4 reset";
        break;
      case 7:
        data.systemRequestReset = "System has been in Backup mode";
        break;
      default:
        break;
    }

    data.active = !!Bits.bitsToUnsigned(bits.substr(50, 1));
    // Reserved 56 - 80
    data.batteryLevel = Bits.bitsToUnsigned(bits.substr(80, 8));
    var min1 = Bits.bitsToUnsigned(bits.substr(88, 8));
    var min2 = Bits.bitsToUnsigned(bits.substr(96, 8));

    data.measurements = (min1 * 256) + min2;
    data.transmitPeriods = Bits.bitsToUnsigned(bits.substr(104, 8));
    data = getValues(bits, data, 112, 2, 'none');
    topic = "lifecycle";
  } else if (type == 67) {
    //16 Reserved
    topic = "paramRead";
  } else if (type == 71) {
    topic = "diagnosticRead";
  }

  emit('sample', { data: data, topic: topic });
}