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
    occupancy.occupiedOrRecentlyUsed = true;
  } else {
    occupancy.occupancyStatus = "FREE";
    occupancy.occupiedOrRecentlyUsed = false;
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
    occupancy.occupiedOrRecentlyUsed = true;
    occupancy.occupancyStatus = "WARM";
  } else {
    occupancy.warm = false;
    occupancy.occupiedOrRecentlyUsed = occupancy.occupied;
  }
  return { state, occupancy }
}

function consume(event) {
  const payload = event.data.payloadHex;
  const bits = Bits.hexToBits(payload);
  let topic = "default";

  if (payload !== "") {
    for (let pointer = 0; pointer < bits.length;) {
      const channel = Bits.bitsToUnsigned(bits.substr(pointer, 8));
      let data = {};
      pointer += 16;

      switch (channel) {
        case 1:
          // Recalibrate Response
          if (Bits.bitsToUnsigned(bits.substr(pointer, 8)) === 1) {
            data.recalibrateResponse = "SUCCESSFUL";
          } else {
            data.recalibrateResponse = "FAILED";
          }
          topic = "recalibrate_response";
          break;
        case 2:
          // Temperature
          data.temperature = Bits.bitsToSigned(bits.substr(pointer, 16)) * 0.1;
          pointer += 8;
          topic = "temperature";
          break;
        case 3:
          // Battery
          data.batteryVoltage =
            Bits.bitsToUnsigned(bits.substr(pointer, 16)) * 0.01;
          pointer += 8;
          topic = "battery";
          break;
        case 5:
          // PNI Internal*
          topic = "contact_pni";
          break;
        case 6:
          // PNI Internal*
          data.hex = payload;
          topic = "contact_pni";
          break;
        case 21: {
          // Parking Status
          if (Bits.bitsToUnsigned(bits.substr(pointer, 8)) === 1) {
            data.occupancy = 1;
            data.occupied = true;
          } else {
            data.occupancy = 0;
            data.occupied = false;
          }

          let recentOccupancyResult = calculateRecentOccupancy(event.device, event.state, data);
          data = recentOccupancyResult.occupancy;

          emit("state", recentOccupancyResult.state);
          topic = "occupancy";
          break;
        } case 28:
          // Deactivate Response
          data.deactivate = "done";
          break;
        case 33:
          // Vehicle Count
          if (Bits.bitsToUnsigned(bits.substr(pointer, 8)) === 128) {
            data.reboot = "RECALIBRATION";
            topic = "reboot";
          } else {
            data.vehicleCount = Bits.bitsToUnsigned(bits.substr(pointer, 8));
            topic = "vehicle_count";
          }
          break;
        case 55: {
          // Keep-Alive
          if (Bits.bitsToUnsigned(bits.substr(pointer, 8)) === 1) {
            data.occupancy = 1;
            data.occupied = true;
          } else {
            data.occupancy = 0;
            data.occupied = false;
          }

          let recentOccupancyResult = calculateRecentOccupancy(event.device, event.state, data);
          data = recentOccupancyResult.occupancy;

          emit("state", recentOccupancyResult.state);
          topic = "occupancy";
          break;
        } case 63:
          // Reboot Response
          data.reboot = "DONE";
          topic = "reboot";
          break;
        default:
        // Should not be needed
      }
      pointer += 8;
      emit("sample", { data, topic });
    }
  } else {
    emit("sample", { data: { startup: "startup" }, topic: "startup" });
  }
}
