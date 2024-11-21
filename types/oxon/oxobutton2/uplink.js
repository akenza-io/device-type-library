function consume(event) {
  const payload = event.data.payloadHex;
  const bits = Bits.hexToBits(payload);
  const data = { button1: 0, button2: 0, button3: 0, button4: 0, heartbeatEvent: 0, periodicUplink: 0, temperatureEvent: 0, humidityEvent: 0, ambientLightEvent: 0 };
  const lifecycle = {};

  if (Bits.bitsToUnsigned(bits.substr(0, 8)) === 57) {
    const reason1 = Bits.bitsToUnsigned(bits.substr(8, 8));
    const reason2 = Bits.bitsToUnsigned(bits.substr(16, 8));

    if (reason1 & 0x01) { data.button1 = 1; }
    if (reason1 & 0x02) { data.button2 = 1; }
    if (reason1 & 0x04) { data.button3 = 1; }
    if (reason1 & 0x08) { data.button4 = 1; }
    if (reason1 & 0x10) { data.heartbeatEvent = 1; }
    if (reason2 & 0x01) { data.periodicUplink = 1; }
    if (reason2 & 0x02) { data.temperatureEvent = 1; }
    if (reason2 & 0x04) { data.humidityEvent = 1; }
    if (reason2 & 0x08) { data.ambientLightEvent = 1; }

    const appMode = Bits.bitsToUnsigned(bits.substr(24, 8));
    switch (appMode) {
      case 0x00:
        lifecycle.appMode = "SENSOR_DISPLAY";
        break;
      case 0x01:
        lifecycle.appMode = "GENERIC_BELL_IMAGE";
        break;
      case 0x02:
        lifecycle.appMode = "FIRE_ALARM_IMAGE";
        break;
      case 0x03:
        lifecycle.appMode = "SERVICE_REQUEST_IMAGE";
        break;
      case 0x04:
        lifecycle.appMode = "MEDICAL_INCIDENT_IMAGE";
        break;
      case 0x05:
        lifecycle.appMode = "TECHNICAL_ALERT_IMAGE";
        break;
      default:
        lifecycle.appMode = "UNKNOWN";
        break;
    }

    lifecycle.acceptsDownlinks = !!Bits.bitsToUnsigned(bits.substr(32, 8));
    lifecycle.batteryLevel = Bits.bitsToUnsigned(bits.substr(40, 8));
    let temperature = Bits.bitsToUnsigned(bits.substr(48, 16));
    if (temperature >= 32768) {
      temperature -= 65536;
    }
    data.temperature = temperature / 100;
    data.humidity = Bits.bitsToUnsigned(bits.substr(64, 16)) / 100;
    data.light = Bits.bitsToUnsigned(bits.substr(80, 16)) / 100;

    emit("sample", { data: lifecycle, topic: "lifecycle" });
    emit("sample", { data, topic: "default" });
  }
}