function cToF(celsius) {
  return Math.round(((celsius * 9) / 5 + 32) * 10) / 10;
}

function consume(event) {
  const payload = event.data.payloadHex;
  const { port } = event.data;
  const data = {};
  let dataBytes = hexToBytes(payload);

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

    let time;
    const capacity = dataBytes.length / 3;
    const d = new Date();

    for (let index = 0; index < capacity; index++) {
      d.setMinutes(d.getMinutes() - 15 * index);

      data.temperature =
        (((dataBytes[index * 3] << 4) |
          ((dataBytes[index * 3 + 2] & 0xf0) >> 4)) -
          800) /
        10.0;
      data.temperatureF = cToF(data.temperature);
      data.humidity =
        (((dataBytes[index * 3 + 1] << 4) | (dataBytes[index * 3 + 2] & 0x0f)) -
          250) /
        10.0;

      time = d.toISOString();
      emit("sample", { data, topic: "default", timestamp: time });
    }
  }
}

// Note: Hex.hexToBytes(...) can't be used here as the returned list does not support slicing...
function hexToBytes(hex) {
  const bytes = [];
  let c = 0;
  while (c < hex.length) {
    bytes.push(parseInt(hex.substr(c, 2), 16));
    c += 2;
  }
  return bytes;
}
