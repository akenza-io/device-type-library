function consume(event) {
  const payload = event.data.payloadHex;
  const bits = Bits.hexToBits(payload);
  const { port } = event.data;
  const data = {};
  let topic = "default";

  switch (port) {
    case 1:
    case 99:
    case 102:
      switch (port) {
        case 1:
          data.messageType = "REGULAR_MESSAGE";
          break;
        case 99:
          data.messageType = "EMERGENCY_MESSAGE";
          break;
        case 102:
          data.messageType = "SELF_TEST_MESSAGE";
          break;
        default:
          break;
      }

      data.leakElectrode12 = !!Bits.bitsToUnsigned(bits.substr(0, 1));
      data.leakElectrode11 = !!Bits.bitsToUnsigned(bits.substr(1, 1));
      data.leakElectrode10 = !!Bits.bitsToUnsigned(bits.substr(2, 1));
      data.leakElectrode9 = !!Bits.bitsToUnsigned(bits.substr(3, 1));

      data.selfTestFailed = !!Bits.bitsToUnsigned(bits.substr(6, 1));
      data.criticalWetFlag = !!Bits.bitsToUnsigned(bits.substr(7, 1));

      data.leakElectrode8 = !!Bits.bitsToUnsigned(bits.substr(8, 1));
      data.leakElectrode7 = !!Bits.bitsToUnsigned(bits.substr(9, 1));
      data.leakElectrode6 = !!Bits.bitsToUnsigned(bits.substr(10, 1));
      data.leakElectrode5 = !!Bits.bitsToUnsigned(bits.substr(11, 1));
      data.leakElectrode4 = !!Bits.bitsToUnsigned(bits.substr(12, 1));
      data.leakElectrode3 = !!Bits.bitsToUnsigned(bits.substr(13, 1));
      data.leakElectrode2 = !!Bits.bitsToUnsigned(bits.substr(14, 1));
      data.leakElectrode1 = !!Bits.bitsToUnsigned(bits.substr(15, 1));

      data.accX = Hex.hexLittleEndianToBigEndian(payload.substr(4, 2), true); //  1/63 g
      data.accY = Hex.hexLittleEndianToBigEndian(payload.substr(6, 2), true); //  1/63 g
      data.accZ = Hex.hexLittleEndianToBigEndian(payload.substr(8, 2), true); //  1/63 g

      data.temperature = Bits.bitsToSigned(bits.substr(48, 8));
      data.wetnessThreshold = Bits.bitsToUnsigned(bits.substr(56, 8));
      data.interval = Bits.bitsToUnsigned(bits.substr(64, 8));

      break;
    case 100:
      topic = "start_up";
      data.serialNumber = Bits.bitsToUnsigned(bits.substr(0, 64));
      data.firmwareVersion = `${Bits.bitsToUnsigned(
        bits.substr(64, 8),
      )}.${Bits.bitsToUnsigned(bits.substr(72, 8))}.${Bits.bitsToUnsigned(
        bits.substr(80, 8),
      )}`;
      break;
    default:
      break;
  }

  emit("sample", { data, topic });
}
