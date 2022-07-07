function consume(event) {
  const payload = event.data.payloadHex;
  const bits = Bits.hexToBits(payload);
  const lifecycle = {};
  const settings = {};
  const temperature = {};
  const co2 = {};

  for (let pointer = 0; pointer < bits.length; ) {
    let measurement = "";
    let length = (Bits.bitsToUnsigned(bits.substr(pointer, 8)) - 1) * 8;
    const msgtype = Bits.bitsToUnsigned(bits.substr((pointer += 8), 8));
    pointer += 8;
    length += pointer;

    switch (msgtype) {
      case 1:
        while (pointer < length) {
          temperature[`temperature${measurement}`] =
            Hex.hexLittleEndianToBigEndian(
              payload.substr(pointer / 4, 4),
              true,
            ) * 0.01;
          pointer += 16;
          temperature[`humidity${measurement}`] =
            Hex.hexLittleEndianToBigEndian(
              payload.substr(pointer / 4, 2),
              true,
            ) * 0.5;
          pointer += 8;
          if (measurement === "") {
            measurement = 1;
          } else {
            measurement++;
          }
        }
        break;
      case 2:
        while (pointer < length) {
          const co2msb = bits.substr(pointer, 8);
          pointer += 8;
          const co2lsb = bits.substr(pointer, 8);
          pointer += 8;
          co2[`co2${measurement}`] = Bits.bitsToUnsigned(co2lsb + co2msb);

          if (measurement === "") {
            measurement = 1;
          } else {
            measurement++;
          }
        }
        break;
      case 3:
        lifecycle.consumption = Hex.hexLittleEndianToBigEndian(
          payload.substr(pointer / 4, 6),
          false,
        );
        pointer += 32;
        break;
      case 5:
        settings.measurementInterval = Hex.hexLittleEndianToBigEndian(
          payload.substr(pointer / 4, 4),
          false,
        );
        pointer += 16;
        settings.temperatureSamples = Hex.hexLittleEndianToBigEndian(
          payload.substr(pointer / 4, 2),
          false,
        );
        pointer += 16;
        break;
      case 6:
        pointer += 16;
        settings.co2Subsample = Hex.hexLittleEndianToBigEndian(
          payload.substr(pointer / 4, 4),
          false,
        );
        pointer += 16;
        settings.abcCalibrationPeriod = Hex.hexLittleEndianToBigEndian(
          payload.substr(pointer / 4, 4),
          false,
        );
        pointer += 16;
        break;
      case 10:
        lifecycle.voltage =
          (Bits.bitsToUnsigned(bits.substr(pointer, 8)) + 170) / 100;
        pointer += 8;
        break;
      case 11:
        settings.firmwareHash = payload.substr(pointer / 4, 8);
        pointer += 32;
        break;
      default:
        lifecycle.error = "Wrong length of payload";
        break;
    }
  }

  if (Object.keys(lifecycle).length > 0) {
    emit("sample", { data: lifecycle, topic: "lifecycle" });
  }

  if (Object.keys(settings).length > 0) {
    emit("sample", { data: settings, topic: "settings" });
  }

  if (Object.keys(temperature).length > 0) {
    emit("sample", { data: temperature, topic: "temperature" });
  }

  if (Object.keys(co2).length > 0) {
    emit("sample", { data: co2, topic: "co2" });
  }
}
