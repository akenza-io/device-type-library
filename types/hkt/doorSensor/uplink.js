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
    case 0x08:
      topic = "default";
      data.open = !!Bits.bitsToUnsigned(bits.substr(48, 8));
      break;
    case 0x22:
      topic = "system";
      data.mode = Bits.bitsToUnsigned(bits.substr(48, 8));
      break;
    case 0x23:
      topic = "system";
      data.countingHours = `${Bits.bitsToUnsigned(
        bits.substr(48, 8),
      )}:${Bits.bitsToUnsigned(bits.substr(56, 8))}-${Bits.bitsToUnsigned(
        bits.substr(64, 8),
      )}:${Bits.bitsToUnsigned(bits.substr(72, 8))}`;
      break;
    case 0x24:
      topic = "system";
      data.countingInterval = Bits.bitsToUnsigned(bits.substr(48, 16));
      break;
    case 0x25: {
      topic = "system";
      const lifecycleInterval = Bits.bitsToUnsigned(bits.substr(48, 8));
      if (lifecycleInterval === 0) {
        data.lifecycleInterval = 24;
      } else if (lifecycleInterval === 1) {
        data.lifecycleInterval = 12;
      } else {
        data.lifecycleInterval = 8;
      }
      break;
    }
    case 0x26:
      topic = "door";
      data.nrOpenings = Bits.bitsToUnsigned(bits.substr(48, 16));
      data.nrClosings = Bits.bitsToUnsigned(bits.substr(64, 16));
      data.absOpenings = Bits.bitsToUnsigned(bits.substr(80, 32));
      data.absClosings = Bits.bitsToUnsigned(bits.substr(112, 32));
      break;
    case 0x84:
      topic = "system";
      data.instaled = !!Bits.bitsToUnsigned(bits.substr(48, 8));
      break;
    default:
      topic = "unknown";
      break;
  }

  emit("sample", { data, topic });
}
