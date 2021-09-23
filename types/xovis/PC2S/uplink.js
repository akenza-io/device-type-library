function consume(event) {
  // Xovis Event
  if (event.values !== undefined) {
    for (let i = 0; i < event.values.length; i++) {
      let data = {};

      if (event.values[i].type === "LineCount") {
        if (event.values[i].direction === "forward") {
          data = { fw: 1, bw: 0 };
        } else {
          data = { fw: 0, bw: 1 };
        }

        // Mask
        const { faceMask } = event.values[i].object;
        if (faceMask !== undefined) {
          if (faceMask === "NO_MASK") {
            data.faceMask = 0;
          } else {
            data.faceMask = 1;
          }
        }

        // Gender
        const { gender } = event.values[i].object;
        if (gender !== undefined) {
          if (gender === "FEMALE") {
            data.gender = "f";
          } else {
            data.gender = "m";
          }
        }

        emit("sample", { data, topic: "line_count" });
      } else if (
        event.values[i].type === "ZoneEntry" ||
        event.values[i].type === "ZoneExit"
      ) {
        // data.id = event.payload[i].object.id; // Can check on Person ID to see how long individual persons take time
        // data.timestamp =  event.payload[i].timestamp; // dwelltime is the same as timein-timeout
        // emit("sample", { data, topic: event.values[i].type, save: false }); // Not saved gets used in Rule
      } else if (event.values[i].type === "ZoneDwellTime") {
        emit("sample", {
          data: { dwelltime: Math.round(event.values[i].dwellTime / 1000) },
          topic: "dwelltime",
        });
      }
    }

    // Xovis Line Count
  } else if (event.content !== undefined) {
    const data = event.content;
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
            } else {
              emit("sample", {
                data: { now: data.element[0].measurement[0].value[0].value },
                topic: "set",
                save: false,
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
      emit("sample", { data: modSample, topic: "genderMod" });

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
