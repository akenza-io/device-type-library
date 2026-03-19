function consume(event) {
  event.data.sensorMessages.forEach((values) => {
    const sample = {};
    const lifecycle = {};

    // Lifecycle
    let timestamp = new Date(values.messageDate); // TODO: Check if this is UTC
    lifecycle.messageId = values.dataMessageGUID;
    lifecycle.state = Number(values.state);
    lifecycle.batteryLevel = Number(values.batteryLevel);
    lifecycle.batteryVoltage = Number(values.voltage);
    lifecycle.signalStrength = Number(values.signalStrength);
    lifecycle.pendingChange = values.pendingChange.toUpperCase() === "TRUE" ? true : false;
    //

    // Split first for |
    const plotLabels = values.plotLabels.split("|");
    const plotValues = values.plotValues.split("|");
    let i = 0;
    plotLabels.forEach((label) => {
      let dataKey = "";
      switch (label) {
        case "Phase1Average":
          dataKey = "currentL1Avg";
          break;
        case "Phase1Max":
          dataKey = "currentL1Max";
          break;
        case "Phase1Min":
          dataKey = "currentL1Min";
          break;
        case "Phase1Duty":
          dataKey = "dutyL1";
          break;
        case "Phase2Average":
          dataKey = "currentL2Avg";
          break;
        case "Phase2Max":
          dataKey = "currentL2Max";
          break;
        case "Phase2Min":
          dataKey = "currentL2Min";
          break;
        case "Phase2Duty":
          dataKey = "dutyL2";
          break;
        case "Phase3Average":
          dataKey = "currentL3Avg";
          break;
        case "Phase3Max":
          dataKey = "currentL3Max";
          break;
        case "Phase3Min":
          dataKey = "currentL3Min";
          break;
        case "Phase3Duty":
          dataKey = "dutyL3";
          break;
        case "TotalCurrentAccumulation":
          dataKey = "totalCurrentAccumulation";
          break;
        case "WattHours":
          dataKey = "wattHours";
          break;
        default:
          dataKey = label[0].toLowerCase() + label.slice(1); // Just standardise if unknown
          break;
      }
      sample[dataKey] = Number(plotValues[i]);
      i++;
    })

    if (Object.values(sample).length > 0) {
      emit("sample", { data: sample, topic: "default", timestamp });
    }

    emit("sample", { data: lifecycle, topic: "lifecycle", timestamp });
  });

  const gateway = {};
  const { gatewayMessage } = event.data

  let timestamp = new Date(gatewayMessage.date); // TODO: Check if this is UTC
  gateway.accountId = gatewayMessage.accountID;
  gateway.messageType = Number(gatewayMessage.messageType);
  gateway.gatewayName = gatewayMessage.gatewayName;
  gateway.signalStrength = Number(gatewayMessage.signalStrength);
  gateway.count = Number(gatewayMessage.count);
  gateway.pendingChange = gatewayMessage.pendingChange.toUpperCase() === "TRUE" ? true : false;
  gateway.networkId = gatewayMessage.networkID;
  gateway.power = Number(gatewayMessage.power);
  gateway.gatewayId = gatewayMessage.gatewayID;
  gateway.batteryLevel = Number(gatewayMessage.batteryLevel);

  emit("sample", { data: gateway, topic: "gateway", timestamp });
}
