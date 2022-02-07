function consume(event) {
  let topic = "default";

  event.data.list.forEach((element) => {
    const sample = {};
    const { resourceType } = element;
    const { value } = element;

    if (resourceType === "SampleTemp") {
      sample.temperature = Math.round(value * 100) / 1000;
      topic = "temperature";
    }

    if (resourceType === "SampleMotion") {
      sample.motion = value;
      if (sample.motion > 0) {
        sample.occupancy = 1;
      } else {
        sample.occupancy = 0;
      }
      topic = "occupancy";
    }

    emit("sample", { data: sample, topic });
  });
}
