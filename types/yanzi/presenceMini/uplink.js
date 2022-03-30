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
    }

    if (Object.keys(sample).length > 0) {
      emit("sample", { data: sample, topic });
    }
  });
}
