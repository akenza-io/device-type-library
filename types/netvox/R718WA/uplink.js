function getBatteryPercentage(voltage) {
  // Lithium ER14505 battery
  const V_MAX = 3.6; // Voltage of fresh batteries (100%)
  const V_MIN = 3.0; // Voltage when batteries are considered dead (0%)

  if (voltage >= V_MAX) {
    return 100;
  }
  if (voltage <= V_MIN) {
    return 0;
  }
  const percentage = ((voltage - V_MIN) / (V_MAX - V_MIN)) * 100;

  return Number(percentage.toFixed(0))
}

function consume(event) {
  const payload = Hex.hexToBytes(event.data.payloadHex);
  const { port } = event.data;
  const deviceType = payload[1];

  // R718WA Device Type is 0x32
  if (deviceType !== 0x32) {
    emit("log", {
      error: `Invalid deviceType: ${deviceType}, expected 0x32`,
    });
    return;
  }

  switch (port) {
    case 6: { // Report Data
      const reportType = payload[2];
      if (reportType === 0x01) {
        // Water Leak & Battery Status Report
        const defaultData = {};
        const lifecycleData = {};

        // Byte 3: Battery Voltage (unit: 0.1V)
        lifecycleData.batteryVoltage = payload[3] / 10.0;
        lifecycleData.batteryLevel = getBatteryPercentage(lifecycleData.batteryVoltage)
        // Byte 4: Water Leak Status (0x01 = leak, 0x00 = no leak)
        defaultData.waterLeak = payload[4] === 0x01;

        emit("sample", {
          data: defaultData,
          topic: "default",
        });
        emit("sample", {
          data: lifecycleData,
          topic: "lifecycle",
        });
      } else if (reportType === 0x00) {
        // Version Packet Report
        const systemData = {};

        // Byte 3: Software Version
        systemData.softwareVersion = payload[3];
        // Byte 4: Hardware Version
        systemData.hardwareVersion = payload[4];
        // Bytes 5-8: Date Code (YYYYMMDD)
        systemData.dateCode = Hex.bytesToHex(payload.slice(5, 9));

        emit("sample", {
          data: systemData,
          topic: "system",
        });
      }
    }
      break;

    case 7: { // Configuration Uplink Response
      const cmdId = payload[0];
      if (cmdId === 0x82) {
        // ReadConfigReportRsp
        const systemData = {};

        // Bytes 2-3: MinTime (seconds)
        systemData.minTime = (payload[2] << 8) | payload[3];
        // Bytes 4-5: MaxTime (seconds)
        systemData.maxTime = (payload[4] << 8) | payload[5];
        // Byte 6: BatteryChange (unit: 0.1V)
        systemData.batteryChange = payload[6] / 10.0;

        emit("sample", {
          data: systemData,
          topic: "system",
        });
      } else if (cmdId === 0x81) {
        // ConfigReportRsp
        const status = payload[2] === 0x00 ? "SUCCESS" : "FAILURE";
        emit("log", {
          message: `Configuration write response: ${status}`,
        });
      }
    }
      break;

    default:
      emit("log", {
        error: `Unhandled FPort: ${port}`,
      });
      break;
  }
}
