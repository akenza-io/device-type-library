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

function consume(event) {
  const payload = event.data.payloadHex;
  const bits = Bits.hexToBits(payload);
  const { port } = event.data;
  const data = {};
  let occupancy = {};

  if (port === 1 || port === 2) {
    occupancy.occupancy = Bits.bitsToUnsigned(bits.substring(0, 8));
    occupancy.occupied = !!occupancy.occupancy;

    let recentOccupancyResult = calculateRecentOccupancy(event.device, event.state, occupancy);
    occupancy = recentOccupancyResult.occupancy;

    emit("state", recentOccupancyResult.state);
    emit("sample", { data: occupancy, topic: "occupancy" });

    if (payload.length > 2) {
      data.temperature = Bits.bitsToSigned(bits.substring(8, 16));
      emit("sample", { data, topic: "lifecycle" });
    }
  }

  if (port === 3) {
    const resetDict = {
      0x01: "WATCHDOG_RESET",
      0x02: "POWER_ON_RESET",
      0x03: "SYSTEM_REQUEST_RESET",
      0x04: "EXTERNAL_PIN_RESET",
      0x05: "LOCKUP_RESET",
      0x06: "BROWNOUT_RESET",
      0x07: "OTHERS",
    };
    data.debug = payload.substring(0, 20).toUpperCase();
    // Reserved 4
    data.fwVersion = `${Bits.bitsToUnsigned(
      bits.substring(96, 104),
    )}.${Bits.bitsToUnsigned(bits.substring(104, 112))}.${Bits.bitsToUnsigned(
      bits.substring(112, 120),
    )}`;
    const resetCause = Bits.bitsToUnsigned(bits.substring(120, 128));
    data.resetCause = resetDict[resetCause];

    emit("sample", { data, topic: "start_up" });
  }

  if (port === 4) {
    data.devEUI = `${payload.substring(0, 6)}${payload.substring(6, 10)}`;
    data.hwRevision = Bits.bitsToUnsigned(bits.substring(24, 27));
    data.productCode = Bits.bitsToUnsigned(bits.substring(27, 40));
    const prdClassExt = !!Bits.bitsToUnsigned(bits.substring(40, 48));
    if (prdClassExt) {
      data.productClassExt = "EU868";
    } else {
      data.productClassExt = "AS923";
    }

    emit("sample", { data, topic: "info" });
  }

  // Device usage
  if (port === 5) {
    const requestID = Bits.bitsToUnsigned(bits.substring(0, 8));
    switch (requestID) {
      case 0:
        data.usageType = "NR_OF_STATE_CHANGES";
        data.value = Bits.bitsToUnsigned(bits.substring(8, 40));
        break;
      case 1:
        data.usageType = "TIME_IN_OCCUPIED_STATE";
        data.value = Bits.bitsToUnsigned(bits.substring(8, 40));
        break;
      case 2:
        data.usageType = "NR_OF_UPLINKS_SENT";
        data.dr0 = Bits.bitsToUnsigned(bits.substring(8, 32));
        data.dr1 = Bits.bitsToUnsigned(bits.substring(32, 56));
        data.dr2 = Bits.bitsToUnsigned(bits.substring(56, 80));
        data.dr3 = Bits.bitsToUnsigned(bits.substring(80, 104));
        data.dr4 = Bits.bitsToUnsigned(bits.substring(104, 128));
        data.dr5 = Bits.bitsToUnsigned(bits.substring(128, 152));
        break;
      case 3:
        data.usageType = "NR_OF_RADAR_TRIGGERS";
        data.value = Bits.bitsToUnsigned(bits.substring(8, 40));
        break;
      case 4:
        data.usageType = "TIME_RUNNING_SINCE_RESTART";
        data.value = Bits.bitsToUnsigned(bits.substring(8, 40));
        break;
      case 5:
        data.usageType = "NR_OF_RESETS_SINCE_INSTALL";
        data.brownOut = Bits.bitsToUnsigned(bits.substring(8, 16));
        data.lockup = Bits.bitsToUnsigned(bits.substring(16, 24));
        data.extPin = Bits.bitsToUnsigned(bits.substring(24, 32));
        data.powerOn = Bits.bitsToUnsigned(bits.substring(32, 40));
        data.watchdog = Bits.bitsToUnsigned(bits.substring(40, 48));
        data.softwareRequested = Bits.bitsToUnsigned(bits.substring(48, 64));
        break;
      case 6:
        data.usageType = "TIME_RUNNING_SINCE_INSTALL";
        data.value = Bits.bitsToUnsigned(bits.substring(8, 40));
        break;
      default:
        break;
    }

    emit("sample", { data, topic: "device_usage" });
  }
}
