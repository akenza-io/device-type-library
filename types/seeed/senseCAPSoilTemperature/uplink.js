function checkForIllegalValue(value, fieldName) {
  let errorCode = "";
  switch (value) {
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

  if (errorCode.length > 0) {
    emit("sample", { data: { errorCode, fieldName }, topic: "error" });
    return null;
  }
  return value;
}

function consume(event) {
  const payload = event.data.payloadHex;
  const data = {};

  // 0-2 Channel Number
  // 2-4 Measurement ID
  const temperature =
    Hex.hexLittleEndianToBigEndian(payload.substr(6, 8), true) / 1000;
  data.temperature = checkForIllegalValue(temperature, "temperature");

  // 14-16 Channel Number
  // 16-20 Measurement ID
  const soilHumidity =
    Hex.hexLittleEndianToBigEndian(payload.substr(20, 8), true) / 1000;
  data.soilHumidity = checkForIllegalValue(soilHumidity, "soilHumidity");

  emit("sample", { data, topic: "default" });
}
