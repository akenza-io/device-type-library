function consume(event) {
  const payload = event.data.payloadHex;
  const bits = Bits.hexToBits(payload);
  const data = {};
  let topic;

  // Header Reserved 0-40
  const dataType = Bits.bitsToUnsigned(bits.substr(40, 8));

  switch (dataType) {
    case 0x01:
      topic = "system";
      data.hwVersion = Bits.bitsToUnsigned(bits.substr(48, 8));
      data.swVersion = Bits.bitsToUnsigned(bits.substr(56, 8));
      break;
    case 0x03:
      topic = "lifecycle";
      data.batteryLevel = Bits.bitsToUnsigned(bits.substr(48, 8));
      break;
    case 0x04: {
      topic = "system";
      const reporting = Bits.bitsToUnsigned(bits.substr(48, 8));
      switch (reporting) {
        case 0x01:
          data.reportingPattern = "TIME_INTERVAL";
          break;
        case 0x02:
          data.reportingPattern = "NUMBER_OF_COUNTS";
          break;
        case 0x03:
          data.reportingPattern = "TIME_INTERVAL_PLUS_COUNTS";
          break;
        case 0x04:
          data.reportingPattern = "EVENT";
          break;
        case 0x05:
          data.reportingPattern = "TIME_INTERVAL_PLUS_EVENT";
          break;
        default:
          data.reportingPattern = "UNKNOWN";
          break;
      }
      break;
    }
    case 0x06:
      topic = "system";
      data.threshold = Bits.bitsToUnsigned(bits.substr(48, 16));
      break;
    case 0x07:
      topic = "default";
      data.counterA = Bits.bitsToUnsigned(bits.substr(48, 16));
      data.counterB = Bits.bitsToUnsigned(bits.substr(64, 16));
      data.absCountA = Bits.bitsToUnsigned(bits.substr(80, 32));
      data.absCountB = Bits.bitsToUnsigned(bits.substr(112, 32));
      break;
    case 0x83:
      topic = "system";
      data.infraredError = !!Bits.bitsToUnsigned(bits.substr(48, 8));
      break;
    case 0x84: {
      topic = "system";
      data.instaled = !!Bits.bitsToUnsigned(bits.substr(48, 8));
      break;
    }
    default:
      topic = "unknown";
      break;
  }

  emit("sample", { data, topic });
}
