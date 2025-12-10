function cToF(celsius) {
  return Math.round(((celsius * 9) / 5 + 32) * 10) / 10;
}

function getFillLevel(device, distance) {
  if (device !== undefined && distance !== undefined) {
    if (device.customFields !== undefined) {
      const { customFields } = device;
      let scaleLength = null;
      let sensorDistance = 0;

      if (customFields.containerHeight !== undefined) {
        scaleLength = Number(device.customFields.containerHeight);
      }

      if (customFields.installationOffset !== undefined) {
        sensorDistance = Number(device.customFields.installationOffset);
      }

      if (scaleLength !== null) {
        const percentExact =
          (100 / scaleLength) * (scaleLength - (distance - sensorDistance));
        let fillLevel = Math.round(percentExact);
        if (fillLevel > 100) {
          fillLevel = 100;
        } else if (fillLevel < 0) {
          fillLevel = 0;
        }
        return fillLevel;
      }
    }
  }
  return undefined;
}

function consume(event) {
  const payload = event.data.payloadHex;
  const bytes = Hex.hexToBytes(payload);

  const mode = (bytes[6] & 0x7c) >> 2;

  let topic = "default";
  const data = {};
  const defaultData = {};
  const lifecycle = {};

  if (mode !== 2 && mode !== 31) {
    lifecycle.batteryVoltage = ((bytes[0] << 8) | bytes[1]) / 1000;
    let batteryLevel =
      Math.round((lifecycle.batteryVoltage - 2.45) / 0.0115 / 10) * 10;

    if (batteryLevel > 100) {
      batteryLevel = 100;
    } else if (batteryLevel < 0) {
      batteryLevel = 0;
    }
    lifecycle.batteryLevel = batteryLevel;

    defaultData.temperature = parseFloat(
      ((((bytes[2] << 24) >> 16) | bytes[3]) / 10).toFixed(2),
    );
    defaultData.temperatureF = cToF(defaultData.temperature);

    if (((bytes[2] << 8) | bytes[3]) === 0xffff) {
      defaultData.temperature = null;
      defaultData.temperatureF = null;
    }

    defaultData.c0adc = ((bytes[4] << 8) | bytes[5]) / 1000;

    defaultData.digitalStatus = bytes[6] & 0x02 ? "HIGH" : "LOW";

    if (mode !== 6) {
      defaultData.extTrigger = !!(bytes[6] & 0x01);
      defaultData.open = !!(bytes[6] & 0x80);
    }
    emit("sample", { data: defaultData, topic: "default" });
  }

  if (mode === 0) {
    topic = "iic";

    if (((bytes[9] << 8) | bytes[10]) === 0) {
      data.light = ((bytes[7] << 24) >> 16) | bytes[8];
    } else {
      data.extTemperature = parseFloat(
        ((((bytes[7] << 24) >> 16) | bytes[8]) / 10).toFixed(2),
      );
      data.extTemperatureF = cToF(data.extTemperature);

      if (((bytes[7] << 8) | bytes[8]) === 0xffff) {
        defaultData.extTemperature = null;
        defaultData.extTemperatureF = null;
      }

      data.extHumidity = parseFloat(
        (((bytes[9] << 8) | bytes[10]) / 10).toFixed(1),
      );
    }
  } else if (mode === 1) {
    topic = "distance";

    data.distance = parseFloat((((bytes[7] << 8) | bytes[8]) / 10).toFixed(1));
    const fillLevel = getFillLevel(event.device, data.distance);
    if (fillLevel !== undefined) {
      data.fillLevel = fillLevel;
    }

    if (((bytes[9] << 8) | bytes[10]) !== 65535) {
      data.distanceSignalStrength = parseFloat(
        ((bytes[9] << 8) | bytes[10]).toFixed(0),
      );
    }
  } else if (mode === 2) {
    topic = "adc";

    lifecycle.batteryVoltage = bytes[11] / 10;
    let batteryLevel =
      Math.round((lifecycle.batteryVoltage - 2.45) / 0.0115 / 10) * 10;

    if (batteryLevel > 100) {
      batteryLevel = 100;
    } else if (batteryLevel < 0) {
      batteryLevel = 0;
    }
    lifecycle.batteryLevel = batteryLevel;

    data.c0adc = ((bytes[0] << 8) | bytes[1]) / 1000;

    data.c1adc = ((bytes[2] << 8) | bytes[3]) / 1000;

    data.c4adc = ((bytes[4] << 8) | bytes[5]) / 1000;

    data.digitalStatus = bytes[6] & 0x02 ? "HIGH" : "LOW";

    data.extTrigger = bytes[6] & 0x01 ? "TRUE" : "FALSE";

    data.open = !!(bytes[6] & 0x80);

    if (((bytes[9] << 8) | bytes[10]) === 0) {
      data.light = ((bytes[7] << 24) >> 16) | bytes[8];
    } else {
      data.temperature = parseFloat(
        ((((bytes[7] << 24) >> 16) | bytes[8]) / 10).toFixed(2),
      );
      data.temperatureF = cToF(data.temperature);

      if (((bytes[7] << 8) | bytes[8]) === 0xffff) {
        defaultData.temperature = null;
        defaultData.temperatureF = null;
      }

      data.humidity = parseFloat(
        (((bytes[9] << 8) | bytes[10]) / 10).toFixed(1),
      );
    }
  } else if (mode === 3) {
    topic = "ds";

    data.c2temperature = parseFloat(
      ((((bytes[7] << 24) >> 16) | bytes[8]) / 10).toFixed(2),
    );
    data.c2temperatureF = cToF(data.c2temperature);

    if (((bytes[7] << 8) | bytes[8]) === 0xffff) {
      data.c2temperature = null;
      data.c2temperatureF = null;
    }

    data.c3temperature = parseFloat(
      ((((bytes[9] << 24) >> 16) | bytes[10]) / 10).toFixed(1),
    );
    data.c3temperatureF = cToF(data.c3temperature);

    if (((bytes[9] << 8) | bytes[10]) === 0xffff) {
      data.c3temperature = null;
      data.c3temperatureF = null;
    }
  } else if (mode === 4) {
    topic = "weight";

    data.weight = ((bytes[7] << 24) >> 16) | bytes[8];
  } else if (mode === 5) {
    topic = "count";

    data.count =
      (bytes[7] << 24) | (bytes[8] << 16) | (bytes[9] << 8) | bytes[10];
  } else if (mode === "31") {
    topic = "alarm";

    lifecycle.batteryVoltage = ((bytes[0] << 8) | bytes[1]) / 1000;

    let batteryLevel =
      Math.round((lifecycle.batteryVoltage - 2.45) / 0.0115 / 10) * 10;

    if (batteryLevel > 100) {
      batteryLevel = 100;
    } else if (batteryLevel < 0) {
      batteryLevel = 0;
    }
    lifecycle.batteryLevel = batteryLevel;

    data.channel1Temperature = parseFloat(
      ((((bytes[2] << 24) >> 16) | bytes[3]) / 10).toFixed(2),
    );
    data.channel1TemperatureF = cToF(data.channel1Temperature);

    if (((bytes[2] << 8) | bytes[3]) === 0xffff) {
      data.channel1Temperature = null;
      data.channel1TemperatureF = null;
    }

    data.channel1TemperatureMin = (bytes[4] << 24) >> 24;
    data.channel1TemperatureMinF = cToF(data.channel1TemperatureMin);

    data.channel1TemperatureMax = (bytes[5] << 24) >> 24;
    data.channel1TemperatureMaxF = cToF(data.channel1TemperatureMax);

    data.shtTemperatureMin = (bytes[7] << 24) >> 24;
    data.shtTemperatureMinF = cToF(data.shtTemperatureMin);

    data.shtTemperatureMax = (bytes[8] << 24) >> 24;
    data.shtTemperatureMaxF = cToF(data.shtTemperatureMax);

    data.shtHumMin = bytes[9];
    data.shtHumMax = bytes[10];
  }

  if (Object.keys(data).length > 0) {
    emit("sample", { data, topic });
  }

  if (Object.keys(lifecycle).length > 0) {
    emit("sample", { data: lifecycle, topic: "lifecycle" });
  }
}
