function calculateIncrement(lastValue, currentValue) {
  // Check if current value exists
  if (currentValue === undefined || Number.isNaN(currentValue)) {
    return 0;
  }

  // Init state && Check for the case the counter reseted
  if (lastValue === undefined || lastValue > currentValue) {
    lastValue = currentValue;
  }
  // Calculate increment
  return currentValue - lastValue;
}

const statusCodes = {
  0: "OK",
  1: "DISABLED",
  2: "FAULT",
  4: "DOWN",
  8: "ALARM",
  16: "STALE",
  64: "NULL",
  128: "UNACKED_ALARM",
};

function consume(event) {
  const decoded = {};
  const lifecycle = {};

  decoded.consumptionCumulative = event.data.value;

  const state = event.state || {};
  decoded.consumption = calculateIncrement(
    state.lastConsumptionCumulative,
    decoded.consumptionCumulative,
  );
  state.lastConsumptionCumulative = decoded.consumptionCumulative;

  // Customfields
  if (event.device !== undefined) {
    if (event.device.customFields !== undefined) {
      const { customFields } = event.device;
      let unitConversionMultiplier = 1;
      let unitConversionDivider = 1;

      if (customFields.unitConversionMultiplier !== undefined) {
        unitConversionMultiplier = Number(customFields.unitConversionMultiplier);
      }

      if (customFields.unitConversionDivider !== undefined) {
        unitConversionDivider = Number(customFields.unitConversionDivider);
      }

      if (decoded.consumptionCumulative !== undefined) {
        decoded.consumptionCumulative =
          Math.round(
            ((decoded.consumptionCumulative * unitConversionMultiplier) / unitConversionDivider) * 1000,
          ) / 1000;
        decoded.consumption =
          Math.round(((decoded.consumption * unitConversionMultiplier) / unitConversionDivider) * 1000) /
          1000;
      }
    }
  }

  lifecycle.status =
    statusCodes[event.data.status] ||
    `UNKNOWN ERROR: ${event.data.status.toString()}`;

  emit("state", state);
  emit("sample", { data: decoded, topic: "consumption" });

  if (lifecycle.status !== "OK") {
    emit("sample", { data: lifecycle, topic: "lifecycle" });
  }
}
