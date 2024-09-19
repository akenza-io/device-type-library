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

function startSiren(warningMode, strobeMode, duration) {
  let hex = "9069"; // Command & Devicetype

  switch (warningMode) {
    case "FIRE_MODE":
      hex += "00";
      break;
    case "EMERGENCY_MODE":
      hex += "01";
      break;
    case "BURGLAR":
      hex += "02";
      break;
    case "DOORBELL":
      hex += "03";
      break;
    case "MUTE_MODE":
      hex += "04";
      break;
    default:
      break;
  }

  switch (strobeMode) {
    case "NO_LED":
      hex += "00";
      break;
    case "LED_BLINK_1":
      hex += "01";
      break;
    case "LED_BLINK_2":
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
  hex += "0000000000";

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
      case "startWarning":
        payloadHex = startSiren(
          payload.warningMode,
          payload.strobeMode,
          payload.duration,
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
