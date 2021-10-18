function consume(event) {
  const payload = event.data;
  // Xovis Event
  if (payload.values !== undefined) {
    for (let i = 0; i < payload.values.length; i++) {
      let data = {};

      if (payload.values[i].type === "LineCount") {
        if (payload.values[i].direction === "forward") {
          data = { fw: 1, bw: 0 };
        } else {
          data = { fw: 0, bw: 1 };
        }

        // Mask
        const { faceMask } = payload.values[i].object;
        if (faceMask !== undefined) {
          if (faceMask === "NO_MASK") {
            data.faceMask = 0;
          } else {
            data.faceMask = 1;
          }
        }

        // Gender
        const { gender } = payload.values[i].object;
        if (gender !== undefined) {
          if (gender === "FEMALE") {
            data.gender = "FEMALE";
          } else {
            data.gender = "MALE";
          }
        }

        emit("sample", { data, topic: "line_count" });
      } else if (payload.values[i].type === "ZoneDwellTime") {
        emit("sample", {
          data: { dwelltime: Math.round(payload.values[i].dwellTime / 1000) },
          topic: "dwelltime",
        });
      }
    }

    // Xovis Line Count
  } else if (payload.content !== undefined) {
    const data = payload.content;
    const rawSample = {};

    // Standart loop over the data
    for (let i = 0; i < data.element.length; i++) {
      for (let j = 0; j < data.element[i].measurement.length; j++) {
        for (let k = 0; k < data.element[i].measurement[j].value.length; k++) {
          const { label } = data.element[i].measurement[j].value[k];
          const { value } = data.element[i].measurement[j].value[k];

          if (data.element[i]["element-name"] === "dwell zone") {
            // Dwell Time Zone
            if (label === "stat") {
              emit("sample", {
                data: { avgWaitingTime: value },
                topic: "waiting_time",
              });
            } else if (label === "count" && k === 1) {
              // Not nice but i cant distinguished the data otherwise
              emit("sample", {
                data: { queueDepth: value },
                topic: "queue_depth",
              });
            }
          } else {
            rawSample[data.element[i].measurement[j].value[k].label] =
              data.element[i].measurement[j].value[k].value;
          }
        }
      }
    }

    // Gender
    if (rawSample.maleFwPercentage !== undefined) {
      const modSample = {};
      const bw = rawSample.bw / 100;
      modSample.maleBw = Math.round(bw * rawSample.maleBwPercentage);
      modSample.femaleBw = Math.round(bw * rawSample.femaleBwPercentage);

      const fw = rawSample.fw / 100;
      modSample.maleFw = Math.round(fw * rawSample.maleFwPercentage);
      modSample.femaleFw = Math.round(fw * rawSample.femaleFwPercentage);

      modSample.maleBwPercentage = rawSample.maleBwPercentage;
      modSample.femaleBwPercentage = rawSample.femaleBwPercentage;
      modSample.maleFwPercentage = rawSample.maleFwPercentage;
      modSample.femaleFwPercentage = rawSample.femaleFwPercentage;
      emit("sample", { data: modSample, topic: "gender_mod" });

      delete rawSample.maleBwPercentage;
      delete rawSample.femaleBwPercentage;
      delete rawSample.maleFwPercentage;
      delete rawSample.femaleFwPercentage;
    }

    // Line Count
    if (rawSample.fw !== undefined) {
      rawSample.count = rawSample.fw + rawSample.bw;
      emit("sample", { data: rawSample, topic: "line_count" });
    }
  }
}
