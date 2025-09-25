function cToF(celsius) {
  return Math.round(((celsius * 9) / 5 + 32) * 10) / 10;
}

function consume(event) {
  const payload = event.data.payloadHex;
  const { port } = event.data;
  const bits = Bits.hexToBits(payload);
  const data = {};
  const lifecycle = {};
  let topic = "default";

  if (port === 3) {
    lifecycle.version = Bits.bitsToUnsigned(bits.substr(0, 8));

    // Status
    lifecycle.digitalInputState = !!Bits.bitsToUnsigned(bits.substr(8, 1));
    lifecycle.deepSleepEvent = !!Bits.bitsToUnsigned(bits.substr(9, 1));
    lifecycle.digitalInputEvent = !!Bits.bitsToUnsigned(bits.substr(10, 1));
    lifecycle.buttonEvent = !!Bits.bitsToUnsigned(bits.substr(11, 1));
    lifecycle.txOnEvent = !!Bits.bitsToUnsigned(bits.substr(12, 1));
    lifecycle.txOnTimer = !!Bits.bitsToUnsigned(bits.substr(13, 1));
    // reserved
    lifecycle.booster = !!Bits.bitsToUnsigned(bits.substr(15, 1));

    // Event
    lifecycle.maxLemOn = !!Bits.bitsToUnsigned(bits.substr(16, 1));
    lifecycle.minLemOn = !!Bits.bitsToUnsigned(bits.substr(17, 1));
    lifecycle.maxPt100On = !!Bits.bitsToUnsigned(bits.substr(18, 1));
    lifecycle.minPt100On = !!Bits.bitsToUnsigned(bits.substr(19, 1));
    lifecycle.maxHumOn = !!Bits.bitsToUnsigned(bits.substr(20, 1));
    lifecycle.minHumOn = !!Bits.bitsToUnsigned(bits.substr(21, 1));
    lifecycle.maxTempOn = !!Bits.bitsToUnsigned(bits.substr(22, 1));
    lifecycle.minTempOn = !!Bits.bitsToUnsigned(bits.substr(23, 1));

    lifecycle.batteryVoltage = Bits.bitsToUnsigned(bits.substr(24, 16)) / 1000;
    let batteryLevel =
      Math.round((lifecycle.batteryVoltage - 2.2) / 0.008 / 10) * 10; // 2.2V - 3V
    if (batteryLevel > 100) {
      batteryLevel = 100;
    } else if (batteryLevel < 0) {
      batteryLevel = 0;
    }
    lifecycle.batteryLevel = batteryLevel;

    emit("sample", { data: lifecycle, topic: "lifecycle" });

    // Data
    data.temperature = Bits.bitsToSigned(bits.substr(40, 16)) / 100;
    data.temperatureF = cToF(data.temperature);
    data.humidity = Bits.bitsToSigned(bits.substr(56, 16)) / 100;
    data.temperaturePT100 = Bits.bitsToSigned(bits.substr(72, 16)) / 100;
    data.temperaturePT100F = cToF(data.temperaturePT100);
    data.adc1 = Bits.bitsToUnsigned(bits.substr(88, 16));
    data.adc2 = Bits.bitsToUnsigned(bits.substr(104, 16));
    data.lem = Bits.bitsToUnsigned(bits.substr(120, 16)) / 1000;
    data.brightness = Bits.bitsToUnsigned(bits.substr(136, 8));

    if (lifecycle.deepSleepEvent === true) {
      emit("sample", { data: { sleep: true }, topic: "sleep" });
    }
    if (lifecycle.buttonEvent === true) {
      emit("sample", {
        data: { buttonPressed: true },
        topic: "button_pressed",
      });
    }
    if (lifecycle.txOnEvent === true) {
      emit("sample", { data: { event: true }, topic: "event" });
    }
    if (lifecycle.txOnTimer === true) {
      emit("sample", { data: { timer: true }, topic: "timer" });
    }
  } else if (port === 100) {
    topic = "system";
    data.appType = Bits.bitsToUnsigned(bits.substr(0, 8));
    data.appVersion = `${Bits.bitsToUnsigned(
      bits.substr(8, 8),
    )}.${Bits.bitsToUnsigned(bits.substr(16, 8))}`;
  } else if (port === 101) {
    topic = "system";
    data.sendInterval = Bits.bitsToUnsigned(bits.substr(0, 16));
    data.minTempThreshold = Bits.bitsToSigned(bits.substr(16, 8));
    data.minTempThresholdF = cToF(data.minTempThreshold);
    data.maxTempThreshold = Bits.bitsToSigned(bits.substr(24, 8));
    data.maxTempThresholdF = cToF(data.maxTempThreshold);
    data.minHumThreshold = Bits.bitsToUnsigned(bits.substr(32, 8));
    data.maxHumThreshold = Bits.bitsToUnsigned(bits.substr(40, 8));
    data.minPtThreshold = Bits.bitsToSigned(bits.substr(48, 8));
    data.minPtThresholdF = cToF(data.minPtThreshold);
    data.maxPtThreshold = Bits.bitsToSigned(bits.substr(56, 8));
    data.maxPtThresholdF = cToF(data.maxPtThreshold);
    data.minLemThreshold = Bits.bitsToUnsigned(bits.substr(64, 16));
    data.maxLemThreshold = Bits.bitsToUnsigned(bits.substr(80, 16));
    data.dinSettings = Bits.bitsToUnsigned(bits.substr(96, 8));
  }

  emit("sample", { data, topic });
}
