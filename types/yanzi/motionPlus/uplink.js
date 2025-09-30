function cToF(celsius) {
  return Math.round(((celsius * 9) / 5 + 32) * 10) / 10;
}

function consume(event) {
  let topic = "default";

  event.data.values.forEach((element) => {
    const sample = {};
    const { resourceType } = element;
    const { value } = element;

    if (resourceType === "SampleHumidity") {
      sample.humidity = value;
      topic = "humidity";
    }

    if (resourceType === "SampleTemp") {
      sample.temperature = Math.round(value * 100) / 1000;
      sample.temperatureF = cToF(sample.temperature);
      topic = "temperature";
    }

    if (resourceType === "SampleIlluminance") {
      sample.light = Math.round(value / 100) / 10;
      const { colorTemperature } = element;
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
      topic = "occupancy";
    }
    if (Object.keys(sample).length > 0) {
      emit("sample", { data: sample, topic });
    }
  });
}
