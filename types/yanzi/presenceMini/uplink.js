function calculateIncrement(lastValue, currentValue) {
  // Check if current value exists
  if (currentValue === undefined || Number.isNaN(currentValue)) {
    return 0;
  }

  // Init state && Check for the case the counter reseted
  if (lastValue === undefined || lastValue > currentValue) {
    lastValue = currentValue;
  }
  // Calculate increment
  return currentValue - lastValue;
}

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
    occupancy.occupiedOrRecentlyUsed = true;
  } else {
    occupancy.occupancyStatus = "FREE";
    occupancy.occupiedOrRecentlyUsed = false;
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
    occupancy.occupiedOrRecentlyUsed = true;
    occupancy.occupancyStatus = "WARM";
  } else {
    occupancy.warm = false;
    occupancy.occupiedOrRecentlyUsed = occupancy.occupied;
  }
  return { state, occupancy }
}

function consume(event) {
  let topic = "default";

  event.data.values.forEach((element) => {
    let sample = {};
    const { resourceType } = element;
    const { value } = element;

    if (resourceType === "SampleTemp") {
      sample.temperature = Math.round(value * 100) / 1000;
      topic = "temperature";
    }

    if (resourceType === "SampleMotion") {
      sample.motion = value;
      topic = "occupancy";
      const state = event.state || {};

      // Calculate increment
      sample.relativeMotion = calculateIncrement(
        state.lastMotion,
        sample.motion,
      );
      state.lastMotion = sample.motion;

      // Occupancy is always counted as 0 or 2. No pending 1 at the moment for yanzi
      if (sample.relativeMotion > 1) {
        sample.occupancy = 1;
        sample.occupied = true;
      } else {
        sample.occupancy = 0;
        sample.occupied = false;
      }

      let recentOccupancyResult = calculateRecentOccupancy(event.device, event.state, sample);
      sample = recentOccupancyResult.occupancy;

      emit("state", recentOccupancyResult.state);
    }

    if (Object.keys(sample).length > 0) {
      emit("sample", { data: sample, topic });
    }
  });
}
