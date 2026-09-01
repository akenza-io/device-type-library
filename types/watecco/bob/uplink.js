function round(value) {
  return Math.round(value * 1000) / 1000;
}

function consume(event) {
  const payload = event.data.payloadHex;
  const bits = Bits.hexToBits(payload);
  const now = new Date().getTime();
  const state = event.state || {};
  const data = {};
  let topic = "default";

  const header = Bits.bitsToUnsigned(bits.substring(0, 8));

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
    data.learningPercentage = Bits.bitsToUnsigned(bits.substring(8, 16));
    const vl1 = Bits.bitsToUnsigned(bits.substring(16, 24));
    const vl2 = Bits.bitsToUnsigned(bits.substring(24, 32));
    const vl3 = Bits.bitsToUnsigned(bits.substring(32, 40));
    data.vibrationLevel = (vl1 * 128 + vl2 + vl3 / 100) / 10 / 121.45; // float
    // Frequency_index
    data.temperature = Bits.bitsToUnsigned(bits.substring(48, 56)) - 30;
    const learningFrom = !!Bits.bitsToUnsigned(bits.substring(56, 64));

    if (learningFrom) {
      data.learningFrom = "ZERO";
    } else {
      data.learningFrom = "ADDITIONAL_LEARNING";
    }
    data.peakFrequencyIndex = Bits.bitsToUnsigned(bits.substring(40, 48)) + 1;

    if (data.peakFrequencyIndex < 128) {
      data.peakFrequency = (data.peakFrequencyIndex * frequency) / 256;
    } else if (data.peakFrequencyIndex >= 128) {
      data.peakFrequency =
        (((Bits.bitsToUnsigned(bits.substring(40, 48)) & 0x7) + 1) * frequency) /
        256;
    }
    // FFT Signal
    for (let i = 8; i <= 39; i++) {
      data[`fft${i - 7}`] =
        (Bits.bitsToUnsigned(bits.substring(i * 8, i * 8 + 8)) * data.vibrationLevel) /
        127;
    }
  } else if (header === 82 || header === 114) {
    // Report
    topic = "report";

    data.anomalyLevel = round(
      (Bits.bitsToUnsigned(bits.substring(8, 16)) * 100) / 127,
    );

    data.nrAlarms = Bits.bitsToUnsigned(bits.substring(32, 40));
    data.temperature = Bits.bitsToUnsigned(bits.substring(40, 48)) - 30;

    let reportLength = Bits.bitsToUnsigned(bits.substring(48, 56));
    data.operatingTime =
      (Bits.bitsToUnsigned(bits.substring(16, 24)) * reportLength) / 127;

    if (reportLength > 59) {
      reportLength = (reportLength - 59) * 60;
    }

    data.reportID = Bits.bitsToUnsigned(bits.substring(56, 64));

    const vl1 = Bits.bitsToUnsigned(bits.substring(64, 72));
    const vl2 = Bits.bitsToUnsigned(bits.substring(72, 80));
    const vl3 = Bits.bitsToUnsigned(bits.substring(80, 88));
    data.maxAmplitude = round((vl1 * 128 + vl2 + vl3 / 100) / 10 / 121.45); // float
    // Frequency_index

    data.peakFrequencyIndex = Bits.bitsToUnsigned(bits.substring(88, 96)) + 1;
    if (data.peakFrequencyIndex < 128) {
      data.peakFrequency = (data.peakFrequencyIndex * frequency) / 256;
    } else if (data.peakFrequencyIndex >= 128) {
      data.peakFrequency =
        (((Bits.bitsToUnsigned(bits.substring(88, 96)) & 0x7) + 1) * frequency) /
        256;
    }

    // Anomaly level time 0 - 10%, ok frequencies
    data.goodVibration = round(
      (Bits.bitsToUnsigned(bits.substring(24, 32)) * data.operatingTime) / 127,
    );
    // Time [minutes] spent in the 10-20% anomaly level range
    data.badVibrationPercentage1020 = round(
      (Bits.bitsToUnsigned(bits.substring(96, 104)) *
        (data.operatingTime - data.goodVibration)) /
      127,
    );
    // Time [minutes] spent in the 20-40% anomaly level range
    data.badVibrationPercentage2040 = round(
      (Bits.bitsToUnsigned(bits.substring(104, 112)) *
        (data.operatingTime - data.goodVibration)) /
      127,
    );
    // Time [minutes] spent in the 40-60% anomaly level range
    data.badVibrationPercentage4060 = round(
      (Bits.bitsToUnsigned(bits.substring(112, 120)) *
        (data.operatingTime - data.goodVibration)) /
      127,
    );
    // Time [minutes] spent in the 60-80% anomaly level range
    data.badVibrationPercentage6080 = round(
      (Bits.bitsToUnsigned(bits.substring(120, 128)) *
        (data.operatingTime - data.goodVibration)) /
      127,
    );
    // Time [minutes] spent in the 80-100% anomaly level range
    data.badVibrationPercentage80100 = round(
      (Bits.bitsToUnsigned(bits.substring(128, 136)) *
        (data.operatingTime - data.goodVibration)) /
      127,
    );

    let lifecycle = {};
    lifecycle.batteryLevel = round((Bits.bitsToUnsigned(bits.substring(136, 144)) * 100) / 127);
    lifecycle.machineRunning = false;
    lifecycle.sensorRunning = false;
    if (state.lastMachineStatus === "MACHINE_START") {
      lifecycle.machineRunning = true;
    }
    if (state.lastSensorStatus === "SENSOR_START") {
      lifecycle.sensorRunning = true;
    }

    emit("sample", {
      data: lifecycle,
      topic: "lifecycle",
    });

    // anomaly level: 255 = infinite time
    data.anomalyLevelTo20Last24h = round(
      Bits.bitsToUnsigned(bits.substring(144, 152)),
    ); // Prediction: time [hours] when anomaly level reaches 20% (24 hours base)
    data.anomalyLevelTo50Last24h = round(
      Bits.bitsToUnsigned(bits.substring(152, 160)),
    ); // Prediction: time [hours] when anomaly level reaches 50% (24 hours base)
    data.anomalyLevelTo80Last24h = round(
      Bits.bitsToUnsigned(bits.substring(160, 168)),
    ); // Prediction: time [hours] when anomaly level reaches 80% (24 hours base)

    data.anomalyLevelTo20Last30d = round(
      Bits.bitsToUnsigned(bits.substring(168, 176)),
    ); // Prediction: time [days] when anomaly level reaches 20% (30 days base)
    data.anomalyLevelTo50Last30d = round(
      Bits.bitsToUnsigned(bits.substring(176, 184)),
    ); // Prediction: time [days] when anomaly level reaches 50% (30 days base)
    data.anomalyLevelTo80Last30d = round(
      Bits.bitsToUnsigned(bits.substring(184, 192)),
    ); // Prediction: time [days] when anomaly level reaches 80% (30 days base)

    data.anomalyLevelTo20Last6m = round(
      Bits.bitsToUnsigned(bits.substring(192, 200)),
    ); // Prediction: time [months] when anomaly level reaches 20% (6 months base)
    data.anomalyLevelTo50Last6m = round(
      Bits.bitsToUnsigned(bits.substring(200, 208)),
    ); // Prediction: time [months] when anomaly level reaches 50% (6 months base)
    data.anomalyLevelTo80Last6m = round(
      Bits.bitsToUnsigned(bits.substring(208, 216)),
    ); // Prediction: time [months] when anomaly level reaches 80% (6 months base)
  } else if (header === 65 || header === 97) {
    // Alarm
    topic = "alarm";
    data.anomalyLevel = round(
      (Bits.bitsToUnsigned(bits.substring(8, 16)) * 100) / 127,
    );
    data.temperature = Bits.bitsToUnsigned(bits.substring(16, 24)) - 30;
    // NA
    const vl1 = Bits.bitsToUnsigned(bits.substring(32, 40));
    const vl2 = Bits.bitsToUnsigned(bits.substring(40, 48));
    const vl3 = Bits.bitsToUnsigned(bits.substring(48, 56));
    data.vibrationLevel = round((vl1 * 128 + vl2 + vl3 / 100) / 10 / 121.45); // float
    // fftSignal
    for (let i = 8; i <= 39; i++) {
      data[`fft${i - 7}`] =
        (Bits.bitsToUnsigned(bits.bits.substring(i * 8, i * 8 + 8)) * data.vibrationLevel) /
        127;
    }
  } else if (header === 83) {
    topic = "status";
    // State init
    if (state.lastSensorStart == undefined) {
      state.lastSensorStart = now;
      state.lastMachineStart = now;
      state.lastMachineStatus = "MACHINE_STOP";
      state.lastSensorStatus = "SENSOR_STOP";
    }
    //
    data.sensorStart = false;
    data.sensorStop = false;
    data.sensorNoVibration = false;
    data.sensorStopNoVibration = false;
    data.sensorLearnKeepalive = false;
    data.machineStopWithErase = false;
    data.machineStop = false;
    data.machineStart = false;

    let sensorState = Bits.bitsToUnsigned(bits.substring(8, 16));
    if (sensorState === 100) {
      sensorState = "SENSOR_START";
      data.sensorStart = true;

      state.lastSensorStatus = sensorState;
      state.lastSensorStart = now;
    } else if (sensorState === 101) {
      sensorState = "SENSOR_STOP";
      state.lastSensorStatus = sensorState;
      data.sensorStop = true;

      let sensorRuntime = Math.round((now - state.lastSensorStart) / 1000 / 60);
      emit("sample", { data: { sensorRuntime }, topic: "sensor_runtime" });
    } else if (sensorState === 104) {
      sensorState = "SENSOR_NO_VIBRATION";
      data.sensorNoVibration = true;
    } else if (sensorState === 105) {
      sensorState = "SENSOR_STOP_NO_VIBRATION";
      data.sensorStopNoVibration = true;
    } else if (sensorState === 106) {
      sensorState = "SENSOR_LEARN_KEEPALIVE";
      data.sensorLearnKeepalive = true;
    } else if (sensorState === 110) {
      sensorState = "MACHINE_STOP_WITH_ERASE";
      data.machineStopWithErase = true;
    } else if (sensorState === 125) {
      sensorState = "MACHINE_STOP";
      state.lastMachineStatus = sensorState;
      data.machineStop = true;

      // Machine runtime
      let machineRuntime = Math.round((now - state.lastMachineStart) / 1000 / 60);
      emit("sample", { data: { machineRuntime }, topic: "machine_runtime" });
    } else if (sensorState === 126) {
      sensorState = "MACHINE_START";
      state.lastMachineStart = now;
      state.lastMachineStatus = sensorState;
      data.machineStart = true;
    }
    data.sensorState = sensorState;

    const lifecycle = {};
    lifecycle.batteryLevel = round((Bits.bitsToUnsigned(bits.substring(16, 24)) * 100) / 127);
    lifecycle.machineRunning = false;
    lifecycle.sensorRunning = false;
    if (state.lastMachineStatus === "MACHINE_START") {
      lifecycle.machineRunning = true;
    }
    if (state.lastSensorStatus === "SENSOR_START") {
      lifecycle.sensorRunning = true;
    }
    emit("state", state);

    emit("sample", {
      data: lifecycle,
      topic: "lifecycle",
    });
  }
  emit("sample", { data, topic });
}