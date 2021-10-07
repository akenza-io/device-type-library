function consume(event) {
  const { eventType } = event;
  const sample = {};
  let topic = eventType;

  if (eventType === "waterPresent") {
    sample.waterPresent = event.data.waterPresent.state;
    topic = "water_present";
  } else if (eventType === "touch") {
    sample.touch = true;
  } else if (eventType === "networkStatus") {
    sample.signalStrength = event.data.networkStatus.signalStrength;
    sample.rssi = event.data.networkStatus.rssi;
    sample.transmissionMode =
      event.data.networkStatus.transmissionMode;
    topic = "network_status";
  } else if (eventType === "batteryStatus") {
    sample.batteryLevel = event.data.batteryStatus.percentage;
    topic = "lifecycle";
  }

  emit("sample", { data: sample, topic });
}
