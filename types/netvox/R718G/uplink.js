function consume(event) {
  const payload = Hex.hexToBytes(event.data.payloadHex);
  const { port } = event.data;

  if (port !== 6) {
    emit("log", {
      message: `Payload received on invalid port ${port}, expected 6`,
    });
    return;
  }

  const deviceType = payload[1];
  if (deviceType !== 0x1e) {
    emit("log", {
      message: `Payload received for wrong device type ${deviceType}, expected 0x1E`,
    });
    return;
  }

  const reportType = payload[2];

  switch (reportType) {
    case 0x00: {
      // Version report
      const system = {};
      system.softwareVersion = payload[3];
      system.hardwareVersion = payload[4];
      system.dateCode =
        (payload[5] << 24) |
        (payload[6] << 16) |
        (payload[7] << 8) |
        payload[8];
      emit("sample", {
        data: system,
        topic: "system",
      });
      break;
    }
    case 0x01: {
      // Data report
      const data = {};
      const lifecycle = {};

      lifecycle.batteryVoltage = (payload[3] & 0x7f) / 10.0;
      lifecycle.lowBattery = (payload[3] & 0x80) !== 0;
      data.illuminance =
        (payload[4] << 24) |
        (payload[5] << 16) |
        (payload[6] << 8) |
        payload[7];
      data.lowIlluminanceAlarm = (payload[8] & 0x01) !== 0;
      data.highIlluminanceAlarm = (payload[8] & 0x02) !== 0;

      emit("sample", {
        data: lifecycle,
        topic: "lifecycle",
      });
      emit("sample", {
        data: data,
        topic: "default",
      });
      break;
    }
    default:
      emit("log", {
        message: `Unknown report type: ${reportType}`,
      });
      break;
  }
}
