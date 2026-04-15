const REQUIRED_FIELDS = {
  motion: [
    "gyroY",
    "accelX",
    "gyroX",
    "gyroZ",
    "accelY",
    "accelZ",
    "magX",
    "magY",
    "magZ",
  ],
  environment: ["temperature", "humidity", "co2", "voc", "pressure", "light", "noise"],
  lifecycle: ["batteryLevel"],
};

function hasRequiredFields(topic, sensors) {
  const requiredFields = REQUIRED_FIELDS[topic];

  if (requiredFields === undefined) {
    return false;
  }

  return requiredFields.every((field) => sensors[field] !== undefined);
}

function consume(event) {
  const data = event.data;
  if (data === undefined || data === null || typeof data !== "object") {
    return;
  }

  const sensors = data.sensors;
  const topic = data.topic;
  if (typeof topic !== "string" || sensors === undefined || sensors === null || typeof sensors !== "object") {
    return;
  }

  if (!hasRequiredFields(topic, sensors)) {
    return;
  }

  emit("sample", {
    data: sensors,
    topic,
  });
}
