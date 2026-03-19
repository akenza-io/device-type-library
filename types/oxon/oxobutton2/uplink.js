function cToF(celsius) {
  return Math.round(((celsius * 9) / 5 + 32) * 10) / 10;
}

function consume(event) {
  const payload = event.data.payloadHex;
  const bits = Bits.hexToBits(payload);
  const data = {
    button1Count: 0,
    button2Count: 0,
    button3Count: 0,
    button4Count: 0,
    heartbeatEventCount: 0,
    periodicUplinkCount: 0,
    temperatureEventCount: 0,
    humidityEventCount: 0,
    ambientLightEventCount: 0,
    button1: false,
    button2: false,
    button3: false,
    button4: false,
    heartbeatEvent: false,
    periodicUplink: false,
    temperatureEvent: false,
    humidityEvent: false,
    ambientLightEvent: false,
  };
  const lifecycle = {};

  if (Bits.bitsToUnsigned(bits.substr(0, 8)) === 57) {
    const reason1 = Bits.bitsToUnsigned(bits.substr(8, 8));
    const reason2 = Bits.bitsToUnsigned(bits.substr(16, 8));

    if (reason1 & 0x01) {
      data.button1Count = 1;
      data.button1 = true;
    }
    if (reason1 & 0x02) {
      data.button2Count = 1;
      data.button2 = true;
    }
    if (reason1 & 0x04) {
      data.button3Count = 1;
      data.button3 = true;
    }
    if (reason1 & 0x08) {
      data.button4Count = 1;
      data.button4 = true;
    }
    if (reason1 & 0x10) {
      data.heartbeatEventCount = 1;
      data.heartbeatEvent = true;
    }
    if (reason2 & 0x01) {
      data.periodicUplinkCount = 1;
      data.periodicUplink = true;
    }
    if (reason2 & 0x02) {
      data.temperatureEventCount = 1;
      data.temperatureEvent = true;
    }
    if (reason2 & 0x04) {
      data.humidityEventCount = 1;
      data.humidityEvent = true;
    }
    if (reason2 & 0x08) {
      data.ambientLightEventCount = 1;
      data.ambientLightEvent = true;
    }

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
    data.temperatureF = cToF(data.temperature);
    data.humidity = Bits.bitsToUnsigned(bits.substr(64, 16)) / 100;
    data.light = Bits.bitsToUnsigned(bits.substr(80, 16)) / 100;

    emit("sample", { data: lifecycle, topic: "lifecycle" });
    emit("sample", { data, topic: "default" });
  }
}
