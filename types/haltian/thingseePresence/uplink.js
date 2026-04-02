function checkForCustomFields(device, target, norm) {
  if (device !== undefined && device.customFields !== undefined && device.customFields[target] !== undefined) {
    return device.customFields[target];
  }
  return norm;
}

function calculateRecentOccupancy(device, state, occupancy) {
  state = state || {};
  // Occupancy status
  if (occupancy.occupied) {
    occupancy.occupancyStatus = "OCCUPIED";
    occupancy.occupiedOrRecentlyUsed = true;
  } else {
    occupancy.occupancyStatus = "UNOCCUPIED";
    occupancy.occupiedOrRecentlyUsed = false;
  }

  const time = new Date().getTime();
  occupancy.minutesSinceLastOccupied = 0;
  occupancy.minutesOccupiedSinceStart = 0;

  if (occupancy.occupied) {
    // Set state to first occupancy occurence so occupied time can be calulcated
    if (state.firstOccupancyTimestamp == undefined) {
      state.firstOccupancyTimestamp = time;
    }
    // Give out how long there has been occupancy
    occupancy.minutesOccupiedSinceStart = Math.round((time - state.firstOccupancyTimestamp) / 1000 / 60);
    delete state.lastOccupancyTimestamp; // Reset cycle
    delete state.minutesOccupiedSinceStart;
  } else {
    // Give out how long there has been no occupancy
    if (state.lastOccupancyTimestamp !== undefined) {
      occupancy.minutesSinceLastOccupied = Math.round((time - state.lastOccupancyTimestamp) / 1000 / 60);
    } else {
      state.lastOccupancyTimestamp = time;

      // Only save the timestamp on first leave and save how long the occupancy has gone on for
      state.minutesOccupiedSinceStart = Math.round((time - state.firstOccupancyTimestamp) / 1000 / 60);
      delete state.firstOccupancyTimestamp; // Reset cycle
    }
  }

  // Allow customFields to change this
  const minimalOccupiedTime = checkForCustomFields(device, "minimalOccupiedTime", 2.5);
  const recentUsageDuration = checkForCustomFields(device, "recentUsageDuration", 90)

  if (occupancy.minutesSinceLastOccupied < recentUsageDuration && !occupancy.occupied && state.minutesOccupiedSinceStart >= minimalOccupiedTime) {
    occupancy.recentlyUsed = true;
    occupancy.occupiedOrRecentlyUsed = true;
    occupancy.occupancyStatus = "WARM";
  } else {
    occupancy.recentlyUsed = false;
    occupancy.occupiedOrRecentlyUsed = occupancy.occupied;
  }
  return { state, occupancy }
}

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

      let recentOccupancyResult = calculateRecentOccupancy(event.device, event.state, sample);
      sample = recentOccupancyResult.occupancy;

      emit("state", recentOccupancyResult.state);
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
