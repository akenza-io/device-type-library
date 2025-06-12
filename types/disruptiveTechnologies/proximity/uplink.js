function consume(event) {
  const { eventType } = event.data;
  const sample = {};
  let topic = eventType;

  if (eventType === "objectPresent") {
    topic = "object_present";
    sample.objectPresent = event.data.objectPresent.state;
    if (sample.objectPresent === "PRESENT") {
      sample.proximity = true;
      sample.relativeCount = 1;
    } else {
      sample.proximity = false;
      sample.relativeCount = 0;
    }

    // State manipulation to get a count for object present changes
    const state = event.state || {};

    // Init absolute count
    if (state.count === undefined || state.count === null) {
      state.count = 0;
    }

    if (state.lastStatus !== undefined && state.lastStatus !== null) {
      if (sample.objectPresent !== state.lastStatus) {
        state.count += sample.relativeCount;
      }
    } else {
      state.count += sample.relativeCount; // Count first instance as a count
    }

    state.lastStatus = sample.objectPresent;
    sample.count = state.count;

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
