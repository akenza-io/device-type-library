function int16(hex) {
  let a = `0x${hex}`;
  a = parseInt(a, 16);
  if ((a & 0x8000) > 0) {
    a -= 0x10000;
  }
  return a;
}

function consume(event) {
  const payload = event.data.payloadHex;
  const { port } = event.data;
  const bits = Bits.hexToBits(payload);
  const lifecycle = {};
  const trigger = {};
  let topic = "default";

  lifecycle.payloadVersion = Bits.bitsToUnsigned(bits.substr(0, 8));
  lifecycle.mode = Bits.bitsToUnsigned(bits.substr(8, 8));
  const status = Number(Bits.bitsToUnsigned(bits.substr(16, 8)));
  const batteryVoltage = Bits.bitsToUnsigned(bits.substr(24, 8)) * 6 + 2000;
  lifecycle.batteryVoltage = Math.round((batteryVoltage / 1000) * 10) / 10;
  let batteryLevel = Math.round((batteryVoltage - 2000) / 15.24);

  if (batteryLevel > 100) {
    batteryLevel = 100;
  } else if (batteryLevel < 0) {
    batteryLevel = 0;
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
        case 3:
          data.reedCounter = Bits.bitsToUnsigned(bits.substr(pointer, 16));
          pointer += 16;
          topic = "reed_counter";
          break;
        case 4:
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
