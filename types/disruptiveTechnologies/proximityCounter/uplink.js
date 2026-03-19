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
  const now = new Date().getTime();
  const state = event.state || {};

  if (eventType === "objectPresentCount") {
    sample.objectPresentCount = event.data.objectPresentCount.total;
    // Calculate increment
    sample.relativeCount = calculateIncrement(
      state.lastCount,
      sample.objectPresentCount,
    );
    state.lastCount = sample.objectPresentCount;
    state.lastSampleEmittedAt = now;

    emit("sample", { data: sample, topic: "object_present_count" });
  } else if (eventType === "touch") {
    sample.touch = true;
    emit("sample", { data: sample, topic: "touch" });
  } else if (eventType === "networkStatus") {
    // suppress network_status for one hour
    if (
      state.lastNetworkEmittedAt === undefined ||
      now - state.lastNetworkEmittedAt >= 3600000
    ) {
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
    sample.batteryLevel = event.data.batteryStatus.percentage;
    emit("sample", { data: sample, topic: "lifecycle" });
  }

  // output a sample each hour to facilitate time series analysis
  if (
    state.lastSampleEmittedAt !== undefined &&
    now - state.lastSampleEmittedAt >= 3600000
  ) {
    emit("sample", {
      data: { objectPresentCount: state.lastCount, relativeCount: 0 },
      topic: "object_present_count",
    });
    state.lastSampleEmittedAt = now;
  }

  emit("state", state);
}
