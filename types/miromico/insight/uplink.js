/**
 * Copyright (c) akenza.io
 *
 * @summary Payload Decoder for miromico - insight
 * @author akenza.io - dta
 *
 * Created at : 2026-02-16
 */

const DSTYPES = {
  DS_TEMP_HUM: 0x01,
  DS_CO2: 0x02,
  DS_COMMON_SETTINGS: 0x05,
  DS_CO2_SETTINGS: 0x06,
  DS_BATTERY_VOLTAGE: 0x09,
  DS_FW_HASH: 0x0a,
  DS_DOOR_ALARM: 0x0b,
  DS_DOOR_ALARM_CLEARED: 0x0c,
  DS_DOOR_STATUS: 0x0d,
  DS_DOOR_SETTINGS: 0x0e,
  DS_IAQ_DATA: 0x0f,
  DS_PRESSURE_DATA: 0x10,
  DS_REPORT_INTERVAL: 0x11,
  DS_LIGHT_INTENSITY: 0x14,
  DS_CONDITIONAL_TX: 0x15,
  DS_BLIND_ADR: 0x16,
  DS_LIGHT_MEASUREMENT: 0x17,
  DS_PARTICULATE_MATTER: 0x18,
  DS_NOISE_ALARM: 0x19,
  DS_MICROPHONE_SETTINGS: 0x1a,
  DS_PM_SETTINGS: 0x1b,
};

function readUInt16LE(bytes, offset) {
  return (bytes[offset] | (bytes[offset + 1] << 8)) >>> 0;
}

function readInt16LE(bytes, offset) {
  let val = readUInt16LE(bytes, offset);
  if (val & 0x8000) {
    val = val - 0x10000;
  }
  return val;
}

function readUInt24LE(bytes, offset) {
  return (
    (bytes[offset] | (bytes[offset + 1] << 8) | (bytes[offset + 2] << 16)) >>>
    0
  );
}

function readUInt32LE(bytes, offset) {
  return (
    ((bytes[offset + 3] << 24) >>> 0) +
    (bytes[offset + 2] << 16) +
    (bytes[offset + 1] << 8) +
    bytes[offset]
  );
}

function consume(event) {
  const bytes = Hex.hexToBytes(event.data.payloadHex);
  const { port } = event.data;

  if (port !== 15) {
    return;
  }

  const rawData = {
    tempHum: [],
    co2: [],
    pressure: [],
    iaq: [],
    pm: [],
    light: null,
    doorEvents: [],
    configs: {},
    lifecycle: {},
  };

  let i = 0;
  let measurementInterval = -1;

  while (i < bytes.length) {
    const length = bytes[i++];
    const type = bytes[i++];

    if (i + length - 1 > bytes.length) {
      break;
    }

    const chunk = bytes.slice(i, i + length - 1);

    switch (type) {
      case DSTYPES.DS_TEMP_HUM: {
        const nMeas = (length - 1) / 3;
        for (let j = 0; j < nMeas; j++) {
          const tRaw = readInt16LE(chunk, j * 3);
          const hRaw = chunk[j * 3 + 2];
          const entry = {};
          if (tRaw !== -32768 || hRaw !== 255) {
            entry.temperature = tRaw / 100;
            entry.humidity = hRaw / 2;
            rawData.tempHum.push(entry);
          } else {
            rawData.tempHum.push(null);
          }
        }
        break;
      }
      case DSTYPES.DS_CO2: {
        const nMeas = (length - 1) / 2;
        for (let j = 0; j < nMeas; j++) {
          const cRaw = readUInt16LE(chunk, j * 2);
          rawData.co2.push({ co2: cRaw });
        }
        break;
      }
      case DSTYPES.DS_COMMON_SETTINGS: {
        const interval = readUInt16LE(chunk, 0);
        const flags = chunk[3];
        rawData.configs.measurementInterval = interval;
        rawData.configs.sendCycle = chunk[2];
        rawData.configs.confirmedUplinks = !!(flags & 0x80);
        rawData.configs.ledOn = !!(flags & 0x40);
        rawData.configs.adrOn = !!(flags & 0x20);
        rawData.configs.contVocMeas = !!(flags & 0x10);
        rawData.configs.reportInterval = !!(flags & 0x08);
        if (length === 6) {
          rawData.configs.retransmissions = chunk[4] & 0x0f;
        } else {
          rawData.configs.retransmissions = flags & 0x0f;
        }
        if (measurementInterval === -1) {
          measurementInterval = interval;
        }
        break;
      }
      case DSTYPES.DS_CO2_SETTINGS: {
        rawData.configs.co2Subsamples = readUInt16LE(chunk, 2);
        rawData.configs.abcPeriod = readUInt16LE(chunk, 4);
        break;
      }
      case DSTYPES.DS_BATTERY_VOLTAGE: {
        rawData.lifecycle.batteryVoltage = readUInt16LE(chunk, 0) / 100;
        break;
      }
      case DSTYPES.DS_FW_HASH: {
        rawData.lifecycle.firmwareHash = readUInt32LE(chunk, 0).toString(16);
        break;
      }
      case DSTYPES.DS_DOOR_ALARM: {
        rawData.doorEvents.push({
          open: true,
          doorOpenCounter: readUInt32LE(chunk, 0),
          alarmCounter: readUInt16LE(chunk, 4),
          alarmTime: readUInt16LE(chunk, 6),
        });
        break;
      }
      case DSTYPES.DS_DOOR_ALARM_CLEARED: {
        rawData.doorEvents.push({
          open: false,
          doorOpenCounter: readUInt32LE(chunk, 0),
          alarmCounter: readUInt16LE(chunk, 4),
        });
        break;
      }
      case DSTYPES.DS_DOOR_STATUS: {
        rawData.doorEvents.push({
          open: chunk[6] !== 0,
          doorOpenCounter: readUInt32LE(chunk, 0),
          alarmCounter: readUInt16LE(chunk, 4),
        });
        break;
      }
      case DSTYPES.DS_DOOR_SETTINGS: {
        rawData.configs.alarmTime = readUInt16LE(chunk, 0);
        rawData.configs.hallDebounce = readUInt16LE(chunk, 2);
        rawData.configs.doorStatusTime = readUInt32LE(chunk, 4);
        break;
      }
      case DSTYPES.DS_IAQ_DATA: {
        const nMeas = (length - 1) / 2;
        for (let j = 0; j < nMeas; j++) {
          const iaqRaw = readUInt16LE(chunk, j * 2);
          if (iaqRaw !== 0xffff) {
            rawData.iaq.push({
              iaqIndex: iaqRaw & 0x3fff,
              iaqAccuracy: iaqRaw >> 14,
            });
          } else {
            rawData.iaq.push(null);
          }
        }
        break;
      }
      case DSTYPES.DS_PRESSURE_DATA: {
        const nMeas = (length - 1) / 3;
        for (let j = 0; j < nMeas; j++) {
          rawData.pressure.push({ pressure: readUInt24LE(chunk, j * 3) });
        }
        break;
      }
      case DSTYPES.DS_REPORT_INTERVAL: {
        measurementInterval = readUInt16LE(chunk, 0);
        break;
      }
      case DSTYPES.DS_LIGHT_INTENSITY: {
        rawData.light = readUInt16LE(chunk, 0);
        break;
      }
      case DSTYPES.DS_CONDITIONAL_TX: {
        rawData.configs.co2Threshold = readUInt16LE(chunk, 0);
        rawData.configs.tempThreshold = readInt16LE(chunk, 2);
        rawData.configs.humThreshold = readUInt16LE(chunk, 4);
        break;
      }
      case DSTYPES.DS_BLIND_ADR: {
        rawData.configs.blindAdrProfile = chunk[0];
        break;
      }
      case DSTYPES.DS_LIGHT_MEASUREMENT: {
        rawData.configs.lightInterval = chunk[0];
        break;
      }
      case DSTYPES.DS_PARTICULATE_MATTER: {
        const nMeas = (length - 1) / 7;
        for (let j = 0; j < nMeas; j++) {
          const offset = j * 7;
          const pm2_5Raw = readUInt16LE(chunk, offset);
          const pm1Raw = readUInt16LE(chunk, offset + 2);
          const pm10Raw = readUInt16LE(chunk, offset + 4);
          const obstructed = chunk[offset + 6] !== 0;
          if (pm2_5Raw === 0 && pm1Raw === 0 && pm10Raw === 0 && !obstructed) {
            rawData.pm.push(null);
          } else {
            rawData.pm.push({
              pm2_5: pm2_5Raw / 10,
              pm1: pm1Raw / 10,
              pm10: pm10Raw / 10,
              pmObstructed: obstructed,
            });
          }
        }
        break;
      }
      case DSTYPES.DS_NOISE_ALARM: {
        rawData.lifecycle.noiseAlarm = true;
        rawData.lifecycle.noiseLevel = chunk[0];
        break;
      }
      case DSTYPES.DS_MICROPHONE_SETTINGS: {
        rawData.configs.noiseHoldIntervalMin = chunk[0];
        rawData.configs.noiseAbsThreshold = readUInt16LE(chunk, 1);
        break;
      }
      case DSTYPES.DS_PM_SETTINGS: {
        rawData.configs.pmIntegrationTimeS = chunk[0];
        break;
      }
      default:
        break;
    }

    i += length - 1;
  }

  // EMIT LOGIC

  const now = new Date();
  const mergedSamples = {};

  function addSample(time, data) {
    const tsKey = time.toISOString();
    if (!mergedSamples[tsKey]) {
      mergedSamples[tsKey] = { timestamp: time, data: {} };
    }
    Object.assign(mergedSamples[tsKey].data, data);
  }

  function processHistory(arr, dataExtractor) {
    const len = arr.length;
    for (let k = 0; k < len; k++) {
      if (arr[k] === null) continue;
      let offsetSec = 0;
      if (measurementInterval > 0) {
        offsetSec = (len - 1 - k) * measurementInterval;
      }
      const time = new Date(now.getTime() - offsetSec * 1000);
      addSample(time, dataExtractor(arr[k]));
    }
  }

  processHistory(rawData.tempHum, (item) => item);
  processHistory(rawData.co2, (item) => item);
  processHistory(rawData.pressure, (item) => item);
  processHistory(rawData.iaq, (item) => item);
  processHistory(rawData.pm, (item) => item);

  if (rawData.light !== null) {
    addSample(now, { light: rawData.light });
  }

  // Emit merged default samples
  const timestamps = Object.keys(mergedSamples).sort();
  for (const ts of timestamps) {
    emit("sample", { data: mergedSamples[ts].data, topic: "default" });
  }

  // Emit Lifecycle
  if (Object.keys(rawData.lifecycle).length > 0) {
    emit("sample", { data: rawData.lifecycle, topic: "lifecycle" });
  }

  // Emit Door Events
  for (const doorEvt of rawData.doorEvents) {
    emit("sample", { data: doorEvt, topic: "door" });
  }

  // Emit Configuration
  if (Object.keys(rawData.configs).length > 0) {
    emit("sample", { data: rawData.configs, topic: "configuration" });
  }
}
