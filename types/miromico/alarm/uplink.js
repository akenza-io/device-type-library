const MELODIES = [
  "NONE", "FAST", "MEDIUM", "SLOW", "ASCENDING",
  "DOUBLE_UP", "DOUBLE", "TRIPLE",
  "ALWAYS_ON", "ALWAYS_OFF", "SHORT_TONE_1_SEC_PERIOD"
];

function melodyName(value) {
  return value < MELODIES.length ? MELODIES[value] : "Unknown(" + value + ")";
}

function decodeUplink(port, bytes) {
  const lifecycle = {};
  const scene = {};

  if (port === 15) {
    let idx = 0;
    const total = bytes.length;

    while (idx < total) {
      const length = bytes[idx];
      const type = bytes[idx + 1];

      switch (type) {
        case 2:
          // Accumulated battery usage in uAh, uint32 little endian
          lifecycle.batteryUsage =
            bytes[idx + 2] +
            bytes[idx + 3] * 256 +
            bytes[idx + 4] * 65536 +
            bytes[idx + 5] * 16777216;
          break;
        case 3:
          lifecycle.batteryVoltage = bytes[idx + 2];
          lifecycle.batteryTemperature = bytes[idx + 3];
          break;
        case 4:
          scene.currentScene = bytes[idx + 2];
          break;
        case 5:
          scene.currentScene = bytes[idx + 2];
          scene.red = bytes[idx + 3];
          scene.green = bytes[idx + 4];
          scene.blue = bytes[idx + 5];
          break;
        case 6:
          // Timeout in minutes, uint16 big endian. 0 = no timeout
          scene.currentScene = bytes[idx + 2];
          scene.timeoutMin = bytes[idx + 4] + bytes[idx + 3] * 256;
          break;
        case 7:
          scene.currentScene = bytes[idx + 2];
          scene.melody = melodyName(bytes[idx + 3]);
          scene.melodyRepeat = Boolean(bytes[idx + 4]);
          break;
        default:
          emit("log", { warning: "Undocumented message" });
          break;
      }

      idx += length + 1;
    }
  }

  return { lifecycle, scene };
}

function consume(event) {
  const payloadData = event.data.payloadHex;
  const { port } = event.data;
  const { lifecycle, scene } = decodeUplink(port, Hex.hexToBytes(payloadData));

  if (Object.keys(lifecycle).length > 0) {
    emit("sample", { data: lifecycle, topic: "lifecycle" });
  }

  if (Object.keys(scene).length > 0) {
    emit("sample", { data: scene, topic: "scene" });
  }
}
