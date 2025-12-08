function readInt16BE(byte1, byte2) {
  let value = (byte1 << 8) | byte2;
  if (value & 0x8000) {
    value = value - 0x10000;
  }
  return value;
}

const FREQUENCY_BANDS = {
  0x01: "EU868",
  0x02: "US915",
  0x03: "IN865",
  0x04: "AU915",
  0x05: "KZ865",
  0x06: "RU864",
  0x07: "AS923",
  0x08: "AS923_1",
  0x09: "AS923_2",
  0x0a: "AS923_3",
  0x0b: "CN470",
  0x0c: "EU433",
  0x0d: "KR920",
  0x0e: "MA869",
};

function getFrequencyBand(byte) {
  return FREQUENCY_BANDS[byte] || "UNKNOWN";
}

function getSubBand(byte) {
  if (byte > 0x00 && byte < 0x08) {
    return "AU915_US915";
  } else if (byte > 0x0b && byte < 0x0c) {
    return "CN470";
  } else {
    return "UNKNOWN";
  }
}

function parseDatalog(offset, bytes) {
  const dataLog = {};

  dataLog.batteryVoltage = ((bytes[offset] << 8) | bytes[offset + 1]) / 1000;

  const rawTemp = readInt16BE(bytes[offset + 2], bytes[offset + 3]);
  dataLog.temperature = parseFloat(rawTemp.toFixed(2));

  dataLog.distance = (bytes[offset + 4] << 8) | bytes[offset + 5];

  dataLog.interruptFlag = ((bytes[offset + 6] >> 1) & 0x01) === 1;
  dataLog.messageType = bytes[offset + 6] & 0x40 ? 1 : 0;

  const timestamp =
    (bytes[offset + 7] << 24) |
    (bytes[offset + 8] << 16) |
    (bytes[offset + 9] << 8) |
    bytes[offset + 10];
  dataLog.date = new Date(timestamp * 1000).toISOString();

  return dataLog;
}

function consume(event) {
  const payload = event.data.payloadHex;
  const { port } = event.data;
  const bytes = Hex.hexToBytes(payload);

  const dataLifecycle = {};
  const dataDefault = {};
  const dataConfiguration = {};

  if (port === 0x02) {
    dataLifecycle.batteryVoltage =
      (((bytes[0] << 8) | bytes[1]) & 0x3fff) / 1000;

    dataDefault.distance = (bytes[2] << 8) | bytes[3];

    dataDefault.interruptFlag = (bytes[4] & 0x01) === 1;

    const rawTemp = readInt16BE(bytes[5], bytes[6]);
    dataDefault.temperature = parseFloat((rawTemp / 10).toFixed(2));

    dataDefault.sensorFlag = (bytes[7] & 0x01) === 1;
  } else if (port === 0x03) {
    if (((bytes[0] >> 7) & 0x01) == true) {
      for (let i = 1; i < bytes.length; i += 11) {
        if (i + 11 > bytes.length) break;

        const log = parseDatalog(i, bytes);

        const historyDefault = {
          temperature: log.temperature,
          distance: log.distance,
          interruptFlag: log.interruptFlag,
          messageType: log.messageType,
        };

        const historyLifecycle = {
          batteryVoltage: log.batteryVoltage,
        };

        emit("sample", {
          data: historyDefault,
          topic: "default",
          timestamp: log.date,
        });
        emit("sample", {
          data: historyLifecycle,
          topic: "lifecycle",
          timestamp: log.date,
        });
      }
    }

    return;
  } else if (port === 0x05) {
    if (bytes[0] === 0x29) {
      dataConfiguration.sensorModel = "DDS20-LB";
    } else {
      dataConfiguration.sensorModel = "UNKNOWN";
    }

    dataConfiguration.frequencyBand = getFrequencyBand(bytes[3]);

    dataConfiguration.subBand = getSubBand(bytes[4]);

    dataConfiguration.firmwareVersion =
      (bytes[1] & 0x0f) +
      "." +
      ((bytes[2] >> 4) & 0x0f) +
      "." +
      (bytes[2] & 0x0f);

    dataLifecycle.batteryVoltage =
      (((bytes[5] << 8) | bytes[6]) & 0x3fff) / 1000;
  }

  if (Object.keys(dataDefault).length > 0) {
    emit("sample", { data: dataDefault, topic: "default" });
  }

  if (Object.keys(dataConfiguration).length > 0) {
    emit("sample", { data: dataConfiguration, topic: "configuration" });
  }

  if (Object.keys(dataLifecycle).length > 0) {
    emit("sample", { data: dataLifecycle, topic: "lifecycle" });
  }
}
