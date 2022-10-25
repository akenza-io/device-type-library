function consume(event) {
  if (event.type === "uplink") {
    const { data } = event.dataSources[1];
    Object.keys(data).forEach((key) => {
      if (key !== "free" && key !== "occupied") {
        emit("action", { id: key, occupied: data[key] }); // HTTP Output
      }
    });
  }
}
