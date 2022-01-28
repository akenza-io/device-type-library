function consume(event) {
  const { resourceType } = event.data.list[0];
  const { value } = event.data.list[0];
  const sample = {};
  let topic = "default";

  if (resourceType === "SampleCO2") {
    sample.co2 = value;
    topic = "co2";
  }

  if (resourceType === "SampleHumidity") {
    sample.humidity = value;
    topic = "humidity";
  }

  if (resourceType === "SampleSoundPressureLevel") {
    sample.soundPressure = value / 1000;
    topic = "sound";
  }

  if (resourceType === "SamplePressure") {
    sample.pressure = value;
    topic = "barometer";
  }

  if (resourceType === "SampleTemp") {
    sample.temperature = Math.round(value * 100) / 1000;
    topic = "temperature";
  }

  if (resourceType === "SampleVOC") {
    sample.tvoc = value;
    topic = "tvoc";
  }

  emit("sample", { data: sample, topic });
}
