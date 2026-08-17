function checkForCustomFields(device, target, fallbackValue) {
  if (device !== undefined && device.customFields !== undefined && device.customFields[target] !== undefined) {
    return device.customFields[target];
  }
  return fallbackValue;
}

function calculateRecentOccupancy(device, state, occupancy) {
  const minOccupancyThreshold = checkForCustomFields(device, "minOccupancyThreshold", 3);
  const occupancyWarmThreshold = checkForCustomFields(device, "occupancyWarmThreshold", 90);
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

    // Only reset if a real occupancy has been tracked
    if (occupancy.occupiedMinutes >= minOccupancyThreshold) {
      delete state.lastOccupancyTimestamp; // Reset cycle
    }
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

function isKthBitSet(byte, k) {
  return byte & (1 << k);
}

function decodeFlags(flagByte) {
  const flags = {};
  flags.tpcStopped = false;
  flags.tpcStuck = false;
  flags.wifiApEnabled = false;
  flags.warmup = false;

  if (isKthBitSet(flagByte, 0)) {
    flags.tpcStopped = true;
  }
  if (isKthBitSet(flagByte, 1)) {
    flags.tpcStuck = true;
  }
  if (isKthBitSet(flagByte, 2)) {
    flags.wifiApEnabled = true;
  }
  if (isKthBitSet(flagByte, 3)) {
    flags.warmup = 1;
  }

  return flags;
}

function decodeZoneOccupancy(byte) {
  return byte === 255 ? false : true;
}
function decodeZoneActive(byte) {
  return byte === 255 ? "NOT_SET" : "ACTIVE";
}


function consume(event) {
  const payload = event.data.payloadHex;
  const bytes = Hex.hexToBytes(payload);
  const sample = {};
  let occupancy = {};

  if (event.data.port === 83) {
    let lifecycle = decodeFlags(bytes[0]);
    lifecycle.zone0Active = decodeZoneActive(bytes[2]);
    lifecycle.zone1Active = decodeZoneActive(bytes[3]);
    lifecycle.zone2Active = decodeZoneActive(bytes[4]);
    lifecycle.zone3Active = decodeZoneActive(bytes[5]);
    lifecycle.zone4Active = decodeZoneActive(bytes[6]);
    lifecycle.zone5Active = decodeZoneActive(bytes[7]);
    lifecycle.zone6Active = decodeZoneActive(bytes[8]);
    lifecycle.zone7Active = decodeZoneActive(bytes[9]);

    sample.zoneGobal = bytes[1];
    sample.zone0 = Boolean(decodeZoneOccupancy(bytes[2]));
    sample.zone1 = Boolean(decodeZoneOccupancy(bytes[3]));
    sample.zone2 = Boolean(decodeZoneOccupancy(bytes[4]));
    sample.zone3 = Boolean(decodeZoneOccupancy(bytes[5]));
    sample.zone4 = Boolean(decodeZoneOccupancy(bytes[6]));
    sample.zone5 = Boolean(decodeZoneOccupancy(bytes[7]));
    sample.zone6 = Boolean(decodeZoneOccupancy(bytes[8]));
    sample.zone7 = Boolean(decodeZoneOccupancy(bytes[9]));

    occupancy.occupied = false;
    occupancy.occupancy = sample.zoneGobal;
    if (sample.zoneGobal > 0) {
      occupancy.occupied = true;
    }

    let recentOccupancyResult = calculateRecentOccupancy(event.device, event.state, occupancy);
    occupancy = recentOccupancyResult.occupancy;

    emit("state", recentOccupancyResult.state);
    emit("sample", { data: occupancy, topic: "occupancy" });
    emit("sample", { data: sample, topic: "default" });
    emit("sample", { data: lifecycle, topic: "lifecycle" });
  }
}
