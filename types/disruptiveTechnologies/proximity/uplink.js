function consume(event) {
  const { eventType } = event.data;
  let sample = {};
  const now = new Date().getTime();
  const state = event.state || {};

  if (eventType === "objectPresent") {
    // Init usage to count washroom visits
    if (state.usage === undefined || state.usage === null) {
      state.usage = 0;
    }

    sample.objectPresent = event.data.objectPresent.state;
    if (sample.objectPresent === "PRESENT") {
      sample.proximity = true;
      sample.relativeCount = 1;
      state.usage++;
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

    // Washroom usage
    if (event.device !== undefined && event.device.tags !== undefined &&
      (event.device.tags.indexOf("washroom_usage") !== -1 || event.device.tags.indexOf("cubicle_usage") !== -1)) {

      // Only emit on usageIncrease
      if (state.usage % 2 === 0) {
        const data = {};
        data.absoluteUsageCount = Math.floor(sample.count / 2);
        data.relativeUsageCount = 1;
        state.usage = 0;
        emit("sample", { data, topic: "washroom_usage" });
      }
    }

    emit("sample", { data: sample, topic: "object_present" });
  } else if (eventType === "touch") {
    sample.touch = true;
    emit("sample", { data: sample, topic: "touch" });
  } else if (eventType === "networkStatus") {
    // suppress network_status for one hour
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

  // output a sample each hour to facilitate time series analysis
  if (state.lastSampleEmittedAt !== undefined && now - state.lastSampleEmittedAt >= 3600000) {
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
