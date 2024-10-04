function checkExpectedValues(value, defaultValue) {
  if (value !== undefined && value !== null) {
    return value;
  }
  return defaultValue;
}

function intToHex(number) {
  let hex = Number(number).toString(16);
  if (hex.length === 1) {
    hex = `0${hex}`;
  }

  return hex;
}

function startSiren(sirenType, sirenIntensity, strobeMode, duration) {
  let hex = "03DE"; // Command & Devicetype

  switch (sirenType) {
    case "EMERGENCY":
      hex += "00";
      break;
    case "DOORBELL":
      hex += "01";
      break;
    case "BURGLAR":
      hex += "02";
      break;
    case "WATER_LEAK":
      hex += "03";
      break;
    case "HELP":
      hex += "04";
      break;
    case "NO_SMOKING":
      hex += "05";
      break;
    case "POOR_AIR_QUALITY":
      hex += "06";
      break;
    case "TEMPERATURE_HIGH":
      hex += "07";
      break;
    case "THIEF":
      hex += "08";
      break;
    case "WELCOME":
      hex += "09";
      break;
    default:
      break;
  }
  // Level O - 30
  hex += intToHex(sirenIntensity);

  switch (strobeMode) {
    case "NO_LED":
      hex += "00";
      break;
    case "FLOWING":
      hex += "01";
      break;
    case "BLINKING":
      hex += "02";
      break;
    default:
      break;
  }

  let durationHex = intToHex(duration);
  while (durationHex.length !== 4) {
    durationHex = `0${durationHex}`;
  }
  hex += durationHex;

  // Add reserved
  hex += "00000000";

  return hex;
}

function setColor(red, green, blue) {
  let hex = "07DE"; // Command & Devicetype

  // RGB
  hex += intToHex(red);
  hex += intToHex(green);
  hex += intToHex(blue);

  // Add reserved
  hex += "000000000000";

  return hex;
}

function consume(event) {
  const port = checkExpectedValues(event.port, 7);
  const confirmed = checkExpectedValues(event.confirmed, true);
  let payloadHex = checkExpectedValues(event.payloadHex, "");

  if (payloadHex.length > 1) {
    emit("downlink", { payloadHex, port, confirmed });
  } else if (event.payload.actionType !== undefined) {
    const { payload } = event;
    switch (payload.actionType) {
      case "startSiren":
        payloadHex = startSiren(
          payload.sirenType,
          payload.sirenIntensity,
          payload.strobeMode,
          payload.duration,
        );
        break;
      case "setColor":
        payloadHex = setColor(payload.red, payload.green, payload.blue);
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
