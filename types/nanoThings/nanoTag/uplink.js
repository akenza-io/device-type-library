function isEmpty(obj) {
  return Object.keys(obj).length === 0;
}

function consume(event) {
  const bits = Bits.hexToBits(event.data.payloadHex);
  const { port } = event.data;
  let topic = "default";
  const data = {};
  const temperature = {};
  const lifecycle = {};

  // Decode based on port number
  switch (port) {
    case 1:
    case 13:
      // Lifecycle
      temperature.temperature = Bits.bitsToUnsigned(bits.substring(0, 8)) - 50;
      lifecycle.internalTemperature =
        Bits.bitsToUnsigned(bits.substring(8, 16)) - 50;
      lifecycle.batteryVoltage =
        Bits.bitsToUnsigned(bits.substring(16, 32)) / 1000;

      break;
    case 28:
      // Configuration request
      temperature.temperature = Bits.bitsToUnsigned(bits.substring(0, 8)) - 50;
      lifecycle.batteryVoltage = Bits.bitsToUnsigned(bits.substring(8, 24)) / 1000;
      break;
    case 25: {
      topic = "configuration_ack";
      data.ackId = Bits.bitsToUnsigned(bits.substring(0, 8));
      data.recordPeriod = Bits.bitsToUnsigned(bits.substring(8, 24));
      data.reportPeriod = Bits.bitsToUnsigned(bits.substring(24, 40));
      const unit = Bits.bitsToUnsigned(bits.substring(40, 48));
      if (unit === 0) {
        data.unit = "MINUTES";
      } else {
        data.unit = "SECONDS";
      }
      break;
    }
    case 26:
    case 27: {
      topic = "report_frame";
      data.fid = Bits.bitsToUnsigned(bits.substring(0, 16));

      let i = 1;
      for (let bytePos = 16; bytePos < bits.length; bytePos += 16) {
        data[`temperature${i}`] =
          Math.round(
            (Bits.bitsToUnsigned(bits.substring(bytePos, bytePos + 16)) / 100 - 50) * 10,
          ) / 10;
        i++;
      }
      break;
    }
    case 22:
      topic = "first_timestamp";
      data.firstSampleTimestamp =
        Bits.bitsToUnsigned(bits.substring(0, 32)) * 1000;
      lifecycle.batteryVoltage =
        Bits.bitsToUnsigned(bits.substring(32, 48)) / 1000;
      break;
    case 21:
      topic = "device_status";
      lifecycle.batteryVoltage = Bits.bitsToUnsigned(bits.substring(0, 16)) / 1000;
      data.lastSampleNumber = Bits.bitsToUnsigned(bits.substring(16, 48));
      data.lastSampleTimestamp =
        Bits.bitsToUnsigned(bits.substring(48, 80)) * 1000;

      break;
    case 31:
      lifecycle.batteryVoltage = Bits.bitsToUnsigned(bits.substring(0, 16)) / 1000;
      break;
    default:
      topic = "unknown";
      data.payload = event.data.payloadHex;
      break;
  }

  if (!isEmpty(lifecycle)) {
    let batteryLevel = Math.round((lifecycle.batteryVoltage - 2.3) / 0.006); // 2.9V - 2.3V

    if (batteryLevel > 100) {
      batteryLevel = 100;
    } else if (batteryLevel < 0) {
      batteryLevel = 0;
    }
    lifecycle.batteryLevel = batteryLevel;

    emit("sample", { data: lifecycle, topic: "lifecycle" });
  }

  if (!isEmpty(temperature)) {
    emit("sample", { data: temperature, topic: "temperature" });
  }

  if (!isEmpty(data)) {
    emit("sample", { data, topic });
  }
}
