function consume(event) {
  emit("sample", { data: event.data, topic: "default" });
}
