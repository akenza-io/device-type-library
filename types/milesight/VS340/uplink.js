function isEmpty(obj) {
  return Object.keys(obj).length === 0;
}

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
  const payload = event.data.payloadHex;
  const bytes = Hex.hexToBytes(payload);
  let decoded = {};
  const lifecycle = {};

  for (let i = 0; i < bytes.length;) {
    const channelId = bytes[i++];
    const channelType = bytes[i++];

    // BATTERY
    if (channelId === 0x01 && channelType === 0x75) {
      lifecycle.batteryLevel = bytes[i];
      i += 1;
    }
    // OCCUPANCY
    else if (channelId === 0x03 && channelType === 0x00) {
      decoded.occupied = bytes[i] !== 0;
      decoded.occupancy = Number(decoded.occupied);

      let recentOccupancyResult = calculateRecentOccupancy(event.device, event.state, decoded);
      decoded = recentOccupancyResult.occupancy;

      emit("state", recentOccupancyResult.state);
      i += 1;
    } else {
      break;
    }
  }

  if (!isEmpty(decoded)) {
    emit("sample", { data: decoded, topic: "default" });
  }

  if (!isEmpty(lifecycle)) {
    emit("sample", { data: lifecycle, topic: "lifecycle" });
  }
}
