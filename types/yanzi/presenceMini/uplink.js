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
        sample.occupancy = 2;
        sample.occupied = true;
      } else {
        sample.occupancy = 0;
        sample.occupied = false;
      }

      emit("state", state);
    }

    if (Object.keys(sample).length > 0) {
      emit("sample", { data: sample, topic });
    }
  });
}
