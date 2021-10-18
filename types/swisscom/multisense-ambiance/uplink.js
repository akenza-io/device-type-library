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
  const data = {};
  const topic = "default";

  data.payloadVersion = Bits.bitsToUnsigned(bits.substr(0, 8));
  data.mode = Bits.bitsToUnsigned(bits.substr(8, 8));
  const status = Number(Bits.bitsToUnsigned(bits.substr(16, 8)));
  const voltage = Bits.bitsToUnsigned(bits.substr(24, 8)) * 6 + 2000;
  data.voltage = voltage / 1000;
  data.batteryLevel = Math.round((voltage - 2000) / 15.24);

  if (port == 3) {
    let pointer = 32;

    while (pointer !== bits.length) {
      const dataId = Bits.bitsToUnsigned(bits.substr(pointer, 8));
      pointer += 8;
      switch (dataId) {
        case 1:
          data.temperature =
            Math.round(
              Bits.bitsToUnsigned(bits.substr(pointer, 16)) * 0.01 * 100,
            ) / 100;
          pointer += 16;
          break;
        case 2:
          data.humidity = Bits.bitsToUnsigned(bits.substr(pointer, 8)) * 0.5;
          pointer += 8;
          break;
        case 3:
          data.reedCounter = Bits.bitsToUnsigned(bits.substr(pointer, 16));
          pointer += 16;
          break;
        case 4:
          data.motionCounter = Bits.bitsToUnsigned(bits.substr(pointer, 16));
          pointer += 16;
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
          break;
        case 7:
          data.humidity = Bits.bitsToUnsigned(bits.substr(pointer, 8)) * 0.5;
          pointer += 8;
          for (let b = 0; b < 7; b++) {
            data[`humHistory${b}`] =
              Bits.bitsToUnsigned(bits.substr(pointer, 8)) * 0.5;
            pointer += 8;
          }
          break;

        default:
          pointer = bits.length;
          break;
      }
    }

    if (data.mode == 1) {
      if (status & 0x80) {
        emit("sample", { data, topic: "usage_start_event" });
      }
      if (status & 0x40) {
        emit("sample", { data, topic: "usage_check_event" });
      }
      if (status & 0x20) {
        emit("sample", { data, topic: "button_event" });
      }
      if (status & 0x10) {
        emit("sample", { data, topic: "life_sign_event" });
      }
    } else {
      if (status & 0x80) {
        emit("sample", {
          data: { temperature: data.temperature, humidity: data.humidity },
          topic: "ambiance",
        });
        delete data.temperature;
        delete data.humidity;
      }
      if (status & 0x40) {
        emit("sample", { data, topic: "button_event" });
      }
      if (status & 0x20) {
        emit("sample", { data, topic: "reed_event" });
      }
      if (status & 0x10) {
        emit("sample", { data, topic: "temp_event" });
      }
      if (status & 0x08) {
        emit("sample", { data, topic: "hum_event" });
      }
      if (status & 0x04) {
        emit("sample", { data, topic: "motion_event" });
      }
      /*
      if (status & 0x02) {
        emit('sample', { data: data, topic: "life_sign_event" });
      } */

      emit("sample", { data, topic: "lifecycle" });
    }
  } else if (port == 100) {
    data.modeSelect = Bits.bitsToUnsigned(bits.substr(56, 8));
    emit("sample", { data, topic: "MODE_CHANGE" });
  }
}
