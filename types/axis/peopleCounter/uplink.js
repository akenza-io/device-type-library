function consume(event) {
  const { measurements } = event.data.data;

  measurements.forEach((measurement) => {
    const sample = { fw: 0, bw: 0 };
    const timestamp = new Date(measurement.utcTo);

    measurement.items.forEach((item) => {
      if (item.direction === "in") {
        sample.fw = item.count;
      } else if (item.direction === "out") {
        sample.bw = item.count;
      } else {
        // Output event if unexpected message is sent
        emit("log", { data: event, message: "Unexpected message. Creating log for further debugging" });
      }
    });

    if (sample.fw !== 0 || sample.bw !== 0) {
      emit("sample", { data: sample, topic: "line_count", timestamp });
    }
  });
}
