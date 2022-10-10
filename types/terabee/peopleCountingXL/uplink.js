function consume(event) {
  const { value } = event.data;
  const sample = {};

  sample.fw = value.in;
  sample.bw = value.out;
  emit("sample", { data: sample, topic: "default" });
}
