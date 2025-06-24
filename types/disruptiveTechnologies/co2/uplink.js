function consume(event) {
  const { eventType } = event.data;
  const sample = {};
  let topic = eventType;

  if (eventType === "humidity") {
    sample.humidity = event.data.humidity.relativeHumidity;
    sample.temperature = event.data.humidity.temperature;
    topic = "default";
  } else if (eventType === "co2") {
    sample.co2 = event.data.co2.ppm;
  } else if (eventType === "pressure") {
    sample.pressure = event.data.pressure.pascal;
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
