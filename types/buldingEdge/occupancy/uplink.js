const statusCodes = {
  0: "OK",
  1: "DISABLED",
  2: "FAULT",
  4: "DOWN",
  8: "ALARM",
  16: "STALE",
  64: "NULL",
  128: "UNACKED_ALARM",
};

function consume(event) {
  const decoded = {};
  const lifecycle = {};

  decoded.motionCount = event.data.value;
  decoded.occupied = decoded.motionCount > 0;
  emit("sample", { data: decoded, topic: "occupancy" });

  lifecycle.status =
    statusCodes[event.data.status] ||
    `UNKNOWN ERROR: ${event.data.status.toString()}`;

  if (lifecycle.status !== "OK") {
    emit("sample", { data: lifecycle, topic: "lifecycle" });
  }
}
