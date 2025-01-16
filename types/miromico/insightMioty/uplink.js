function climateSamples(values, topic, state) {
  let now = new Date().getTime();
  let sampleInterval = 0;
  if (state !== undefined) {
    sampleInterval = Math.round((now - state) / values.length);
  }

  if (sampleInterval !== 0) {
    // Give out samples with the right time // Different values can have different intervals :(
    values.forEach(datapoint => {
      const data = {};
      data[topic] = datapoint;
      emit("sample", { data, topic, timestamp: new Date(now) });
      now -= sampleInterval;
    });
  } else {
    // If no timestamps are available. Only give out the newest sample
    const data = {};
    data[topic] = values[0];
    emit("sample", { data, topic });
  }

  return new Date().getTime()
}

function consume(event) {
  const payload = event.data.payloadHex;
  const bits = Bits.hexToBits(payload);
  const lifecycle = {};
  const settings = {};

  const temperature = [];
  const humidity = [];
  const co2 = [];

  for (let pointer = 0; pointer < bits.length;) {
    let length = (Bits.bitsToUnsigned(bits.substr(pointer, 8)) - 1) * 8;
    const msgtype = Bits.bitsToUnsigned(bits.substr((pointer += 8), 8));
    pointer += 8;
    length += pointer;

    switch (msgtype) {
      case 1:
        while (pointer < length) {
          temperature.push(Hex.hexLittleEndianToBigEndian(payload.substr(pointer / 4, 4), true) * 0.01)
          pointer += 16;
          humidity.push(Hex.hexLittleEndianToBigEndian(payload.substr(pointer / 4, 2), true) * 0.5);
          pointer += 8;
        }
        break;
      case 2:
        while (pointer < length) {
          const co2msb = bits.substr(pointer, 8);
          pointer += 8;
          const co2lsb = bits.substr(pointer, 8);
          pointer += 8;
          co2.push(Bits.bitsToUnsigned(co2lsb + co2msb));
        }
        break;
      case 3:
        lifecycle.consumption = Hex.hexLittleEndianToBigEndian(
          payload.substr(pointer / 4, 6),
          false,
        );
        pointer += 32;
        break;
      case 5:
        settings.measurementInterval = Hex.hexLittleEndianToBigEndian(
          payload.substr(pointer / 4, 4),
          false,
        );
        pointer += 16;
        settings.temperatureSamples = Hex.hexLittleEndianToBigEndian(
          payload.substr(pointer / 4, 2),
          false,
        );
        pointer += 16;
        break;
      case 6:
        pointer += 16;
        settings.co2Subsample = Hex.hexLittleEndianToBigEndian(
          payload.substr(pointer / 4, 4),
          false,
        );
        pointer += 16;
        settings.abcCalibrationPeriod = Hex.hexLittleEndianToBigEndian(
          payload.substr(pointer / 4, 4),
          false,
        );
        pointer += 16;
        break;
      case 10:
        lifecycle.batteryVoltage =
          (Bits.bitsToUnsigned(bits.substr(pointer, 8)) + 170) / 100;
        pointer += 8;
        break;
      case 11:
        settings.firmwareHash = payload.substr(pointer / 4, 8);
        pointer += 32;
        break;
      default:
        lifecycle.error = "Wrong length of payload";
        break;
    }
  }

  const state = event.state || {};
  // Temperature & Humidity always comes in pairs
  if (temperature.length !== 0) {
    climateSamples(temperature, "temperature", state.lastTemperatureSample);
    state.lastTemperatureSample = climateSamples(humidity, "humidity", state.lastTemperatureSample);
  }

  if (co2.length !== 0) {
    state.lastCo2Sample = climateSamples(co2, "co2", state.lastCo2Sample);
  }
  emit("state", state);

  if (Object.keys(lifecycle).length > 0) {
    emit("sample", { data: lifecycle, topic: "lifecycle" });
  }

  if (Object.keys(settings).length > 0) {
    emit("sample", { data: settings, topic: "settings" });
  }
}
