function consume(event) {
  const payload = event.data.payloadHex;
  const bits = Bits.hexToBits(payload);
  const data = {};

  // Reserved 16
  const reportType = Bits.bitsToUnsigned(bits.substr(16, 8));

  switch (reportType) {
    case 0:
      data.softwareVersion = Bits.bitsToUnsigned(bits.substr(24, 8));
      data.hardwareVersion = Bits.bitsToUnsigned(bits.substr(32, 8));
      data.dataCode = payload.substr(10, 8);
      emit("sample", { data, topic: "lifecycle" });
      break;
    case 1:
      // Reserved 8
      data.current1 = Bits.bitsToUnsigned(bits.substr(32, 16));
      data.current2 = Bits.bitsToUnsigned(bits.substr(48, 16));
      data.current3 = Bits.bitsToUnsigned(bits.substr(64, 16));
      data.multiplier1 = Bits.bitsToUnsigned(bits.substr(80, 8));
      emit("sample", { data, topic: "raw1" });
      break;
    case 2:
      data.batteryVoltage = Bits.bitsToUnsigned(bits.substr(24, 8)) / 10;
      data.multiplier2 = Bits.bitsToUnsigned(bits.substr(32, 8));
      data.multiplier3 = Bits.bitsToUnsigned(bits.substr(40, 8));
      emit("sample", { data, topic: "raw2" });
      break;
    default:
      break;
  }
}
