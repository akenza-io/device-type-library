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
      case 4175: {
        data.modelId = Hex.hexLittleEndianToBigEndian(
          payload.substr((pointer += 4), 4),
          false,
        );
        data.detectionType = Hex.hexLittleEndianToBigEndian(
          payload.substr((pointer += 4), 4),
          false,
        );
        pointer += 2;
        break;
      }
      default:
        pointer = payload.length;
        break;
    }
  }

  emit("sample", { data, topic: "default" });
}
