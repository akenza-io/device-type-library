function consume(event) {
  const payload = event.data.payloadHex;
  const bits = Bits.hexToBits(payload);
  const data = {};
  let topic = "default";
  const msgType = Bits.bitsToUnsigned(bits.substr(8, 8));

  // Status Message
  if (msgType === 2) {
    data.usedCharges = Hex.hexLittleEndianToBigEndian(
      payload.substr(4, 8),
      false,
    );
    // Reserved // 03 03

    data.voltage = (Bits.bitsToUnsigned(bits.substr(64, 8)) + 170) / 100;
    // Max 3.0 min 2.0 V
    data.batteryLevel = Math.floor((data.voltage - 2) / 0.01 / 10) * 10;
    if (data.batteryLevel > 100) {
      data.batteryLevel = 100;
    } else if (data.batteryLevel < 0) {
      data.batteryLevel = 0;
    }

    data.internalTemp = Bits.bitsToUnsigned(bits.substr(72, 8));

    if (bits.length > 80) {
      // Reserved // 05 04
      data.activeButtonW = Number(bits.substr(100, 1));
      data.activeButtonS = Number(bits.substr(101, 1));
      data.activeButtonE = Number(bits.substr(102, 1));
      data.activeButtonN = Number(bits.substr(103, 1));

      data.confirmed = Number(bits.substr(104, 1));
      data.buzzer = Number(bits.substr(105, 1));
      data.dutyCycle = Number(bits.substr(106, 1));
      data.ambitiousFirstPress = Number(bits.substr(107, 1));
      data.joinStrat = Number(bits.substr(108, 1));

      data.statusMessageinterval = Hex.hexLittleEndianToBigEndian(
        payload.substr(28, 4),
        false,
      );
    }

    topic = "status";
    // Button Press
  } else if (msgType === 1) {
    data.btnWfirst = Number(bits.substr(20, 1));
    data.btnSfirst = Number(bits.substr(21, 1));
    data.btnEfirst = Number(bits.substr(22, 1));
    data.btnNfirst = Number(bits.substr(23, 1));

    data.btnWpressed = Number(bits.substr(16, 1));
    data.btnSpressed = Number(bits.substr(17, 1));
    data.btnEpressed = Number(bits.substr(18, 1));
    data.btnNpressed = Number(bits.substr(19, 1));

    data.buttonCount = Hex.hexLittleEndianToBigEndian(
      payload.substr(6, 4),
      false,
    );
    // Reserved
    data.usedCharges = Hex.hexLittleEndianToBigEndian(
      payload.substr(14, 6),
      false,
    );

    topic = "button_pressed";

    // Firmware Version
  } else if (msgType === 5) {
    data.join = true;
    topic = "join";
  }

  emit("sample", { data, topic });
}
