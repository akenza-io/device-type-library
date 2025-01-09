function isEmpty(obj) {
  return Object.keys(obj).length === 0;
}

function consume(event) {
  const payload = event.data.payloadHex;
  const bytes = Hex.hexToBytes(payload);
  const decoded = {};
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

      // Warm desk 
      const time = new Date().getTime();
      const state = event.state || {};
      decoded.minutesSinceLastOccupied = 0; // Always give out minutesSinceLastOccupied for consistancy
      if (decoded.occupied) {
        delete state.lastOccupancyTimestamp; // Delete last occupancy timestamp
      } else if (state.lastOccupancyTimestamp !== undefined) {
        decoded.minutesSinceLastOccupied = Math.round((time - state.lastOccupancyTimestamp) / 1000 / 60); // Get free since
      } else if (state.lastOccupancyValue) { //
        state.lastOccupancyTimestamp = time; // Start with first no occupancy
      }

      if (Number.isNaN(decoded.minutesSinceLastOccupied)) {
        decoded.minutesSinceLastOccupied = 0;
      }
      state.lastOccupancyValue = decoded.occupied;
      emit("state", state);
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
