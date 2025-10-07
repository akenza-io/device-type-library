function consume(event) {
  const payload = event.data.payloadHex;
  const { port } = event.data;
  const bytes = Hex.hexToBytes(payload);

  // Data reports are on FPort 6
  if (port === 6) {
    const version = bytes[0];
    const deviceType = bytes[1];
    const reportType = bytes[2];

    if (version !== 0x01 || deviceType !== 0x25) {
      emit("log", {
        error: `Invalid version or device type. Version: ${version}, DeviceType: ${deviceType}`,
      });
      return;
    }

    switch (reportType) {
      case 0x00: { // Version Information Report
        const systemData = {};
        systemData.softwareVersion = bytes[3];
        systemData.hardwareVersion = bytes[4];
        // The date code is represented as a 4-byte hex string, e.g., 20170503
        systemData.dateCode = payload.substring(10, 18);
        emit("sample", {
          data: systemData,
          topic: "system",
        });
        break;
      }

      case 0x01: { // Battery and Hall Sensor Status Report
        const defaultData = {};
        const lifecycleData = {};

        // Lifecycle data
        lifecycleData.batteryVoltage = bytes[3] / 10.0;
        // If the battery voltage is less than or equal to 3.2V, it is considered low
        lifecycleData.lowBattery = lifecycleData.batteryVoltage <= 3.2;
        emit("sample", {
          data: lifecycleData,
          topic: "lifecycle",
        });

        // Default data
        const status = bytes[4];
        // 0 = closed, 1 = open
        defaultData.reedContact = status === 1;
        emit("sample", {
          data: defaultData,
          topic: "default",
        });
        break;
      }

      default:
        emit("log", {
          warning: `Unknown report type received: ${reportType}`,
        });
        break;
    }
  } else if (port === 7) {
    const cmdId = bytes[0];
    if (cmdId === 0x81) {
      const status = bytes[2] === 0x00 ? "SUCCESS" : "FAILURE";
      emit("log", {
        message: `Configuration response received: ${status}`,
      });
    } else if (cmdId === 0x82) {
      const minTime = (bytes[3] << 8) | bytes[4];
      const maxTime = (bytes[5] << 8) | bytes[6];
      const batteryChange = bytes[2] / 10;
      emit("log", {
        message: "Read configuration response received",
        minTime: `${minTime}s`,
        maxTime: `${maxTime}s`,
        batteryChange: `${batteryChange}V`,
      });
    } else {
      emit("log", {
        warning: `Unknown command ID on port 7: ${cmdId}`,
      });
    }
  }
}
