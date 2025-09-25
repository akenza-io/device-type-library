function cToF(celsius) {
  return Math.round(((celsius * 9) / 5 + 32) * 10) / 10;
}

function consume(event) {
  const payload = event.data.payloadHex;
  const { port } = event.data;
  const bytes = Hex.hexToBytes(payload);
  const data = {};
  const lifecycle = {};

  if (port === 1) {
    // TELEMETRY

    const variant = (bytes[0] << 8) | bytes[1];

    // decode header
    lifecycle.baseId = bytes[0] >> 4;
    lifecycle.majorVersion = bytes[0] & 0x0f;
    lifecycle.minorVersion = bytes[1] >> 4;
    lifecycle.productVersion = bytes[1] & 0x0f;
    lifecycle.upCnt = bytes[2];
    lifecycle.batteryVoltage = ((bytes[3] << 8) | bytes[4]) / 1000;
    let batteryLevel = Math.round((lifecycle.batteryVoltage - 4.4) / 0.016); // 6V - 4.4V

    if (batteryLevel > 100) {
      batteryLevel = 100;
    } else if (batteryLevel < 0) {
      batteryLevel = 0;
    }
    lifecycle.batteryLevel = batteryLevel;

    lifecycle.internalTemperature = Math.round(
      ((bytes[5] << 8) | bytes[6]) / 10 - 100,
    );
    lifecycle.internalTemperatureF = cToF(lifecycle.internalTemperature);

    let it = 7;

    // Luftfeuchte ist bei allen Varianten enthalten
    data.humidity = bytes[it++];

    if (lifecycle.productVersion & 0x01) {
      // Co2 und Druck sind enthalten wenn subversion bit0 = 1, andernfalls 0
      data.pressure = (bytes[it++] << 8) | bytes[it++];
      data.co2 = (bytes[it++] << 8) | bytes[it++];
    } else {
      it += 4; // Werte sind 0  aus kompatibilitäts Gründen, daher überspringen
    }

    const alarm = bytes[it++]; // Alarm-Level, entspricht grün, gelb, rot
    switch (alarm) {
      case 0:
        data.alarm = "GREEN";
        break;
      case 1:
        data.alarm = "YELLOW";
        break;
      case 2:
        data.alarm = "RED";
        break;
      default:
        break;
    }

    // FIFO Werte wegwerfen (1 byte fifo size, 1 byte period, 7 bytes pro fifo eintrag)
    it += 2 + bytes[it] * 7;

    // Taupunkt seit minor version 2 bei alle Varianten enthalten (ausnahme früher versionen subversion 2, daher byte prüfen)
    if (lifecycle.minorVersion >= 2 && bytes[it]) {
      data.dewPoint = bytes[it++] - 100;
      data.dewPointF = cToF(data.dewPoint);
    }

    // Wandtemperatur und Feuchte enthalten wenn subversion bit 2 = 1
    if (lifecycle.productVersion & 0x04) {
      data.wallTemperature = bytes[it++] - 100;
      data.wallTemperatureF = cToF(data.wallTemperature);
      data.thermTemperature = bytes[it++] - 100;
      data.thermTemperatureF = cToF(data.thermTemperature);
      data.wallHumidity = bytes[it++];
    }
    emit("sample", { data: lifecycle, topic: "lifecycle" });
    emit("sample", { data, topic: "default" });
  }
}
