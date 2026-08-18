function peopleCountAccumulator(bits) {
  const pca = Bits.bitsToUnsigned(bits);
  return pca;
}

function peopleCountBin(bits, binsReadyFlag) {
  // bins
  let pc = Bits.bitsToUnsigned(bits);
  if (!binsReadyFlag) {
    pc = "ERROR";
  }
  // Math.pow(pc, 1/bins);
  return pc;
}

function batteryVoltage(bits) {
  const bv = Bits.bitsToUnsigned(bits) * 0.05;
  return bv;
}

function temperature(bits) {
  let tp = Bits.bitsToSigned(bits);
  if (tp < -40 || tp > 125) {
    tp = "ERROR";
  }
  return tp;
}

function consume(event) {
  const payload = event.data.payloadHex;
  const bits = Bits.hexToBits(payload);
  let topic = "default";
  const data = {};
  const lifecycle = {};

  const cd = Bits.bitsToUnsigned(bits.substring(0, 1));
  const subType = Bits.bitsToUnsigned(bits.substring(1, 4));
  // Reserved 4 bits

  // Standart Meassurement
  if (subType === 0 && cd === 0) {
    lifecycle.heartbeatFlag = !!Number(bits.substring(92, 93));
    lifecycle.magSwitchFlag = !!Number(bits.substring(93, 94));
    lifecycle.proxHWError = !!Number(bits.substring(94, 95));
    lifecycle.binsReadyFlag = !!Number(bits.substring(95, 96));

    lifecycle.batteryVoltage = batteryVoltage(bits.substring(8, 16));
    data.peopleCount = peopleCountAccumulator(bits.substring(16, 32));
    data.peopleCountBin1 = peopleCountBin(
      bits.substring(32, 42),
      lifecycle.binsReadyFlag,
    );
    data.peopleCountBin2 = peopleCountBin(
      bits.substring(42, 52),
      lifecycle.binsReadyFlag,
    );
    data.peopleCountBin3 = peopleCountBin(
      bits.substring(52, 62),
      lifecycle.binsReadyFlag,
    );
    data.peopleCountBin4 = peopleCountBin(
      bits.substring(62, 72),
      lifecycle.binsReadyFlag,
    );
    data.peopleCountBin5 = peopleCountBin(
      bits.substring(72, 82),
      lifecycle.binsReadyFlag,
    );
    data.peopleCountBin6 = peopleCountBin(
      bits.substring(82, 92),
      lifecycle.binsReadyFlag,
    );
  } else if (subType === 1 && cd === 0) {
    lifecycle.forcedDownlinkFlag = !!Number(bits.substring(82, 83));
    lifecycle.countAlertFlag = !!Number(bits.substring(83, 84));
    lifecycle.heartbeatFlag = !!Number(bits.substring(84, 85));
    lifecycle.magSwitchFlag = !!Number(bits.substring(85, 86));
    lifecycle.proxHWError = !!Number(bits.substring(86, 87));
    lifecycle.binsReadyFlag = !!Number(bits.substring(87, 88));

    lifecycle.batteryVoltage = batteryVoltage(bits.substring(8, 16));
    data.peopleCount = peopleCountAccumulator(bits.substring(16, 32));
    data.peopleCountBin1 = peopleCountBin(
      bits.substring(32, 42),
      lifecycle.binsReadyFlag,
    );
    data.peopleCountBin2 = peopleCountBin(
      bits.substring(42, 52),
      lifecycle.binsReadyFlag,
    );
    data.peopleCountBin3 = peopleCountBin(
      bits.substring(52, 62),
      lifecycle.binsReadyFlag,
    );
    data.peopleCountBin4 = peopleCountBin(
      bits.substring(62, 72),
      lifecycle.binsReadyFlag,
    );
    data.peopleCountBin5 = peopleCountBin(
      bits.substring(72, 82),
      lifecycle.binsReadyFlag,
    );
    data.temperature = temperature(bits.substring(88, 96));
  } else if (subType === 3 && cd === 0) {
    lifecycle.forcedDownlinkFlag = !!Number(bits.substring(50, 51));
    lifecycle.countAlertFlag = !!Number(bits.substring(51, 52));
    lifecycle.heartbeatFlag = !!Number(bits.substring(52, 53));
    lifecycle.magSwitchFlag = !!Number(bits.substring(53, 54));
    lifecycle.proxHWError = !!Number(bits.substring(54, 55));
    lifecycle.binsReadyFlag = !!Number(bits.substring(55, 56));

    lifecycle.batteryVoltage = batteryVoltage(bits.substring(8, 16));
    data.peopleCount = peopleCountAccumulator(bits.substring(16, 32));
    data.alertCount = Bits.bitsToUnsigned(bits.substring(32, 48));
    data.temperature = temperature(bits.substring(56, 64));
    topic = "default";
  } else if (subType === 2 && cd === 0) {
    data.testFrames = bits.substring(8, 16);
    topic = "rssi_test";
  }

  if (cd === 0) {
    emit("sample", { data, topic });
  }
}
