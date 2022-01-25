function consume(event) {
  const { data } = event;
  const { resourceType } = data;
  const sample = {};
  let topic = "default";

  /*
  // Foreach ? if foreach dann decoder function
  if (resourceType === "SampleUpState") {
    sample.upLog = data.upLog;
    topic = "upLog";
  }
  */

  if (resourceType === "SampleTemp") {
    sample.temperature = data.temperatureK;
    topic = "temperature";
  }

  if (resourceType === "SampleMotion") {
    sample.motion = data.motion;
    if (sample.motion > 0) {
      sample.occupancy = 1;
    } else {
      sample.occupancy = 0;
    }
    topic = "occupancy";
  }

  emit("sample", { data: sample, topic });
}
