function consume(event) {
  let data = {};

  if (event.live_data !== undefined) {
    // Live data
    const payload = event.live_data.frames[0];

    // Line crossing
    const { type } = payload.tracked_objects[0];
    const direction = payload.events[0].type;

    // Ignore GROUP for now (redundant message)
    if (type === "PERSON") {
      if (direction === "LINE_CROSS_FORWARD") {
        data = { fw: 1, bw: 0 };
      } else {
        data = { fw: 0, bw: 1 };
      }
      emit("sample", { data, topic: "line_count" });
    }
  } else if (event.status_data !== undefined) {
    // Status data
    const payload = event.status_data.states;

    data.deviceStatus = payload.device.state.state;
    data.timeStatus = payload.time.state.state;
    data.networkStatus = payload.network.state.state;
    data.updateStatus = payload.updates.state.state;
    data.singleSensorIllumination = payload.singlesensor.status.illumination;
    data.multisensor = payload.multisensor.status.enabled;

    emit("sample", { data, topic: "line_count" });
  }
}
