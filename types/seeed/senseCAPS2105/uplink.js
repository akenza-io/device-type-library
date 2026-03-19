function cToF(celsius) {
  return Math.round(((celsius * 9) / 5 + 32) * 10) / 10;
}

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
  let pointer = 0;

  while (pointer < payload.length) {
    let measurementID = payload.substr((pointer += 2), 4);
    measurementID = Hex.hexLittleEndianToBigEndian(measurementID, false);

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
        const temperature =
          Hex.hexLittleEndianToBigEndian(
            payload.substr((pointer += 4), 8),
            true,
          ) / 1000;
        data.temperature = checkForIllegalValue(temperature, "temperature");
        pointer += 8;
        break;
      }
      case 4098: {
        const humidity =
          Hex.hexLittleEndianToBigEndian(
            payload.substr((pointer += 4), 8),
            false,
          ) / 1000;
        data.humidity = checkForIllegalValue(humidity, "humidity");
        pointer += 8;
        break;
      }
      case 4099: {
        const light =
          Hex.hexLittleEndianToBigEndian(
            payload.substr((pointer += 4), 8),
            false,
          ) / 1000;
        data.light = checkForIllegalValue(light, "light");
        pointer += 8;
        break;
      }
      case 4100: {
        const co2 =
          Hex.hexLittleEndianToBigEndian(
            payload.substr((pointer += 4), 8),
            false,
          ) / 1000;
        data.co2 = checkForIllegalValue(co2, "co2");
        pointer += 8;
        break;
      }
      case 4102: {
        const soilTemperature =
          Hex.hexLittleEndianToBigEndian(
            payload.substr((pointer += 4), 8),
            true,
          ) / 1000;
        data.soilTemperature = checkForIllegalValue(
          soilTemperature,
          "soilTemperature",
        );
        data.soilTemperatureF = cToF(data.soilTemperature);
        pointer += 8;
        break;
      }
      case 4103: {
        const soilHumidity =
          Hex.hexLittleEndianToBigEndian(
            payload.substr((pointer += 4), 8),
            false,
          ) / 1000;
        data.soilHumidity = checkForIllegalValue(soilHumidity, "soilHumidity");
        pointer += 8;
        break;
      }
      case 4108: {
        const soilConductivity =
          Hex.hexLittleEndianToBigEndian(
            payload.substr((pointer += 4), 8),
            false,
          ) / 1000;
        data.soilConductivity = checkForIllegalValue(
          soilConductivity,
          "soilConductivity",
        );
        pointer += 8;
        break;
      }
      default:
        pointer = payload.length;
        break;
    }
  }

  emit("sample", { data, topic: "default" });
}
