function consume(event) {
  const { resourceType } = event.data.list[0];
  const { value } = event.data.list[0];
  const sample = {};
  let topic = "default";

  if (resourceType === "SampleHumidity") {
    sample.humidity = value;
    topic = "humidity";
  }

  if (resourceType === "SampleTemp") {
    sample.temperature = Math.round(value * 100) / 1000;
    topic = "temperature";
  }

  if (resourceType === "SampleIlluminance") {
    sample.light = Math.round(value / 100) / 10;
    const { colorTemperature } = event.data.list[0];
    if (colorTemperature !== undefined) {
      sample.colorTemperature = colorTemperature;
    }
    topic = "light";
  }

  if (resourceType === "SampleSoundPressureLevel") {
    sample.soundPressure = value / 1000;
    topic = "sound";
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
}