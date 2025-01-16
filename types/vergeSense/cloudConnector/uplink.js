function consume(event) {
  let topic = 'default';
  const payload = {};

  if (event.data.event_type === 'space_report') {
    topic = 'area_count';
    payload.peopleCount = event.data.person_count;

    if (payload.peopleCount > 0) {
      emit('sample', { data: { "occupancy": 2, "occupied": true }, topic: "occupancy" });
    } else {
      emit('sample', { data: { "occupancy": 0, "occupied": false }, topic: "occupancy" });
    }
  } else if (event.data.event_type === 'space_availability') {
    topic = 'space_availability';
    payload.state = event.data.state.toUpperCase();
  } else {
    topic = 'unknown';
    payload.message = 'unknown message type';
  }

  emit('sample', { data: payload, topic });
}