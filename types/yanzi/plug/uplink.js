function consume(event) {
  let topic = "default";

  event.data.values.forEach((element) => {
    const sample = {};
    const { resourceType } = element;
    const { value } = element;

    if (resourceType === "SampleElectricalEnergbySimple") {
      sample.temperature = Math.round(value * 100) / 1000;
      topic = "temperature";
    }

    if (resourceType === "SampleOnOff") {
      if (value) {
        sample.power = "ON";
      } else {
        sample.power = "OFF";
      }
      topic = "power";
    }
    if (Object.keys(sample).length > 0) {
      emit("sample", { data: sample, topic });
    }
  });
}
