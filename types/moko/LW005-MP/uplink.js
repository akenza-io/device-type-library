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
      data.instantaneousVoltage = Bits.bitsToUnsigned(bits.substr(40, 16)) / 10
      data.instantaneousCurrent = Bits.bitsToUnsigned(bits.substr(56, 16)) / 1000;
      data.instantaneousCurrentFrequency = Bits.bitsToUnsigned(bits.substr(72, 16)) / 1000;
      break;
    case 7:
      topic = "electrical";
      data.instantaneousActivePower = Bits.bitsToUnsigned(bits.substr(40, 32)) / 10;
      data.instantaneousPowerFactor = bytes[9] & 0xFF;
      break;
    case 8:
      topic = "energy";
      data.totalEnergy = Bits.bitsToUnsigned(bits.substr(40, 32)) / 3200;
      data.energyOfLastHour = Bits.bitsToUnsigned(bits.substr(72, 16)) / 3200;
      break;
    case 9:
      topic = "over_voltage";
      data.overVoltageState = bytes[5];
      data.currentInstantaneousVoltage = Bits.bitsToUnsigned(bits.substr(48, 16)) / 10;
      data.overVoltageThreshold = Bits.bitsToUnsigned(bits.substr(64, 16)) / 10;
      break;
    case 10:
      topic = "sag_voltage";
      data.sagVoltageState = bytes[5];
      data.currentInstantaneousVoltage = Bits.bitsToUnsigned(bits.substr(48, 16)) / 10;
      data.sagVoltageThreshold = Bits.bitsToUnsigned(bits.substr(64, 16)) / 10;
      break;
    case 11:
      topic = "over_current";
      data.overCurrentState = bytes[5];
      data.currentInstantaneousCurrent = Bits.bitsToUnsigned(bits.substr(48, 16)) / 1000;
      data.overCurrentThreshold = Bits.bitsToUnsigned(bits.substr(64, 16)) / 1000;
      break;
    case 12:
      topic = "overload";
      data.overLoadState = bytes[5];
      data.currentInstantaneous_power = Bits.bitsToUnsigned(bits.substr(48, 24)) / 10;
      data.overLoadThreshold = Bits.bitsToUnsigned(bits.substr(72, 16)) / 10;
      break;
    case 13:
      topic = "load_state";
      data.loadChangeState = bytes[5] === 1 ? "LOAD_START" : "LOAD_STOP";
      break;
    case 14:
      topic = "countdown";
      data.acOutputStateAfterCountdown = bytes[5] === 1 ? "ON" : "OFF";;
      data.remainingTimeOfCountdownProcess = Bits.bitsToUnsigned(bits.substr(48, 32));
      break;
    default:
      break;
  }


  emit("sample", { data, topic });

}