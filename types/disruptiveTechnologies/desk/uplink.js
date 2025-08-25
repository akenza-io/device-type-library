function consume(event) {
  const { eventType } = event.data;
  let sample = {};
  const now = new Date().getTime();
  const state = event.state || {};

  if (eventType === "touch") {
    emit("sample", { data: { touch: true }, topic: "touch" });
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
    state.lastSampleEmittedAt = now;

    emit("sample", { data: sample, topic: "occupancy" });
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
    if (state.lastOccupiedValue) {
      sample.occupancy = 2;
      sample.occupied = true;
    } else {
      sample.occupancy = 0;
      sample.occupied = false;
    }

    // Warm desk 
    const time = new Date().getTime();
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

    emit("sample", { data: sample, topic: "occupancy" });
    state.lastSampleEmittedAt = now;
  }

  emit("state", state);
}
