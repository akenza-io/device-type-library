const resetState = {
  1: "POWER_ON",
  2: "HARD_RESET",
  3: "SOFT_RESET",
  4: "WATCHDOG",
  5: "BROWN_OUT",
  6: "OTHER",
}

const hardwareRegion = {
  0: "EU868",
  1: "US915",
  2: "AS923",
  3: "AU915",
}

function convertRange(num, inMin, inMax, outMin, outMax) {
  let out = outMin + ((num - inMin) / (inMax - inMin) * (outMax - outMin));
  return parseFloat(out.toFixed(2));
}

function convertTemp(num) {
  if (num === 0xFF) {
    return null;
  }
  return convertRange(num, 0, 240, -10, 50);
}

function convertHum(num) {
  if (num === 0xFF) {
    return null;
  }
  return convertRange(num, 0, 200, 0, 100);
}

function convertSound(num) {
  if (num === 0xFF) {
    return null;
  }
  return convertRange(num, 0, 250, 0, 125);
}

function convertLux(num) {
  if (num === 0xFFFF) {
    return null;
  }
  return convertRange(num, 0, 20000, 0, 20000);
}

function consume(event) {
  const payload = event.data.payloadHex;
  const bytes = Hex.hexToBytes(payload);
  let topic = "default";
  let data = {};
  const lifecycle = {};

  let byte = 0;
  const productId = bytes[byte++];
  const messageTypeRev = bytes[byte++];
  const messageTypeValue = (messageTypeRev >> 4) & 0x0f;
  lifecycle.revision = (messageTypeRev & 0x0f);

  // Battery status - 0x00 is externally powered, 0xFF is not measured
  const batteryInfo = bytes[byte++];
  if (batteryInfo !== 0 && batteryInfo !== 0xff) {
    lifecycle.batteryVoltage = convertRange(batteryInfo, 1, 241, 0, 48);
  } else {
    lifecycle.batteryVoltage = null;
  }

  // Boot message
  if (messageTypeValue == 1) {
    topic = "configuration";

    // Firmware version
    let firmwareVersionValue = bytes[byte++];
    firmwareVersionValue = (firmwareVersionValue << 8) | bytes[byte++];
    data.firmwareVersion = (((firmwareVersionValue >> 12) & 0x0f) + '.' + ((firmwareVersionValue >> 8) & 0x0f) + '.' + ((firmwareVersionValue >> 4) & 0x0f) + '.' + (firmwareVersionValue & 0x0f));

    // Reset reason
    data.resetReason = resetState[bytes[byte++]];

    // Hardware region
    data.hardwareRegionSelection = hardwareRegion[bytes[byte++]];

    // Sensors present
    let sensorAvailableValue = bytes[byte++];
    lifecycle.tempHumActive = (sensorAvailableValue & (1 << 0)) !== 0;
    lifecycle.luxActive = (sensorAvailableValue & (1 << 4)) !== 0;
    lifecycle.soundLevelActive = (sensorAvailableValue & (1 << 5)) !== 0;
    lifecycle.pirActive = (sensorAvailableValue & (1 << 6)) !== 0;

    // Reading interval
    let readIntervalValue = bytes[byte++];
    data.readConfiguration = (readIntervalValue & (1 << 0)) !== 0 ? 'NETWORK' : 'DIP_SWITCH';
    data.readInterval = ((readIntervalValue >> 1) & 0xFF); // Minutes

    // PIR
    if (lifecycle.pirActive == true) {
      data.pirAbsenceTimeout = bytes[byte++]; // Minutes
      data.pirRepeatedTimeOut = bytes[byte++]; // Minutes
    }

    // Temperature and humidity
    if (lifecycle.tempHumActive == true) {
      let temperatureOffsetRaw = bytes[byte++];
      data.temperatureOffset = temperatureOffsetRaw;
      data.temperatureOffsetScaled = ((0.25 * temperatureOffsetRaw) - 5); // 0..40 is -5..+5
      let humidityOffsetRaw = bytes[byte++];
      data.humidityOffset = humidityOffsetRaw;
      data.humidityOffsetScaled = ((0.5 * humidityOffsetRaw) - 5); // 0..20 is -5..+5
    }

    // Sensor data message
  } else if (messageTypeValue == 2) {
    lifecycle.dataAge = bytes[byte++];

    // Sensors present
    let sensorAvailableValue = bytes[byte++];
    lifecycle.tempHumActive = (sensorAvailableValue & (1 << 0)) !== 0;
    lifecycle.luxActive = (sensorAvailableValue & (1 << 4)) !== 0;
    lifecycle.soundLevelActive = (sensorAvailableValue & (1 << 5)) !== 0;
    lifecycle.pirActive = (sensorAvailableValue & (1 << 6)) !== 0;

    if (lifecycle.tempHumActive == true) {
      data.temperature = convertTemp(bytes[byte++]);
      data.humidity = convertHum(bytes[byte++]);
    }

    if (lifecycle.soundLevelActive == true) {
      data.soundLevel = convertSound(bytes[byte++]);
    }

    if (lifecycle.luxActive == true) {
      data.illumination = convertLux(bytes[byte++] << 8 | bytes[byte++]); // lx
    }

    // Occupancy data message
  } else {
    topic = "occupancy";
    lifecycle.dataAge = bytes[byte++];
    let occupancyValue = bytes[byte++];
    data.occupied = ((occupancyValue & 0x01) == 0) ? false : true;
    data.occupancy = Number(data.occupied);
  }

  emit("sample", { data: data, topic });
  emit("sample", { data: lifecycle, topic: "lifecycle" });
}
