function consume(event) {
  const raw = event.data;

  if (raw.line_trigger_data !== undefined && raw.line_trigger_data.length !== 0) {
    raw.line_trigger_data.forEach(lineData => {
      const data = {};
      data.totalCounterIn = lineData.total.in;
      data.totalCounterOut = lineData.total.out;

      emit("sample", { data, topic: `line${lineData.line}` });
    });
  }

  if (raw.line_periodic_data !== undefined && raw.line_periodic_data.length !== 0) {
    raw.line_periodic_data.forEach(lineData => {
      const data = {};
      data.periodicCounterIn = lineData.total.in;
      data.periodicCounterOut = lineData.total.out;

      emit("sample", { data, topic: `line${lineData.line}` });
    });
  }

  if (raw.line_total_data !== undefined && raw.line_total_data.length !== 0) {
    raw.line_total_data.forEach(lineData => {
      const data = {};
      data.totalCountedIn = lineData.total.in_counted;
      data.totalCountedOut = lineData.total.out_counted;
      data.totalCountedCapacity = lineData.total.capacity_counted;

      emit("sample", { data, topic: `line${lineData.line}` });
    });
  }

  if (raw.region_trigger_data !== undefined) {
    if (raw.region_trigger_data.dwell_time_data !== undefined && raw.region_trigger_data.dwell_time_data.length !== 0) {
      raw.region_trigger_data.dwell_time_data.forEach(dwellTime => {
        const data = {};
        data.duration = dwellTime.duration;
        data.dwellTimeStart = dwellTime.dwell_start_time;
        data.dwellTimeEnd = dwellTime.dwell_end_time;

        emit("sample", { data, topic: `region${dwellTime.region}` });
      });
    }
  }

  if (raw.region_data !== undefined) {
    if (raw.region_data.dwell_time_data !== undefined && raw.region_data.dwell_time_data.length !== 0) {
      raw.region_data.dwell_time_data.forEach(dwellTime => {
        const data = {};
        data.avgDwellTime = dwellTime.avg_dwell_time;
        data.maxDwellTime = dwellTime.max_dwell_time;

        emit("sample", { data, topic: `region${dwellTime.region}` });
      });
    }

    if (raw.region_data.region_count_data !== undefined && raw.region_data.region_count_data.length !== 0) {
      raw.region_data.region_count_data.forEach(dwellTime => {
        const data = {};
        data.totalDwellers = dwellTime.total.current_total;

        emit("sample", { data, topic: `region${dwellTime.region}` });
      });
    }
  }
}
