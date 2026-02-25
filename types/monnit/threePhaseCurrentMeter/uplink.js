function consume(event) {
  event.data.sensorMessages.forEach((values) => {
    const sample = {};
    const lifecycle = {};

    let timestamp = new Date(values.messageDate); // TODO: Check if this is UTC
    lifecycle.messageId = values.dataMessageGUID;
    lifecycle.state = Number(values.state);
    lifecycle.batteryLevel = Number(values.batteryLevel);
    lifecycle.batteryVoltage = Number(values.voltage);
    lifecycle.signalStrength = Number(values.signalStrength);
    lifecycle.pendingChange = values.pendingChange.toUpperCase() === "TRUE" ? true : false;

    // Split first for |
    const plotLabels = values.plotLabels.split("|");
    const plotValues = values.plotValues.split("|");
    let i = 0;
    plotLabels.forEach((label) => {
      let datakey = label[0].toLowerCase() + label.slice(1); // Lowercasing starting letter for standardisation
      sample[datakey] = Number(plotValues[i]);
      i++;
    })

    if (Object.values(sample).length > 0) {
      emit("sample", { data: sample, topic: "default", timestamp });
    }

    emit("sample", { data: lifecycle, topic: "lifecycle", timestamp });
  });
}
