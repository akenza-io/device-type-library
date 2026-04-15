function checkForCustomFields(device, target, fallbackValue) {
  if (device !== undefined && device.customFields !== undefined && device.customFields[target] !== undefined) {
    return device.customFields[target];
  }
  return fallbackValue;
}

function calculateRecentOccupancy(device, state, occupancy) {
  state = state || {};
  // Occupancy status
  if (occupancy.occupied) {
    occupancy.occupancyStatus = "OCCUPIED";
    occupancy.occupiedOrWarm = true;
  } else {
    occupancy.occupancyStatus = "FREE";
    occupancy.occupiedOrWarm = false;
  }

  const time = new Date().getTime();
  occupancy.minutesSinceLastOccupied = 0;
  occupancy.occupiedMinutes = 0;

  if (occupancy.occupied) {
    // Set state to first occupancy occurence so occupied time can be calulcated
    if (state.firstOccupancyTimestamp == undefined) {
      state.firstOccupancyTimestamp = time;
    }
    // Give out how long there has been occupancy
    occupancy.occupiedMinutes = Math.round((time - state.firstOccupancyTimestamp) / 1000 / 60);
    delete state.lastOccupancyTimestamp; // Reset cycle
    delete state.occupiedMinutes;
  } else {
    // Give out how long there has been no occupancy
    if (state.lastOccupancyTimestamp !== undefined) {
      occupancy.minutesSinceLastOccupied = Math.round((time - state.lastOccupancyTimestamp) / 1000 / 60);
    } else {
      state.lastOccupancyTimestamp = time;

      // Only save the timestamp on first leave and save how long the occupancy has gone on for
      state.occupiedMinutes = Math.round((time - state.firstOccupancyTimestamp) / 1000 / 60);
      delete state.firstOccupancyTimestamp; // Reset cycle
    }
  }

  // Allow customFields to change this
  const minOccupancyThreshold = checkForCustomFields(device, "minOccupancyThreshold", 2.5);
  const occupancyWarmThreshold = checkForCustomFields(device, "occupancyWarmThreshold", 90)

  if (occupancy.minutesSinceLastOccupied < occupancyWarmThreshold && !occupancy.occupied && state.occupiedMinutes >= minOccupancyThreshold) {
    occupancy.warm = true;
    occupancy.occupiedOrWarm = true;
    occupancy.occupancyStatus = "WARM";
  } else {
    occupancy.warm = false;
    occupancy.occupiedOrWarm = occupancy.occupied;
  }
  return { state, occupancy }
}

function consume(event) {
  const payload = event.data.payloadHex;
  const { port } = event.data;
  const lifecycle = {};
  let occupancy = {};

  if (port === 1 || port === 2) {
    occupancy.occupancy = parseInt(`0x${payload}`, 16) & 0x01;
  }

  if (port === 3) {
    const resetDict = {
      0x01: "WATCHDOG_RESET",
      0x02: "POWER_ON_RESET",
      0x03: "SYSTEM_REQUEST_RESET",
      0x04: "OTHER_RESET",
    };
    lifecycle.debug = `Payload hex:${payload.substring(0, 24).toUpperCase()}`;
    lifecycle.fwVersion = `${parseInt(
      `0x${payload.substring(24, 26)}`,
      16,
    )}.${parseInt(`0x${payload.substring(26, 28)}`, 16)}.${parseInt(
      `0x${payload.substring(28, 30)}`,
      16,
    )}`;
    const resetCause = parseInt(`0x${payload.substring(30, 32)}`, 16);
    lifecycle.resetCause = resetDict[resetCause];
    occupancy.occupancy = parseInt(`0x${payload.substring(32, 34)}`, 16) & 0x01;

    emit("sample", { data: lifecycle, topic: "lifecycle" });
  }

  if (port === 1 || port === 2 || port === 3) {
    occupancy.occupied = !!occupancy.occupancy;

    let recentOccupancyResult = calculateRecentOccupancy(event.device, event.state, occupancy);
    occupancy = recentOccupancyResult.occupancy;

    emit("state", recentOccupancyResult.state);
    emit("sample", { data: occupancy, topic: "occupancy" });
  }
}
