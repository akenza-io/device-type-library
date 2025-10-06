function toSignedInt16(byte1, byte2) {
  const value = (byte1 << 8) | byte2;
  return value & 0x8000 ? value - 0x10000 : value;
}

function roundToTwoDecimals(value) {
  return Math.round(value * 100) / 100;
}

/**
 * Consume the event and decode the payload.
 * @param {Event} event - The event object.
 */
function consume(event) {
  const payload = Hex.hexToBytes(event.data.payloadHex);
  const port = event.data.port;

  // Uplink data is on FPort 6
  if (port !== 6) {
    emit("log", {
      error: `Invalid FPort: ${port}. Expected 6.`,
    });
    return;
  }

  // Basic validation of payload structure
  if (payload.length < 3) {
    emit("log", {
      error: `Payload too short: ${payload.length} bytes.`,
    });
    return;
  }

  const version = payload[0];
  const deviceType = payload[1];
  const reportType = payload[2];

  // Check for the correct device type for R718A
  if (deviceType !== 0x0b) {
    emit("log", {
      error: `Invalid DeviceType: 0x${deviceType.toString(16)}. Expected 0x0B.`,
    });
    return;
  }

  // Route decoding based on ReportType
  switch (reportType) {
    case 0x00: // Version Packet
      if (payload.length !== 11) {
        emit("log", {
          error: `Invalid length for Version Packet: ${payload.length} bytes. Expected 11.`,
        });
        return;
      }
      const systemData = {
        softwareVersion: payload[3].toString(),
        hardwareVersion: payload[4].toString(),
        dateCode: Hex.bytesToHex(payload.slice(5, 9)),
      };
      emit("sample", {
        data: systemData,
        topic: "system",
      });
      break;

    case 0x01: // Data Packet
      if (payload.length !== 11) {
        emit("log", {
          error: `Invalid length for Data Packet: ${payload.length} bytes. Expected 11.`,
        });
        return;
      }

      // Lifecycle data
      const batteryByte = payload[3];
      const lifecycleData = {
        batteryVoltage: (batteryByte & 0x7f) * 0.1,
        lowBatteryAlarm: !!(batteryByte & 0x80),
      };
      emit("sample", {
        data: lifecycleData,
        topic: "lifecycle",
      });

      // Default data
      const alarmByte = payload[8];
      const defaultTopicData = {
        temperature: roundToTwoDecimals(
          toSignedInt16(payload[4], payload[5]) * 0.01
        ),
        humidity: roundToTwoDecimals((payload[6] << 8) | payload[7]) * 0.01,
        lowTemperatureAlarm: !!(alarmByte & 0x01),
        highTemperatureAlarm: !!(alarmByte & 0x02),
        lowHumidityAlarm: !!(alarmByte & 0x04),
        highHumidityAlarm: !!(alarmByte & 0x08),
      };
      emit("sample", {
        data: defaultTopicData,
        topic: "default",
      });
      break;

    default:
      emit("log", {
        error: `Unknown ReportType: 0x${reportType.toString(16)}.`,
      });
      break;
  }
}
