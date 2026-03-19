function cToF(celsius) {
  return Math.round(((celsius * 9 / 5) + 32) * 100) / 100;
}

function consume(event) {
  const { eventType } = event.data;
  const sample = {};
  const now = new Date().getTime();
  const state = event.state || {};

  if (eventType === "temperature") {
    event.data.temperature.samples.forEach(singleSample => {
      emit("sample", { data: { "temperature": singleSample.value, "temperatureF": cToF(singleSample.value) }, topic: "default", timestamp: new Date(singleSample.sampleTime) });
    });
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
      emit("state", state);
    }
  } else if (eventType === "batteryStatus") {
    sample.batteryLevel = event.data.batteryStatus.percentage;
    emit("sample", { data: sample, topic: "lifecycle" });
  }
}
