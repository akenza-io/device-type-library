function calculateIncrement(state, currentValue, usageDefinition = 2, doorClosingDefinition = 1) {
  if (state == undefined) {
    state = {}
  }

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
  const { eventType } = event.data;
  const now = new Date().getTime();
  let state = event.state || {};

  if (eventType === "contact") {
    const sample = {};
    sample.contact = event.data.contact.state;;
    if (sample.contact === "OPEN") {
      sample.hasContact = false;
      sample.relativeCount = 1;
    } else {
      sample.hasContact = true;
      sample.relativeCount = 0;
    }

    if (state.lastCount !== undefined) {
      if (sample.contact !== state.lastContact) {
        sample.count = sample.relativeCount + state.lastCount;
      } else {
        sample.count = state.lastCount;
      }
    } else {
      sample.count = 0;
    }

    state.lastSampleEmittedAt = now;
    state.lastContact = sample.contact;

    const calculated = calculateIncrement(state, sample.count, checkForCustomFields(event.device, "usageCountDivider", 2));
    const { doorClosings, usageCount } = calculated.data;
    state = calculated.state;

    emit("sample", { data: { doorClosings, usageCount }, topic: "door_count" });
    emit("sample", { data: sample, topic: "contact" });
  } else if (eventType === "touch") {
    emit("sample", { data: { touch: true }, topic: "touch" });
  } else if (eventType === "networkStatus") {
    // suppress network_status for one hour
    if (state.lastNetworkEmittedAt === undefined || now - state.lastNetworkEmittedAt >= 3600000) {
      const sample = {};
      sample.signalStrength = event.data.networkStatus.signalStrength;
      sample.rssi = event.data.networkStatus.rssi;
      sample.transmissionMode = event.data.networkStatus.transmissionMode;
      if (sample.rssi >= -50) {
        sample.sqi = 3;
      } else if (sample.rssi < -50 && sample.rssi >= -100) {
        sample.sqi = 2;
      } else {
        sample.sqi = 1;
      }
      state.lastNetworkEmittedAt = now;
      emit("sample", { data: sample, topic: "network_status" });
    }
  } else if (eventType === "batteryStatus") {
    const sample = {};
    sample.batteryLevel = event.data.batteryStatus.percentage;
    emit("sample", { data: sample, topic: "lifecycle" });
  }

  // output a sample each hour to facilitate time series analysis
  if (state.lastSampleEmittedAt !== undefined && now - state.lastSampleEmittedAt >= 3600000) {
    const sample = {};
    sample.contact = state.lastContact;
    sample.relativeCount = 0;
    sample.count = state.lastCount;
    if (sample.contact === "OPEN") {
      sample.hasContact = false;
    } else {
      sample.hasContact = true;
    }

    emit("sample", { data: { doorClosings: 0, usageCount: 0 }, topic: "door_count" });
    emit("sample", { data: sample, topic: "contact" });
    state.lastSampleEmittedAt = now;
  }

  emit("state", state);
}
