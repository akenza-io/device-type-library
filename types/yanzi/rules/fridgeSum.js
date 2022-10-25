function consume(event) {
  let occupancy = 0;

  if (event.type === "uplink") {
    if (
      event.dataSources["1"].data.occupancy > 0 ||
      event.dataSources["2"].data.occupancy > 0
    ) {
      occupancy = 1;
    } else {
      occupancy = 0;
    }

    emit("action", { occupancy });
  }
}
