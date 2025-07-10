function consume(event) {
  const { eventType } = event.data;
  let sample = {};
  const now = new Date().getTime();
  const state = event.state || {};

  if (eventType === "objectPresent") {
    sample.objectPresent = event.data.objectPresent.state;
    if (sample.objectPresent === "PRESENT") {
      sample.proximity = true;
      sample.relativeCount = 1;
    } else {
      sample.proximity = false;
      sample.relativeCount = 0;
    }

    // State manipulation to get a count for object present changes
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
    state.lastSampleEmittedAt = now;

    emit("sample", { data: sample, topic: "object_present" });
  } else if (eventType === "touch") {
    sample.touch = true;
    emit("sample", { data: sample, topic: "touch" });
  } else if (eventType === "networkStatus") {
    // Supress networkStatus for an hour
    if (state.lastNetworkEmittedAt === undefined || now - state.lastNetworkEmittedAt >= 3600000) {
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

  // Give out a repeated sample each hour so our charts are keept happy
  if (now - state.lastSampleEmittedAt >= 3600000) {
    sample = {};
    sample.objectPresent = state.lastStatus;
    sample.relativeCount = 0;
    sample.count = state.count;
    if (sample.objectPresent === "PRESENT") {
      sample.proximity = true;
    } else {
      sample.proximity = false;
    }

    emit("sample", { data: sample, topic: "object_present" });
    state.lastSampleEmittedAt = now;
  }

  emit("state", state);
}
