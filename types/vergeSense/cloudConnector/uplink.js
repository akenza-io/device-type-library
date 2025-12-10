function consume(event) {
  let topic = "default";
  const payload = {};
  const now = new Date().getTime();
  const state = event.state || {};

  if (event.data.event_type === "space_report") {
    topic = "area_count";
    payload.peopleCount = event.data.person_count;
    payload.signsOfLife = event.data.signs_of_life;

    // Set the state if its not set to prevent long periods of time without messages
    if (state.lastOccupied === undefined) {
      if (payload.peopleCount > 0) {
        state.lastOccupied = "OCCUPIED";
      } else {
        state.lastOccupied = "UNOCCUPIED";
      }
    }

    // output a sample each hour to facilitate time series analysis
    if (
      state.lastEmittedAt === undefined ||
      now - state.lastEmittedAt >= 3600000
    ) {
      if (state.lastOccupied === "OCCUPIED") {
        emit("sample", {
          data: { occupancy: 1, occupied: true },
          topic: "occupancy",
        });
      } else {
        emit("sample", {
          data: { occupancy: 0, occupied: false },
          topic: "occupancy",
        });
      }
      state.lastEmittedAt = now;
    }
  } else if (event.data.event_type === "space_availability") {
    topic = "space_availability";
    payload.state = event.data.state.toUpperCase();
    state.lastOccupied = payload.state;
    state.lastEmittedAt = now;

    if (payload.state === "OCCUPIED") {
      emit("sample", {
        data: { occupancy: 1, occupied: true },
        topic: "occupancy",
      });
    } else {
      emit("sample", {
        data: { occupancy: 0, occupied: false },
        topic: "occupancy",
      });
    }
  } else {
    topic = "unknown";
    payload.message = "unknown message type";
  }

  emit("state", state);
  emit("sample", { data: payload, topic });
}
