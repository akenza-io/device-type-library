function consume(event) {
  let data = {};

  if (event.data.live_data !== undefined) {
    // Live data
    event.data.live_data.frames.forEach((payload) => {
      const object = payload.tracked_objects[0].type;
      const time = new Date(payload.time);

      // Ignore GROUP for now (redundant message)
      if (object === "PERSON") {
        if (payload.events !== undefined) {
          payload.events.forEach((ev) => {
            const { type } = ev;
            let topic = "default";
            data = {};

            if (type === "LINE_CROSS_FORWARD") {
              data.bw = 0;
              data.fw = 1;
              topic = "line_count";
            } else if (type === "LINE_CROSS_BACKWARD") {
              data.bw = 1;
              data.fw = 0;
              topic = "line_count";
            } else if (type === "TRACK_CREATE") {
              data.trackType = type;
              data.trackId = ev.attributes.track_id;
              data.sequenceNumber = ev.attributes.sequence_number;
              topic = "track";
            } else if (type === "TRACK_DELETE") {
              data.trackType = type;
              data.trackId = ev.attributes.track_id;
              data.sequenceNumber = ev.attributes.sequence_number;
              topic = "track";
            } else if (type === "ZONE_ENTRY") {
              data.trackType = type;
              data.trackId = ev.attributes.track_id;
              data.sequenceNumber = ev.attributes.sequence_number;
              data.geometryName = ev.attributes.geometry_name;
              topic = "track";
            } else if (type === "ZONE_EXIT") {
              data.trackType = type;
              data.trackId = ev.attributes.track_id;
              data.sequenceNumber = ev.attributes.sequence_number;
              data.geometryName = ev.attributes.geometry_name;
              topic = "track";
            } else if (type === "COUNT_INCREMENT") {
              data.countType = type;
              data.logicName = ev.attributes.logic_name;
              data.counterValue = ev.attributes.counter_value;
              data.direction = ev.attributes.counter_name;
              topic = "count";
            } else if (type === "COUNT_DECREMENT") {
              data.countType = type;
              data.logicName = ev.attributes.logic_name;
              data.counterValue = ev.attributes.counter_value;
              data.direction = ev.attributes.counter_name;
              topic = "count";
            }
            emit("sample", { data, topic, timestamp: time });
          });
        } else {
          // Here could the positions for each frame get emitted

          // Addon messages
          const { attributes } = payload.tracked_objects[0];
          if (Object.keys(attributes).length > 0) {
            const { gender } = attributes;
            let { tag } = attributes;
            let faceMask = attributes.face_mask;
            const viewDirection = attributes.view_direction;

            if (gender !== undefined) {
              emit("sample", {
                data: { gender },
                topic: "gender",
              });
            }
            if (tag !== undefined) {
              if (tag === "NO_TAG") {
                tag = false;
              } else {
                tag = true;
              }
              emit("sample", {
                data: { tag },
                topic: "tag",
              });
            }
            if (faceMask !== undefined) {
              if (faceMask === "NO_MASK") {
                faceMask = false;
              } else {
                faceMask = true;
              }

              emit("sample", {
                data: { faceMask },
                topic: "face_mask",
              });
            }
            if (viewDirection !== undefined) {
              emit("sample", {
                data: {
                  xCoordinate: viewDirection[0],
                  yCoordinate: viewDirection[1],
                },
                topic: "view_direction",
              });
            }
          }
        }
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

    // Standart Forwards & Backwards
    let fw = 0;
    let bw = 0;

    // Gender Addon
    let fwMen = 0;
    let fwWoman = 0;
    let bwMen = 0;
    let bwWomen = 0;

    // Gender Mask
    let fwMask = 0;
    let fwNoMask = 0;
    let bwMask = 0;
    let bwNoMask = 0;

    let peopleInZone = 0;
    let timestamp = new Date();

    payload.forEach((logic) => {
      logic.records.forEach((record) => {
        timestamp = new Date(record.to);

        record.counts.forEach((count) => {
          const { value } = count;

          // Dont send empty samples
          if (value > 0) {
            if (regex.test(logic.info)) {
              // Line
              switch (count.name) {
                case "fw":
                  fw += value;
                  break;
                case "bw":
                  bw += value;
                  break;
                case "fw-male":
                  fwMen += value;
                  break;
                case "bw-male":
                  bwMen += value;
                  break;
                case "fw-female":
                  fwWoman += value;
                  break;
                case "bw-female":
                  bwWomen += value;
                  break;
                case "fw-mask":
                  fwMask += value;
                  break;
                case "bw-mask":
                  bwMask += value;
                  break;
                case "fw-no_mask":
                  fwNoMask += value;
                  break;
                case "bw-no_mask":
                  bwNoMask += value;
                  break;
                default:
                  break;
              }
            } else {
              // Zone
              peopleInZone += value;
            }
          }
        });
      });
    });

    if (fw > 0 || bw > 0) {
      emit("sample", {
        data: { fw, bw },
        topic: "line_count",
        timestamp,
      });
    }

    if (fwMen > 0 || fwWoman > 0 || bwMen > 0 || bwWomen > 0) {
      emit("sample", {
        data: { fwMen, fwWoman, bwMen, bwWomen },
        topic: "gender",
        timestamp,
      });
    }

    if (fwMask > 0 || fwNoMask > 0 || bwMask > 0 || bwNoMask > 0) {
      emit("sample", {
        data: { fwMask, fwNoMask, bwMask, bwNoMask },
        topic: "face_mask",
        timestamp,
      });
    }

    if (peopleInZone > 0) {
      emit("sample", { data: { peopleInZone }, topic: "zone", timestamp });
    }
  }
}
