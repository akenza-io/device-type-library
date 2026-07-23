function consume(event) {
  const state = event.state || {};
  let data = {};

  if (event.data.live_data !== undefined) {
    // Live data
    event.data.live_data.frames.forEach((payload) => {
      const object = payload.tracked_objects[0].type;
      const time = new Date(payload.time);

      // Ignore GROUP for now (redundant message)
      if (object === "PERSON") {
        if (payload.events !== undefined && payload.events.length !== 0) {
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
            } else if (type === "TIME_CHANGE") {
              let time = Math.round(ev.attributes.amount)
              if (ev.attributes.counter_name === "queueing-time") {
                data.queueTime = time;
                topic = "queue_time";
              } else if (ev.attributes.counter_name === "dwell_time") {
                data.dwellTime = time;
                topic = "dwell_time";
              }
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
            let { age } = attributes;
            let faceMask = attributes.face_mask;
            const viewDirection = attributes.view_direction;

            if (gender !== undefined) {
              emit("sample", {
                data: { gender },
                topic: "gender",
              });
            }
            if (age !== undefined) {
              emit("sample", {
                data: { age },
                topic: "age",
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
    const lineRegex = new RegExp("LINE");
    const queueRegex = new RegExp("QUEUE_STATISTICS");
    const occupancyRegex = new RegExp("ZONE_OCCUPANCY");
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

    // Queue statistics
    let queueLength = 0;
    let outflow = 0;
    let queueingTime = 0;
    let queueFlag = false;

    // Zone occupancy
    let balance = 0;
    let visits = 0;
    let dwellTime = 0;
    let zoneOccupancyFlag = false;


    // Age buckets addon
    let fwAge = [];
    let bwAge = [];

    let timestamp = new Date();

    payload.forEach((logic) => {
      logic.records.forEach((record) => {
        timestamp = new Date(record.to);

        record.counts.forEach((count) => {
          const { value } = count;

          if (lineRegex.test(logic.info)) {
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
              case "fw-age":
                if (fwAge.length) {
                  for (let i = 0; i < count.bins.length; i++) {
                    fwAge[i] += count.bins[i];
                  }
                } else {
                  fwAge = count.bins;
                }
                break;
              case "bw-age":
                if (bwAge.length) {
                  for (let i = 0; i < count.bins.length; i++) {
                    bwAge[i] += count.bins[i];
                  }
                } else {
                  bwAge = count.bins;
                }
                break;
              default:
                break;
            }
          } else if (queueRegex.test(logic.info)) {
            const { name } = count;
            switch (name) {
              case "queue-length":
                queueLength = value;
                break;
              case "outflow":
                outflow = value;
                break;
              case "queueing-time":
                queueingTime = Math.round(value);
                break;
              default:
                break;
            }
            queueFlag = true;
          } else if (occupancyRegex.test(logic.info)) {
            const { name } = count;
            switch (name) {
              case "balance":
                balance = value;
                break;
              case "visits":
                visits = value;
                break;
              case "dwell_time":
                dwellTime = Math.round(value);
                break;
              default:
                break;
            }
            zoneOccupancyFlag = true;
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

    if (fwAge.reduce((accumulator, currentValue) => accumulator + currentValue, 0) > 0 ||
      bwAge.reduce((accumulator, currentValue) => accumulator + currentValue, 0) > 0) {
      let ageBucketSample = {};
      for (let i = 0; i < fwAge.length; i++) {
        ageBucketSample["bucketFw" + (i + 1)] = fwAge[i];
      }

      for (let i = 0; i < bwAge.length; i++) {
        ageBucketSample["bucketBw" + (i + 1)] = bwAge[i];
      }

      emit("sample", {
        data: ageBucketSample,
        topic: "age_buckets",
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

    if (zoneOccupancyFlag) {
      if (state.lastVisits == undefined) {
        state.lastVisits = 1;
      }

      // Should give out zero once
      if (visits > 0 || visits != state.lastVisits) {
        emit("sample", {
          data: { peopleInZone: balance, visits, dwellTime },
          topic: "zone",
          timestamp,
        });
      }

      state.lastVisits = visits;
      emit("state", state);
    }

    if (queueFlag) {
      emit("sample", {
        data: { outflow, queueLength, queueingTime },
        topic: "queue",
        timestamp,
      });
    }
  }
}
