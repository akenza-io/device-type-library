function checkForIllegalValue(value) {
  if (
    value === 2000001 ||
    value === 2000002 ||
    value === 2000003 ||
    value === 2000257
  ) {
    return null;
  }
  return value;
}

function consume(event) {
  const payload = event.data.payloadHex;
  const data = {};
  const error = {};

  // 0-2 Channel Number
  // 2-4 Measurement ID
  const temperature =
    Hex.hexLittleEndianToBigEndian(payload.substr(6, 8), true) / 1000;
  if (checkForIllegalValue(temperature) === null) {
    let errorCode = "";
    switch (temperature) {
      case 2000001:
        errorCode = "NO_SENSOR_RESPONSE";
        break;
      case 2000002:
        errorCode = "SENSOR_DATA_HEAD_ERROR";
        break;
      case 2000003:
        errorCode = "SENSOR_ARG_INVAILD";
        break;
      case 2000257:
        errorCode = "SENSOR_DATA_ERROR_UNKONW";
        break;
      default:
        break;
    }
    error.errorCode = errorCode;
  }
  data.temperature = checkForIllegalValue(temperature);

  // 14-16 Channel Number
  // 16-20 Measurement ID
  const soilHumidity =
    Hex.hexLittleEndianToBigEndian(payload.substr(20, 8), true) / 1000;
  if (checkForIllegalValue(soilHumidity) === null) {
    let errorCode = "";
    switch (soilHumidity) {
      case 2000001:
        errorCode = "NO_SENSOR_RESPONSE";
        break;
      case 2000002:
        errorCode = "SENSOR_DATA_HEAD_ERROR";
        break;
      case 2000003:
        errorCode = "SENSOR_ARG_INVAILD";
        break;
      case 2000257:
        errorCode = "SENSOR_DATA_ERROR_UNKONW";
        break;
      default:
        break;
    }
    error.errorCode = errorCode;
  }
  data.soilHumidity = checkForIllegalValue(soilHumidity);

  if (Object.keys(error).length > 0) {
    emit("sample", { data: error, topic: "error" });
  }

  emit("sample", { data, topic: "default" });
}
