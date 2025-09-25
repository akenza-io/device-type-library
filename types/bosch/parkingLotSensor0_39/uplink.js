function cToF(celsius) { 
 return Math.round(((celsius * 9) / 5 + 32) * 10) / 10; 
 } 

function consume(event) {
  const payload = event.data.payloadHex;
  const bits = Bits.hexToBits(payload);
  const { port } = event.data;
  const data = {};
  const occupancy = {};

  if (port === 1 || port === 2) {
    occupancy.occupancy = Bits.bitsToUnsigned(bits.substr(0, 8));
    occupancy.occupied = !!occupancy.occupancy;

    // Warm desk 
    const time = new Date().getTime();
    const state = event.state || {};
    occupancy.minutesSinceLastOccupied = 0; // Always give out minutesSinceLastOccupied for consistancy
    if (occupancy.occupied) {
      delete state.lastOccupancyTimestamp; // Delete last occupancy timestamp
    } else if (state.lastOccupancyTimestamp !== undefined) {
      occupancy.minutesSinceLastOccupied = Math.round((time - state.lastOccupancyTimestamp) / 1000 / 60); // Get free since
    } else if (state.lastOccupiedValue) { //
      state.lastOccupancyTimestamp = time; // Start with first no occupancy
    }

    if (Number.isNaN(occupancy.minutesSinceLastOccupied)) {
      occupancy.minutesSinceLastOccupied = 0;
    }
    state.lastOccupiedValue = occupancy.occupied;
    emit("state", state);

    if (payload.length > 2) {
      data.temperature = Bits.bitsToSigned(bits.substr(8, 8));
 data.temperatureF = cToF(data.temperature);
      emit("sample", { data, topic: "lifecycle" });
    }
    emit("sample", { data: occupancy, topic: "occupancy" });
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
      bits.substr(96, 8),
    )}.${Bits.bitsToUnsigned(bits.substr(104, 8))}.${Bits.bitsToUnsigned(
      bits.substr(112, 8),
    )}`;
    const resetCause = Bits.bitsToUnsigned(bits.substr(120, 8));
    data.resetCause = resetDict[resetCause];

    emit("sample", { data, topic: "start_up" });
  }

  if (port === 4) {
    data.devEUI = `${payload.substring(0, 6)}${payload.substring(6, 10)}`;
    data.hwRevision = Bits.bitsToUnsigned(bits.substr(24, 3));
    data.productCode = Bits.bitsToUnsigned(bits.substr(27, 13));
    const prdClassExt = !!Bits.bitsToUnsigned(bits.substr(40, 8));
    if (prdClassExt) {
      data.productClassExt = "EU868";
    } else {
      data.productClassExt = "AS923";
    }

    emit("sample", { data, topic: "info" });
  }

  // Device usage
  if (port === 5) {
    const requestID = Bits.bitsToUnsigned(bits.substr(0, 8));
    switch (requestID) {
      case 0:
        data.usageType = "NR_OF_STATE_CHANGES";
        data.value = Bits.bitsToUnsigned(bits.substr(8, 32));
        break;
      case 1:
        data.usageType = "TIME_IN_OCCUPIED_STATE";
        data.value = Bits.bitsToUnsigned(bits.substr(8, 32));
        break;
      case 2:
        data.usageType = "NR_OF_UPLINKS_SENT";
        data.dr0 = Bits.bitsToUnsigned(bits.substr(8, 24));
        data.dr1 = Bits.bitsToUnsigned(bits.substr(32, 24));
        data.dr2 = Bits.bitsToUnsigned(bits.substr(56, 24));
        data.dr3 = Bits.bitsToUnsigned(bits.substr(80, 24));
        data.dr4 = Bits.bitsToUnsigned(bits.substr(104, 24));
        data.dr5 = Bits.bitsToUnsigned(bits.substr(128, 24));
        break;
      case 3:
        data.usageType = "NR_OF_RADAR_TRIGGERS";
        data.value = Bits.bitsToUnsigned(bits.substr(8, 32));
        break;
      case 4:
        data.usageType = "TIME_RUNNING_SINCE_RESTART";
        data.value = Bits.bitsToUnsigned(bits.substr(8, 32));
        break;
      case 5:
        data.usageType = "NR_OF_RESETS_SINCE_INSTALL";
        data.brownOut = Bits.bitsToUnsigned(bits.substr(8, 8));
        data.lockup = Bits.bitsToUnsigned(bits.substr(16, 8));
        data.extPin = Bits.bitsToUnsigned(bits.substr(24, 8));
        data.powerOn = Bits.bitsToUnsigned(bits.substr(32, 8));
        data.watchdog = Bits.bitsToUnsigned(bits.substr(40, 8));
        data.softwareRequested = Bits.bitsToUnsigned(bits.substr(48, 16));
        break;
      case 6:
        data.usageType = "TIME_RUNNING_SINCE_INSTALL";
        data.value = Bits.bitsToUnsigned(bits.substr(8, 32));
        break;
      default:
        break;
    }

    emit("sample", { data, topic: "device_usage" });
  }
}
