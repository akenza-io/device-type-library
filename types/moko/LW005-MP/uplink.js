function consume(event) {
  const { port } = event.data;
  const { payloadHex } = event.data;
  const bytes = Hex.hexToBytes(payloadHex);
  const bits = Bits.hexToBits(payloadHex);
  const data = {};
  let topic = "default";

  switch (port) {
    case 5:
      topic = "switch";
      data.acOutputState = bytes[5] === 1 ? "ON" : "OFF";
      data.plugLoadStatus = bytes[6] === 1 ? "LOAD" : "NO_LOAD";
      break;
    case 6:
      topic = "electrical";
      data.voltage = Bits.bitsToUnsigned(bits.substr(40, 16)) / 10
      data.current = Bits.bitsToUnsigned(bits.substr(56, 16)) / 1000;
      data.frequency = Bits.bitsToUnsigned(bits.substr(72, 16)) / 1000;
      break;
    case 7:
      topic = "power";
      data.activePower = Bits.bitsToUnsigned(bits.substr(40, 32)) / 10;
      data.powerFactor = bytes[9] & 0xFF;
      break;
    case 8:
      topic = "energy";
      data.totalEnergy = Bits.bitsToUnsigned(bits.substr(40, 32)) / 3200;
      data.energyLastHour = Bits.bitsToUnsigned(bits.substr(72, 16)) / 3200;
      break;
    case 9:
      topic = "overvoltage";
      data.overvoltage = !!bytes[5];
      data.voltage = Bits.bitsToUnsigned(bits.substr(48, 16)) / 10;
      data.overvoltageThreshold = Bits.bitsToUnsigned(bits.substr(64, 16)) / 10;
      break;
    case 10:
      topic = "undervoltage";
      data.undervoltage = !!bytes[5];
      data.voltage = Bits.bitsToUnsigned(bits.substr(48, 16)) / 10;
      data.undervoltageThreshold = Bits.bitsToUnsigned(bits.substr(64, 16)) / 10;
      break;
    case 11:
      topic = "overcurrent";
      data.overcurrent = !!bytes[5];
      data.current = Bits.bitsToUnsigned(bits.substr(48, 16)) / 1000;
      data.overcurrentThreshold = Bits.bitsToUnsigned(bits.substr(64, 16)) / 1000;
      break;
    case 12:
      topic = "overload";
      data.overload = !!bytes[5];
      data.power = Bits.bitsToUnsigned(bits.substr(48, 24)) / 10;
      data.overloadThreshold = Bits.bitsToUnsigned(bits.substr(72, 16)) / 10;
      break;
    case 13:
      topic = "load_state";
      data.loadState = bytes[5] === 1 ? "LOAD_START" : "LOAD_STOP";
      break;
    case 14:
      topic = "countdown";
      data.acAfterCountdown = bytes[5] === 1 ? "ON" : "OFF";;
      data.countdownTime = Bits.bitsToUnsigned(bits.substr(48, 32));
      break;
    default:
      break;
  }


  emit("sample", { data, topic });

}