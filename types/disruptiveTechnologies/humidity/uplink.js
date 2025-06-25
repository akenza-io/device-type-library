function consume(event) {
  const { eventType } = event.data;
  const sample = {};

  if (eventType === "humidity") {
    // New version
    if (event.data.humidity.samples !== undefined) {
      event.data.humidity.samples.forEach(singleSample => {
        emit("sample", { data: { "temperature": singleSample.temperature, "humidity": singleSample.relativeHumidity }, topic: "default", timestamp: new Date(singleSample.sampleTime) });
      });
      // Old version
    } else {
      sample.temperature = event.data.humidity.temperature;
      sample.humidity = event.data.humidity.relativeHumidity;
      emit("sample", { data: sample, topic: "default" });
    }

  } else if (eventType === "touch") {
    sample.touch = true;
    emit("sample", { data: sample, topic: "touch" });
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
    emit("sample", { data: sample, topic: "network_status" });
  } else if (eventType === "batteryStatus") {
    sample.batteryLevel = event.data.batteryStatus.percentage;
    emit("sample", { data: sample, topic: "lifecycle" });
  }
}
