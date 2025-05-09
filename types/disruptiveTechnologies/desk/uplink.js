function consume(event) {
  const { eventType } = event.data;
  const sample = {};
  let topic = eventType;

  if (eventType === "touch") {
    sample.touch = true;
  } else if (eventType === "deskOccupancy") {
    const motion = event.data.deskOccupancy.state;
    if (motion === "OCCUPIED") {
      sample.occupancy = 2;
      sample.occupied = true;
    } else {
      sample.occupancy = 0;
      sample.occupied = false;
    }

    // Warm desk 
    const time = new Date().getTime();
    const state = event.state || {};
    sample.minutesSinceLastOccupied = 0; // Always give out minutesSinceLastOccupied for consistancy
    if (sample.occupied) {
      delete state.lastOccupancyTimestamp; // Delete last occupancy timestamp
    } else if (state.lastOccupancyTimestamp !== undefined) {
      sample.minutesSinceLastOccupied = Math.round((time - state.lastOccupancyTimestamp) / 1000 / 60); // Get free since
    } else if (state.lastOccupiedValue) {
      state.lastOccupancyTimestamp = time; // Start with first no occupancy
    }

    if (Number.isNaN(sample.minutesSinceLastOccupied)) {
      sample.minutesSinceLastOccupied = 0;
    }
    state.lastOccupiedValue = sample.occupied;
    emit("state", state);

    topic = "occupancy";
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
