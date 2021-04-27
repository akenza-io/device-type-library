function toLittleEndian(hex) {
  var data = hex.match(/../g);

  // Create a buffer
  var buf = new ArrayBuffer(4);
  // Create a data view of it
  var view = new DataView(buf);

  // set bytes
  data.forEach(function (b, i) {
    view.setUint8(i, parseInt(b, 16));
  });

  // get an int32 with little endian
  var num = view.getInt32(0, 1);
  return num;
}


function consume(event) {
  var payload = event.data.payload_hex;
  var bits = Bits.hexToBits(payload);
  var data = {};
  var topic = "default";

  data.msgType = Bits.bitsToUnsigned(bits.substr(8, 8));

  // Status Message
  if (data.msgType == 2) {
    data.usedCharges = toLittleEndian(payload.substr(4, 8));
    // Reserved // 03 03

    data.battery = ((Bits.bitsToUnsigned(bits.substr(64, 8)) + 170) / 100);
    data.internalTemp = Bits.bitsToUnsigned(bits.substr(72, 8));

    if (bits.length > 80) {
      // Reserved // 05 04
      data.activeButtonN = Number(bits.substr(100, 1));
      data.activeButtonE = Number(bits.substr(101, 1));
      data.activeButtonS = Number(bits.substr(102, 1));
      data.activeButtonW = Number(bits.substr(103, 1));

      data.joinStrat = Number(bits.substr(104, 1));
      data.ambitiousFirstPress = Number(bits.substr(105, 1));
      data.dutyCycle = Number(bits.substr(106, 1));
      data.buzzer = Number(bits.substr(107, 1));
      data.confirmed = Number(bits.substr(108, 1));

      data.statusMessageinterval = toLittleEndian(payload.substr(28, 4));
    }


    topic = "status";
    // Button Press
  } else if (data.msgType == 1) {
    data.btnNfirst = Number(bits.substr(20, 1));
    data.btnEfirst = Number(bits.substr(21, 1));
    data.btnSfirst = Number(bits.substr(22, 1));
    data.btnWfirst = Number(bits.substr(23, 1));

    data.btnNpressed = Number(bits.substr(16, 1));
    data.btnEpressed = Number(bits.substr(17, 1));
    data.btnSpressed = Number(bits.substr(18, 1));
    data.btnWpressed = Number(bits.substr(19, 1));

    data.buttonCount = toLittleEndian(payload.substr(6, 4));
    // Reserved
    data.usedCharges = toLittleEndian(payload.substr(14, 6));

    if (data.btnNpressed == "1" || data.btnEpressed == "1" || data.btnSpressed == "1" || data.btnWpressed == "1") {
      topic = "button_pressed";
    }

    // Firmware Version
  } else if (data.msgType == 5) {
    data.join = true;
    topic = "join";
  }

  emit('sample', { data: data, topic: topic });
}