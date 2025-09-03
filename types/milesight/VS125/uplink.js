function consume(event) {
  const raw = event.data;

  if (raw.line_trigger_data !== undefined && raw.line_trigger_data.length !== 0) {
    raw.line_trigger_data.forEach(lineData => {
      const data = {};
      data.totalCounterIn = lineData.total.in;
      data.totalCounterOut = lineData.total.out;

      emit("sample", { data, topic: lineData.line });
    });
  }

  if (raw.region_trigger_data !== undefined) {
    if (raw.region_trigger_data.dwell_time_data !== undefined && raw.region_trigger_data.dwell_time_data.length !== 0) {
      raw.region_trigger_data.dwell_time_data.forEach(dwellTime => {
        const data = {};
        data.duration = dwellTime.duration;
        data.dwellStartTime = dwellTime.dwell_start_time;
        data.dwellEndTime = dwellTime.dwell_end_time;

        emit("sample", { data, topic: "dwell_time" });
      });
    }
  }
}
