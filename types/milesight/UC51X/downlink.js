// Special EF CD AB -> AB CD EF Case
function intToHex(number) {
  let base = Number(number).toString(16);
  if (base.length % 2) {
    base = `0${base}`;
  }

  let hex = "";
  for (let i = 0; i < base.length; i += 2) {
    hex = base.slice(i, i + 2) + hex;
  }

  return hex;
}

// Syncs with network server
function timeSync() {
  return "ff4a00";
}

function standardDownlinkStructure(valve, action, time) {
  let hex = "ff1d"; // Channel & Type
  let settings = "00"; // Disable time and flow control
  if (time) {
    settings = "10";
  }

  // Open or close
  if (action) {
    settings += "10000";
  } else {
    settings += "00000";
  }

  // Targeted valve
  if (valve === 1) {
    settings += "0";
  } else {
    settings += "1";
  }

  const status = parseInt(settings, 2).toString(16);
  if (status.length < 2) {
    hex += "0";
  }
  hex += status;
  hex += "00"; // Disable sequence

  return hex;
}

function timedValvePayload(valve, action, durationSeconds) {
  let hex = standardDownlinkStructure(valve, action, true);

  // Add duration for action which should be taken
  hex += intToHex(durationSeconds);
  // Fill with zeros for unused time
  while (hex.length < 14) {
    hex += "0";
  }

  return hex;
}

function checkWeekDay(day) {
  let bit = 0;
  if (day) {
    bit = 1;
  }
  return bit;
}

function schedulePayload(valve, action, plan, enable, days, start, end) {
  let hex = "ff4d"; // Channel & Type
  hex += intToHex(plan);

  let settings = "0"; // Enable / Disable plan
  if (enable) {
    settings = "1";
  }

  // Open or close
  if (action) {
    settings += "10000";
  } else {
    settings += "00000";
  }

  // Targeted valve
  if (valve === 1) {
    settings += "01";
  } else if (valve === 2) {
    settings += "10";
  } else if (valve === 3) {
    settings += "11";
  }

  const status = parseInt(settings, 2).toString(16);
  if (status.length < 2) {
    hex += "0";
  }
  hex += status;

  // Add days which this plan should run at
  let weekdays = "0";
  weekdays += checkWeekDay(days.sunday);
  weekdays += checkWeekDay(days.saturday);
  weekdays += checkWeekDay(days.friday);
  weekdays += checkWeekDay(days.thursday);
  weekdays += checkWeekDay(days.wednesday);
  weekdays += checkWeekDay(days.tuesday);
  weekdays += checkWeekDay(days.monday);

  const weekdaysHex = parseInt(weekdays, 2).toString(16);
  if (weekdaysHex.length < 2) {
    hex += "0";
  }
  hex += weekdaysHex;

  // Start time
  hex +=
    intToHex(Number(start.substring(0, 2))) +
    intToHex(Number(start.substring(2, 4)));

  // End time
  hex +=
    intToHex(Number(end.substring(0, 2))) +
    intToHex(Number(end.substring(2, 4)));

  hex += "0000"; // Disable Pulse controle

  return hex;
}

function checkExpectedValues(value, defaultValue) {
  if (value !== undefined && value !== null) {
    return value;
  }
  return defaultValue;
}

function consume(event) {
  const port = checkExpectedValues(event.port, 85);
  const confirmed = checkExpectedValues(event.confirmed, true);
  let payloadHex = checkExpectedValues(event.payloadHex, "");

  if (payloadHex.length > 1) {
    emit("downlink", { payloadHex, port, confirmed });
  } else if (event.payload.actionType !== undefined) {
    const { payload } = event;
    switch (payload.actionType) {
      case "control":
        payloadHex = standardDownlinkStructure(
          payload.valve,
          payload.open,
          false,
        );
        break;
      case "timedControl":
        payloadHex = timedValvePayload(
          payload.valve,
          payload.open,
          payload.durationSeconds,
        );
        break;
      case "milesightSchedule":
        payloadHex = schedulePayload(
          payload.valve,
          payload.open,
          payload.schedule,
          payload.enable,
          payload.weekdays,
          payload.start,
          payload.end,
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
