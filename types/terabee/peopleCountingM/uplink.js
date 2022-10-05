function consume(event) {
  const { data } = event;
  const sample = {};

  sample.fw = data.count_in;
  sample.bw = data.count_out;
  emit("sample", { data: sample, topic: "default" });
}
