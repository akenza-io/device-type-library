function consume(event) {
  const payload = event.data.payload_hex;
  const bits = Bits.hexToBits(payload);
  const data = {};
  const lifecycle = {};

  // Reserved 0-8
  data.sequenceNumber = Bits.bitsToUnsigned(bits.substr(8, 8));
  data.temperature = Bits.bitsToSigned(bits.substr(16, 8));

  const batteryStatus = Bits.bitsToUnsigned(bits.substr(24, 2));
  if (batteryStatus === 0) {
    lifecycle.batteryStatus = "VERY_LOW";
  } else if (batteryStatus === 1) {
    lifecycle.batteryStatus = "LOW";
  } else if (batteryStatus === 2) {
    lifecycle.batteryStatus = "DISCHARGING";
  } else if (batteryStatus === 3) {
    lifecycle.batteryStatus = "HEALTHY";
  }

  data.buttonLatched = !!Bits.bitsToUnsigned(bits.substr(26, 1));
  data.isButtonPressed = !!Bits.bitsToUnsigned(bits.substr(27, 1));

  const currentProfile = Bits.bitsToUnsigned(bits.substr(28, 4));
  if (currentProfile === 1) {
    lifecycle.currentProfile = "IMR_LORA_SIGFOX";
  } else if (currentProfile === 3) {
    lifecycle.currentProfile = "SIGFOX";
  } else if (currentProfile === 5) {
    lifecycle.currentProfile = "SIGFOX_LORA";
  }

  data.currentLevel = Bits.bitsToUnsigned(bits.substr(32, 10)) / 10;
  data.removedFromDial = !!Bits.bitsToUnsigned(bits.substr(42, 1));
  data.isRefilling = !!Bits.bitsToUnsigned(bits.substr(43, 1));
  data.highLPG = !!Bits.bitsToUnsigned(bits.substr(44, 1));
  data.lowLPG = !!Bits.bitsToUnsigned(bits.substr(45, 1));
  data.outOfRange = !!Bits.bitsToUnsigned(bits.substr(46, 1));
  data.notValidReadout = !!Bits.bitsToUnsigned(bits.substr(46, 1));

  emit("sample", { data: lifecycle, topic: "lifecycle" });
  emit("sample", { data, topic: "default" });
}
