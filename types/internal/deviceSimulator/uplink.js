function consume(event) {
  emit('sample', { data: event, topic: 'default' });
}