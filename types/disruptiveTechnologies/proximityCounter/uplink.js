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

function consume(event) {
  const { eventType } = event.data;
  const sample = {};
  let topic = eventType;

  if (eventType === "objectPresentCount") {
    sample.objectPresentCount = event.data.objectPresentCount.total;
    topic = "object_present_count";

    const state = event.state || {};
    // Calculate increment
    sample.relativeCount = calculateIncrement(
      state.lastCount,
      sample.objectPresentCount,
    );
    state.lastCount = sample.objectPresentCount;

    emit("state", state);
  } else if (eventType === "touch") {
    sample.touch = true;
  } else if (eventType === "networkStatus") {
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
    topic = "network_status";
  } else if (eventType === "batteryStatus") {
    sample.batteryLevel = event.data.batteryStatus.percentage;
    topic = "lifecycle";
  }

  emit("sample", { data: sample, topic });
}
