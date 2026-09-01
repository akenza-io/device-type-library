function consume(event) {
  const payload = event.data.payloadHex;
  const bits = Bits.hexToBits(payload);
  const data = {};
  const lifecycle = {};

  // Reserved 0-8
  lifecycle.sequenceNumber = Bits.bitsToUnsigned(bits.substring(8, 16));
  data.temperature = Bits.bitsToSigned(bits.substring(16, 24));

  const batteryStatus = Bits.bitsToUnsigned(bits.substring(24, 26));
  if (batteryStatus === 0) {
    lifecycle.batteryStatus = "VERY_LOW";
  } else if (batteryStatus === 1) {
    lifecycle.batteryStatus = "LOW";
  } else if (batteryStatus === 2) {
    lifecycle.batteryStatus = "DISCHARGING";
  } else if (batteryStatus === 3) {
    lifecycle.batteryStatus = "HEALTHY";
  }

  data.buttonLatched = !!Bits.bitsToUnsigned(bits.substring(26, 27));
  data.isButtonPressed = !!Bits.bitsToUnsigned(bits.substring(27, 28));

  const currentProfile = Bits.bitsToUnsigned(bits.substring(28, 32));
  if (currentProfile === 1) {
    lifecycle.currentProfile = "IMR_LORA_SIGFOX";
  } else if (currentProfile === 3) {
    lifecycle.currentProfile = "SIGFOX";
  } else if (currentProfile === 5) {
    lifecycle.currentProfile = "SIGFOX_LORA";
  }

  data.currentLevel = Bits.bitsToUnsigned(bits.substring(32, 42)) / 10;
  data.removedFromDial = !!Bits.bitsToUnsigned(bits.substring(42, 43));
  data.isRefilling = !!Bits.bitsToUnsigned(bits.substring(43, 44));
  data.highLPG = !!Bits.bitsToUnsigned(bits.substring(44, 45));
  data.lowLPG = !!Bits.bitsToUnsigned(bits.substring(45, 46));
  data.outOfRange = !!Bits.bitsToUnsigned(bits.substring(46, 47));
  data.notValidReadout = !!Bits.bitsToUnsigned(bits.substring(46, 47));

  emit("sample", { data: lifecycle, topic: "lifecycle" });
  emit("sample", { data, topic: "default" });
}
