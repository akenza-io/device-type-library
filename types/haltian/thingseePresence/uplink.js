function consume(event) {
  const { data } = event;
  const header = data.tsmId;
  const type = data.tsmEv;

  const lifecycle = {};
  let sample = {};

  let topic = "default";

  if (type === 9) {
    lifecycle.reason = "CHANGE";
  } else if (type === 10) {
    lifecycle.reason = "TIME";
  } else if (type === 11) {
    lifecycle.reason = "STARTUP";
  } else if (type === 29) {
    lifecycle.reason = "ERROR";
  } else if (type === 33) {
    lifecycle.reason = "FIRMWARE_RESPONSE";
  }

  switch (header) {
    // System message
    case 1100: {
      topic = "system_info";
      sample.swVersion = data.swVersion;
      sample.modelCode = data.modelCode;
      sample.psn = data.psn;

      break;
    }
    case 1102: {
      topic = "firmware_response";
      sample.requestTsmId = data.requestTsmId;

      break;
    }
    case 1110: {
      topic = "battery_level";
      sample.batteryLevel = data.batl;

      const { chrg } = data;
      if (chrg !== undefined) {
        sample.batteryCharge = chrg;
      }

      break;
    }
    case 1111: {
      topic = "orientation";
      sample.accX = data.accx;
      sample.accY = data.accy;
      sample.accZ = data.accz;

      break;
    }
    case 1202: {
      topic = "network";
      sample.rssi = data.rssi;

      const { rssiDbm } = data;
      const { neighNodeInfo } = data;
      const { neighRadioPower } = data;
      const { neighRadioPowerDbm } = data;

      if (rssiDbm !== undefined) {
        sample.rssiDbm = rssiDbm;
      }

      if (neighNodeInfo !== undefined) {
        sample.neighNodeInfo = neighNodeInfo;
      }

      if (neighRadioPower !== undefined) {
        sample.neighRadioPower = neighRadioPower;
      }

      if (neighRadioPowerDbm !== undefined) {
        sample.neighRadioPowerDbm = neighRadioPowerDbm;
      }

      sample.rssiDbm = rssiDbm;
      sample.neighNodeInfo = neighNodeInfo;
      sample.neighRadioPower = neighRadioPower;
      sample.neighRadioPowerDbm = neighRadioPowerDbm;

      break;
    }
    case 1312: {
      topic = "firmware_binary";
      sample.binaryType = data.binaryType;
      sample.binaryVersion = data.binaryVersion;

      break;
    }
    case 1403: {
      topic = "error_event";
      sample.errorType = data.errorType;
      sample.errorCause = data.errorCause;

      break;
    }
    // Sensordata
    case 13100: {
      topic = "move_count";
      sample.moveCount = data.moveCount;
      break;
    }
    case 2100: {
      topic = "occupancy";
      sample.occupancy = data.state;
      sample.occupied = !!sample.occupancy;

      // Warm desk 
      const time = new Date().getTime();
      const state = event.state || {};
      sample.minutesSinceLastOccupied = 0; // Always give out minutesSinceLastOccupied for consistancy
      if (sample.occupied) {
        delete state.lastOccupancyTimestamp; // Delete last occupancy timestamp
      } else if (state.lastOccupancyTimestamp !== undefined) {
        sample.minutesSinceLastOccupied = Math.round((time - state.lastOccupancyTimestamp) / 1000 / 60); // Get free since
      } else if (state.lastOccupancyValue) { //
        state.lastOccupancyTimestamp = time; // Start with first no occupancy
      }

      if (Number.isNaN(sample.minutesSinceLastOccupied)) {
        sample.minutesSinceLastOccupied = 0;
      }
      state.lastOccupancyValue = sample.occupied;
      emit("state", state);
      break;
    }
    default:
      topic = "unknown";
      sample = data;
      break;
  }

  if (topic !== "unknown") {
    emit("sample", { data: sample, topic });
  } else {
    emit("log", { data: sample });
  }

  if (Object.keys(lifecycle).length !== 0) {
    emit("sample", { data: lifecycle, topic: "lifecycle" });
  }
}
