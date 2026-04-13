const vocUnits = {
  0: "TVOC μg/m3",
  1: "TVOC ppb",
  2: "VOC Index",
  3: "Reserved",
}

const tvocEquivalent = {
  0: "Isobutylene",
  1: "Mølhave",
  2: "Ethanol",
  3: "Reserved",
}

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
  } else {
    return convertRange(num, 0, 240, -10, 50);
  }
}

function convertHum(num) {
  if (num === 0xFF) {
    return null;
  } else {
    return convertRange(num, 0, 200, 0, 100);
  }
}

function convertPm(num) {
  if (num === 0x1FF) {
    return null;
  } else {
    return num;
  }
}

function convertSound(num) {
  if (num === 0xFF) {
    return null;
  } else {
    return convertRange(num, 0, 250, 0, 125);
  }
}

function convertLux(num) {
  if (num === 0xFFFF) {
    return null;
  } else {
    return convertRange(num, 0, 20000, 0, 20000);
  }
}

function convertco2(num) {
  if (num === 0xFFFF) {
    return null;
  } else {
    return convertRange(num, 0, 5000, 0, 5000);
  }
}

function convertVoc(num) {
  if (num === 0x3FFF) {
    return null;
  } else {
    return convertRange(num, 0, 5000, 0, 5000);
  }
}

function consume(event) {
  const payload = event.data.payloadHex;
  const bytes = Hex.hexToBytes(payload);
  let topic = "default";
  let data = {};
  const lifecycle = {};

  let byte = 0;
  const messageTypeRev = bytes[byte++];
  const messageTypeValue = (messageTypeRev >> 4) & 0x0f;
  lifecycle.revision = (messageTypeRev & 0x0f);

  // Battery status
  const batteryInfo = bytes[byte++];
  if (batteryInfo !== 0 && batteryInfo !== 0xff) {
    // convert the voltage in 0.2V steps
    lifecycle.batteryVoltage = convertRange(batteryInfo, 1, 241, 0, 48);
  }

  // Boot Message
  if (messageTypeValue == 1) {
    topic = "configuration";
    // Get the firmware version
    let firmwareVersionValue = bytes[byte++];
    firmwareVersionValue = (firmwareVersionValue << 8) | bytes[byte++];

    data.firmwareVersion = (((firmwareVersionValue >> 12) & 0x0f) + '.' + ((firmwareVersionValue >> 8) & 0x0f) + '.' + ((firmwareVersionValue >> 4) & 0x0f) + '.' + (firmwareVersionValue & 0x0f));

    // Reset reason 
    data.resetReason = resetState[bytes[byte++]];

    // Hardware region
    data.hardwareRegionSelection = hardwareRegion[bytes[byte++]];

    // Sensors present
    let sensorAvailableValue = bytes[byte++];
    lifecycle.tempHumActive = (sensorAvailableValue & (1 << 0)) !== 0 ? true : false;
    lifecycle.tvocActive = (sensorAvailableValue & (1 << 1)) !== 0 ? true : false;
    lifecycle.co2Active = (sensorAvailableValue & (1 << 2)) !== 0 ? true : false;
    lifecycle.pmActive = (sensorAvailableValue & (1 << 3)) !== 0 ? true : false;
    lifecycle.luxActive = (sensorAvailableValue & (1 << 4)) !== 0 ? true : false;
    lifecycle.soundLevelActive = (sensorAvailableValue & (1 << 5)) !== 0 ? true : false;
    lifecycle.pirActive = (sensorAvailableValue & (1 << 6)) !== 0 ? true : false;

    // Reading Interval 
    let readIntervalValue = bytes[byte++];
    data.readConfiguration = (readIntervalValue & (1 << 0)) !== 0 ? 'NETWORK' : 'DIP_SWITCH';
    data.readInterval = ((readIntervalValue >> 1) & 0xFF); // Minutes

    // PM Sensor
    if (lifecycle.pmActive == true) {
      let pmMaskValue = bytes[byte++];
      data.pmIsAutoCleanIntervalSet = (pmMaskValue & (1 << 0)) !== 0 ? true : false;
      // Clean is not disabled, so show the interval period
      if (data.pmIsAutoCleanIntervalSet == true) {
        // Clean Interval
        data.pmAutoCleanInterval = ((pmMaskValue >> 2) & 0x07); // Days
      }
    }

    // CO2 sensor
    if (lifecycle.co2Active == true) {
      // Fresh Air
      let co2FreshMaskValue = bytes[byte++];
      co2FreshMaskValue = (co2FreshMaskValue << 8) | bytes[byte++];
      data.co2HasManualCalibrationPerformed = (co2FreshMaskValue & (1 << 15)) !== 0 ? true : false;
      data.co2FreshAirBackgroundLevel = (co2FreshMaskValue & 0x7FFF); // ppm

      // Indoor Air
      let co2IndoorMaskValue = bytes[byte++];
      co2IndoorMaskValue = (co2IndoorMaskValue << 8) | bytes[byte++];
      data.co2IsAutoCalibrationEnabled = (co2IndoorMaskValue & (1 << 15)) !== 0 ? true : false;
      data.co2IndoorAirBackgroundLevel = (co2IndoorMaskValue & 0x7FFF); // ppm
    }

    // PIR
    if (lifecycle.pirActive == true) {
      data.pirAbsenceTimeOut = bytes[byte++]; // Minutes
      data.pirRepeatedTimeOut = bytes[byte++]; // Minutes
    }

    // Temperature and humidity
    if (lifecycle.tempHumActive == true) {
      // Temperature Offset
      let temperatureOffsetRaw = bytes[byte++];
      data.temperatureOffset = temperatureOffsetRaw; // °
      data.temperatureOffsetScaled = ((0.25 * temperatureOffsetRaw) - 5); //0..40 is -5..+5
      // Humidity Offset
      let humidityOffsetRaw = bytes[byte++];
      data.humidityOffset = humidityOffsetRaw; // %
      data.humidityOffsetScaled = ((0.5 * humidityOffsetRaw) - 5); //0..20 is -5..+5
    }

    // VOC
    if (lifecycle.isSensorsAvailable.tvoc == true) {
      let vocMaskValue = bytes[byte++];
      data.vocUnit = vocUnits[(vocMaskValue) >> 4];
      data.vocEquivalent = tvocEquivalent[(vocMaskValue & 0x0F)];
    }
    // Default
  } else if (messageTypeValue == 2) {
    lifecycle.dataAge = bytes[byte++];

    // Sensors present
    let sensorAvailableValue = bytes[byte++];
    lifecycle.tempHumActive = (sensorAvailableValue & (1 << 0)) !== 0 ? true : false;
    lifecycle.tvocActive = (sensorAvailableValue & (1 << 1)) !== 0 ? true : false;
    lifecycle.co2Active = (sensorAvailableValue & (1 << 2)) !== 0 ? true : false;
    lifecycle.pmActive = (sensorAvailableValue & (1 << 3)) !== 0 ? true : false;
    lifecycle.luxActive = (sensorAvailableValue & (1 << 4)) !== 0 ? true : false;
    lifecycle.soundLevelActive = (sensorAvailableValue & (1 << 5)) !== 0 ? true : false;
    lifecycle.pirActive = (sensorAvailableValue & (1 << 6)) !== 0 ? true : false;


    // Sensor data, Only if available
    if (lifecycle.tempHumActive == true) {
      data.temperature = convertTemp(bytes[byte++]);
      data.humidity = convertHum(bytes[byte++]);
    }

    if (lifecycle.pmActive == true) {
      // Convert PM10
      let pmRaw = bytes[byte++] << 8 | bytes[byte];
      data.pm10 = convertPm((pmRaw & 0xFF80) >> 7);
      // Convert PM4
      pmRaw = bytes[byte++] << 8 | bytes[byte];
      data.pm4 = convertPm((pmRaw & 0x7FC0) >> 6);
      // Convert PM2.5
      pmRaw = bytes[byte++] << 8 | bytes[byte];
      data.pm2_5 = convertPm((pmRaw & 0x3FE0) >> 5);
      // Convert PM1.0
      pmRaw = bytes[byte++] << 8 | bytes[byte++];
      data.pm1_0 = convertPm((pmRaw & 0x1FF0) >> 4); // µg/m³
    }

    if (lifecycle.soundLevelActive == true) {
      data.soundLevel = convertSound(bytes[byte++]);
    }

    if (lifecycle.luxActive.lux == true) {
      data.illumination = convertLux(bytes[byte++] << 8 | bytes[byte++]); // lx
    }

    if (lifecycle.co2Active == true) {
      data.co2 = convertco2(bytes[byte++] << 8 | bytes[byte++]); // ppm
    }

    if (lifecycle.tvocActive == true) {
      let vocRaw = bytes[byte++] << 8 | bytes[byte++];
      let voc = convertVoc(vocRaw & 0x3FFF);

      if (voc !== null) {
        data.tvoc = voc;
        data.vocUnit = vocUnits[(vocRaw & 0xC000) >> 14];
      }
    }
  } else {
    topic = "occupancy";
    lifecycle.dataAge = bytes[byte++];
    let occupancyValue = bytes[byte++];

    data.occupied = ((occupancyValue & 0x01) == 0) ? false : true;
    data.occupancy = Number(data.occupied);

    // Warm desk 
    const time = new Date().getTime();
    const state = event.state || {};
    data.minutesSinceLastOccupied = 0; // Always give out minutesSinceLastOccupied for consistancy
    if (data.occupied) {
      delete state.lastOccupancyTimestamp; // Delete last occupancy timestamp
    } else if (state.lastOccupancyTimestamp !== undefined) {
      data.minutesSinceLastOccupied = Math.round((time - state.lastOccupancyTimestamp) / 1000 / 60); // Get free since
    } else if (state.lastOccupiedValue) { //
      state.lastOccupancyTimestamp = time; // Start with first no occupancy
    }

    if (Number.isNaN(data.minutesSinceLastOccupied)) {
      data.minutesSinceLastOccupied = 0;
    }
    state.lastOccupiedValue = data.occupied;
    emit("state", state);
  }

  emit("sample", { data: data, topic });
  emit("sample", { data: lifecycle, topic: "lifecycle" });
}