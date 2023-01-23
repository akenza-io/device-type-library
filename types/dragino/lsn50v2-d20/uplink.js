function consume(event) {
  const payload = event.data.payloadHex;
  const bytes = Hex.hexToBytes(payload);

  const mode = (bytes[6] & 0x7c) >> 2;

  const decode = {};

  if (mode !== 2 && mode !== 31) {
    decode.BatV = ((bytes[0] << 8) | bytes[1]) / 1000;

    decode.temperature = parseFloat(
      ((((bytes[2] << 24) >> 16) | bytes[3]) / 10).toFixed(2),
    );

    decode.c0adc = ((bytes[4] << 8) | bytes[5]) / 1000;

    decode.digitalStatus = bytes[6] & 0x02 ? "HIGH" : "LOW";

    if (mode !== 6) {
      decode.extTrigger = !!(bytes[6] & 0x01);
      decode.open = !!(bytes[6] & 0x80);
    }
  }

  if (mode === "0") {
    decode.workMode = "IIC";

    if (((bytes[9] << 8) | bytes[10]) === 0) {
      decode.light = ((bytes[7] << 24) >> 16) | bytes[8];
    } else {
      decode.extTemperature = parseFloat(
        ((((bytes[7] << 24) >> 16) | bytes[8]) / 10).toFixed(2),
      );

      decode.extHumidity = parseFloat(
        (((bytes[9] << 8) | bytes[10]) / 10).toFixed(1),
      );
    }
  } else if (mode === "1") {
    decode.workMode = " Distance";

    decode.distance = parseFloat(
      (((bytes[7] << 8) | bytes[8]) / 10).toFixed(1),
    );

    if (((bytes[9] << 8) | bytes[10]) !== 65535) {
      decode.distanceSignalStrength = parseFloat(
        ((bytes[9] << 8) | bytes[10]).toFixed(0),
      );
    }
  } else if (mode === "2") {
    decode.workMode = "3ADC";

    decode.batteryVoltage = bytes[11] / 10;

    decode.c0adc = ((bytes[0] << 8) | bytes[1]) / 1000;

    decode.c1adc = ((bytes[2] << 8) | bytes[3]) / 1000;

    decode.c4adc = ((bytes[4] << 8) | bytes[5]) / 1000;

    decode.digitalStatus = bytes[6] & 0x02 ? "HIGH" : "LOW";

    decode.extTrigger = bytes[6] & 0x01 ? "TRUE" : "FALSE";

    decode.open = !!(bytes[6] & 0x80);

    if (((bytes[9] << 8) | bytes[10]) === 0) {
      decode.light = ((bytes[7] << 24) >> 16) | bytes[8];
    } else {
      decode.temperature = parseFloat(
        ((((bytes[7] << 24) >> 16) | bytes[8]) / 10).toFixed(2),
      );

      decode.humidity = parseFloat(
        (((bytes[9] << 8) | bytes[10]) / 10).toFixed(1),
      );
    }
  } else if (mode === "3") {
    decode.workMode = "3DS18B20";

    decode.c2temperature = parseFloat(
      ((((bytes[7] << 24) >> 16) | bytes[8]) / 10).toFixed(2),
    );

    decode.c3temperature = parseFloat(
      ((((bytes[9] << 24) >> 16) | bytes[10]) / 10).toFixed(1),
    );
  } else if (mode === "4") {
    decode.workMode = "WEIGHT";

    decode.weight = ((bytes[7] << 24) >> 16) | bytes[8];
  } else if (mode === "5") {
    decode.workMode = "COUNT";

    decode.count =
      (bytes[7] << 24) | (bytes[8] << 16) | (bytes[9] << 8) | bytes[10];
  } else if (mode === "31") {
    decode.workMode = "ALARM";

    decode.batteryVoltage = ((bytes[0] << 8) | bytes[1]) / 1000;

    decode.c1Temperature = parseFloat(
      ((((bytes[2] << 24) >> 16) | bytes[3]) / 10).toFixed(2),
    );

    decode.c1tempMin = (bytes[4] << 24) >> 24;

    decode.c1tempMin = (bytes[5] << 24) >> 24;

    decode.shtTempMin = (bytes[7] << 24) >> 24;

    decode.shTempMax = (bytes[8] << 24) >> 24;

    decode.shtHumMin = bytes[9];

    decode.shtHumMax = bytes[10];
  }
}
