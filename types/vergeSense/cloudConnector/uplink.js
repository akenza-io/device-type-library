function consume(event) {
  let topic = 'default';
  const payload = {};
  const hour = new Date().getHours();
  const state = event.state || {};

  if (event.data.event_type === 'space_report') {
    topic = 'area_count';
    payload.peopleCount = event.data.person_count;

    // Set the state if its not set to prevent long periods of time without messages
    if (state.lastOccupied === undefined) {
      if (payload.peopleCount > 0) {
        state.lastOccupied = "OCCUPIED";
      } else {
        state.lastOccupied = "UNOCCUPIED";
      }
    }

    // Give out a repeated sample each hour so our charts are keept happy
    if (state.lastHour !== undefined && state.lastHour !== hour) {
      if (state.lastOccupied === "OCCUPIED") {
        emit('sample', { data: { "occupancy": 2, "occupied": true }, topic: "occupancy" });
      } else {
        emit('sample', { data: { "occupancy": 0, "occupied": false }, topic: "occupancy" });
      }
    }
    state.lastHour = hour;
  } else if (event.data.event_type === 'space_availability') {
    topic = 'space_availability';
    payload.state = event.data.state.toUpperCase();
    state.lastOccupied = payload.state;

    if (payload.state === "OCCUPIED") {
      emit('sample', { data: { "occupancy": 2, "occupied": true }, topic: "occupancy" });
    } else {
      emit('sample', { data: { "occupancy": 0, "occupied": false }, topic: "occupancy" });
    }
  } else {
    topic = 'unknown';
    payload.message = 'unknown message type';
  }

  emit("state", state);
  emit('sample', { data: payload, topic });
}