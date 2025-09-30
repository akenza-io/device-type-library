function cToF(celsius) {
  return Math.round(((celsius * 9) / 5 + 32) * 10) / 10;
}

function consume(event) {
  const payload = event.data.payloadHex;
  const bits = Bits.hexToBits(payload);
  const data = {};
  const lifecycle = {};

  if (Bits.bitsToUnsigned(bits.substr(0, 8)) === 49) {
    // Buttons Pressed
    data.longPressed = !!Bits.bitsToUnsigned(bits.substr(8, 1));
    // Reserved 1
    data.button6 = !!Bits.bitsToUnsigned(bits.substr(10, 1));
    data.button5 = !!Bits.bitsToUnsigned(bits.substr(11, 1));
    data.button4 = !!Bits.bitsToUnsigned(bits.substr(12, 1));
    data.button3 = !!Bits.bitsToUnsigned(bits.substr(13, 1));
    data.button2 = !!Bits.bitsToUnsigned(bits.substr(14, 1));
    data.button1 = !!Bits.bitsToUnsigned(bits.substr(15, 1));
    //

    // Numeric Buttons Pressed
    data.numericLongPressed = Number(data.longPressed);
    // Reserved 1
    data.numericButton6 = Number(data.button6);
    data.numericButton5 = Number(data.button5);
    data.numericButton4 = Number(data.button4);
    data.numericButton3 = Number(data.button3);
    data.numericButton2 = Number(data.button2);
    data.numericButton1 = Number(data.button1);

    lifecycle.hbIRQ = !!Bits.bitsToUnsigned(bits.substr(16, 8));
    lifecycle.accIRQ = !!Bits.bitsToUnsigned(bits.substr(24, 8));
    lifecycle.appMode = Bits.bitsToUnsigned(bits.substr(32, 8));

    // Enabled buttons
    // Reserved 2
    data.button6Enabled = !!Bits.bitsToUnsigned(bits.substr(42, 1));
    data.button5Enabled = !!Bits.bitsToUnsigned(bits.substr(43, 1));
    data.button4Enabled = !!Bits.bitsToUnsigned(bits.substr(44, 1));
    data.button3Enabled = !!Bits.bitsToUnsigned(bits.substr(45, 1));
    data.button2Enabled = !!Bits.bitsToUnsigned(bits.substr(46, 1));
    data.button1Enabled = !!Bits.bitsToUnsigned(bits.substr(47, 1));
    //

    lifecycle.batteryLevel = Bits.bitsToUnsigned(bits.substr(48, 8));
    data.temperature = Bits.bitsToUnsigned(bits.substr(56, 8));
    data.temperatureF = cToF(data.temperature);
    let accX =
      Bits.bitsToUnsigned(bits.substr(64, 8)) * 256 +
      Bits.bitsToUnsigned(bits.substr(72, 8));
    let accY =
      Bits.bitsToUnsigned(bits.substr(80, 8)) * 256 +
      Bits.bitsToUnsigned(bits.substr(88, 8));
    let accZ =
      Bits.bitsToUnsigned(bits.substr(96, 8)) * 256 +
      Bits.bitsToUnsigned(bits.substr(104, 8));
    accX = accX < 32767 ? (2 / 8191) * accX : (-2 / 8192) * (65536 - accX);
    accY = accY < 32767 ? (2 / 8191) * accY : (-2 / 8192) * (65536 - accY);
    accZ = accZ < 32767 ? (2 / 8191) * accZ : (-2 / 8192) * (65536 - accZ);
    data.accX = Math.round((accX + 2.7755575615628914e-17) * 1000) / 1000;
    data.accY = Math.round((accY + 2.7755575615628914e-17) * 1000) / 1000;
    data.accZ = Math.round((accZ + 2.7755575615628914e-17) * 1000) / 1000;

    emit("sample", { data: lifecycle, topic: "lifecycle" });
    emit("sample", { data, topic: "default" });
  }
}
