function consume(event) {
  let data = {};

  if (event.data.live_data !== undefined) {
    // Live data
    data = { fw: 0, bw: 0 };
    event.data.live_data.frames.forEach((payload) => {
      // Line crossing
      const { type } = payload.tracked_objects[0];
      const direction = payload.events[0].type;

      // Ignore GROUP for now (redundant message)
      if (type === "PERSON") {
        if (direction === "LINE_CROSS_FORWARD") {
          data.fw += 1;
        } else {
          data.bw += 1;
        }
      }
    });
    emit("sample", { data, topic: "line_count" });
  } else if (event.data.status_data !== undefined) {
    // Status data
    const payload = event.data.status_data.states;

    data.deviceStatus = payload.device.state.state;
    data.timeStatus = payload.time.state.state;
    data.networkStatus = payload.network.state.state;
    data.updateStatus = payload.updates.state.state;
    data.singleSensorIllumination = payload.singlesensor.status.illumination;
    data.multisensor = payload.multisensor.status.enabled;

    emit("sample", { data, topic: "lifecycle" });
  } else if (event.data.logics_data !== undefined) {
    // Logic data
    const regex = new RegExp("LINE");
    const payload = event.data.logics_data.logics;

    payload.forEach((logic) => {
      logic.records.forEach((record) => {
        const from = new Date(record.from); // Maybe usefull
        const to = new Date(record.from);

        record.counts.forEach((count) => {
          const { value } = count;

          // Dont send empty samples
          if (value > 0) {
            if (regex.test(logic.info)) {
              // Line
              if (count.name === "fw") {
                data.fw = value;
                data.bw = 0;
              } else {
                data.fw = 0;
                data.bw = value;
              }
              emit("sample", { data, topic: "line_count" }); // Multiple samples or one ? This would be multiple
            } else {
              // Zone
              emit("sample", { data: { peopleInZone: value }, topic: "zone" });
            }
          }
        });
      });
    });

    emit("sample", { data, topic: "line_count" });
  }
}
