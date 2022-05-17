function consume(event) {
  const payload = event.data.payloadHex;
  const { port } = event.data;
  const data = {};
  let dataBytes = Buffer.from(payload, "hex");

  if (port === 1) {
    if (payload === "012000") {
      data.message = "STARTUP_OK";
    } else {
      data.message = "STARTUP_FAIL";
    }
    emit("sample", { data, topic: "startup" });
  }
  if (port === 2 || port === 3) {
    if (port === 3) {
      dataBytes = dataBytes.slice(1, dataBytes.length);
    }

    let index = 0;
    let time;
    const capacity = dataBytes.length / 3;
    const d = new Date();

    for (index = 0; index < capacity; index++) {
      d.setMinutes(d.getMinutes() - 15 * index);

      data.temperature =
        (((dataBytes[index * 3] << 4) |
          ((dataBytes[index * 3 + 2] & 0xf0) >> 4)) -
          800) /
        10.0;
      data.humidity =
        (((dataBytes[index * 3 + 1] << 4) | (dataBytes[index * 3 + 2] & 0x0f)) -
          250) /
        10.0;

      time = d.toISOString();
      emit("sample", { data, topic: "default", timestamp: time });
    }
  }
}
