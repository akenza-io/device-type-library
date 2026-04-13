function calculateIncrement(state, currentValue, usageDefinition = 2, doorClosingDefinition = 1) {
  let { lastCount } = state;
  let { partialUsage } = state;
  let { partialDoorClosing } = state;
  let response = { state, data: { increment: 0, usageCount: 0, doorClosings: 0 } }

  // Check if current value exists
  if (currentValue === undefined || Number.isNaN(currentValue)) {
    return response;
  }

  // Init state for last absolute count && Check for the case the counter reseted
  if (lastCount === undefined || lastCount > currentValue) {
    lastCount = currentValue;
  }

  // Calculate increment
  response.data.increment = currentValue - lastCount;
  response.state.lastCount = currentValue;

  // Init state for cycles
  if (partialUsage === undefined || Number.isNaN(partialUsage)) {
    partialUsage = 0;
  }
  if (partialDoorClosing === undefined || Number.isNaN(partialDoorClosing)) {
    partialDoorClosing = 0;
  }

  // Add new partial usage 
  let newPartialUsage = partialUsage + response.data.increment;
  let remainingPartialUsage = newPartialUsage % usageDefinition;
  response.data.usageCount = (newPartialUsage - remainingPartialUsage) / usageDefinition;

  // Add new partial doorClosing
  let newPartialDoorClosing = partialDoorClosing + response.data.increment;
  let remainingPartialDoorClosing = newPartialDoorClosing % doorClosingDefinition;
  response.data.doorClosings = (newPartialDoorClosing - remainingPartialDoorClosing) / doorClosingDefinition;

  // Save not used partial usage for next time
  response.state.partialUsage = remainingPartialUsage;
  response.state.partialDoorClosing = remainingPartialDoorClosing;

  return response;
}

function checkForCustomFields(device, target, norm) {
  if (device !== undefined && device.customFields !== undefined && device.customFields[target] !== undefined) {
    return device.customFields[target];
  }
  return norm;
}

function consume(event) {
  const { payload } = event.data;
  let timestamp = new Date().toISOString();
  const sample = {};
  let topic = "system";
  const state = event.state || {};

  Object.keys(payload).forEach(key => {
    const value = payload[key];
    switch (key) {
      case "timestamp":
        timestamp = value;
        break;
      case "doorPhysicalState":
        topic = "door_state";
        sample.state = value.toUpperCase();
        sample.open = true;

        if (sample.state === "CLOSED") {
          sample.open = false;
        }
        break;
      case "doorLockState":
        topic = "lock";
        sample.state = value.toUpperCase();
        sample.locked = true;

        if (sample.state !== "LOCKED") {
          sample.locked = false;
        }
        break;
      case "doorCycle": {
        topic = "default";
        sample.absoluteCount = value;

        const calculated = calculateIncrement(state, sample.absoluteCount, checkForCustomFields(event.device, "usageCountDivider", 2), 1);
        const { doorClosings, usageCount } = calculated.data;
        sample.relativeCount = calculated.data.increment;

        emit("sample", { data: { doorClosings, usageCount }, topic: "door_count" });
        break;
      } case "pgsPosition":
        topic = "mode_change";
        sample.pgsPosition = value.toUpperCase();
        break;
      case "isConnected":
        topic = "connection_status";
        sample.isConnected = value;
        break;

      case "totalCycles":
        sample.totalCycles = value;
        break;
      case "InstallationLightBarriersUpdated":
        sample.lightBarriers = value["SensorSignals.LightBarriers"];
        break;
      case "InstallationDoorStatusUpdated":
        sample.doorStatus = value["Status.DoorStatus"].toUpperCase();
        break;
      case "InstallationErrorCodeHistoryUpdated":
        sample.errorHistory = value["Errors.ErrorCodeHistory"];
        break;
      case "InstallationIndoorSensorsUpdated":
        sample.indoorSensors = value["SensorSignals.IndoorSensors"];
        break;
      case "InstallationPowerFailUpdated":
        sample.powerFail = value["Alerts.PowerFail"];
        break;
      case "InstallationProgramswitchModeUpdated":
        sample.programSwitchMode = value["Status.ProgramswitchMode"].toUpperCase();
        break;
      case "InstallationDueMaintenanceCyclesUpdated":
        sample.dueMaintenanceCycles = value["Maintenance.DueMaintenanceCycles"];
        break;
      case "InstallationDoorCyclesAfterMaintenanceUpdated":
        sample.cyclesAfterMaintenance = value["Maintenance.DoorCyclesAfterMaintenance"];
        break;
      case "InstallationOperatingHoursBatteryUpdated":
        sample.operatingHoursBattery = value["Maintenance.OperatingHoursBattery"];
        break;
      case "InstallationDoorForcedUpdated":
        sample.doorForced = value["Alerts.DoorForced"];
        break;
      case "InstallationSafetySensorsMCEUpdated":
        sample.safetySensorMCE = value["SensorSignals.SafetySensorsMCE"];
        break;
      case "InstallationSabotageUpdated":
        sample.sabotageDetected = value["Alerts.Sabotage"];
        break;
      case "InstallationDoorCyclesUpdated":
        sample.doorCycles = value["Maintenance.DoorCycles"];
        break;
      case "InstallationOperatingHoursUpdated":
        sample.operatingHours = value["Maintenance.OperatingHours"];
        break;
      case "InstallationCalibrationNecessaryUpdated":
        sample.calibrationNecessary = value["Alerts.CalibrationNecessary"];
        break;
      case "InstallationCurrentErrorsUpdated":
        sample.currentErrros = value["Errors.CurrentErrors"];
        break;
      case "InstallationOutdoorSensorsUpdated":
        sample.outdoorSensors = value["SensorSignals.OutdoorSensors"];
        break;
      case "InstallationDueMaintenanceIntervalUpdated":
        sample.dueMaintenanceInterval = value["Maintenance.DueMaintenanceInterval"];
        break;
      case "InstallationLockStateDoorLockUpdated":
        sample.lockState = value["Status.LockStateDoorLock"].toUpperCase();
        break;
      case "InstallationSafetySensorsSCEUpdated":
        sample.safetySensorMCE = value["SensorSignals.SafetySensorsSCE"];
        break;
      case "InstallationInputSignalsUpdated":
        sample.inputSignals = value["InputSignals"];
        break;
      case "meta":
      case "doorState":
        break;
      default:
        emit("sample", { data: { "errorReason": "UNKNOWN_HEADER", "header": key, "payload": payload }, topic: "error" });
        break;
    }
  });

  // Do not emit duplicate messages
  if (state[topic] == undefined || JSON.stringify(state[topic]) !== JSON.stringify(sample)) {
    emit("sample", { data: sample, topic, timestamp });
  }
  state[topic] = sample;

  emit("state", state);
}