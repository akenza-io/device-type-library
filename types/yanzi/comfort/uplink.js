function consume(event) {
  const { data } = event;
  const { resourceType } = data;
  const sample = {};
  let topic = "default";

  /*
  // Foreach ?
  if (resourceType === "SampleUpState") {
    sample.upLog = data.upLog;
    topic = "upLog";
  }
  */
  if (resourceType === "SampleCO2") {
    sample.co2 = data.carbonDioxide;
    topic = "co2";
  }

  if (resourceType === "SampleHumidity") {
    sample.humidity = data.relativeHumidity; // * 10
    topic = "humidity";
  }

  if (resourceType === "SampleSoundPressureLevel") {
    sample.soundPressure = data.soundPressureLevel; // * 100
    topic = "sound";
  }

  if (resourceType === "SamplePressure") {
    sample.pressure = data.pressure;
    topic = "barometer";
  }

  if (resourceType === "SampleTemp") {
    sample.temperature = data.temperatureK;
    topic = "temperature";
  }

  if (resourceType === "SampleVOC") {
    sample.tvoc = data.volatileOrganicCompound;
    topic = "tvoc";
  }

  emit("sample", { data: sample, topic });
}
