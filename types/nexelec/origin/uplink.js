
// --- Global Constants and Helpers ---

// Safely emits data only if the object is not empty.
function emitIfNotEmpty(topic, data, timestamp) {
  if (data && Object.keys(data).length > 0) {
    const sample = { data, topic };
    if (timestamp) {
      sample.timestamp = timestamp;
    }
    emit("sample", sample);
  }
}

// Decodes raw temperature values.
function decodeTemperature(rawValue) {
  if (rawValue === 1023 || rawValue === 1022) return null;
  return parseFloat(((rawValue * 0.1) - 30).toFixed(2));
}

// Decodes raw humidity values.
function decodeHumidity(rawValue) {
  if (rawValue === 255) return null;
  return parseFloat((rawValue * 0.5).toFixed(2));
}

// --- Field Mappings ---
const productModels = {
  0xbd: "ORIGIN+",
  0xb2: "ORIGIN",
  0xb3: "GUARD+",
  0xb4: "GUARD",
  0xb1: "ORIGIN+",
};
const magneticBaseDetectionMap = {
  0: "NOT_DETECTED",
  1: "DETECTED",
  2: "PRODUCT_REMOVED_FROM_BASE_IMMEDIATELY",
  3: "INSTALLING_PRODUCT_ON_BASE_AT_MOMENT_S_NOTICE",
  4: "MAGNETIC_BASE_NEVER_DETECTED",
};
const batteryLevelMap = {
  0: 100,
  1: 50,
  2: 10,
  3: 0
};
const sensorStatusMap = {
  0: "OK",
  1: "FAULTY"
};
const reconfigSourceMap = {
  0: "NFC",
  1: "DOWNLINK",
  2: "PRODUCT_STARTUP",
  5: "LOCAL"
};
const reconfigStatusMap = {
  0: "TOTAL_SUCCESS",
  1: "PARTIAL_SUCCESS",
  2: "TOTAL_FAILURE"
};
const nfcStatusMap = {
  0: "DISCOVERABLE",
  1: "NON_DISCOVERABLE",
  2: "RFU",
  3: "RFU"
};
const alarmStatusMap = {
  0: "NO_SMOKE_DETECTED",
  1: "SMOKE_DETECTED",
  2: "REPEATED_ALARM"
};
const pauseAlarmMap = {
  0: "NO_MORE_SMOKE",
  1: "MAIN_BUTTON_PRESSED",
  2: "ALL_PRODUCTS_SWITCHED_OFF"
};
const productTestMap = {
  0: "NO_TESTS",
  1: "LOCAL_TEST",
  2: "REMOTE_TEST"
};
const maintenanceMap = {
  0: "MAINTENANCE_NOT_CARRIED_OUT",
  1: "MAINTENANCE_CARRIED_OUT"
};


// Handles Product Status messages (0x00).
function handleProductStatus(payload, productType, timestamp) {
  if (payload.length < 7) {
    emit("log", { error: "Invalid payload length for Product Status" });
    return;
  }
  const system = { productType };
  const lifecycle = {};
  const statusByte5 = payload[5];

  system.hardwareVersion = payload[2];
  system.softwareVersion = (payload[3] / 10).toFixed(1);
  if (payload[4] <= 120) lifecycle.remainingProductLife = payload[4];
  lifecycle.smokeSensorStatus = sensorStatusMap[(statusByte5 >> 7) & 0x01];
  lifecycle.tempHumSensorStatus = sensorStatusMap[(statusByte5 >> 6) & 0x01];
  system.magneticBaseDetection = magneticBaseDetectionMap[(statusByte5 >> 2) & 0x07];
  lifecycle.batteryLevel = batteryLevelMap[statusByte5 & 0x03];
  lifecycle.batteryVoltage = (payload[6] * 5) + 2000;

  emitIfNotEmpty("system", system);
  emitIfNotEmpty("lifecycle", lifecycle);
}

// Handles Product Configuration messages (0x01).
function handleProductConfig(payload, productType, timestamp) {
  if (payload.length < 11) {
    emit("log", { error: "Invalid payload length for Product Configuration" });
    return;
  }
  const system = { productType };
  const datalog = {};
  const configByte2 = payload[2];

  system.reconfigurationSource = reconfigSourceMap[(configByte2 >> 5) & 0x07];
  system.reconfigurationStatus = reconfigStatusMap[(configByte2 >> 3) & 0x03];
  datalog.datalogTemperatureEnabled = ((configByte2 >> 2) & 0x01) === 1;
  datalog.dailyAirQualityEnabled = ((configByte2 >> 1) & 0x01) === 1;
  system.delayedJoinRequest = !!((payload[3] >> 7) & 0x01);
  system.nfcStatus = nfcStatusMap[(payload[3] >> 5) & 0x03];
  datalog.newMeasurementsPerMessage = ((payload[3] & 0x01) << 5) | (payload[4] >> 3);
  datalog.transmissionsOfSameData = ((payload[4] & 0x07) << 2) | (payload[5] >> 6);
  const transmissionPeriodRaw = ((payload[5] & 0x3F) << 2) | (payload[6] >> 6);
  datalog.transmissionPeriod = transmissionPeriodRaw * 10;
  system.d2dNetworkId = ((payload[6] & 0x3F) << 11) | (payload[7] << 3) | (payload[8] >> 5);
  system.downlinkFcnt = (payload[9] << 8) | payload[10];

  emitIfNotEmpty("system", system);
  emitIfNotEmpty("datalog", datalog);
}

// Handles Alarm Status messages (0x02).
function handleAlarmStatus(payload, productType, timestamp) {
  if (payload.length < 7) {
    emit("log", { error: "Invalid payload length for Alarm Status" });
    return;
  }
  emitIfNotEmpty("system", { productType });

  const alarm = {};
  const lifecycle = {};
  const climate = {};
  const statusByte2 = payload[2];

  alarm.alarmStatus = alarmStatusMap[(statusByte2 >> 6) & 0x03];
  alarm.pauseAlarm = pauseAlarmMap[(statusByte2 >> 4) & 0x03];
  alarm.productTest = productTestMap[(statusByte2 >> 2) & 0x03];
  alarm.timeSinceLastProductTest = ((statusByte2 & 0x03) << 6) | (payload[3] >> 2);
  lifecycle.maintenance = maintenanceMap[(payload[3] >> 1) & 0x01];
  lifecycle.timeSinceLastMaintenance = ((payload[3] & 0x01) << 7) | (payload[4] >> 1);
  const tempRaw = ((payload[4] & 0x01) << 9) | (payload[5] << 1) | (payload[6] >> 7);
  climate.temperature = decodeTemperature(tempRaw);

  emitIfNotEmpty("alarm", alarm);
  emitIfNotEmpty("lifecycle", lifecycle);
  emitIfNotEmpty("default", climate);
}

// Handles Daily Air Quality messages (0x03).
function handleDailyAirQuality(payload, productType, timestamp) {
  if (payload.length < 9) {
    emit("log", { error: "Invalid payload length for Daily Air Quality" });
    return;
  }
  emitIfNotEmpty("system", { productType });

  const climate = {};
  climate.minTemperature = decodeTemperature((payload[2] << 2) | (payload[3] >> 6));
  climate.maxTemperature = decodeTemperature(((payload[3] & 0x3f) << 4) | (payload[4] >> 4));
  climate.averageTemperature = decodeTemperature(((payload[4] & 0x0f) << 6) | (payload[5] >> 2));
  climate.minHumidity = decodeHumidity(((payload[5] & 0x03) << 6) | (payload[6] >> 2));
  climate.maxHumidity = decodeHumidity(((payload[6] & 0x03) << 6) | (payload[7] >> 2));
  climate.averageHumidity = decodeHumidity(((payload[7] & 0x03) << 6) | (payload[8] >> 2));

  emitIfNotEmpty("default", climate);
}

// Handles Periodic Data messages (0x04).
function handlePeriodicData(payload, productType, timestamp) {
  if (payload.length < 5) {
    emit("log", { error: "Invalid payload length for Periodic Data" });
    return;
  }
  emitIfNotEmpty("system", { productType });

  const climate = {};
  climate.temperature = decodeTemperature((payload[2] << 2) | (payload[3] >> 6));
  climate.humidity = decodeHumidity(((payload[3] & 0x3f) << 2) | (payload[4] >> 6));

  emitIfNotEmpty("default", climate);
}

// Handles Historical Data messages (0x05).
function handleHistoricalData(payload, productType, timestamp) {
  emitIfNotEmpty("system", { productType });

  const datalog = {};
  datalog.totalMeasurements = payload[2] >> 2;
  datalog.samplingPeriod = ((payload[2] & 0x03) << 6) | (payload[3] >> 2);
  datalog.repetitionsInMessage = ((payload[3] & 0x03) << 4) | (payload[4] >> 4);
  emitIfNotEmpty("datalog", datalog);

  let bitString = "";
  for (let i = 0; i < payload.length; i++) {
    bitString += payload[i].toString(2).padStart(8, '0');
  }

  for (let i = 0; i < datalog.totalMeasurements; i++) {
    const startBit = 36 + (i * 10);
    const endBit = startBit + 10;
    if (endBit > bitString.length) break;

    const tempBits = bitString.substring(startBit, endBit);
    const tempRaw = parseInt(tempBits, 2);
    const temperature = decodeTemperature(tempRaw);

    if (temperature !== null) {
      emitIfNotEmpty("default", { temperature });
    }
  }
}


/**
 * Decodes the payload from a nexelec origin device.
 * @param {object} event - The event object containing the payload and other data.
 */
function consume(event) {
  const payload = Hex.hexToBytes(event.data.payloadHex);
  const { port } = event.data;

  // Ensure the port is correct.
  if (port !== 56) {
    emit("log", { error: `Invalid port: ${port}` });
    return;
  }

  const productType = productModels[payload[0]] || "Unknown";
  const messageType = payload[1];

  switch (messageType) {
    case 0x00: handleProductStatus(payload, productType); break;
    case 0x01: handleProductConfig(payload, productType); break;
    case 0x02: handleAlarmStatus(payload, productType); break;
    case 0x03: handleDailyAirQuality(payload, productType); break;
    case 0x04: handlePeriodicData(payload, productType); break;
    case 0x05: handleHistoricalData(payload, productType); break;
    default: emit("log", { error: `Unknown message type: ${messageType}` });
  }
}