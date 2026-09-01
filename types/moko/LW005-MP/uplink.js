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
      topic = "energy";
      data.voltage = Bits.bitsToUnsigned(bits.substring(40, 56)) / 10
      data.current = Bits.bitsToUnsigned(bits.substring(56, 72)) / 1000;
      data.frequency = Bits.bitsToUnsigned(bits.substring(72, 88)) / 1000;
      break;
    case 7:
      topic = "power";
      data.activePower = Bits.bitsToUnsigned(bits.substring(40, 72)) / 10;
      data.powerFactor = bytes[9] & 0xFF;
      break;
    case 8:
      topic = "consumption";
      data.totalConsumption = Bits.bitsToUnsigned(bits.substring(40, 72)) / 3200;
      data.consumptionLastHour = Bits.bitsToUnsigned(bits.substring(72, 88)) / 3200;
      break;
    case 9:
      topic = "overvoltage";
      data.overvoltage = !!bytes[5];
      data.voltage = Bits.bitsToUnsigned(bits.substring(48, 64)) / 10;
      data.overvoltageThreshold = Bits.bitsToUnsigned(bits.substring(64, 80)) / 10;
      break;
    case 10:
      topic = "undervoltage";
      data.undervoltage = !!bytes[5];
      data.voltage = Bits.bitsToUnsigned(bits.substring(48, 64)) / 10;
      data.undervoltageThreshold = Bits.bitsToUnsigned(bits.substring(64, 80)) / 10;
      break;
    case 11:
      topic = "overcurrent";
      data.overcurrent = !!bytes[5];
      data.current = Bits.bitsToUnsigned(bits.substring(48, 64)) / 1000;
      data.overcurrentThreshold = Bits.bitsToUnsigned(bits.substring(64, 80)) / 1000;
      break;
    case 12:
      topic = "overload";
      data.overload = !!bytes[5];
      data.power = Bits.bitsToUnsigned(bits.substring(48, 72)) / 10;
      data.overloadThreshold = Bits.bitsToUnsigned(bits.substring(72, 88)) / 10;
      break;
    case 13:
      topic = "load_state";
      data.loadState = bytes[5] === 1 ? "LOAD_START" : "LOAD_STOP";
      break;
    case 14:
      topic = "countdown";
      data.acAfterCountdown = bytes[5] === 1 ? "ON" : "OFF";;
      data.countdownTime = Bits.bitsToUnsigned(bits.substring(48, 80));
      break;
    default:
      break;
  }


  emit("sample", { data, topic });

}