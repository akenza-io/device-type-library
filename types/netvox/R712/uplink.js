const getBatteryPercentage = (voltage) => {
  // R712 uses two 1.5V AA
  const V_MAX = 3.2; // Voltage of fresh batteries (100%)
  const V_MIN = 2.0; // Voltage when batteries are considered dead (0%)

  if (voltage >= V_MAX) {
    return 100;
  }
  if (voltage <= V_MIN) {
    return 0;
  }
  const percentage = ((voltage - V_MIN) / (V_MAX - V_MIN)) * 100;

  return percentage
}


function consume(event) {
  const payload = Hex.hexToBytes(event.data.payloadHex);
  const { port } = event.data;

  if (port === 6) {
    const deviceType = payload[1];
    const reportType = payload[2];

    // According to the documentation, R712 has DeviceType 0x01
    if (deviceType !== 0x01) {
      emit("log", {
        error: `Unknown device type: ${deviceType}`,
      });
      return;
    }

    if (reportType === 0x00) {
      // Version Report
      const system = {};
      system.softwareVersion = payload[3];
      system.hardwareVersion = payload[4];
      // Date code is not part of the schema, so we ignore it.
      emit("sample", {
        data: system,
        topic: "system",
      });
    } else if (reportType === 0x01) {
      // Data Packet Report
      const defaultTopic = {};
      const lifecycle = {};

      // Lifecycle
      lifecycle.batteryVoltage = (payload[3] & 0x7f) / 10;
      lifecycle.batteryLevel = getBatteryPercentage(lifecycle.batteryVoltage)

      emit("sample", {
        data: lifecycle,
        topic: "lifecycle",
      });



      // default
      let temperatureValue = (payload[4] << 8) | payload[5];
      if ((temperatureValue & 0x8000) > 0) {
        temperatureValue -= 0x10000;
      }
      defaultTopic.temperature = temperatureValue / 100;

      const humidityValue = (payload[6] << 8) | payload[7];
      defaultTopic.humidity = humidityValue / 100;

      const alarmByte = payload[8];
      defaultTopic.lowTemperatureAlarm = (alarmByte & 0x01) !== 0;
      defaultTopic.highTemperatureAlarm = (alarmByte & 0x02) !== 0;
      defaultTopic.lowHumidityAlarm = (alarmByte & 0x04) !== 0;
      defaultTopic.highHumidityAlarm = (alarmByte & 0x08) !== 0;

      emit("sample", {
        data: defaultTopic,
        topic: "default",
      });
    } else {
      emit("log", {
        error: `Unknown report type: ${reportType}`,
      });
    }
  } else if (port === 7) {
    // Configuration Commands
    const cmdID = payload[0];
    const system = {};

    if (cmdID === 0x81) {
      // ConfigReportRsp
      system.configStatus = payload[2] === 0x00 ? "SUCCESS" : "FAILURE";
      emit("sample", {
        data: system,
        topic: "system",
      });
    } else if (cmdID === 0x82) {
      // ReadConfigRsp
      system.minTime = (payload[2] << 8) | payload[3];
      system.maxTime = (payload[4] << 8) | payload[5];
      system.batteryChange = payload[6] / 10;
      system.temperatureChange = ((payload[7] << 8) | payload[8]) / 100;
      system.humidityChange = ((payload[9] << 8) | payload[10]) / 100;
      emit("sample", {
        data: system,
        topic: "system",
      });
    } else {
      emit("log", {

        error: `Unknown command ID on port 7: ${cmdID}`,
      });
    }
  }
}
