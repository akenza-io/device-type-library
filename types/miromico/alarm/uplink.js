function deleteUnusedKeys(data) {
  let keysRetained = false;
  Object.keys(data).forEach((key) => {
    if (data[key] === undefined || isNaN(data[key])) {
      delete data[key];
    } else {
      keysRetained = true;
    }
  });
  return keysRetained;
}

function consume(event) {
  const payload = event.data.payloadHex;
  const bytes = Hex.hexToBytes(payload);
  const { port } = event.data;

  const lifecycle = {};

  if (port === 15) {
    let idx = 0;
    const total = bytes.length;

    while (idx < total) {
      const length = bytes[idx];
      switch (bytes[idx + 1]) {
        case 1:
          lifecycle.batteryUsage =
            bytes[idx + 5] +
            bytes[idx + 4] * 256 +
            bytes[idx + 3] * 256 * 256 +
            bytes[idx + 2] * 256 * 256 * 256;
          break;
        case 4:
          lifecycle.currentScene = bytes[idx + 2];
          break;
        case 3:
          lifecycle.batteryVoltage = (
            bytes[idx + 3] +
            bytes[idx + 2] * 256) / 1000
          break;
        default:
          break
      }

      idx += length + 1;
    }

    if (deleteUnusedKeys(lifecycle)) {
      emit("sample", { data: lifecycle, topic: "lifecycle" });
    }
  }
}