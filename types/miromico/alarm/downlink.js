function intToHex(number) {
  let hex = Number(number).toString(16);
  if (hex.length === 1) {
    hex = `0${hex}`;
  }

  return hex;
}

function bytesToHex(bytes) {
  let hex = "";
  bytes.forEach(byte => {
    hex += intToHex(byte);
  });
  return hex;
}

function sensorConfigs(confirmed, dutyCycle, classC, buzzer, statusIntervalMin, numLed, resetTimeH) {
  const bytes = [];
  bytes.push(6);
  bytes.push(128);

  // combine all the flags into a single byte with the number of retransmissions
  let temp = 0;
  if (confirmed) {
    temp |= 0x80;
  }
  if (dutyCycle) {
    temp |= 0x40;
  }
  if (classC) {
    temp |= 0x20;
  }
  if (buzzer) {
    temp |= 0x10;
  }
  bytes.push(temp);

  bytes.push(((statusIntervalMin) >> 8) & 0xff);
  bytes.push(((statusIntervalMin) & 0xff));
  bytes.push((numLed) & 0xff);
  bytes.push((resetTimeH) & 0xff);

  return bytesToHex(bytes);
}

function sceneConfigs(currentScene) {
  const bytes = [];
  bytes.push(2);
  bytes.push(129);
  bytes.push(currentScene & 0xff);

  return bytesToHex(bytes);
}

function brightnessConfigs(brightnessPercent) {
  const bytes = [];
  bytes.push(2)
  bytes.push(130)
  const temp = brightnessPercent / 100 * 255
  bytes.push(temp & 0xff);

  return bytesToHex(bytes);
}

function volumeConfigs(volume, currentScene = 0) {
  const bytes = [];
  bytes.push(2);
  bytes.push(133);

  switch (volume) {
    case "OFF":
      bytes.push(0);
      break;
    case "LOW":
      bytes.push(1);
      break;
    case "MEDIUM":
      bytes.push(2);
      break;
    case "HIGH":
      bytes.push(3);
      break;
    default:
      bytes.push(0);
      break;
  }
  bytes.push(currentScene & 0xff);

  return bytesToHex(bytes);
}

function lightConfigs(selectedScene, red, green, blue, sceneTimeoutMin) {
  const bytes = [];
  bytes.push(7);
  bytes.push(131);

  bytes.push(selectedScene & 0xff); // 1 - 4
  bytes.push(red & 0xff);
  bytes.push(green & 0xff);
  bytes.push(blue & 0xff);
  bytes.push((sceneTimeoutMin >> 8) & 0xff);
  bytes.push(sceneTimeoutMin & 0xff);

  return bytesToHex(bytes);
}

function buzzerConfigs(selectedScene, red, green, blue, sceneTimeoutMin, buzzerMelody, buzzerRepeat) {
  const bytes = [];
  bytes.push(7);
  bytes.push(131);
  bytes.push(selectedScene & 0xff)
  bytes.push(red & 0xff)
  bytes.push(green & 0xff)
  bytes.push(blue & 0xff)
  bytes.push((sceneTimeoutMin >> 8) & 0xff)
  bytes.push(sceneTimeoutMin & 0xff)

  switch (buzzerMelody) {
    case "NONE":
      bytes.push(0);
      break;
    case "FAST":
      bytes.push(1);
      break;
    case "MEDIUM":
      bytes.push(2);
      break;
    case "SLOW":
      bytes.push(3);
      break;
    case "ASCENDING":
      bytes.push(4);
      break;
    case "DOUBLEUP":
      bytes.push(5);
      break;
    case "DOUBLE":
      bytes.push(6);
      break;
    case "TRIPLE":
      bytes.push(7);
      break;
    default:
      bytes.push(0);
      break;
  }

  if (buzzerRepeat) {
    bytes.push(1);
  } else {
    bytes.push(0);
  }

  return bytesToHex(bytes);
}

function checkExpectedValues(value, defaultValue) {
  if (value !== undefined && value !== null) {
    return value;
  }
  return defaultValue;
}

function consume(event) {
  const port = checkExpectedValues(event.port, 3);
  const confirmed = checkExpectedValues(event.confirmed, true);
  let payloadHex = checkExpectedValues(event.payloadHex, "");

  if (payloadHex.length > 1) {
    emit("downlink", { payloadHex, port, confirmed });
  } else if (event.payload.actionType !== undefined) {
    const { payload } = event;
    switch (payload.actionType) {
      case "sensorConfigs":
        payloadHex = sensorConfigs(
          payload.confirmed,
          payload.dutyCycle,
          payload.classC,
          payload.buzzer,
          payload.statusIntervalMin,
          payload.numLed,
          payload.resetTimeH
        );
        break;
      case "sceneConfigs":
        payloadHex = sceneConfigs(
          payload.currentScene
        );
        break;
      case "brightnessConfigs":
        payloadHex = brightnessConfigs(
          payload.brightnessPercent,
        );
        break;
      case "volumeConfigs":
        payloadHex = volumeConfigs(
          payload.volume,
        );
        break;
      case "lightConfigs":
        payloadHex = lightConfigs(
          payload.selectedScene,
          payload.red,
          payload.green,
          payload.blue,
          payload.sceneTimeoutMin,
        );
        break;
      case "buzzerConfigs":
        payloadHex = buzzerConfigs(
          payload.selectedScene,
          payload.red,
          payload.green,
          payload.blue,
          payload.sceneTimeoutMin,
          payload.buzzerMelody,
          payload.buzzerRepeat,
        );
        break;
      default:
        emit("log", { "Something went wrong with": payload });
        break;
    }

    emit("downlink", {
      payloadHex,
      port,
      confirmed: true,
    });
  }
}
