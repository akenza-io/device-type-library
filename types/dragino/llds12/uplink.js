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
  const data = {};
  const lifecycle = {};

  lifecycle.batteryVoltage = (((bytes[0] << 8) | bytes[1]) & 0x3fff) / 1000;

  let batteryLevel =
    Math.round((lifecycle.batteryVoltage - 2.45) / 0.0115 / 10) * 10;

  if (batteryLevel > 100) {
    batteryLevel = 100;
  } else if (batteryLevel < 0) {
    batteryLevel = 0;
  }
  lifecycle.batteryLevel = batteryLevel;

  data.temperature = ((((bytes[2] << 24) >> 16) | bytes[3]) / 10).toFixed(2);
  if ((bytes[2] << 8) | bytes[3] === 0xffff) {
    data.temperature = null;
  }
  data.distance = ((bytes[4] << 8) | bytes[5]) / 10;
  const fillLevel = getFillLevel(event.device, data.distance);
  if (fillLevel !== undefined) {
    data.fillLevel = fillLevel;
  }
  data.distanceSignalStrength = (bytes[6] << 8) | bytes[7];
  data.lidarTemperature = (bytes[9] << 24) >> 24;

  emit("sample", { data, topic: "default" });
  emit("sample", { data: lifecycle, topic: "lifecycle" });
}
