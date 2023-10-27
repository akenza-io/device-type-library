function consume(event) {
  const payload = event.data.payloadHex;
  const { port } = event.data;
  const bits = Bits.hexToBits(payload);
  const lifecycle = {};
  let topic = "default";

  switch (port) {
    // APP
    case 3: {
      const devicetype = Bits.bitsToUnsigned(bits.substr(0, 2));
      if (devicetype === 0) {
        lifecycle.deviceType = "SML_KLAX";
      } else {
        lifecycle.deviceType = "MODBUS_KLAX";
      }
      lifecycle.payloadVersion = Bits.bitsToUnsigned(bits.substr(2, 6));

      lifecycle.batteryLevel = Bits.bitsToUnsigned(bits.substr(8, 3));
      const readingMode = Bits.bitsToUnsigned(bits.substr(11, 3));
      switch (readingMode) {
        case 0:
          lifecycle.readingMode = "SML";
          break;
        case 1:
          lifecycle.readingMode = "IEC_NORMAL_MODE";
          break;
        case 2:
          lifecycle.readingMode = "IEC_BATTERY_MODE";
          break;
        case 3:
          lifecycle.readingMode = "LOGAREX";
          break;
        case 4:
          lifecycle.readingMode = "EBZ";
          break;
        case 5:
          lifecycle.readingMode = "TRITSCHLER_VC3";
          break;
        default:
          break;
      }
      lifecycle.registersConfigured = !!Bits.bitsToUnsigned(bits.substr(14, 1));
      lifecycle.connectionTest = !!Bits.bitsToUnsigned(bits.substr(15, 1));

      const messageIndex = Bits.bitsToUnsigned(bits.substr(16, 8));
      const messageNumber = Bits.bitsToUnsigned(bits.substr(24, 4));
      const totalMessages = Bits.bitsToUnsigned(bits.substr(28, 4));

      let pointer = 32;
      while (bits.length > pointer) {
        const data = {};
        const payloadId = Bits.bitsToUnsigned(bits.substr(pointer, 8));
        pointer += 8;
        switch (payloadId) {
          // Register Filtering ID
          case 1: {
            data.registerMask = Bits.bitsToUnsigned(bits.substr(pointer, 8));
            data.filterPositionActive = !!Bits.bitsToUnsigned(
              bits.substr(pointer, 1),
            );
            pointer += 1;
            const filterPositionSelector = Bits.bitsToUnsigned(
              bits.substr(pointer, 2),
            );
            pointer += 3; // 1 bit reserved
            switch (filterPositionSelector) {
              case 0:
                data.filterPositionSelector = "REGISTER_FILTER_1";
                break;
              case 1:
                data.filterPositionSelector = "REGISTER_FILTER_2";
                break;
              case 2:
                data.filterPositionSelector = "REGISTER_FILTER_3";
                break;
              case 3:
                data.filterPositionSelector = "REGISTER_FILTER_4";
                break;
              default:
                break;
            }
            const filterPositionUnit = Bits.bitsToUnsigned(
              bits.substr(pointer, 4),
            );
            pointer += 4;
            switch (filterPositionUnit) {
              case 0:
                data.filterPositionUnit = "NDEF";
                break;
              case 1:
                data.filterPositionUnit = "Wh";
                break;
              case 2:
                data.filterPositionUnit = "W";
                break;
              case 3:
                data.filterPositionUnit = "V";
                break;
              case 4:
                data.filterPositionUnit = "A";
                break;
              case 5:
                data.filterPositionUnit = "Hz";
                break;
              case 6:
                data.filterPositionUnit = "varh";
                break;
              case 7:
                data.filterPositionUnit = "var";
                break;
              case 8:
                data.filterPositionUnit = "VAh";
                break;
              case 9:
                data.filterPositionUnit = "VA";
                break;
              default:
                break;
            }

            break;
          }
          // Register NOW
          case 2:
            break;
          // Server ID
          case 3:
            break;
          // Device ID
          case 8:
            break;

          default:
            break;
        }
      }

      topic = "debug";
      break;
    }
    // CONFIG
    case 100:
      topic = "debug";
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
      topic = "debug";
      break;
    default:
      break;
  }

  emit("sample", { data, topic });
}
