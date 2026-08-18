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
  const reportType = Bits.bitsToUnsigned(bits.substring(16, 24));
  let batteryVoltage = 0;

  switch (reportType) {
    case 0:
      data.softwareVersion = Bits.bitsToUnsigned(bits.substring(24, 32));
      data.hardwareVersion = Bits.bitsToUnsigned(bits.substring(32, 40));
      data.dataCode = payload.substring(10, 18);
      emit("sample", { data, topic: "lifecycle" });
      break;
    case 1:
      batteryVoltage = Bits.bitsToUnsigned(bits.substring(24, 32)) / 10;
      state.current1 = Bits.bitsToUnsigned(bits.substring(32, 48));
      state.current2 = Bits.bitsToUnsigned(bits.substring(48, 64));
      state.current3 = Bits.bitsToUnsigned(bits.substring(64, 80));
      state.multiplier1 = Bits.bitsToUnsigned(bits.substring(80, 88));
      emit("state", state);
      break;
    case 2: {
      batteryVoltage = Bits.bitsToUnsigned(bits.substring(24, 32)) / 10;

      const { current1 } = state;
      const { current2 } = state;
      const { current3 } = state;

      const { multiplier1 } = state;
      const multiplier2 = Bits.bitsToUnsigned(bits.substring(32, 40));
      const multiplier3 = Bits.bitsToUnsigned(bits.substring(40, 48));

      data.current1 = (current1 * multiplier1) / 1000;
      data.current2 = (current2 * multiplier2) / 1000;
      data.current3 = (current3 * multiplier3) / 1000;

      emit("sample", { data, topic: "default" });
      break;
    }
    case 3: {
      batteryVoltage = Bits.bitsToUnsigned(bits.substring(24, 32)) / 10;

      const current1 = Bits.bitsToUnsigned(bits.substring(32, 48));
      const current2 = Bits.bitsToUnsigned(bits.substring(48, 64));
      const current3 = Bits.bitsToUnsigned(bits.substring(64, 80));

      const multiplier1 = multipier(Bits.bitsToUnsigned(bits.substring(86, 88)));
      const multiplier2 = multipier(Bits.bitsToUnsigned(bits.substring(84, 86)));
      const multiplier3 = multipier(Bits.bitsToUnsigned(bits.substring(82, 84)));

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
