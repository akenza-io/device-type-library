function consume(event) {
  const payload = Hex.hexToBytes(event.data.payloadHex);
  const { port } = event.data;

  if (port !== 56) {
    emit("log", {
      error: `Invalid port: ${port}`
    });
    return;
  }

  const messageType = payload[1];

  const productModels = {
    0xbd: "ORIGIN+",
    0xb2: "ORIGIN",
    0xb3: "GUARD+",
    0xb4: "GUARD",
  };

  const productType = productModels[payload[0]] || "Unknown";

  function emitIfNotEmpty(topic, data) {
    if (Object.keys(data).length > 0) {
      emit("sample", {
        data,
        topic
      });
    }
  }

  function decodeTemperature(rawValue) {
    if (rawValue === 1023) return "Error";
    if (rawValue === 1022) return "Sensor not present";
    return parseFloat((rawValue * 0.1 - 30).toFixed(2));
  }

  function decodeHumidity(rawValue) {
    if (rawValue === 255) return "Error";
    return parseFloat((rawValue * 0.5).toFixed(2));
  }

  switch (messageType) {
    case 0x00: { // Product Status
      const system = {
        productType
      };
      const lifecycle = {};
      const statusByte5 = payload[5];

      system.hardwareVersion = payload[2];
      system.softwareVersion = (payload[3] / 10).toFixed(1);

      const remainingLife = payload[4];
      if (remainingLife === 0) {
        lifecycle.remainingProductLife = "End of life";
      } else if (remainingLife === 255) {
        lifecycle.remainingProductLife = "Unknown";
      } else {
        lifecycle.remainingProductLife = remainingLife;
      }

      lifecycle.smokeSensorStatus = (statusByte5 >> 7) & 0x01 ? "Faulty smoke chamber" : "OK";
      lifecycle.tempHumSensorStatus = (statusByte5 >> 6) & 0x01 ? "Temperature/humidity sensor faulty" : "OK";

      const magneticBaseDetectionMap = {
        0: "Magnetic base not detected",
        1: "Magnetic base detected",
        2: "Product removed from its base immediately",
        3: "Installing the product on its base at a moment's notice",
        4: "Magnetic base never detected",
      };
      system.magneticBaseDetection = magneticBaseDetectionMap[(statusByte5 >> 2) & 0x07];

      const batteryLevelMap = {
        0: "High (> 50%)",
        1: "Medium (20 - 50%)",
        2: "Low (1 - 10%)",
        3: "Critical (< 1%)",
      };
      lifecycle.batteryLevel = batteryLevelMap[statusByte5 & 0x03];
      lifecycle.batteryVoltage = payload[6] * 5;

      emitIfNotEmpty("system", system);
      emitIfNotEmpty("lifecycle", lifecycle);
      break;
    }
    case 0x01: { // Product Configuration
      const system = {
        productType
      };
      const datalog = {};
      const configByte2 = payload[2];

      const reconfigSourceMap = {
        0: "NFC",
        1: "Downlink",
        2: "Product startup",
        5: "Local",
      };
      system.reconfigurationSource = reconfigSourceMap[(configByte2 >> 5) & 0x07];

      const reconfigStatusMap = {
        0: "Total success",
        1: "Partial success",
        2: "Total failure",
      };
      system.reconfigurationStatus = reconfigStatusMap[(configByte2 >> 3) & 0x03];

      datalog.datalogTemperatureEnabled = ((configByte2 >> 2) & 0x01) === 1;
      datalog.dailyAirQualityEnabled = ((configByte2 >> 1) & 0x01) === 1;

      system.delayedJoinRequest = !!((payload[3] >> 7) & 0x01);

      const nfcStatusMap = {
        0: "Discoverable",
        1: "Non-discoverable",
        2: "RFU",
        3: "RFU"
      };
      system.nfcStatus = nfcStatusMap[(payload[3] >> 5) & 0x03];

      datalog.newMeasurementsPerMessage = ((payload[3] & 0x01) << 5) | (payload[4] >> 3);
      datalog.transmissionsOfSameData = ((payload[4] & 0x07) << 2) | (payload[5] >> 6);
      datalog.transmissionPeriod = (((payload[5] & 0x3f) << 8) | payload[6]) * 30; // Value is in 30min steps

      system.d2dNetworkId = ((payload[6] & 0x3f) << 11) | (payload[7] << 3) | (payload[8] >> 5);
      system.downlinkFcnt = (payload[9] << 8) | payload[10];

      emitIfNotEmpty("system", system);
      emitIfNotEmpty("datalog", datalog);
      break;
    }
    case 0x02: { // Alarm Status
      const alarm = {};
      const lifecycle = {};
      const climate = {};
      const statusByte2 = payload[2];

      const alarmStatusMap = {
        0: "No smoke detected",
        1: "Smoke detected",
        2: "Repeated alarm"
      };
      alarm.alarmStatus = alarmStatusMap[(statusByte2 >> 6) & 0x03];

      const pauseAlarmMap = {
        0: "The alarm has stopped because there is no more smoke",
        1: "Alarm stopped when main button pressed",
        2: "Alarm stopped after all smoke-detecting products were switched off",
      };
      alarm.pauseAlarm = pauseAlarmMap[(statusByte2 >> 4) & 0x03];

      const productTestMap = {
        0: "No product test carried out",
        1: "Local product test",
        2: "Remote product test"
      };
      alarm.productTest = productTestMap[(statusByte2 >> 2) & 0x03];

      alarm.timeSinceLastProductTest = ((statusByte2 & 0x03) << 6) | (payload[3] >> 2);
      lifecycle.maintenance = (payload[3] >> 1) & 0x01 ? "Maintenance has been carried out" : "Maintenance has not been performed";
      lifecycle.timeSinceLastMaintenance = ((payload[3] & 0x01) << 7) | (payload[4] >> 1);

      const tempRaw = ((payload[4] & 0x01) << 9) | (payload[5] << 1) | (payload[6] >> 7);
      climate.temperature = decodeTemperature(tempRaw);

      emitIfNotEmpty("alarm", alarm);
      emitIfNotEmpty("lifecycle", lifecycle);
      emitIfNotEmpty("default", climate);
      break;
    }
    case 0x03: { // Daily Air Quality
      const climate = {};

      climate.minTemperature = decodeTemperature((payload[2] << 2) | (payload[3] >> 6));
      climate.maxTemperature = decodeTemperature(((payload[3] & 0x3f) << 4) | (payload[4] >> 4));
      climate.averageTemperature = decodeTemperature(((payload[4] & 0x0f) << 6) | (payload[5] >> 2));
      climate.minHumidity = decodeHumidity(((payload[5] & 0x03) << 6) | (payload[6] >> 2));
      climate.maxHumidity = decodeHumidity(((payload[6] & 0x03) << 6) | (payload[7] >> 2));
      climate.averageHumidity = decodeHumidity(((payload[7] & 0x03) << 6) | (payload[8] >> 2));

      emitIfNotEmpty("climate", climate);
      break;
    }
    case 0x04: { // Periodic Data
      const climate = {};

      climate.temperature = decodeTemperature((payload[2] << 2) | (payload[3] >> 6));
      climate.humidity = decodeHumidity(((payload[3] & 0x3f) << 2) | (payload[4] >> 6));

      emitIfNotEmpty("climate", climate);
      break;
    }
    case 0x05: { // Historical Temperature Data (Datalog Temperature)
      const datalog = {};
      const climate = {};
      const bits = Bits.hexToBits(event.data.payloadHex);

      datalog.totalMeasurements = Bits.bitsToUnsigned(bits.substring(16, 22));
      datalog.samplingPeriod = Bits.bitsToUnsigned(bits.substring(22, 30));
      datalog.repetitionsInMessage = Bits.bitsToUnsigned(bits.substring(30, 36));

      climate.temperatureHistory = [];
      for (let i = 0; i < datalog.totalMeasurements; i++) {
        const start = 36 + i * 10;
        const tempBits = bits.substring(start, start + 10);
        if (tempBits.length === 10) {
          const tempRaw = Bits.bitsToUnsigned(tempBits);
          climate.temperatureHistory.push(decodeTemperature(tempRaw));
        }
      }

      emitIfNotEmpty("datalog", datalog);
      emitIfNotEmpty("climate", climate);
      break;
    }
    default:
  }
}