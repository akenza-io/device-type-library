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

function consume(event) {
  const payload = event.data.payloadHex;
  const bytes = Hex.hexToBytes(payload);
  const { port } = event.data;

  const climate = {};
  const door = {};
  const lifecycle = {};
  const settings = {};

  if (port === 15) {
    let idx = 0;
    const total = bytes.length;

    while (idx < total) {
      const length = bytes[idx];
      let iteration = "";

      switch (bytes[idx + 1]) {
        case 1: {
          let start = idx + 2;
          while (start < idx + length) {
            climate[`temperature${iteration}`] = signed(bytes[start] + bytes[start + 1] * 256, 2) / 100;
            climate[`humidity${iteration}`] = bytes[start + 2] / 2;
            start += 3;

            if (iteration === "") {
              iteration = 2;
            } else {
              iteration++;
            }
          }
          break;
        } case 2: {
          let start = idx + 2;
          let key = "co2";
          while (start < idx + length) {
            climate[`${key}${iteration}`] = bytes[start] + bytes[start + 1] * 256;
            start += 2;

            if (iteration === "") {
              iteration = 2;
              key += "_";
            } else {
              iteration++;
            }
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
            climate[`iaq${iteration}`] = bytes[start] + (bytes[start + 1] & 0x3f) * 256;
            climate[`iaqAccuracy${iteration}`] = bytes[start + 1] >> 6;
            start += 2;

            if (iteration === "") {
              iteration = 2;
            } else {
              iteration++;
            }
          }
          break;
        } case 16: {
          let start = idx + 2;
          while (start < idx + length) {
            climate[`pressure${iteration}`] = (
              bytes[start] +
              bytes[start + 1] * 256 +
              bytes[start + 2] * 256 * 256
            );
            start += 3;

            if (iteration === "") {
              iteration = 2;
            } else {
              iteration++;
            }
          }
          break;
        } case 17: {
          settings.reportedInterval = bytes[idx + 2] + bytes[idx + 3] * 256;
          break;
        } case 20: { // light not buffered atm
          climate.light = bytes[idx + 2] + bytes[idx + 3] * 256;
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

  if (deleteUnusedKeys(climate)) {
    emit("sample", { data: climate, topic: "climate" });
  }
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