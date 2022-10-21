function consume(event) {
  const payload = event.data.payloadHex;
  const data = {};
  let pointer = 0;

  while (pointer < payload.length) {
    const measurementID = Hex.hexLittleEndianToBigEndian(
      payload.substr((pointer += 2), 4),
      false,
    );
    switch (measurementID) {
      case 7: {
        const batteryLevel = Hex.hexLittleEndianToBigEndian(
          payload.substr((pointer += 4), 4),
          false,
        );
        const sendInterval = Hex.hexLittleEndianToBigEndian(
          payload.substr((pointer += 4), 4),
          false,
        );
        pointer += 4;
        emit("sample", {
          data: { batteryLevel, sendInterval },
          topic: "lifecycle",
        });
        break;
      }
      case 4097:
        data.temperature =
          Hex.hexLittleEndianToBigEndian(
            payload.substr((pointer += 4), 8),
            true,
          ) / 1000;
        pointer += 8;
        break;
      case 4098:
        data.humidity =
          Hex.hexLittleEndianToBigEndian(
            payload.substr((pointer += 4), 8),
            false,
          ) / 1000;
        pointer += 8;
        break;
      case 4099:
        data.light =
          Hex.hexLittleEndianToBigEndian(
            payload.substr((pointer += 4), 8),
            false,
          ) / 1000;
        pointer += 8;
        break;
      case 4100:
        data.co2 =
          Hex.hexLittleEndianToBigEndian(
            payload.substr((pointer += 4), 8),
            false,
          ) / 1000;
        pointer += 8;
        break;
      case 4102:
        data.soilTemperature =
          Hex.hexLittleEndianToBigEndian(
            payload.substr((pointer += 4), 8),
            true,
          ) / 1000;
        pointer += 8;
        break;
      case 4103:
        data.soilHumidity =
          Hex.hexLittleEndianToBigEndian(
            payload.substr((pointer += 4), 8),
            false,
          ) / 1000;
        pointer += 8;
        break;
      case 4108:
        data.soilConductivity =
          Hex.hexLittleEndianToBigEndian(
            payload.substr((pointer += 4), 8),
            false,
          ) / 1000;
        pointer += 8;
        break;
      default:
        pointer = payload.length;
        break;
    }
  }

  emit("sample", { data, topic: "default" });
}
