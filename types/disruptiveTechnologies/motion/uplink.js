function consume(event) {
  const { eventType } = event.data;
  const sample = {};
  const now = new Date().getTime();
  const state = event.state || {};

  if (eventType === "motion") {
    const motion = event.data.motion.state;
    if (motion === "MOTION_DETECTED") {
      sample.motion = true;
    } else {
      sample.motion = false;
    }
    state.lastMotion = sample.motion;
    state.lastSampleEmittedAt = now;
    emit("sample", { data: sample, topic: "motion" });
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
    emit("sample", { data: { motion: state.lastMotion }, topic: "motion" });
    state.lastSampleEmittedAt = now;
  }

  emit("state", state);
}
