function cToF(celsius) {
  return (celsius * 9) / 5 + 32;
}

function consume(event) {
  const { eventType } = event.data;
  const sample = {};
  const now = new Date().getTime();
  const state = event.state || {};

  if (eventType === "humidity") {
    sample.humidity = event.data.humidity.relativeHumidity;
    sample.temperature = event.data.humidity.temperature;
    sample.temperatureF = cToF(sample.temperature);
    emit("sample", { data: sample, topic: "default" });
  } else if (eventType === "co2") {
    emit("sample", { data: { co2: event.data.co2.ppm }, topic: "co2" });
  } else if (eventType === "pressure") {
    emit("sample", {
      data: { pressure: event.data.pressure.pascal },
      topic: "pressure",
    });
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
      emit("state", state);
    }
  } else if (eventType === "batteryStatus") {
    emit("sample", {
      data: { batteryLevel: event.data.batteryStatus.percentage },
      topic: "lifecycle",
    });
  }
}
