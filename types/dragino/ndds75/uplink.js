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
  const bits = Bits.hexToBits(payload);
  const data = {};
  const lifecycle = {};

  lifecycle.deviceId = payload.substr(0, 16);
  lifecycle.version = Bits.bitsToUnsigned(bits.substr(64, 16));
  lifecycle.batteryVoltage = Bits.bitsToUnsigned(bits.substr(80, 16)) / 1000;
  lifecycle.signalStrength = Bits.bitsToUnsigned(bits.substr(96, 8));
  lifecycle.mod = Bits.bitsToUnsigned(bits.substr(104, 8));
  lifecycle.interrupt = Bits.bitsToUnsigned(bits.substr(112, 8));

  for (let pointer = 120; pointer < bits.length; pointer++) {
    data.distance = Bits.bitsToUnsigned(bits.substr(pointer, 16));
    const fillLevel = getFillLevel(event.device, data.distance);
    if (fillLevel !== undefined) {
      data.fillLevel = fillLevel;
    }
    pointer += 16;
    const timestamp = new Date(
      Bits.bitsToUnsigned(bits.substr(pointer, 32)) * 1000,
    );
    emit("sample", { data, topic: "default", timestamp });
    pointer += 32;
  }

  let batteryLevel =
    Math.round((lifecycle.batteryVoltage - 2.5) / 0.011 / 10) * 10;

  if (batteryLevel > 100) {
    batteryLevel = 100;
  } else if (batteryLevel < 0) {
    batteryLevel = 0;
  }
  lifecycle.batteryLevel = batteryLevel;

  emit("sample", { data: lifecycle, topic: "lifecycle" });
}
