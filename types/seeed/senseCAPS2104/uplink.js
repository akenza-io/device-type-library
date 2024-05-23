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
  let pointer = 0;

  while (pointer < payload.length) {
    let measurementID = payload.substr((pointer += 2), 4);
    measurementID = Hex.hexLittleEndianToBigEndian(measurementID, false);
    let value = 0;

    switch (measurementID) {
      case 7: {
        let batteryLevel = payload.substr((pointer += 4), 4);
        batteryLevel = Hex.hexLittleEndianToBigEndian(batteryLevel, false);

        let sendInterval = payload.substr((pointer += 4), 4);
        sendInterval = Hex.hexLittleEndianToBigEndian(sendInterval, false);
        pointer += 4;

        emit("sample", {
          data: { batteryLevel, sendInterval },
          topic: "lifecycle",
        });
        break;
      }
      case 4097: {
        value =
          Hex.hexLittleEndianToBigEndian(
            payload.substr((pointer += 4), 8),
            true,
          ) / 1000;
        data.temperature = checkForIllegalValue(value);
        pointer += 8;
        break;
      }
      case 4098: {
        value =
          Hex.hexLittleEndianToBigEndian(
            payload.substr((pointer += 4), 8),
            true,
          ) / 1000;
        data.humidity = checkForIllegalValue(value);
        pointer += 8;
        break;
      }
      case 4099: {
        value =
          Hex.hexLittleEndianToBigEndian(
            payload.substr((pointer += 4), 8),
            true,
          ) / 1000;
        data.light = checkForIllegalValue(value);
        pointer += 8;
        break;
      }
      case 4100: {
        value =
          Hex.hexLittleEndianToBigEndian(
            payload.substr((pointer += 4), 8),
            true,
          ) / 1000;
        data.co2 = checkForIllegalValue(value);
        pointer += 8;
        break;
      }
      case 4102: {
        value =
          Hex.hexLittleEndianToBigEndian(
            payload.substr((pointer += 4), 8),
            true,
          ) / 1000;
        data.soilTemperature = checkForIllegalValue(value);
        pointer += 8;
        break;
      }
      case 4103: {
        value =
          Hex.hexLittleEndianToBigEndian(
            payload.substr((pointer += 4), 8),
            true,
          ) / 1000;
        data.soilHumidity = checkForIllegalValue(value);
        pointer += 8;
        break;
      }
      case 4108: {
        value =
          Hex.hexLittleEndianToBigEndian(
            payload.substr((pointer += 4), 8),
            true,
          ) / 1000;
        data.soilConductivity = checkForIllegalValue(value);
        pointer += 8;
        break;
      }
      default:
        pointer = payload.length;
        break;
    }
    if (checkForIllegalValue(value) === null) {
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
      error.errorCode = errorCode;
    }
  }

  if (Object.keys(error).length > 0) {
    emit("sample", { data: error, topic: "error" });
  }

  emit("sample", { data, topic: "default" });
}
