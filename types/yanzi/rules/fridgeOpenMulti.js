// No last samples ? :(

function consume(event) {
  const { fridge } = event.inputs;
  const { timeRange } = event.properties;
  let ruleState = {};
  const time = new Date();

  // State init
  if (event.state === undefined) {
    ruleState.fridgeStatus = [];
  } else {
    ruleState = event.state;
  }

  // State init first time for each device
  if (ruleState.fridgeStatus[event.device.id] === undefined) {
    ruleState.fridgeStatus[event.device.id] = {};
    ruleState.fridgeStatus[event.device.id].name = event.device.name;
  }

  if (event.type === "uplink") {
    if (fridge) {
      ruleState.fridgeStatus[event.device.id].status = "opened";
      ruleState.fridgeStatus[event.device.id].min = time.getMinutes();
      ruleState.fridgeStatus[event.device.id].sec = time.getSeconds();

      const runAt = time.setMinutes(time.getMinutes() + timeRange);
      emit("run_at", new Date(runAt));
    } else {
      ruleState.fridgeStatus[event.device.id].status = "closed";
      ruleState.fridgeStatus[event.device.id].time = 0;
    }
  } else if (event.type === "timer") {
    for (const key in state.fridgeStatus) {
      if (state.fridgeStatus[key].time.getMinutes() == time.getMinutes()) {
        state.fridgeStatus[key] = {
          status: "closed",
          name: state.fridgeStatus[key].name,
        };
        emit("out", { name: state.fridgeStatus[key].name });
      }
    }
  }
  emit("state", ruleState);
}
