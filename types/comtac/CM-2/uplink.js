function consume(event) {
  const payload = event.data.payloadHex;
  const { port } = event.data;
  const bits = Bits.hexToBits(payload);
  const data = {};
  const lifecycle = {};
  let topic = "default";

  if (port === 3) {
    lifecycle.version = Bits.bitsToUnsigned(bits.substring(0, 8));

    // Status
    lifecycle.digitalInputState = !!Bits.bitsToUnsigned(bits.substring(8, 9));
    lifecycle.deepSleepEvent = !!Bits.bitsToUnsigned(bits.substring(9, 10));
    lifecycle.digitalInputEvent = !!Bits.bitsToUnsigned(bits.substring(10, 11));
    lifecycle.buttonEvent = !!Bits.bitsToUnsigned(bits.substring(11, 12));
    lifecycle.txOnEvent = !!Bits.bitsToUnsigned(bits.substring(12, 13));
    lifecycle.txOnTimer = !!Bits.bitsToUnsigned(bits.substring(13, 14));
    // reserved
    lifecycle.booster = !!Bits.bitsToUnsigned(bits.substring(15, 16));

    // Event
    lifecycle.maxLemOn = !!Bits.bitsToUnsigned(bits.substring(16, 17));
    lifecycle.minLemOn = !!Bits.bitsToUnsigned(bits.substring(17, 18));
    lifecycle.maxPt100On = !!Bits.bitsToUnsigned(bits.substring(18, 19));
    lifecycle.minPt100On = !!Bits.bitsToUnsigned(bits.substring(19, 20));
    lifecycle.maxHumOn = !!Bits.bitsToUnsigned(bits.substring(20, 21));
    lifecycle.minHumOn = !!Bits.bitsToUnsigned(bits.substring(21, 22));
    lifecycle.maxTempOn = !!Bits.bitsToUnsigned(bits.substring(22, 23));
    lifecycle.minTempOn = !!Bits.bitsToUnsigned(bits.substring(23, 24));

    lifecycle.batteryVoltage = Bits.bitsToUnsigned(bits.substring(24, 40)) / 1000;
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
    data.temperature = Bits.bitsToSigned(bits.substring(40, 56)) / 100;
    data.humidity = Bits.bitsToSigned(bits.substring(56, 72)) / 100;
    data.temperaturePT100 = Bits.bitsToSigned(bits.substring(72, 88)) / 100;
    data.adc1 = Bits.bitsToUnsigned(bits.substring(88, 104));
    data.adc2 = Bits.bitsToUnsigned(bits.substring(104, 120));
    data.lem = Bits.bitsToUnsigned(bits.substring(120, 136)) / 1000;
    data.brightness = Bits.bitsToUnsigned(bits.substring(136, 144));

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
    data.appType = Bits.bitsToUnsigned(bits.substring(0, 8));
    data.appVersion = `${Bits.bitsToUnsigned(
      bits.substring(8, 16),
    )}.${Bits.bitsToUnsigned(bits.substring(16, 24))}`;
  } else if (port === 101) {
    topic = "system";
    data.sendInterval = Bits.bitsToUnsigned(bits.substring(0, 16));
    data.minTempThreshold = Bits.bitsToSigned(bits.substring(16, 24));
    data.maxTempThreshold = Bits.bitsToSigned(bits.substring(24, 32));
    data.minHumThreshold = Bits.bitsToUnsigned(bits.substring(32, 40));
    data.maxHumThreshold = Bits.bitsToUnsigned(bits.substring(40, 48));
    data.minPtThreshold = Bits.bitsToSigned(bits.substring(48, 56));
    data.maxPtThreshold = Bits.bitsToSigned(bits.substring(56, 64));
    data.minLemThreshold = Bits.bitsToUnsigned(bits.substring(64, 80));
    data.maxLemThreshold = Bits.bitsToUnsigned(bits.substring(80, 96));
    data.dinSettings = Bits.bitsToUnsigned(bits.substring(96, 104));
  }

  emit("sample", { data, topic });
}
