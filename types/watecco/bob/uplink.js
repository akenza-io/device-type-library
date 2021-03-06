function round(value) {
  return Math.round(value * 1000) / 1000;
}

function consume(event) {
  var payload = event.data.payloadHex;
  var bits = Bits.hexToBits(payload);
  var data = {};
  var topic = "default";

  var header = Bits.bitsToUnsigned(bits.substr(0, 8));

  if (header == 76 || header == 108) {
    // Learning
    topic = "learning";
    data.learningPerc = Bits.bitsToUnsigned(bits.substr(8, 8));
    var vl_1 = Bits.bitsToUnsigned(bits.substr(16, 8));
    var vl_2 = Bits.bitsToUnsigned(bits.substr(24, 8));
    var vl_3 = Bits.bitsToUnsigned(bits.substr(32, 8));
    data.vibration = (vl_1 * 128 + vl_2 + vl_3 / 100) / 10 / 121.45; // float
    // Frequency_index
    data.temperature = Bits.bitsToUnsigned(bits.substr(48, 8)) - 30;
    var learningFrom = Bits.bitsToUnsigned(bits.substr(56, 8));

    if (learningFrom) {
      data.learningFrom = "Zero";
    } else if (learningFrom) {
      data.learningFrom = "Additional Learning";
    }
    // fftSignal
  } else if (header == 82 || header == 114) {
    // Report
    topic = "report";

    data.anomalyLevel = round(
      (Bits.bitsToUnsigned(bits.substr(8, 8)) * 100) / 127,
    );
    data.nrAlarms = Bits.bitsToUnsigned(bits.substr(32, 8));
    data.temperature = Bits.bitsToUnsigned(bits.substr(40, 8)) - 30;

    var reportLength = Bits.bitsToUnsigned(bits.substr(48, 8));

    if (reportLength > 59) {
      reportLength = (reportLength - 59) * 60;
    } else {
      reportLength = reportLength;
    }

    data.operatingTime =
      (Bits.bitsToUnsigned(bits.substr(16, 8)) * reportLength) / 127;
    data.repID = Bits.bitsToUnsigned(bits.substr(56, 8));

    var vl_1 = Bits.bitsToUnsigned(bits.substr(64, 8));
    var vl_2 = Bits.bitsToUnsigned(bits.substr(72, 8));
    var vl_3 = Bits.bitsToUnsigned(bits.substr(80, 8));
    data.maxAmplitude = round((vl_1 * 128 + vl_2 + vl_3 / 100) / 10 / 121.45); // float
    // Frequency_index

    data.peakFrequency = Bits.bitsToUnsigned(bits.substr(88, 8)) + 1;

    data.min0_10 = round(
      (Bits.bitsToUnsigned(bits.substr(24, 8)) * data.operatingTime) / 127,
    );
    data.min10_20 = round(
      (Bits.bitsToUnsigned(bits.substr(96, 8)) *
        (data.operatingTime - data.min0_10)) /
        127,
    );
    data.min20_40 = round(
      (Bits.bitsToUnsigned(bits.substr(104, 8)) *
        (data.operatingTime - data.min0_10)) /
        127,
    );
    data.min40_60 = round(
      (Bits.bitsToUnsigned(bits.substr(112, 8)) *
        (data.operatingTime - data.min0_10)) /
        127,
    );
    data.min60_80 = round(
      (Bits.bitsToUnsigned(bits.substr(120, 8)) *
        (data.operatingTime - data.min0_10)) /
        127,
    );
    data.min80_100 = round(
      (Bits.bitsToUnsigned(bits.substr(128, 8)) *
        (data.operatingTime - data.min0_10)) /
        127,
    );

    emit("sample", {
      data: {
        batteryLevel: round(
          (Bits.bitsToUnsigned(bits.substr(136, 8)) * 100) / 127,
        ),
      },
      topic: "lifecycle",
    });

    data.anomalyLvL20Hours = round(Bits.bitsToUnsigned(bits.substr(144, 8)));
    data.anomalyLvL50Hours = round(Bits.bitsToUnsigned(bits.substr(152, 8)));
    data.anomalyLvL80Hours = round(Bits.bitsToUnsigned(bits.substr(160, 8)));

    data.anomalyLvL20Days = round(Bits.bitsToUnsigned(bits.substr(168, 8)));
    data.anomalyLvL50Days = round(Bits.bitsToUnsigned(bits.substr(176, 8)));
    data.anomalyLvL80Days = round(Bits.bitsToUnsigned(bits.substr(184, 8)));

    data.anomalyLvL20Months = round(Bits.bitsToUnsigned(bits.substr(192, 8)));
    data.anomalyLvL50Months = round(Bits.bitsToUnsigned(bits.substr(200, 8)));
    data.anomalyLvL80Months = round(Bits.bitsToUnsigned(bits.substr(208, 8)));
  } else if (header == 65 || header == 97) {
    // Alarm
    topic = "alarm";
    data.anomalyLevel = round(
      (Bits.bitsToUnsigned(bits.substr(8, 8)) * 100) / 127,
    );
    data.temperature = Bits.bitsToUnsigned(bits.substr(16, 8)) - 30;
    // NA
    var vl_1 = Bits.bitsToUnsigned(bits.substr(32, 8));
    var vl_2 = Bits.bitsToUnsigned(bits.substr(40, 8));
    var vl_3 = Bits.bitsToUnsigned(bits.substr(48, 8));
    data.vibration = round((vl_1 * 128 + vl_2 + vl_3 / 100) / 10 / 121.45); // float
    // fftSignal
  } else if (header == 83) {
    // State
    topic = "lifecycle";
    var sensorState = Bits.bitsToUnsigned(bits.substr(8, 8));
    if (sensorState == 100) {
      sensorState = "Sensor start";
    } else if (sensorState == 101) {
      sensorState = "Sensor stop";
    } else if (sensorState == 125) {
      sensorState = "Machine stop";
    } else if (sensorState == 126) {
      sensorState = "Machine start";
    }
    data.sensorState = sensorState;
    data.batteryLevel = round(
      (Bits.bitsToUnsigned(bits.substr(16, 8)) * 100) / 127,
    );
  }

  emit("sample", { data: data, topic: topic });
}
