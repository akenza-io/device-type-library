function roundToOneDecimal(value) {
  return Math.round(value * 10) / 10;
}

function roundToTwoDecimals(value) {
  return Math.round(value * 100) / 100;
}

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

  // Helper function for signed 16-bit big-endian conversion
  function toS16Be(byte1, byte2) {
    let value = (byte1 << 8) | byte2;
    if (value & 0x8000) {
      value -= 0x10000;
    }
    return value;
  }

  if (port === 6) {
    const deviceType = payload[1];
    const reportType = payload[2];

    if (deviceType !== 0x03) {
      // Not an RB11E device
      emit("log", {
        error: "Incorrect DeviceType",
        expected: 3,
        received: deviceType,
      });
      return;
    }

    if (reportType === 0x01) {
      // Standard data report
      const lifecycleData = {
        batteryVoltage: roundToOneDecimal(payload[3] * 0.1),
      };
      lifecycleData.batteryLevel = getBatteryPercentage(lifecycleData.batteryVoltage)
      emit("sample", {
        data: lifecycleData,
        topic: "lifecycle",
      });

      const defaultData = {
        temperature: roundToTwoDecimals(
          toS16Be(payload[4], payload[5]) * 0.01
        ),
        light: (payload[6] << 8) | payload[7],
        alarm: payload[9] === 1,
      };
      emit("sample", {
        data: defaultData,
        topic: "default",
      });

      const occupancyData = {
        occupied: payload[8] === 1,
      };
      emit("sample", {
        data: occupancyData,
        topic: "occupancy",
      });
    } else if (reportType === 0x00) {
      // Version report
      const systemData = {
        softwareVersion: payload[3],
        hardwareVersion: payload[4],
        // The datecode is in BCD format, which can be directly parsed from its hex representation
        datecode: parseInt(Hex.bytesToHex(payload.slice(5, 9))),
      };
      emit("sample", {
        data: systemData,
        topic: "system",
      });
    } else {
      emit("log", {
        error: `Unknown report type: ${reportType}`,
      });
    }
  }
}
