function consume(event) {
  const { resourceType } = event.data.list[0];
  const { value } = event.data.list[0];
  const sample = {};
  let topic = "default";

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

  emit("sample", { data: sample, topic });
}
