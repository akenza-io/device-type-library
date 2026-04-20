function checkForCustomFields(device, target, fallbackValue) {
  if (device !== undefined && device.customFields !== undefined && device.customFields[target] !== undefined) {
    return device.customFields[target];
  }
  return fallbackValue;
}

function calculateRecentOccupancy(device, state, occupancy) {
  state = state || {};
  // Occupancy status
  if (occupancy.occupied) {
    occupancy.occupancyStatus = "OCCUPIED";
    occupancy.occupiedOrWarm = true;
  } else {
    occupancy.occupancyStatus = "FREE";
    occupancy.occupiedOrWarm = false;
  }

  const time = new Date().getTime();
  occupancy.minutesSinceLastOccupied = 0;
  occupancy.occupiedMinutes = 0;

  if (occupancy.occupied) {
    // Set state to first occupancy occurence so occupied time can be calulcated
    if (state.firstOccupancyTimestamp == undefined) {
      state.firstOccupancyTimestamp = time;
    }
    // Give out how long there has been occupancy
    occupancy.occupiedMinutes = Math.round((time - state.firstOccupancyTimestamp) / 1000 / 60);
    delete state.lastOccupancyTimestamp; // Reset cycle
    delete state.occupiedMinutes;
  } else {
    // Give out how long there has been no occupancy
    if (state.lastOccupancyTimestamp !== undefined) {
      occupancy.minutesSinceLastOccupied = Math.round((time - state.lastOccupancyTimestamp) / 1000 / 60);
    } else {
      state.lastOccupancyTimestamp = time;

      // Only save the timestamp on first leave and save how long the occupancy has gone on for
      state.occupiedMinutes = Math.round((time - state.firstOccupancyTimestamp) / 1000 / 60);
      delete state.firstOccupancyTimestamp; // Reset cycle
    }
  }

  // Allow customFields to change this
  const minOccupancyThreshold = checkForCustomFields(device, "minOccupancyThreshold", 2.5);
  const occupancyWarmThreshold = checkForCustomFields(device, "occupancyWarmThreshold", 90)

  if (occupancy.minutesSinceLastOccupied < occupancyWarmThreshold && !occupancy.occupied && state.occupiedMinutes >= minOccupancyThreshold) {
    occupancy.warm = true;
    occupancy.occupiedOrWarm = true;
    occupancy.occupancyStatus = "WARM";
  } else {
    occupancy.warm = false;
    occupancy.occupiedOrWarm = occupancy.occupied;
  }
  return { state, occupancy }
}

function consume(event) {
  const { eventType } = event.data;
  let sample = {};
  const now = new Date().getTime();
  let state = event.state || {};

  if (eventType === "touch") {
    emit("sample", { data: { touch: true }, topic: "touch" });
  } else if (eventType === "deskOccupancy") {
    const motion = event.data.deskOccupancy.state;
    if (motion === "OCCUPIED") {
      sample.occupancy = 1;
      sample.occupied = true;
    } else {
      sample.occupancy = 0;
      sample.occupied = false;
    }

    let recentOccupancyResult = calculateRecentOccupancy(event.device, event.state, sample);
    sample = recentOccupancyResult.occupancy;
    state = recentOccupancyResult.state;

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
      sample.occupancy = 1;
      sample.occupied = true;
    } else {
      sample.occupancy = 0;
      sample.occupied = false;
    }

    let recentOccupancyResult = calculateRecentOccupancy(event.device, event.state, sample);
    sample = recentOccupancyResult.occupancy;
    state = recentOccupancyResult.state;

    state.lastSampleEmittedAt = now;
    emit("sample", { data: sample, topic: "occupancy" });
  }

  emit("state", state);
}
