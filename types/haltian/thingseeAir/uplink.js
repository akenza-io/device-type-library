function cToF(celsius) {
  return Math.round(((celsius * 9) / 5 + 32) * 10) / 10;
}

function consume(event) {
  const { data } = event;
  const header = data.tsmId;
  const type = data.tsmEv;

  const lifecycle = {};
  let sample = {};

  let topic = "default";

  if (type === 9) {
    lifecycle.reason = "CHANGE";
  } else if (type === 10) {
    lifecycle.reason = "TIME";
  } else if (type === 11) {
    lifecycle.reason = "STARTUP";
  } else if (type === 29) {
    lifecycle.reason = "ERROR";
  } else if (type === 33) {
    lifecycle.reason = "FIRMWARE_RESPONSE";
  }

  switch (header) {
    // System message
    case 1100: {
      topic = "system_info";
      sample.swVersion = data.swVersion;
      sample.modelCode = data.modelCode;
      sample.psn = data.psn;

      break;
    }
    case 1102: {
      topic = "firmware_response";
      sample.requestTsmId = data.requestTsmId;

      break;
    }
    case 1110: {
      topic = "battery_level";
      sample.batteryLevel = data.batl;

      const { chrg } = data;
      if (chrg !== undefined) {
        sample.batteryCharge = chrg;
      }

      break;
    }
    case 1111: {
      topic = "orientation";
      sample.accX = data.accx;
      sample.accY = data.accy;
      sample.accZ = data.accz;

      break;
    }
    case 1202: {
      topic = "network";
      sample.rssi = data.rssi;

      const { rssiDbm } = data;
      const { neighNodeInfo } = data;
      const { neighRadioPower } = data;
      const { neighRadioPowerDbm } = data;

      if (rssiDbm !== undefined) {
        sample.rssiDbm = rssiDbm;
      }

      if (neighNodeInfo !== undefined) {
        sample.neighNodeInfo = neighNodeInfo;
      }

      if (neighRadioPower !== undefined) {
        sample.neighRadioPower = neighRadioPower;
      }

      if (neighRadioPowerDbm !== undefined) {
        sample.neighRadioPowerDbm = neighRadioPowerDbm;
      }

      break;
    }
    case 1312: {
      topic = "firmware_binary";
      sample.binaryType = data.binaryType;
      sample.binaryVersion = data.binaryVersion;

      break;
    }
    case 1403: {
      topic = "error_event";
      sample.errorType = data.errorType;
      sample.errorCause = data.errorCause;

      break;
    }
    // Sensordata
    case 12100: {
      topic = "environment";
      const pressure = data.airp;
      const humidity = data.humd;
      const temperature = data.temp;
      const light = data.lght;

      if (pressure !== undefined) {
        sample.pressure = pressure;
      }

      if (humidity !== undefined) {
        sample.humidity = humidity;
      }

      if (temperature !== undefined) {
        sample.temperature = temperature;
        sample.temperatureF = cToF(sample.temperature);
      }

      if (light !== undefined) {
        sample.light = light;
      }

      break;
    }
    case 24100: {
      topic = "co2";
      sample.co2 = data.carbonDioxide;
      const { status } = data;
      switch (status) {
        case -1:
          sample.co2Status = "MEASUREMENT_FAILED";
          break;
        case 0:
          sample.co2Status = "OK";
          break;
        case 1:
          sample.co2Status = "AUTO_CALIBRATED";
          break;
        case 2:
          sample.co2Status = "AUTO_CALIBRATEN_FAILED";
          break;
        default:
          break;
      }
      break;
    }
    case 24101: {
      topic = "tvoc";
      sample.tvoc = data.tvoc;
      break;
    }
    default:
      topic = "unknown";
      sample = data;
      break;
  }

  if (topic !== "unknown") {
    emit("sample", { data: sample, topic });
  } else {
    emit("log", { data: sample });
  }

  if (Object.keys(lifecycle).length !== 0) {
    emit("sample", { data: lifecycle, topic: "lifecycle" });
  }
}
