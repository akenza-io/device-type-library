function consume(event) {
  const { eventType } = event.data;
  let sample = {};
  const now = new Date().getTime();
  const state = event.state || {};

  if (eventType === "objectPresent") {
    // Init usage to count washroom visits
    if (state.usage === undefined || state.usage === null) {
      state.usage = 0;
    }

    sample.objectPresent = event.data.objectPresent.state;
    if (sample.objectPresent === "PRESENT") {
      sample.proximity = true;
      sample.relativeCount = 1;
      state.usage++;
    } else {
      sample.proximity = false;
      sample.relativeCount = 0;
    }

    // State manipulation to get a count for object present changes
    // Init absolute count
    if (state.count === undefined || state.count === null) {
      state.count = 0;
    }

    if (state.lastStatus !== undefined && state.lastStatus !== null) {
      if (sample.objectPresent !== state.lastStatus) {
        state.count += sample.relativeCount;
      }
    } else {
      state.count += sample.relativeCount; // Count first instance as a count
    }

    state.lastStatus = sample.objectPresent;
    sample.count = state.count;
    state.lastSampleEmittedAt = now;

    // Washroom usage
    if (event.device !== undefined && event.device.customFields !== undefined &&
      event.device.customFields.usecase !== undefined && event.device.customFields.usecase === "Washroom") {
      const data = {};

      // Always floor or ceil depending on the starting point
      if (state.start === undefined) {
        if (sample.count % 2 === 0) {
          state.start = "EVEN";
        } else {
          state.start = "ODD";
        }
      }

      // This is done so the absolute visits count up as a relative visit has been registered
      if (state.start === "ODD") {
        data.absolutVisitCount = Math.floor(sample.count / 2);
      } else {
        data.absolutVisitCount = Math.ceil(sample.count / 2);
      }

      if (state.usage / 2 === 1) {
        data.relativeVisitCount = 1;
        state.usage = 0;
      } else {
        data.relativeVisitCount = 0;
      }
      emit("sample", { data, topic: "washroom_visit" });
    }

    emit("sample", { data: sample, topic: "object_present" });
  } else if (eventType === "touch") {
    sample.touch = true;
    emit("sample", { data: sample, topic: "touch" });
  } else if (eventType === "networkStatus") {
    // suppress network_status for one hour
    if (state.lastNetworkEmittedAt === undefined || now - state.lastNetworkEmittedAt >= 3600000) {
      sample.signalStrength = event.data.networkStatus.signalStrength;
      sample.rssi = event.data.networkStatus.rssi;
      sample.transmissionMode = event.data.networkStatus.transmissionMode;
      if (sample.rssi >= -50) {
        sample.sqi = 3;
      } else if (sample.rssi < -50 && sample.rssi >= -100) {
        sample.sqi = 2;
      } else {
        sample.sqi = 1;
      }
      state.lastNetworkEmittedAt = now;
      emit("sample", { data: sample, topic: "network_status" });
    }
  } else if (eventType === "batteryStatus") {
    sample.batteryLevel = event.data.batteryStatus.percentage;
    emit("sample", { data: sample, topic: "lifecycle" });
  }

  // output a sample each hour to facilitate time series analysis
  if (state.lastSampleEmittedAt !== undefined && now - state.lastSampleEmittedAt >= 3600000) {
    sample = {};
    sample.objectPresent = state.lastStatus;
    sample.relativeCount = 0;
    sample.count = state.count;
    if (sample.objectPresent === "PRESENT") {
      sample.proximity = true;
    } else {
      sample.proximity = false;
    }

    // Washroom usage
    if (event.device !== undefined && event.device.customFields !== undefined &&
      event.device.customFields.usecase !== undefined && event.device.customFields.usecase === "Washroom") {
      const data = {};

      if (state.start === undefined) {
        // Predicts the next state in this case
        if (state.count % 2 === 0) {
          state.start = "ODD";
        } else {
          state.start = "EVEN";
        }
      }

      if (state.start === "ODD") {
        data.absolutVisitCount = Math.floor(state.count / 2);
      } else {
        data.absolutVisitCount = Math.ceil(state.count / 2);
      }

      data.relativeVisitCount = 0;
      emit("sample", { data, topic: "washroom_visit" });
    }

    emit("sample", { data: sample, topic: "object_present" });
    state.lastSampleEmittedAt = now;
  }

  emit("state", state);
}
