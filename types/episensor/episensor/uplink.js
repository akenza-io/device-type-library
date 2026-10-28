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

// Periods without a timezone offset are treated as UTC, independent of the runtime timezone
function parsePeriod(period) {
  if (!/(Z|[+-]\d{2}:?\d{2})$/i.test(period)) {
    period += "Z";
  }
  return new Date(period).getTime();
}

function consume(event) {
  let values = event.data.data;
  const state = event.state || {};
  let emits = 0;

  values.sort((a, b) => a.period.localeCompare(b.period));
  values.forEach(entry => {
    const data = {};
    let { value } = entry;
    let period = parsePeriod(entry.period);
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

    // Hardcap for devices which have been offline for a long time and are backfilling too much
    if (emits <= 80)
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
        emits++;
      }
  });

  if (emits >= 80) {
    emit("sample", { data: { "message": "Too many datapoints (" + values.length + ") have been sent in one message. Cutting of after the first 80 entries." }, topic: "warning" });
  }

  emit("state", state);
}