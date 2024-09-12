function customPulse(device, pulse, phase) {
  if (pulse !== undefined) {
    // Customfields
    if (device !== undefined) {
      if (device.customFields !== undefined) {
        const { customFields } = device;
        let pulseType = "";
        let multiplier = 1;
        let divider = 1;

        if (customFields[`pulseType${phase}`] !== undefined) {
          pulseType = customFields[`pulseType${phase}`];
        }

        if (customFields[`multiplier${phase}`] !== undefined) {
          multiplier = Number(customFields[`multiplier${phase}`]);
        }

        if (customFields[`divider${phase}`] !== undefined) {
          divider = Number(customFields[`divider${phase}`]);
        }

        if (pulse !== undefined) {
          if (pulseType !== "") {
            return Math.round(((pulse * multiplier) / divider) * 1000) / 1000;
          }
        }
      }
    }
  }
  return false;
}

function calculateValveOpeningTime(valveStatus, openingStart) {
  const response = { durationMessage: false };
  if (valveStatus !== undefined) {
    const now = new Date().getTime();
    if (valveStatus === "OPEN") {
      if (openingStart === undefined || openingStart === null) {
        response.durationMessage = true;
        response.openingTime = now;
      }
    } else if (valveStatus === "CLOSED") {
      if (openingStart !== undefined && openingStart !== null) {
        response.durationMessage = true;
        response.openingTime = undefined;
        response.openDuration = Math.round((now - openingStart) / 1000);
      }
    }
  }

  return response;
}

function readUInt16LE(bytes) {
  const value = (bytes[1] << 8) + bytes[0];
  return value & 0xffff;
}

function readUInt32LE(bytes) {
  const value =
    (bytes[3] << 24) + (bytes[2] << 16) + (bytes[1] << 8) + bytes[0];
  return (value & 0xffffffff) >>> 0;
}

function readProtocolVersion(bytes) {
  const major = (bytes & 0xf0) >> 4;
  const minor = bytes & 0x0f;
  return `v${major}.${minor}`;
}

function readHardwareVersion(bytes) {
  const major = bytes[0] & 0xff;
  const minor = (bytes[1] & 0xff) >> 4;
  return `v${major}.${minor}`;
}

function readFirmwareVersion(bytes) {
  const major = bytes[0] & 0xff;
  const minor = bytes[1] & 0xff;
  return `v${major}.${minor}`;
}

function readSerialNumber(bytes) {
  const temp = [];
  for (let idx = 0; idx < bytes.length; idx++) {
    temp.push(`0${(bytes[idx] & 0xff).toString(16)}`.slice(-2));
  }
  return temp.join("");
}

function readAscii(bytes) {
  let str = "";
  for (let i = 0; i < bytes.length; i++) {
    if (bytes[i] === 0) {
      continue;
    }
    str += String.fromCharCode(bytes[i]);
  }
  return str;
}

function readD2DCommand(bytes) {
  return (
    `0${(bytes[1] & 0xff).toString(16)}`.slice(-2) +
    `0${(bytes[0] & 0xff).toString(16)}`.slice(-2)
  );
}

function isEmpty(obj) {
  if (obj === undefined) {
    return true;
  }
  return Object.keys(obj).length === 0;
}

function calculateIncrement(lastValue, currentValue) {
  // Check if current value exists
  if (currentValue === undefined || Number.isNaN(currentValue)) {
    return 0;
  }

  // Init state && Check for the case the counter reseted
  if (lastValue === undefined || lastValue > currentValue) {
    lastValue = currentValue;
  }
  // Calculate increment
  return currentValue - lastValue;
}

function consume(event) {
  const payload = event.data.payloadHex;
  const bytes = Hex.hexToBytes(payload);
  const state = event.state || {};

  const pulse = {};
  const status = {};
  const pressure = {};
  const gpio = {};
  const rule = {};
  const lifecycle = {};

  for (let i = 0; i < bytes.length; ) {
    const channelId = bytes[i++];
    const channelType = bytes[i++];

    // IPSO VERSION
    if (channelId === 0xff && channelType === 0x01) {
      lifecycle.ipsoVersion = readProtocolVersion(bytes[i]);
      i += 1;
    }
    // HARDWARE VERSION
    else if (channelId === 0xff && channelType === 0x09) {
      lifecycle.hardwareVersion = readHardwareVersion(bytes.slice(i, i + 2));
      i += 2;
    }
    // FIRMWARE VERSION
    else if (channelId === 0xff && channelType === 0x0a) {
      lifecycle.firmwareVersion = readFirmwareVersion(bytes.slice(i, i + 2));
      i += 2;
    }
    // DEVICE STATUS
    else if (channelId === 0xff && channelType === 0x0b) {
      i += 1;
    }
    // LORAWAN CLASS TYPE
    else if (channelId === 0xff && channelType === 0x0f) {
      i += 1;
    }
    // SERIAL NUMBER
    else if (channelId === 0xff && channelType === 0x16) {
      lifecycle.serialNumber = readSerialNumber(bytes.slice(i, i + 8));
      i += 8;
    }
    // BATTERY
    else if (channelId === 0x01 && channelType === 0x75) {
      lifecycle.batteryLevel = bytes[i];
      i += 1;
    }
    // VALVE 1
    else if (channelId === 0x03 && channelType === 0x01) {
      status.valve1 = bytes[i] === 0 ? "CLOSED" : "OPEN";
      i += 1;
    }
    // VALVE 2
    else if (channelId === 0x05 && channelType === 0x01) {
      status.valve2 = bytes[i] === 0 ? "CLOSED" : "OPEN";
      i += 1;
    }
    // VALVE 1 Pulse
    else if (channelId === 0x04 && channelType === 0xc8) {
      pulse.pulse1 = readUInt32LE(bytes.slice(i, i + 4));
      pulse.relativePulse1 = calculateIncrement(state.lastPulse1, pulse.pulse1);
      state.lastPulse1 = pulse.pulse1;
      i += 4;
    }
    // VALVE 2 Pulse
    else if (channelId === 0x06 && channelType === 0xc8) {
      pulse.pulse2 = readUInt32LE(bytes.slice(i, i + 4));
      pulse.relativePulse2 = calculateIncrement(state.lastPulse2, pulse.pulse2);
      state.lastPulse2 = pulse.pulse2;
      i += 4;
    }
    // GPIO 1
    else if (channelId === 0x07 && channelType === 0x01) {
      status.gpio1 = bytes[i] === 0 ? "OFF" : "ON";
      i += 1;
    }
    // GPIO 2
    else if (channelId === 0x08 && channelType === 0x01) {
      status.gpio2 = bytes[i] === 0 ? "OFF" : "ON";
      i += 1;
    }
    // PRESSURE
    else if (channelId === 0x09 && channelType === 0x7b) {
      pressure.pressure = readUInt16LE(bytes.slice(i, i + 2));
      i += 2;
    }
    // CUSTOM MESSAGE
    else if (channelId === 0xff && channelType === 0x12) {
      lifecycle.text = readAscii(bytes.slice(i, bytes.length));
      i = bytes.length;
    }
    // HISTORY
    else if (channelId === 0x20 && channelType === 0xce) {
      const timestamp = new Date(readUInt32LE(bytes.slice(i, i + 4)) * 1000);
      const value = bytes[i + 4];
      const valveStatus = (value & 0x01) === 0 ? "CLOSED" : "OPEN";
      const mode = ((value >> 1) & 0x01) === 0 ? "COUNTER" : "GPIO";
      const gpioStatus = ((value >> 2) & 0x01) === 0 ? "OFF" : "ON";
      const index = ((value >> 4) & 0x01) === 0 ? 1 : 2;
      const pulseValue = readUInt32LE(bytes.slice(i + 5, i + 9));
      const data = {};

      if (mode === "GPIO") {
        data[`valve${index}`] = valveStatus;
        data[`gpio${index}`] = gpioStatus;
        emit("sample", { data, topic: "status", timestamp });
      } else if (mode === "COUNTER") {
        data[`valve${index}`] = valveStatus;
        emit("sample", { data, topic: "status", timestamp });
        emit("sample", {
          data: { [`pulse${index}`]: pulseValue },
          topic: "pulse",
          timestamp,
        });
      }
      i += 9;
    }
    // HISTORY(PIPE PRESSURE)
    else if (channelId === 0x21 && channelType === 0xce) {
      const data = {};
      const timestamp = new Date(readUInt32LE(bytes.slice(i, i + 4)) * 1000);
      data.pressure = readUInt16LE(bytes.slice(i + 4, i + 6));
      i += 6;

      emit("sample", { data, topic: "pressure", timestamp });
    }
    // RULE ENGINE
    else if (channelId === 0xfe && channelType === 0x53) {
      rule.index = bytes[i];
      rule.enabled = bytes[i + 1] !== 0;

      const ruleCondition = {};
      const condition = bytes[i + 2];
      switch (condition) {
        case 0x00:
          ruleCondition.type = "NONE";
          break;
        case 0x01: {
          ruleCondition.type = "TIME_CONDITION";
          ruleCondition.startTime = readUInt32LE(bytes.slice(i + 3, i + 7));
          ruleCondition.endime = readUInt32LE(bytes.slice(i + 7, i + 11));
          ruleCondition.repeatEnabled =
            bytes[i + 11] === 0 ? "DISABLED" : "ENABLED";
          ruleCondition.repeatType = ["MONTHLY", "DAILY", "WEEKLY"][
            bytes[i + 12]
          ];
          const repeatValue = readUInt16LE(bytes.slice(i + 13, i + 15));
          const weekEnums = [
            "MONDAY",
            "TUESDAY",
            "WEDNESDAY",
            "THURSDAY",
            "FRIDAY",
            "SATURDAY",
            "SUNDAY",
          ];
          if (ruleCondition.repeatType === "WEEKLY") {
            ruleCondition.repeatTime = [];
            for (i = 0; i < 7; i++) {
              if ((repeatValue >> i) & (0x01 === 1)) {
                ruleCondition.repeatTime.push(weekEnums[i]);
              }
            }
          } else {
            ruleCondition.repeatStep = weekEnums;
          }
          break;
        }
        case 0x02:
          ruleCondition.type = "D2D_CONDITION";
          ruleCondition.d2dCommand = readD2DCommand(bytes.slice(i + 3, i + 5));
          break;
        case 0x03:
          ruleCondition.type = "TIME_AND_PULSE_THRESHOLD_CONDITION";
          ruleCondition.valveIndex = bytes[i + 3];
          ruleCondition.durationTime = readUInt16LE(bytes.slice(i + 4, i + 6));
          ruleCondition.pulseThreshold = readUInt32LE(
            bytes.slice(i + 6, i + 10),
          );
          break;
        case 0x04:
          ruleCondition.type = "PULSE_THRESHOLD_CONDITION";
          ruleCondition.valveIndex = bytes[i + 3];
          ruleCondition.pulseThreshold = readUInt32LE(
            bytes.slice(i + 4, i + 8),
          );
          break;
        default:
          break;
      }
      i += 15;

      const action = bytes[i];
      const ruleAction = {};
      switch (action) {
        case 0x00:
          ruleAction.type = "NONE";
          break;
        case 0x01:
        case 0x02:
          ruleAction.type = "VALVE_ACTION";
          ruleAction.valveIndex = bytes[i + 1];
          ruleAction.valveStatus = bytes[i + 2] === 0 ? "CLOSE" : "OPEN";
          ruleAction.timeEnabled = bytes[i + 3] === 0 ? "DISABLED" : "ENABLED";
          ruleAction.durationTime = readUInt32LE(bytes.slice(i + 4, i + 8));
          ruleAction.pulseEnabled = bytes[i + 8] === 0 ? "DISABLED" : "ENABLED";
          ruleAction.pulseThreshold = readUInt32LE(bytes.slice(i + 9, i + 13));
          break;
        case 0x03: {
          const type = bytes[i + 1];
          if (type === 0x01) {
            ruleAction.type = "DEVICE_STATUS_REPORT";
            ruleAction.valveIndex = 1;
          } else if (type === 0x02) {
            ruleAction.type = "DEVICE_STATUS_REPORT";
            ruleAction.valveIndex = 2;
          } else if (type === 0x03) {
            ruleAction.type = "CUSTOM_MESSAGE_REPORT";
            ruleAction.text = readAscii(bytes.slice(i + 2, i + 10));
          }
          break;
        }
        default:
          break;
      }
      i += 13;
    } else {
      break;
    }
  }

  if (!isEmpty(pulse)) {
    const customPulse1 = customPulse(event.device, pulse.relativePulse1, 1);
    if (customPulse1 !== false) {
      pulse[event.device.customFields.pulseType1] = customPulse1;
    }

    const customPulse2 = customPulse(event.device, pulse.relativePulse2, 2);
    if (customPulse2 !== false) {
      pulse[event.device.customFields.pulseType2] = customPulse2;
    }

    emit("sample", { data: pulse, topic: "pulse" });
  }

  if (!isEmpty(status)) {
    if (status.valve1 !== undefined || status.valve2 !== undefined) {
      const valveOpeningTime1 = calculateValveOpeningTime(
        status.valve1,
        state.openingTime1,
      );
      if (valveOpeningTime1.durationMessage) {
        state.openingTime1 = valveOpeningTime1.openingTime;
        if (valveOpeningTime1.openDuration !== undefined) {
          emit("sample", {
            data: { openDuration: valveOpeningTime1.openDuration },
            topic: "open_duration_valve_1",
          });
        }
      }

      const valveOpeningTime2 = calculateValveOpeningTime(
        status.valve2,
        state.openingTime2,
      );
      if (valveOpeningTime2.durationMessage) {
        state.openingTime2 = valveOpeningTime2.openingTime;
        if (valveOpeningTime2.openDuration !== undefined) {
          emit("sample", {
            data: { openDuration: valveOpeningTime2.openDuration },
            topic: "open_duration_valve_2",
          });
        }
      }
    }

    emit("sample", { data: status, topic: "status" });
  }

  if (!isEmpty(pressure)) {
    emit("sample", { data: pressure, topic: "pressure" });
  }

  if (!isEmpty(gpio)) {
    emit("sample", { data: gpio, topic: "gpio" });
  }

  if (!isEmpty(lifecycle)) {
    emit("sample", { data: lifecycle, topic: "lifecycle" });
  }

  if (!isEmpty(rule)) {
    emit("sample", { data: rule, topic: "rule" });
  }
  emit("state", state);
}
