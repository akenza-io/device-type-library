// Check if in timerange
function checkTime(now, ctf, ctt) {
  return now >= ctf && now <= ctt;
}

// Check Daterange
function checkDate(dayChanged, checkDays) {
  // If times are overlapping days return true
  if (dayChanged) {
    return true;
  }
  const day = new Date().getDay();
  return checkDays[day];
}

function consume(event) {
  const { type } = event;
  const { startTime } = event.properties;
  const { endTime } = event.properties;
  const checkDays = [
    event.properties.sunday,
    event.properties.monday,
    event.properties.tuesday,
    event.properties.wednesday,
    event.properties.thursday,
    event.properties.friday,
    event.properties.saturday,
  ];
  const { fridge } = event.inputs;
  const { timeRange } = event.properties;

  // State init
  let ruleState = {};
  if (event.state !== undefined) {
    ruleState = event.state;
  } else {
    ruleState.sent = false;
  }

  const time = new Date();
  const now = new Date().getTime();
  let runAt = new Date();

  if (type === "uplink") {
    let dayChanged = false;
    const st = time.setHours(startTime);
    let et = time.setHours(endTime);

    if (st > et && now > st) {
      et = new Date(et);
      et = et.setDate(et.getDate() + 1);
      dayChanged = true;
    }

    if (checkDate(dayChanged, checkDays) && checkTime(now, st, et)) {
      if (fridge) {
        ruleState.status = "open";
        runAt = runAt.setMinutes(runAt.getMinutes() + timeRange);
        emit("run_at", new Date(runAt));
      } else {
        ruleState.status = "closed";
      }
    }
  } else if (type === "timer") {
    if (ruleState.status === "open") {
      emit("out", { name: ruleState.name });
    }
  }

  emit("state", ruleState);
}
