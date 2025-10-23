function int16(hex) {
  let a = `0x${hex}`;
  a = parseInt(a, 16);
  if ((a & 0x8000) > 0) {
    a -= 0x10000;
  }
  return a;
}

function checkForCustomFields(device, target, norm) {
  if (device !== undefined && device.customFields !== undefined && device.customFields[target] !== undefined) {
    return device.customFields[target];
  }
  return norm;
}

function calculateIncrement(state, currentValue, usageDefinition = 2) {
  let { lastCount } = state;
  let { partialUsage } = state;
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

  // Add new partial usage 
  let newPartialUsage = partialUsage + response.data.increment;
  let remainingPartialUsage = newPartialUsage % usageDefinition;

  // Needs to be done for larger partial usages
  response.data.doorClosings = response.data.increment / (usageDefinition / 2);
  response.data.usageCount = (newPartialUsage - remainingPartialUsage) / usageDefinition;

  // Save not used partial usage for next time
  response.state.partialUsage = remainingPartialUsage;

  return response;
}

function consume(event) {
  const payload = event.data.payloadHex;
  const { port } = event.data;
  const bits = Bits.hexToBits(payload);
  const lifecycle = {};
  const trigger = {};
  const state = event.state || {};
  let topic = "default";

  lifecycle.payloadVersion = Bits.bitsToUnsigned(bits.substr(0, 8));
  lifecycle.mode = Bits.bitsToUnsigned(bits.substr(8, 8));
  const status = Number(Bits.bitsToUnsigned(bits.substr(16, 8)));
  const batteryVoltage = Bits.bitsToUnsigned(bits.substr(24, 8)) * 6 + 2000;
  lifecycle.batteryVoltage = Math.round((batteryVoltage / 1000) * 10) / 10;

  let batteryLevel = 0;
  // Battery level curve with drop off point
  if (batteryVoltage >= 2820) {
    batteryLevel = Math.round(((batteryVoltage - 2820) / 1.9) * 0.8) + 20; // 3010 -- 2820
    if (batteryLevel > 100) {
      batteryLevel = 100;
    }
  } else if (batteryVoltage >= 2550) {
    batteryLevel = Math.round(((batteryVoltage - 2550) / 2.7) * 0.2); // 2820 -- 2550
  }
  lifecycle.batteryLevel = batteryLevel;

  if (port === 3) {
    let pointer = 32;

    while (pointer !== bits.length) {
      const dataId = Bits.bitsToUnsigned(bits.substr(pointer, 8));
      const data = {};
      pointer += 8;
      switch (dataId) {
        case 1:
          data.temperature =
            Math.round(
              Bits.bitsToUnsigned(bits.substr(pointer, 16)) * 0.01 * 100,
            ) / 100;
          pointer += 16;
          topic = "temperature";
          break;
        case 2:
          data.humidity = Bits.bitsToUnsigned(bits.substr(pointer, 8)) * 0.5;
          pointer += 8;
          topic = "humidity";
          break;
        case 3: {
          data.reedCounter = Bits.bitsToUnsigned(bits.substr(pointer, 16));
          pointer += 16;
          topic = "reed_counter";

          const calculated = calculateIncrement(state, data.reedCounter, checkForCustomFields(event.device, "usageCountDivider", 2));
          const { doorClosings, usageCount } = calculated.data;
          data.relativeReedCounter = calculated.data.increment;

          emit("state", calculated.state);
          emit("sample", { data: { doorClosings, usageCount }, topic: "door_count" });
          break;
        } case 4:
          data.motionCounter = Bits.bitsToUnsigned(bits.substr(pointer, 16));
          pointer += 16;
          topic = "motion_counter";
          break;
        case 5:
          var hexPointer = pointer / 4;
          data.accX = int16(payload.substr(hexPointer, 4));
          hexPointer += 4;
          data.accY = int16(payload.substr(hexPointer, 4));
          hexPointer += 4;
          data.accZ = int16(payload.substr(hexPointer, 4));
          hexPointer += 4;
          pointer += 48;
          topic = "acceleration";
          break;
        case 6:
          data.temperature =
            Math.round(
              Bits.bitsToUnsigned(bits.substr(pointer, 16)) * 0.01 * 100,
            ) / 100;
          pointer += 16;
          for (let a = 0; a < 7; a++) {
            data[`tempHistory${a}`] =
              Math.round(
                Bits.bitsToUnsigned(bits.substr(pointer, 16)) * 0.01 * 100,
              ) / 100;
            pointer += 16;
          }
          topic = "temperature_history";
          break;
        case 7:
          data.humidity = Bits.bitsToUnsigned(bits.substr(pointer, 8)) * 0.5;
          pointer += 8;
          for (let b = 0; b < 7; b++) {
            data[`humHistory${b}`] =
              Bits.bitsToUnsigned(bits.substr(pointer, 8)) * 0.5;
            pointer += 8;
          }
          topic = "humidity_history";
          break;
        default:
          pointer = bits.length;
          break;
      }
      emit("sample", { data, topic });
    }

    if (lifecycle.mode === 1) {
      if (status & 0x80) {
        trigger.event = "USAGE_START_EVENT";
      }
      if (status & 0x40) {
        trigger.event = "USAGE_CHECK_EVENT";
      }
      if (status & 0x20) {
        trigger.event = "BUTTON_EVENT";
        emit("sample", { data: { buttonEvent: 1 }, topic: "button_event" });
      }
      if (status & 0x10) {
        trigger.event = "LIFECYCLE";
      }
    } else {
      if (status & 0x80) {
        trigger.event = "TIMED_EVENT";
      }
      if (status & 0x40) {
        trigger.event = "BUTTON_EVENT";
        emit("sample", { data: { buttonEvent: 1 }, topic: "button_event" });
      }
      if (status & 0x20) {
        trigger.event = "REED_EVENT";
      }
      if (status & 0x10) {
        trigger.event = "TEMPERATURE_EVENT";
      }
      if (status & 0x08) {
        trigger.event = "HUMIDITY_EVENT";
      }
      if (status & 0x04) {
        trigger.event = "MOTION_EVENT";
      }
      if (status & 0x02) {
        trigger.event = "LIFECYCLE";
      }
    }
  } else if (port === 100) {
    lifecycle.modeSelect = Bits.bitsToUnsigned(bits.substr(56, 8));
    trigger.event = "MODE_CHANGE";
  }

  emit("sample", { data: trigger, topic: "event" });
  emit("sample", { data: lifecycle, topic: "lifecycle" });
}
