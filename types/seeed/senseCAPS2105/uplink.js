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
        const temperature = payload.substr((pointer += 4), 8);
        data.temperature =
          Hex.hexLittleEndianToBigEndian(temperature, true) / 1000;
        pointer += 8;
        break;
      }
      case 4098: {
        const humidity = payload.substr((pointer += 4), 8);
        data.humidity = Hex.hexLittleEndianToBigEndian(humidity, false) / 1000;
        pointer += 8;
        break;
      }
      case 4099: {
        const light = payload.substr((pointer += 4), 8);
        data.light = Hex.hexLittleEndianToBigEndian(light, false) / 1000;
        pointer += 8;
        break;
      }
      case 4100: {
        const co2 = payload.substr((pointer += 4), 8);
        data.co2 = Hex.hexLittleEndianToBigEndian(co2, false) / 1000;
        pointer += 8;
        break;
      }
      case 4102: {
        const soilTemperature = payload.substr((pointer += 4), 8);
        data.soilTemperature =
          Hex.hexLittleEndianToBigEndian(soilTemperature, true) / 1000;
        pointer += 8;
        break;
      }
      case 4103: {
        const soilHumidity = payload.substr((pointer += 4), 8);
        data.soilHumidity =
          Hex.hexLittleEndianToBigEndian(soilHumidity, false) / 1000;
        pointer += 8;
        break;
      }
      case 4108: {
        const soilConductivity = payload.substr((pointer += 4), 8);
        data.soilConductivity =
          Hex.hexLittleEndianToBigEndian(soilConductivity, false) / 1000;
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
