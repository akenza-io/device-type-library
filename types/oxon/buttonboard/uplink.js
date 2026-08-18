function consume(event) {
  const payload = event.data.payloadHex;
  const bits = Bits.hexToBits(payload);
  const data = {};
  const lifecycle = {};

  if (Bits.bitsToUnsigned(bits.substring(0, 8)) === 49) {
    // Buttons Pressed
    data.longPressed = !!Bits.bitsToUnsigned(bits.substring(8, 9));
    // Reserved 1
    data.button6 = !!Bits.bitsToUnsigned(bits.substring(10, 11));
    data.button5 = !!Bits.bitsToUnsigned(bits.substring(11, 12));
    data.button4 = !!Bits.bitsToUnsigned(bits.substring(12, 13));
    data.button3 = !!Bits.bitsToUnsigned(bits.substring(13, 14));
    data.button2 = !!Bits.bitsToUnsigned(bits.substring(14, 15));
    data.button1 = !!Bits.bitsToUnsigned(bits.substring(15, 16));
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

    lifecycle.hbIRQ = !!Bits.bitsToUnsigned(bits.substring(16, 24));
    lifecycle.accIRQ = !!Bits.bitsToUnsigned(bits.substring(24, 32));
    lifecycle.appMode = Bits.bitsToUnsigned(bits.substring(32, 40));

    // Enabled buttons
    // Reserved 2
    data.button6Enabled = !!Bits.bitsToUnsigned(bits.substring(42, 43));
    data.button5Enabled = !!Bits.bitsToUnsigned(bits.substring(43, 44));
    data.button4Enabled = !!Bits.bitsToUnsigned(bits.substring(44, 45));
    data.button3Enabled = !!Bits.bitsToUnsigned(bits.substring(45, 46));
    data.button2Enabled = !!Bits.bitsToUnsigned(bits.substring(46, 47));
    data.button1Enabled = !!Bits.bitsToUnsigned(bits.substring(47, 48));
    //

    lifecycle.batteryLevel = Bits.bitsToUnsigned(bits.substring(48, 56));
    data.temperature = Bits.bitsToUnsigned(bits.substring(56, 64));
    let accX =
      Bits.bitsToUnsigned(bits.substring(64, 72)) * 256 +
      Bits.bitsToUnsigned(bits.substring(72, 80));
    let accY =
      Bits.bitsToUnsigned(bits.substring(80, 88)) * 256 +
      Bits.bitsToUnsigned(bits.substring(88, 96));
    let accZ =
      Bits.bitsToUnsigned(bits.substring(96, 104)) * 256 +
      Bits.bitsToUnsigned(bits.substring(104, 112));
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
