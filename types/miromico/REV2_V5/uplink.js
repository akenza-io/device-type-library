function consume(event) {
  const payload = event.data.payloadHex;
  const bits = Bits.hexToBits(payload);
  const data = {};
  let topic = "default";
  const msgType = Bits.bitsToUnsigned(bits.substring(8, 16));

  // Status Message
  if (msgType === 2) {
    data.usedCharges = Hex.hexLittleEndianToBigEndian(
      payload.substring(4, 12),
      false,
    );
    // Reserved // 03 03

    data.batteryVoltage = (Bits.bitsToUnsigned(bits.substring(64, 72)) + 170) / 100;
    // Max 3.0 min 2.0 V
    data.batteryLevel = Math.floor((data.batteryVoltage - 2) / 0.01 / 10) * 10;
    if (data.batteryLevel > 100) {
      data.batteryLevel = 100;
    } else if (data.batteryLevel < 0) {
      data.batteryLevel = 0;
    }

    data.internalTemp = Bits.bitsToUnsigned(bits.substring(72, 80));

    if (bits.length > 80) {
      // Reserved // 05 04
      data.activeButtonW = Number(bits.substring(100, 101));
      data.activeButtonS = Number(bits.substring(101, 102));
      data.activeButtonE = Number(bits.substring(102, 103));
      data.activeButtonN = Number(bits.substring(103, 104));

      data.confirmed = Number(bits.substring(104, 105));
      data.buzzer = Number(bits.substring(105, 106));
      data.dutyCycle = Number(bits.substring(106, 107));
      data.ambitiousFirstPress = Number(bits.substring(107, 108));
      data.joinStrat = Number(bits.substring(108, 109));

      data.statusMessageinterval = Hex.hexLittleEndianToBigEndian(
        payload.substring(28, 32),
        false,
      );
    }

    topic = "status";
    // Button Press
  } else if (msgType === 1) {
    data.btnWfirst = Number(bits.substring(20, 21));
    data.btnSfirst = Number(bits.substring(21, 22));
    data.btnEfirst = Number(bits.substring(22, 23));
    data.btnNfirst = Number(bits.substring(23, 24));

    data.btnWpressed = Number(bits.substring(16, 17));
    data.btnSpressed = Number(bits.substring(17, 18));
    data.btnEpressed = Number(bits.substring(18, 19));
    data.btnNpressed = Number(bits.substring(19, 20));

    data.buttonCount = Hex.hexLittleEndianToBigEndian(
      payload.substring(6, 10),
      false,
    );
    // Reserved
    data.usedCharges = Hex.hexLittleEndianToBigEndian(
      payload.substring(14, 20),
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
