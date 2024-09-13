function multipier(val) {
  let multi = 1;
  switch (val) {
    case 0:
      multi = 1;
      break;
    case 1:
      multi = 5;
      break;
    case 2:
      multi = 10;
      break;
    case 3:
      multi = 100;
      break;
    default:
      break;
  }
  return multi;
}

function consume(event) {
  const payload = event.data.payloadHex;
  const bits = Bits.hexToBits(payload);
  const state = event.state || {};
  const data = {};

  // Reserved 16
  const reportType = Bits.bitsToUnsigned(bits.substr(16, 8));
  let batteryVoltage = 0;

  switch (reportType) {
    case 0:
      data.softwareVersion = Bits.bitsToUnsigned(bits.substr(24, 8));
      data.hardwareVersion = Bits.bitsToUnsigned(bits.substr(32, 8));
      data.dataCode = payload.substr(10, 8);
      emit("sample", { data, topic: "lifecycle" });
      break;
    case 1:
      batteryVoltage = Bits.bitsToUnsigned(bits.substr(24, 8)) / 10;
      state.current1 = Bits.bitsToUnsigned(bits.substr(32, 16));
      state.current2 = Bits.bitsToUnsigned(bits.substr(48, 16));
      state.current3 = Bits.bitsToUnsigned(bits.substr(64, 16));
      state.multiplier1 = Bits.bitsToUnsigned(bits.substr(80, 8));
      emit("state", state);
      break;
    case 2: {
      batteryVoltage = Bits.bitsToUnsigned(bits.substr(24, 8)) / 10;

      const { current1 } = state;
      const { current2 } = state;
      const { current3 } = state;

      const { multiplier1 } = state;
      const multiplier2 = Bits.bitsToUnsigned(bits.substr(32, 8));
      const multiplier3 = Bits.bitsToUnsigned(bits.substr(40, 8));

      data.current1 = (current1 * multiplier1) / 1000;
      data.current2 = (current2 * multiplier2) / 1000;
      data.current3 = (current3 * multiplier3) / 1000;

      emit("sample", { data, topic: "default" });
      break;
    }
    case 3: {
      batteryVoltage = Bits.bitsToUnsigned(bits.substr(24, 8)) / 10;

      const current1 = Bits.bitsToUnsigned(bits.substr(32, 16));
      const current2 = Bits.bitsToUnsigned(bits.substr(48, 16));
      const current3 = Bits.bitsToUnsigned(bits.substr(64, 16));

      const multiplier1 = multipier(Bits.bitsToUnsigned(bits.substr(86, 2)));
      const multiplier2 = multipier(Bits.bitsToUnsigned(bits.substr(84, 2)));
      const multiplier3 = multipier(Bits.bitsToUnsigned(bits.substr(82, 2)));

      data.current1 = (current1 * multiplier1) / 1000;
      data.current2 = (current2 * multiplier2) / 1000;
      data.current3 = (current3 * multiplier3) / 1000;
      emit("sample", { data, topic: "default" });
      break;
    }
    default:
      break;
  }

  if (batteryVoltage > 0) {
    emit("sample", { data: { batteryVoltage }, topic: "lifecycle" });
  }
}
