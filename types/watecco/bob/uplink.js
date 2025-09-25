function cToF(celsius) {
  return Math.round(((celsius * 9) / 5 + 32) * 10) / 10;
}

function round(value) {
  return Math.round(value * 1000) / 1000;
}

function consume(event) {
  const payload = event.data.payloadHex;
  const bits = Bits.hexToBits(payload);
  const data = {};
  let topic = "default";

  const header = Bits.bitsToUnsigned(bits.substr(0, 8));

  let frequency = 1000;
  let device = "MPU";
  if (header === 108 || header === 114 || header === 97) {
    frequency = 800;
    device = "KX";
  }

  // Learning
  if (header === 76 || header === 108) {
    topic = "learning";
    data.device = device;
    data.learningPercentage = Bits.bitsToUnsigned(bits.substr(8, 8));
    const vl1 = Bits.bitsToUnsigned(bits.substr(16, 8));
    const vl2 = Bits.bitsToUnsigned(bits.substr(24, 8));
    const vl3 = Bits.bitsToUnsigned(bits.substr(32, 8));
    data.vibrationLevel = (vl1 * 128 + vl2 + vl3 / 100) / 10 / 121.45; // float
    // Frequency_index
    data.temperature = Bits.bitsToUnsigned(bits.substr(48, 8)) - 30;
    data.temperatureF = cToF(data.temperature);
    const learningFrom = Bits.bitsToUnsigned(bits.substr(56, 8));

    if (learningFrom) {
      data.learningFrom = "ZERO";
    } else if (learningFrom) {
      data.learningFrom = "ADDITIONAL_LEARNING";
    }
    data.peakFrequencyIndex = Bits.bitsToUnsigned(bits.substr(40, 8)) + 1;

    if (data.peakFrequencyIndex < 128) {
      data.peakFrequency = (data.peakFrequencyIndex * frequency) / 256;
    } else if (data.peakFrequencyIndex >= 128) {
      data.peakFrequency =
        (((Bits.bitsToUnsigned(bits.substr(40, 8)) & 0x7) + 1) * frequency) /
        256;
    }
    // FFT Signal
    for (let i = 8; i <= 39; i++) {
      data[`fft${i - 7}`] =
        (Bits.bitsToUnsigned(bits.substr(i * 8, 8)) * data.vibrationLevel) /
        127;
    }
  } else if (header === 82 || header === 114) {
    // Report
    topic = "report";

    data.anomalyLevel = round(
      (Bits.bitsToUnsigned(bits.substr(8, 8)) * 100) / 127,
    );

    data.nrAlarms = Bits.bitsToUnsigned(bits.substr(32, 8));
    data.temperature = Bits.bitsToUnsigned(bits.substr(40, 8)) - 30;
    data.temperatureF = cToF(data.temperature);

    let reportLength = Bits.bitsToUnsigned(bits.substr(48, 8));
    data.operatingTime =
      (Bits.bitsToUnsigned(bits.substr(16, 8)) * reportLength) / 127;

    if (reportLength > 59) {
      reportLength = (reportLength - 59) * 60;
    }

    data.reportID = Bits.bitsToUnsigned(bits.substr(56, 8));

    const vl1 = Bits.bitsToUnsigned(bits.substr(64, 8));
    const vl2 = Bits.bitsToUnsigned(bits.substr(72, 8));
    const vl3 = Bits.bitsToUnsigned(bits.substr(80, 8));
    data.maxAmplitude = round((vl1 * 128 + vl2 + vl3 / 100) / 10 / 121.45); // float
    // Frequency_index

    data.peakFrequencyIndex = Bits.bitsToUnsigned(bits.substr(88, 8)) + 1;
    if (data.peakFrequencyIndex < 128) {
      data.peakFrequency = (data.peakFrequencyIndex * frequency) / 256;
    } else if (data.peakFrequencyIndex >= 128) {
      data.peakFrequency =
        (((Bits.bitsToUnsigned(bits.substr(88, 8)) & 0x7) + 1) * frequency) /
        256;
    }

    // Anomaly level time 0 - 10%, ok frequencies
    data.goodVibration = round(
      (Bits.bitsToUnsigned(bits.substr(24, 8)) * data.operatingTime) / 127,
    );
    // Time [minutes] spent in the 10-20% anomaly level range
    data.badVibrationPercentage1020 = round(
      (Bits.bitsToUnsigned(bits.substr(96, 8)) *
        (data.operatingTime - data.goodVibration)) /
      127,
    );
    // Time [minutes] spent in the 20-40% anomaly level range
    data.badVibrationPercentage2040 = round(
      (Bits.bitsToUnsigned(bits.substr(104, 8)) *
        (data.operatingTime - data.goodVibration)) /
      127,
    );
    // Time [minutes] spent in the 40-60% anomaly level range
    data.badVibrationPercentage4060 = round(
      (Bits.bitsToUnsigned(bits.substr(112, 8)) *
        (data.operatingTime - data.goodVibration)) /
      127,
    );
    // Time [minutes] spent in the 60-80% anomaly level range
    data.badVibrationPercentage6080 = round(
      (Bits.bitsToUnsigned(bits.substr(120, 8)) *
        (data.operatingTime - data.goodVibration)) /
      127,
    );
    // Time [minutes] spent in the 80-100% anomaly level range
    data.badVibrationPercentage80100 = round(
      (Bits.bitsToUnsigned(bits.substr(128, 8)) *
        (data.operatingTime - data.goodVibration)) /
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

    // anomaly level: 255 = infinite time
    data.anomalyLevelTo20Last24h = round(
      Bits.bitsToUnsigned(bits.substr(144, 8)),
    ); // Prediction: time [hours] when anomaly level reaches 20% (24 hours base)
    data.anomalyLevelTo50Last24h = round(
      Bits.bitsToUnsigned(bits.substr(152, 8)),
    ); // Prediction: time [hours] when anomaly level reaches 50% (24 hours base)
    data.anomalyLevelTo80Last24h = round(
      Bits.bitsToUnsigned(bits.substr(160, 8)),
    ); // Prediction: time [hours] when anomaly level reaches 80% (24 hours base)

    data.anomalyLevelTo20Last30d = round(
      Bits.bitsToUnsigned(bits.substr(168, 8)),
    ); // Prediction: time [days] when anomaly level reaches 20% (30 days base)
    data.anomalyLevelTo50Last30d = round(
      Bits.bitsToUnsigned(bits.substr(176, 8)),
    ); // Prediction: time [days] when anomaly level reaches 50% (30 days base)
    data.anomalyLevelTo80Last30d = round(
      Bits.bitsToUnsigned(bits.substr(184, 8)),
    ); // Prediction: time [days] when anomaly level reaches 80% (30 days base)

    data.anomalyLevelTo20Last6m = round(
      Bits.bitsToUnsigned(bits.substr(192, 8)),
    ); // Prediction: time [months] when anomaly level reaches 20% (6 months base)
    data.anomalyLevelTo50Last6m = round(
      Bits.bitsToUnsigned(bits.substr(200, 8)),
    ); // Prediction: time [months] when anomaly level reaches 50% (6 months base)
    data.anomalyLevelTo80Last6m = round(
      Bits.bitsToUnsigned(bits.substr(208, 8)),
    ); // Prediction: time [months] when anomaly level reaches 80% (6 months base)
  } else if (header === 65 || header === 97) {
    // Alarm
    topic = "alarm";
    data.anomalyLevel = round(
      (Bits.bitsToUnsigned(bits.substr(8, 8)) * 100) / 127,
    );
    data.temperature = Bits.bitsToUnsigned(bits.substr(16, 8)) - 30;
    data.temperatureF = cToF(data.temperature);
    // NA
    const vl1 = Bits.bitsToUnsigned(bits.substr(32, 8));
    const vl2 = Bits.bitsToUnsigned(bits.substr(40, 8));
    const vl3 = Bits.bitsToUnsigned(bits.substr(48, 8));
    data.vibrationLevel = round((vl1 * 128 + vl2 + vl3 / 100) / 10 / 121.45); // float
    // fftSignal
    for (let i = 8; i <= 39; i++) {
      data[`fft${i - 7}`] =
        (Bits.bitsToUnsigned(bits.substr(i * 8, 8)) * data.vibrationLevel) /
        127;
    }
  } else if (header === 83) {
    // State
    topic = "lifecycle";
    let sensorState = Bits.bitsToUnsigned(bits.substr(8, 8));
    if (sensorState === 100) {
      sensorState = "SENSOR_START";
    } else if (sensorState === 101) {
      sensorState = "SENSOR_STOP";
    } else if (sensorState === 104) {
      sensorState = "SENSOR_START_NO_VIBRATION";
    } else if (sensorState === 105) {
      sensorState = "SENSOR_STOP_NO_VIBRATION";
    } else if (sensorState === 106) {
      sensorState = "SENSOR_LEARN_KEEPALIVE";
    } else if (sensorState === 110) {
      sensorState = "SENSOR_STOP_WITH_ERASE";
    } else if (sensorState === 125) {
      sensorState = "MACHINE_STOP";
    } else if (sensorState === 126) {
      sensorState = "MACHINE_START";
    }
    data.sensorState = sensorState;
    data.batteryLevel = round(
      (Bits.bitsToUnsigned(bits.substr(16, 8)) * 100) / 127,
    );
  }

  emit("sample", { data, topic });
}
