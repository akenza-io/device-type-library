function consume(event) {
  const { deviationCount } = event.properties;
  const { resetTime } = event.properties;
  const { maxPeople } = event.properties;
  const ruleState = {};

  let time = new Date();
  time = new Date(time.setDate(time.getDate() + 1));
  time = time.setHours(resetTime, 0, 0, 0);

  if (ruleState.peopleIn === undefined) {
    if (new Date().getHours() < new Date(time).getHours()) {
      time = new Date(time);
      time = new Date(time.setDate(time.getDate() - 1));
    }

    emit("timer", { runAt: new Date(time) });
    ruleState.peopleIn = 0;
    ruleState.deviationCount = 0;
  }

  if (event.type == "uplink") {
    const countIn = event.inputs.inCount;
    const countOut = event.inputs.outCount;

    const sample = {};
    ruleState.peopleIn = ruleState.peopleIn + countIn - countOut;

    if (ruleState.peopleIn < 0) {
      ruleState.peopleIn = 0;
      ruleState.deviationCount--;
    }
    sample.in = countIn;
    sample.out = countOut;
    sample.peopleIn = ruleState.peopleIn;

    if (
      maxPeople != 0 &&
      maxPeople != undefined &&
      ruleState.peopleIn != undefined
    ) {
      const percent =
        Math.round(ruleState.peopleIn / (maxPeople / 100) / 5) * 5;
      sample.percent = percent;
    }
    emit("action", sample);
  } else if (event.type == "timer") {
    emit("timer", { runAt: new Date(time) });
    if (deviationCount) {
      emit("action", {
        deviationCount: ruleState.peopleIn + ruleState.deviationCount,
        peopleIn: 0,
        in: 0,
        out: 0,
      });
    } else {
      emit("action", { peopleIn: 0, in: 0, out: 0 });
    }
    ruleState.peopleIn = 0;
    ruleState.deviationCount = 0;
  }
  emit("state", ruleState);
}
