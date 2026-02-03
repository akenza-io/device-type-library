function calculateIncrement(lastValue, currentValue) {
  // Check if current value exists
  if (currentValue === undefined || Number.isNaN(currentValue)) {
    return 0;
  }

  // Init state && Check for the case the counter reseted
  if (lastValue === undefined || lastValue > currentValue) {
    lastValue = currentValue;
  }
  // Calculate increment
  return Math.round((currentValue - lastValue) * 10) / 10;
}

function consume(event) {
  let values = event.data.data;
  const state = event.state || {};

  values.sort((a, b) => a.period.localeCompare(b.period));
  values.forEach(entry => {
    const data = {};
    let { value } = entry;
    let { period } = entry;
    let { id } = entry;

    if (event.state.id == undefined) {
      event.state.id = id;
    } else if (event.state.id !== id) {
      emit("sample", {
        data: {
          "error": "Device connected to bridge changed. If it's a new counter please add it as a new device.",
          value,
          period,
          "newId": id,
          "initialId": event.state.id
        }, topic: "error"
      });
      return;
    }

    data.totalActivePowerKWh = value;
    data.incrementActivePowerKWh = calculateIncrement(
      state.lastTotalActivePowerKWh,
      data.totalActivePowerKWh,
    );
    state.lastTotalActivePowerKWh = data.totalActivePowerKWh;

    emit("sample", { data: data, topic: "default", timestamp: new Date(period) });
  });

  emit("state", state);
}