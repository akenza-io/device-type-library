function consume(event) {
  let topic = 'default';
  const payload = {};

  if (event.data.event_type === 'space_report') {
    topic = 'space_report';
    payload.personCount = event.data.person_count;

    if (payload.personCount > 0) {
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