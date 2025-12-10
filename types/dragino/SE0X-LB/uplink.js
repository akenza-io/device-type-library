function cToF(celsius) {
  return Math.round(((celsius * 9) / 5 + 32) * 10) / 10;
}

function consume(event) {
  const payload = event.data.payloadHex;
  const { port } = event.data;
  const bytes = Hex.hexToBytes(payload);
  const bits = Bits.hexToBits(payload);
  const data = {};
  const lifecycle = {};

  if (port === 2) {
    lifecycle.batteryVoltage = (((bytes[0] << 8) | bytes[1]) & 0x3fff) / 1000;
    let batteryLevel =
      Math.round((lifecycle.batteryVoltage - 2.45) / 0.0115 / 10) * 10;

    if (batteryLevel > 100) {
      batteryLevel = 100;
    } else if (batteryLevel < 0) {
      batteryLevel = 0;
    }
    lifecycle.batteryLevel = batteryLevel;

    const mod = (bytes[4] >> 7) & 0x01; // Sampling mode
    const type = bytes[4] & 0x0f;

    if (mod === 0) {
      let pointer = 40;
      for (let i = 0; i < 4; i++) {
        // Checks if specific sensor is online
        if ((type >> (3 - i)) & (0x01 === 1)) {
          data[`soilHumidity${i + 1}`] =
            Bits.bitsToUnsigned(bits.substr(pointer, 16)) / 10;
          pointer += 16;

          const soilTemperature =
            Bits.bitsToUnsigned(bits.substr(pointer, 16)) / 10;
          pointer += 16;
          if ((soilTemperature & 0x8000) >> 15 === 0) {
            data[`soilTemperature${i + 1}`] = soilTemperature / 100;
          } else {
            data[`soilTemperature${i + 1}`] = (soilTemperature - 0xffff) / 100;
          }
          data[`soilTemperature${i + 1}${"F"}`] = cToF(
            data[`soilTemperature${i + 1}`],
          );

          data[`soilConductivity${i + 1}`] =
            Bits.bitsToUnsigned(bits.substr(pointer, 16)) / 10;
          pointer += 16;
        } else {
          pointer += 48;
        }
      }

      emit("sample", { data, topic: "default" });
    } else {
      let pointer = 40;
      for (let i = 0; i < 4; i++) {
        // Checks if specific sensor is connected
        if ((type >> (3 - i)) & (0x01 === 1)) {
          data[`soilDielectricConstant${i + 1}`] =
            Bits.bitsToUnsigned(bits.substr(pointer, 16)) / 10;
          pointer += 16;
          data[`rawSoilHumidity${i + 1}`] = Bits.bitsToUnsigned(
            bits.substr(pointer, 16),
          );
          pointer += 16;
          data[`rawSoilConductivity${i + 1}`] = Bits.bitsToUnsigned(
            bits.substr(pointer, 16),
          );
          pointer += 16;
        } else {
          pointer += 48;
        }
      }
      emit("sample", { data, topic: "raw" });
    }

    emit("sample", { data: lifecycle, topic: "lifecycle" });
  }
}
