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

  const cd = Bits.bitsToUnsigned(bits.substr(0, 1));
  const subType = Bits.bitsToUnsigned(bits.substr(1, 3));
  // Reserved 4 bits

  // Standart Meassurement
  if (subType === 0 && cd === 0) {
    lifecycle.heartbeatFlag = !!Number(bits.substr(92, 1));
    lifecycle.magSwitchFlag = !!Number(bits.substr(93, 1));
    lifecycle.proxHWError = !!Number(bits.substr(94, 1));
    lifecycle.binsReadyFlag = !!Number(bits.substr(95, 1));

    lifecycle.batteryVoltage = batteryVoltage(bits.substr(8, 8));
    data.peopleCount = peopleCountAccumulator(bits.substr(16, 16));
    data.peopleCountBin1 = peopleCountBin(
      bits.substr(32, 10),
      lifecycle.binsReadyFlag,
    );
    data.peopleCountBin2 = peopleCountBin(
      bits.substr(42, 10),
      lifecycle.binsReadyFlag,
    );
    data.peopleCountBin3 = peopleCountBin(
      bits.substr(52, 10),
      lifecycle.binsReadyFlag,
    );
    data.peopleCountBin4 = peopleCountBin(
      bits.substr(62, 10),
      lifecycle.binsReadyFlag,
    );
    data.peopleCountBin5 = peopleCountBin(
      bits.substr(72, 10),
      lifecycle.binsReadyFlag,
    );
    data.peopleCountBin6 = peopleCountBin(
      bits.substr(82, 10),
      lifecycle.binsReadyFlag,
    );
  } else if (subType === 1 && cd === 0) {
    lifecycle.ForcedDownlinkFlag = !!Number(bits.substr(82, 1));
    lifecycle.CountAlertFlag = !!Number(bits.substr(83, 1));
    lifecycle.HeartbeatFlag = !!Number(bits.substr(84, 1));
    lifecycle.MagSwitchFlag = !!Number(bits.substr(85, 1));
    lifecycle.ProxHWError = !!Number(bits.substr(86, 1));
    lifecycle.BinsReadyFlag = !!Number(bits.substr(87, 1));

    lifecycle.batteryVoltage = batteryVoltage(bits.substr(8, 8));
    data.peopleCount = peopleCountAccumulator(bits.substr(16, 16));
    data.peopleCountBin1 = peopleCountBin(
      bits.substr(32, 10),
      lifecycle.binsReadyFlag,
    );
    data.peopleCountBin2 = peopleCountBin(
      bits.substr(42, 10),
      lifecycle.binsReadyFlag,
    );
    data.peopleCountBin3 = peopleCountBin(
      bits.substr(52, 10),
      lifecycle.binsReadyFlag,
    );
    data.peopleCountBin4 = peopleCountBin(
      bits.substr(62, 10),
      lifecycle.binsReadyFlag,
    );
    data.peopleCountBin5 = peopleCountBin(
      bits.substr(72, 10),
      lifecycle.binsReadyFlag,
    );
    data.temperature = temperature(bits.substr(88, 8));
  } else if (subType === 3 && cd === 0) {
    lifecycle.ForcedDownlinkFlag = !!Number(bits.substr(50, 1));
    lifecycle.CountAlertFlag = !!Number(bits.substr(51, 1));
    lifecycle.HeartbeatFlag = !!Number(bits.substr(52, 1));
    lifecycle.MagSwitchFlag = !!Number(bits.substr(53, 1));
    lifecycle.ProxHWError = !!Number(bits.substr(54, 1));
    lifecycle.BinsReadyFlag = !!Number(bits.substr(55, 1));

    lifecycle.batteryVoltage = batteryVoltage(bits.substr(8, 8));
    data.peopleCount = peopleCountAccumulator(bits.substr(16, 16));
    data.alertCount = Bits.bitsToUnsigned(bits.substr(32, 16));
    data.temperature = temperature(bits.substr(56, 8));
    topic = "count_alert";
  } else if (subType === 2 && cd === 0) {
    data.testFrames = bits.substr(8, 8);
    topic = "rssi_test";
  }

  if (cd === 0) {
    emit("sample", { data, topic });
  }
}
