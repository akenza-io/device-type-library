function consume(event) {
  const payload = event.data.payloadHex;
  const { port } = event.data;
  const bits = Bits.hexToBits(payload);
  const data = {};
  const lifecycle = {};
  let topic = "default";

  switch (port) {
    // APP
    case 3: {
      const devicetype = Bits.bitsToUnsigned(bits.substr(0, 2));
      if (devicetype === 0) {
        data.deviceType = "SML_KLAX";
      } else {
        data.deviceType = "MODBUS_KLAX";
      }
      data.payloadVersion = Bits.bitsToUnsigned(bits.substr(2, 6));

      data.batteryLevel = Bits.bitsToUnsigned(bits.substr(8, 3));
      const readingMode = Bits.bitsToUnsigned(bits.substr(11, 3));
      switch (readingMode) {
        case 0:
          data.readingMode = "SML";
          break;
        case 1:
          data.readingMode = "IEC_NORMAL_MODE";
          break;
        case 2:
          data.readingMode = "IEC_BATTERY_MODE";
          break;
        case 3:
          data.readingMode = "LOGAREX";
          break;
        case 4:
          data.readingMode = "EBZ";
          break;
        case 5:
          data.readingMode = "TRITSCHLER_VC3";
          break;
        default:
          break;
      }
      data.registersConfigured = !!Bits.bitsToUnsigned(bits.substr(14, 1));
      data.connectionTest = !!Bits.bitsToUnsigned(bits.substr(15, 1));

      const messageIndex = Bits.bitsToUnsigned(bits.substr(16, 8));
      const messageNumber = Bits.bitsToUnsigned(bits.substr(24, 4));
      const totalMessages = Bits.bitsToUnsigned(bits.substr(28, 4));

      topic = "debug";
      break;
    }
    // CONFIG
    case 100:
      topic = "boot";
      break;
    // INFO
    case 101:
      data.serialNumber = payload;
      topic = "debug";
      break;
    // REG-SEARCH
    case 103:
      topic = "debug";
      break;
    // REG-SET
    case 104:
      data.batteryLevel = Bits.bitsToUnsigned(bits.substr(0, 8));
      topic = "lifecycle";
      break;
    default:
      break;
  }

  emit("sample", { data, topic });
}
