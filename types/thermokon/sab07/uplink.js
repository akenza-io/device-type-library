function cToF(celsius) {
  return Math.round(((celsius * 9) / 5 + 32) * 10) / 10;
}

function consume(event) {
  const payload = event.data.payloadHex;
  const bytes = Hex.hexToBytes(payload);

  const keepaliveBytes = bytes.slice(-9);
  const command = keepaliveBytes[0];

  // --- Decode Data --- //

  const defaultData = {};
  const actuator = {};
  const lifecycle = {};

  // Climate data
  if (command === 0x81) {
    defaultData.sensorTemperature = parseFloat(
      ((keepaliveBytes[2] - 28.33333) / 5.66666).toFixed(2)
    );
    defaultData.sensorTemperatureF = cToF(defaultData.sensorTemperature);
  } else {
    // command === 0x01
    defaultData.sensorTemperature = parseFloat(
      ((keepaliveBytes[2] * 165) / 256 - 40).toFixed(2)
    );
    defaultData.sensorTemperatureF = cToF(defaultData.sensorTemperature);
  }
  defaultData.targetTemperature = keepaliveBytes[1];
  defaultData.targetTemperatureF = cToF(defaultData.targetTemperature);
  defaultData.relativeHumidity = parseFloat(
    ((keepaliveBytes[3] * 100) / 256).toFixed(2)
  );

  // Actuator data
  actuator.motorPosition = ((keepaliveBytes[6] >> 4) << 8) | keepaliveBytes[4];
  actuator.motorRange = ((keepaliveBytes[6] & 0x0f) << 8) | keepaliveBytes[5];

  // Lifecycle data
  lifecycle.batteryVoltage = parseFloat(
    (2 + ((keepaliveBytes[7] >> 4) & 0x0f) * 0.1).toFixed(2)
  );

  // Status flags from byte 7
  lifecycle.openWindow = ((keepaliveBytes[7] >> 3) & 1) === 1;
  lifecycle.highMotorConsumption = ((keepaliveBytes[7] >> 2) & 1) === 1;
  lifecycle.lowMotorConsumption = ((keepaliveBytes[7] >> 1) & 1) === 1;
  lifecycle.brokenSensor = (keepaliveBytes[7] & 1) === 1;

  // Status flags from byte 8
  lifecycle.childLock = ((keepaliveBytes[8] >> 7) & 1) === 1;
  lifecycle.calibrationFailed = ((keepaliveBytes[8] >> 6) & 1) === 1;
  lifecycle.attachedBackplate = ((keepaliveBytes[8] >> 5) & 1) === 1;
  lifecycle.perceiveAsOnline = ((keepaliveBytes[8] >> 4) & 1) === 1;

  // --- Emit Samples --- //

  emit("sample", {
    topic: "default",
    data: defaultData
  });
  emit("sample", {
    data: actuator,
    topic: "actuator"
  });
  emit("sample", {
    data: lifecycle,
    topic: "lifecycle"
  });
}