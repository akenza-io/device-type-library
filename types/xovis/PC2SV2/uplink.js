function consume(event) {
  let data = {};

  if (event.data.live_data !== undefined) {
    // Live data
    event.data.live_data.frames.forEach((payload) => {
      const object = payload.tracked_objects[0].type;
      if (payload.events !== undefined) {
        payload.events.forEach((ev) => {
          const { type } = ev;
          let topic = "default";
          data = {};

          // Ignore GROUP for now (redundant message)
          if (object === "PERSON") {
            if (type === "LINE_CROSS_FORWARD") {
              data.bw = 0;
              data.fw = 1;
              topic = "line_count";
            } else if (type === "LINE_CROSS_BACKWARD") {
              data.bw = 1;
              data.fw = 0;
              topic = "line_count";
            } else if (type === "TRACK_CREATE") {
              data.trackId = ev.attributes.track_id;
              data.sequenceNumber = ev.attributes.sequence_number;
              topic = "track_create";
            } else if (type === "TRACK_DELETE") {
              data.trackId = ev.attributes.track_id;
              data.sequenceNumber = ev.attributes.sequence_number;
              topic = "track_create";
            } else if (type === "ZONE_ENTRY") {
              data.trackId = ev.attributes.track_id;
              data.sequenceNumber = ev.attributes.sequence_number;
              data.geometryName = ev.attributes.geometry_name;
              topic = "zone_entry";
            } else if (type === "ZONE_EXIT") {
              data.trackId = ev.attributes.track_id;
              data.sequenceNumber = ev.attributes.sequence_number;
              data.geometryName = ev.attributes.geometry_name;
              topic = "zone_exit";
            } else if (type === "COUNT_INCREMENT") {
              data.trackId = ev.attributes.track_id;
              data.logicName = ev.attributes.logic_name;
              data.counterValue = ev.attributes.counter_value;
              topic = "count_increment";
            } else if (type === "COUNT_DECREMENT") {
              data.trackId = ev.attributes.track_id;
              data.logicName = ev.attributes.logic_name;
              data.counterValue = ev.attributes.counter_value;
              topic = "count_decrement";
            }
            // emit("sample", { data, topic });
          }
        });
      } else {
        // Possition message, each mf frame
      }
    });
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
