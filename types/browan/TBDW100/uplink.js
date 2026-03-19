function calculateIncrement(state, currentValue, usageDefinition = 2, doorClosingDefinition = 1) {
  let { lastCount } = state;
  let { partialUsage } = state;
  let { partialDoorClosing } = state;
  let response = { state, data: { increment: 0, usageCount: 0, doorClosings: 0 } }

  // Check if current value exists
  if (currentValue === undefined || Number.isNaN(currentValue)) {
    return response;
  }

  // Init state for last absolute count && Check for the case the counter reseted
  if (lastCount === undefined || lastCount > currentValue) {
    lastCount = currentValue;
  }

  // Calculate increment
  response.data.increment = currentValue - lastCount;
  response.state.lastCount = currentValue;

  // Init state for cycles
  if (partialUsage === undefined || Number.isNaN(partialUsage)) {
    partialUsage = 0;
  }
  if (partialDoorClosing === undefined || Number.isNaN(partialDoorClosing)) {
    partialDoorClosing = 0;
  }

  // Add new partial usage 
  let newPartialUsage = partialUsage + response.data.increment;
  let remainingPartialUsage = newPartialUsage % usageDefinition;
  response.data.usageCount = (newPartialUsage - remainingPartialUsage) / usageDefinition;

  // Add new partial doorClosing
  let newPartialDoorClosing = partialDoorClosing + response.data.increment;
  let remainingPartialDoorClosing = newPartialDoorClosing % doorClosingDefinition;
  response.data.doorClosings = (newPartialDoorClosing - remainingPartialDoorClosing) / doorClosingDefinition;

  // Save not used partial usage for next time
  response.state.partialUsage = remainingPartialUsage;
  response.state.partialDoorClosing = remainingPartialDoorClosing;

  return response;
}

function checkForCustomFields(device, target, norm) {
  if (device !== undefined && device.customFields !== undefined && device.customFields[target] !== undefined) {
    return device.customFields[target];
  }
  return norm;
}

function consume(event) {
  const payload = event.data.payloadHex;
  const bits = Bits.hexToBits(payload);
  const data = {};
  const lifecycle = {};

  data.open = !!Bits.bitsToUnsigned(bits.substr(7, 1));

  let batteryVoltage = Bits.bitsToUnsigned(bits.substr(12, 4));
  batteryVoltage = (25 + batteryVoltage) / 10;
  lifecycle.batteryVoltage = Math.round(batteryVoltage * 10) / 10;

  let batteryLevel =
    Math.round((lifecycle.batteryVoltage - 3.1) / 0.005 / 10) * 10; // 3.1V - 3.6V
  if (batteryLevel > 100) {
    batteryLevel = 100;
  } else if (batteryLevel < 0) {
    batteryLevel = 0;
  }
  lifecycle.batteryLevel = batteryLevel;

  data.temperature = Bits.bitsToUnsigned(bits.substr(17, 7));
  data.temperature -= 32;
  data.time = Hex.hexLittleEndianToBigEndian(payload.substr(6, 4), false);
  data.count = Hex.hexLittleEndianToBigEndian(payload.substr(10, 6), false);

  const state = event.state || {};
  const calculated = calculateIncrement(state, data.count, checkForCustomFields(event.device, "usageCountDivider", 4), 2);
  const { doorClosings, usageCount } = calculated.data;
  data.relativeCount = calculated.data.increment;

  emit("state", calculated.state);
  emit("sample", { data: { doorClosings, usageCount }, topic: "door_count" });
  emit("sample", { data: lifecycle, topic: "lifecycle" });
  emit("sample", { data, topic: "default" });
}
