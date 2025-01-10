function signed(value, size) {
  const mask = 1 << (size * 8 - 1);
  const buf = -(value & mask) + (value & ~mask);
  return buf;
}

function toHexString(byteArray) {
  let s = '';
  byteArray.forEach((byte) => {
    s += (`0${(byte & 0xFF).toString(16)}`).slice(-2);
  });
  return s;
}

function deleteUnusedKeys(data) {
  let keysRetained = false;
  Object.keys(data).forEach((key) => {
    if (data[key] === undefined || isNaN(data[key])) {
      delete data[key];
    } else {
      keysRetained = true;
    }
  });
  return keysRetained;
}

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
      emit("sample", { data, topic, timestamp: now });
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
  const bytes = Hex.hexToBytes(payload);
  const { port } = event.data;

  const temperature = [];
  const humidity = [];
  const co2 = [];
  const iaq = [];
  const iaqAccuracy = [];
  const pressure = [];
  let light;

  const door = {};
  const lifecycle = {};
  const settings = {};

  if (port === 15) {
    let idx = 0;
    const total = bytes.length;

    while (idx < total) {
      const length = bytes[idx];
      switch (bytes[idx + 1]) {
        case 1: {
          let start = idx + 2;
          while (start < idx + length) {
            temperature.push(signed(bytes[start] + bytes[start + 1] * 256, 2) / 100);
            humidity.push(bytes[start + 2] / 2);
            start += 3;
          }
          break;
        } case 2: {
          let start = idx + 2;
          while (start < idx + length) {
            co2.push(bytes[start] + bytes[start + 1] * 256)
            start += 2;
          }
          break;
        } case 5: {
          settings.sendCycle = bytes[idx + 2] + bytes[idx + 3] * 256;
          settings.transmissionInterval = bytes[idx + 4];
          settings.cfm = Boolean(bytes[idx + 5] & 0x80);
          settings.led = Boolean(bytes[idx + 5] & 0x40);
          settings.adr = Boolean(bytes[idx + 5] & 0x20);
          settings.continousIaq = Boolean(bytes[idx + 5] & 0x10);
          settings.rptInt = Boolean(bytes[idx + 5] & 0x08);
          settings.nbretrans = bytes[idx + 6] & 0x0f;
          break;
        } case 6: {
          settings.co2Subsamples =
            bytes[idx + 4] + bytes[idx + 5] * 256;
          settings.co2AbcPeriod =
            bytes[idx + 6] + bytes[idx + 7] * 256;
          break;
        } case 9: {
          lifecycle.batteryVoltage = (bytes[idx + 2] + bytes[idx + 3] * 256) / 100;
          break;
        } case 10: {
          settings.gitHash = toHexString(
            bytes.slice(idx + 2, idx + 6).reverse()
          );
          break;
        } case 11: {
          door.doorAlarm = true;
          door.openCounter =
            bytes[idx + 2] +
            bytes[idx + 3] * 256 +
            bytes[idx + 4] * 256 * 256 +
            bytes[idx + 5] * 256 * 256 * 256;
          door.alarmCounter = bytes[idx + 6] + bytes[idx + 7] * 256;
          settings.alarmTime = bytes[idx + 8] + bytes[idx + 9] * 256;
          break;
        } case 12: {
          door.doorAlarm = false;
          door.openCounter =
            bytes[idx + 2] +
            bytes[idx + 3] * 256 +
            bytes[idx + 4] * 256 * 256 +
            bytes[idx + 5] * 256 * 256 * 256;
          door.alarmCounter = bytes[idx + 6] + bytes[idx + 7] * 256;
          break;
        } case 13: {
          door.openCounter =
            bytes[idx + 2] +
            bytes[idx + 3] * 256 +
            bytes[idx + 4] * 256 * 256 +
            bytes[idx + 5] * 256 * 256 * 256;
          door.alarmCounter = bytes[idx + 6] + bytes[idx + 7] * 256;
          door.doorAlarm = Boolean(bytes[idx + 8]);
          break;
        } case 14: {
          settings.alarmTime = bytes[idx + 2] + bytes[idx + 3] * 256; // S
          settings.hallDebounce =
            bytes[idx + 4] + bytes[idx + 5] * 256; // MS
          settings.doorStatusTime =
            bytes[idx + 6] +
            bytes[idx + 7] * 256 +
            bytes[idx + 8] * 256 * 256 +
            bytes[idx + 9] * 256 * 256 * 256; // S
          break;
        } case 15: {
          let start = idx + 2;
          while (start < idx + length) {
            iaq.push(bytes[start] + (bytes[start + 1] & 0x3f) * 256);
            iaqAccuracy.push(bytes[start + 1] >> 6);
            start += 2;
          }
          break;
        } case 16: {
          let start = idx + 2;
          while (start < idx + length) {
            pressure.push(
              bytes[start] +
              bytes[start + 1] * 256 +
              bytes[start + 2] * 256 * 256
            );
            start += 3;
          }
          break;
        } case 17: {
          settings.reportedInterval = bytes[idx + 2] + bytes[idx + 3] * 256;
          break;
        } case 20: { // light not buffered atm
          light = bytes[idx + 2] + bytes[idx + 3] * 256;
          break;
        } case 21: {
          settings.condTxCo2Th = bytes[idx + 2] + bytes[idx + 3] * 256;
          settings.condTxTempTh = bytes[idx + 4] + bytes[idx + 5] * 256;
          settings.condTxHumTh = bytes[idx + 6] + bytes[idx + 7] * 256;
          break;
        } case 22: {
          settings.blindAdrProfile = bytes[idx + 2];
          break;
        } case 23: {
          settings.lightInterval = bytes[idx + 2];
          break;
        } default:
          break;
      }

      idx += length + 1;
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

  if (iaq.length !== 0) {
    state.lastIaqSample = climateSamples(iaq, "iaq", state.lastIaqSample);
  }

  if (pressure.length !== 0) {
    state.lastPressureSample = climateSamples(pressure, "pressure", state.lastPressureSample);
  }

  emit("state", state);

  if (deleteUnusedKeys(door)) {
    emit("sample", { data: door, topic: "door" });
  }
  if (deleteUnusedKeys(lifecycle)) {
    emit("sample", { data: lifecycle, topic: "lifecycle" });
  }
  if (deleteUnusedKeys(settings)) {
    emit("sample", { data: settings, topic: "settings" });
  }
}