function cToF(celsius) {
  return Math.round(((celsius * 9) / 5 + 32) * 10) / 10;
}

function consume(event) {
  let topic = "default";

  event.data.values.forEach((element) => {
    const sample = {};
    const { resourceType } = element;
    const { value } = element;

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
      sample.temperatureF = cToF(sample.temperature);
      topic = "temperature";
    }

    if (resourceType === "SampleVOC") {
      sample.tvoc = value;
      topic = "tvoc";
    }
    if (Object.keys(sample).length > 0) {
      emit("sample", { data: sample, topic });
    }
  });
}
