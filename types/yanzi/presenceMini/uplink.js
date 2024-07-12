function incrementValue(lastPulse, pulse) {
  // Init state && Check for the case the counter reseted
  if (lastPulse === undefined || lastPulse > pulse) {
    lastPulse = pulse;
  }
  // Calculate increment
  return pulse - lastPulse;
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
      sample.absoluteMotion = value;
      topic = "occupancy";

      // Calculate increment
      sample.motion = incrementValue(
        event.state.lastMotion,
        sample.absoluteMotion,
      );
      event.state.lastMotion = sample.absoluteMotion;

      if (sample.motion > 1) {
        sample.occupancy = 2;
        sample.occupied = true;
      } else {
        sample.occupancy = 0;
        sample.occupied = false;
      }

      emit("state", event.state);
    }

    if (Object.keys(sample).length > 0) {
      emit("sample", { data: sample, topic });
    }
  });
}
