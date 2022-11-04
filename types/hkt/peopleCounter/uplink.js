function consume(event) {
  const payload = event.data.payloadHex;
  const bits = Bits.hexToBits(payload);
  const data = {};
  const lifecycle = {};
  const system = {};

  // Header Reserved 0-40
  let pointer = 40;

  while (pointer < bits.length) {
    const dataType = Bits.bitsToUnsigned(bits.substr(pointer, 8));

    switch (dataType) {
      case 0x01:
        system.hwVersion = Bits.bitsToUnsigned(bits.substr((pointer += 8), 8));
        system.swVersion = Bits.bitsToUnsigned(bits.substr((pointer += 8), 8));
        pointer += 8;
        break;
      case 0x03:
        lifecycle.batteryLevel = Bits.bitsToUnsigned(
          bits.substr((pointer += 8), 8),
        );
        emit("sample", { data: lifecycle, topic: "lifecycle" });
        pointer += 8;
        break;
      case 0x04: {
        const reporting = Bits.bitsToUnsigned(bits.substr((pointer += 8), 8));
        switch (reporting) {
          case 0x01:
            system.reportingPattern = "TIME_INTERVAL";
            break;
          case 0x02:
            system.reportingPattern = "NUMBER_OF_COUNTS";
            break;
          case 0x03:
            system.reportingPattern = "TIME_INTERVAL_PLUS_COUNTS";
            break;
          case 0x04:
            system.reportingPattern = "EVENT";
            break;
          case 0x05:
            system.reportingPattern = "TIME_INTERVAL_PLUS_EVENT";
            break;
          default:
            data.reportingPattern = "UNKNOWN";
            break;
        }
        pointer += 8;
        break;
      }
      case 0x05:
        pointer += 24;
        break;
      case 0x06:
        system.threshold = Bits.bitsToUnsigned(bits.substr((pointer += 8), 16));
        pointer += 16;
        break;
      case 0x07:
        data.counterA = Bits.bitsToUnsigned(bits.substr((pointer += 8), 16));
        data.counterB = Bits.bitsToUnsigned(bits.substr((pointer += 16), 16));
        data.absCountA = Bits.bitsToUnsigned(bits.substr((pointer += 16), 32));
        data.absCountB = Bits.bitsToUnsigned(bits.substr((pointer += 32), 32));
        emit("sample", { data, topic: "default" });
        pointer += 32;
        break;
      case 0x83:
        system.infraredError = !!Bits.bitsToUnsigned(
          bits.substr((pointer += 8), 8),
        );
        pointer += 8;
        break;
      case 0x84: {
        system.installed = !!Bits.bitsToUnsigned(
          bits.substr((pointer += 8), 8),
        );
        pointer += 8;
        break;
      }
      case 0x86:
        pointer += 24;
        break;
      default:
        pointer = bits.length;
        break;
    }
  }

  if (Object.keys(system).length > 0) {
    emit("sample", { data: system, topic: "system" });
  }
}
