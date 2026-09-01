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
      // 00 00
      data.leakElectrode12 = !!Bits.bitsToUnsigned(bits.substring(0, 1));
      data.leakElectrode11 = !!Bits.bitsToUnsigned(bits.substring(1, 2));
      data.leakElectrode10 = !!Bits.bitsToUnsigned(bits.substring(2, 3));
      data.leakElectrode9 = !!Bits.bitsToUnsigned(bits.substring(3, 4));

      data.selfTestFailed = !!Bits.bitsToUnsigned(bits.substring(6, 7));
      data.criticalWetFlag = !!Bits.bitsToUnsigned(bits.substring(7, 8));

      data.leakElectrode8 = !!Bits.bitsToUnsigned(bits.substring(8, 9));
      data.leakElectrode7 = !!Bits.bitsToUnsigned(bits.substring(9, 10));
      data.leakElectrode6 = !!Bits.bitsToUnsigned(bits.substring(10, 11));
      data.leakElectrode5 = !!Bits.bitsToUnsigned(bits.substring(11, 12));
      data.leakElectrode4 = !!Bits.bitsToUnsigned(bits.substring(12, 13));
      data.leakElectrode3 = !!Bits.bitsToUnsigned(bits.substring(13, 14));
      data.leakElectrode2 = !!Bits.bitsToUnsigned(bits.substring(14, 15));
      data.leakElectrode1 = !!Bits.bitsToUnsigned(bits.substring(15, 16));

      // fd 02 3f
      data.accX = Bits.bitsToUnsigned(bits.substring(16, 24)); //  1/63 g
      data.accY = Bits.bitsToUnsigned(bits.substring(24, 32)); //  1/63 g
      data.accZ = Bits.bitsToUnsigned(bits.substring(32, 40)); //  1/63 g

      data.temperature = Bits.bitsToSigned(bits.substring(40, 48)); // 18
      data.wetnessThreshold = Bits.bitsToUnsigned(bits.substring(48, 56)); // 03
      data.interval = Bits.bitsToUnsigned(bits.substring(56, 72)); // 0168

      break;
    case 100:
      topic = "start_up";
      data.serialNumber = Bits.bitsToUnsigned(bits.substring(0, 64));
      data.firmwareVersion = `${Bits.bitsToUnsigned(
        bits.substring(64, 72),
      )}.${Bits.bitsToUnsigned(bits.substring(72, 80))}.${Bits.bitsToUnsigned(
        bits.substring(80, 88),
      )}`;
      break;
    default:
      break;
  }

  emit("sample", { data, topic });
}
