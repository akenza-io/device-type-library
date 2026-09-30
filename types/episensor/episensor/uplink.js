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
    let period = new Date(entry.period).getTime();
    let { id } = entry;

    if (state.id == undefined) {
      state.id = id;
    } else if (state.id !== id) {
      emit("sample", {
        data: {
          "error": "Device connected to bridge changed. If it's a new counter please add it as a new device.",
          value,
          period: new Date(period).toISOString(),
          "newId": id,
          "initialId": state.id
        }, topic: "error"
      });
      return;
    }

    if (state.lastPeriod == undefined) {
      state.lastPeriod = 0;
    }

    // Do not backfill data otherwise the state corrupts for a few messages
    if (state.lastPeriod < period) {
      data.totalActivePowerKWh = value;
      data.incrementActivePowerKWh = calculateIncrement(
        state.lastTotalActivePowerKWh,
        data.totalActivePowerKWh,
      );
      state.lastTotalActivePowerKWh = data.totalActivePowerKWh;
      state.lastPeriod = period;

      emit("sample", { data: data, topic: "default", timestamp: new Date(period) });
    }
  });

  emit("state", state);
}