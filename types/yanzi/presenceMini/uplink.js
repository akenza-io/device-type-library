function cToF(celsius) {
  return Math.round(((celsius * 9) / 5 + 32) * 10) / 10;
}

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

function consume(event) {
  let topic = "default";

  event.data.values.forEach((element) => {
    const sample = {};
    const { resourceType } = element;
    const { value } = element;

    if (resourceType === "SampleTemp") {
      sample.temperature = Math.round(value * 100) / 1000;
      sample.temperatureF = cToF(sample.temperature);
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

      // Warm desk
      const time = new Date().getTime();
      sample.minutesSinceLastOccupied = 0; // Always give out minutesSinceLastOccupied for consistancy
      if (sample.occupied) {
        delete state.lastOccupancyTimestamp; // Delete last occupancy timestamp
      } else if (state.lastOccupancyTimestamp !== undefined) {
        sample.minutesSinceLastOccupied = Math.round(
          (time - state.lastOccupancyTimestamp) / 1000 / 60,
        ); // Get free since
      } else if (state.lastOccupiedValue) {
        //
        state.lastOccupancyTimestamp = time; // Start with first no occupancy
      }

      if (Number.isNaN(sample.minutesSinceLastOccupied)) {
        sample.minutesSinceLastOccupied = 0;
      }
      state.lastOccupiedValue = sample.occupied;
      emit("state", state);
    }

    if (Object.keys(sample).length > 0) {
      emit("sample", { data: sample, topic });
    }
  });
}
