function to_int16(byte1, byte2) {
  let value = (byte1 << 8) | byte2;
  if ((value & 0x8000) > 0) {
    value = value - 0x10000;
  }
  return value;
}

function consume(event) {
  const bytes = Hex.hexToBytes(event.data.payloadHex);
  const { port } = event.data;

  // Uplink data is on FPort 6 and has a fixed length of 11 bytes.
  if (port === 6 && bytes.length === 11) {
    const deviceType = bytes[1];
    const reportType = bytes[2];

    // Ensure the message is from a R718B device (0x95)
    if (deviceType !== 0x95) {
      emit("log", {
        error: `Invalid device type: ${deviceType}`,
      });
      return;
    }

    switch (reportType) {
      case 0x01: { // Data Packet
        // --- Lifecycle data ---
        const batteryByte = bytes[3];
        const lifecycle = {
          batteryVoltage: (batteryByte & 0x7f) * 0.1,
          lowBattery: (batteryByte & 0x80) > 0,
        };
        emit("sample", {
          data: lifecycle,
          topic: "lifecycle",
        });

        // --- Default data ---
        const tempValue = to_int16(bytes[4], bytes[5]);
        const alarmByte = bytes[6];
        const defaultData = {
          temperature: tempValue / 10.0,
          lowTemperatureAlarm: (alarmByte & 0x01) > 0,
          highTemperatureAlarm: (alarmByte & 0x02) > 0,
        };
        emit("sample", {
          data: defaultData,
          topic: "default",
        });
        break;
      }
      case 0x00: { // Version Packet
        const swVersionByte = bytes[3];
        const hwVersionByte = bytes[4];

        // Date code is 4 bytes representing YYYYMMDD in hex
        const dateCodeHex = Hex.bytesToHex(bytes.slice(5, 9));

        const system = {
          softwareVersion: `${swVersionByte >> 4}.${swVersionByte & 0x0f}`,
          hardwareVersion: `${hwVersionByte >> 4}.${hwVersionByte & 0x0f}`,
          dateCode: dateCodeHex,
        };
        emit("sample", {
          data: system,
          topic: "system",
        });
        break;
      }
      default:
        emit("log", {
          error: `Unknown report type: ${reportType}`,
        });
        break;
    }
  } else {
    emit("log", {
      error: `Invalid port (${port}) or payload length (${bytes.length})`,
    });
  }
}
