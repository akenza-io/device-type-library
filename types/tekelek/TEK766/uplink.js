// Calculates ullage by combining the two values and add offset
function getUllage(ull1, ull2) {
  return ull1 * 256 + ull2;
}
// Calculating the temperature by subtracting the offset
function getTemperature(temp) {
  let base = 0;
  if (temp > 50) {
    base = 256;
  }
  return -(base - temp);
}

function consume(event) {
  const payload = event.data.payload_hex;
  const bits = Bits.hexToBits(payload);
  const data = {};
  const type = Bits.bitsToUnsigned(bits.substr(0, 8));
  // 8-16 prodID
  if (type === 16 || type === 69) {
    data.limit1Exceeded = !!Number(bits.substr(23, 1));
    data.limit2Exceeded = !!Number(bits.substr(22, 1));
    data.limit3Exceeded = !!Number(bits.substr(21, 1));
    // 24 reserved
    let ull1 = Bits.bitsToUnsigned(bits.substr(32, 8));
    let ull2 = Bits.bitsToUnsigned(bits.substr(40, 8));
    data.ullage = getUllage(ull1, ull2);

    let temp = Bits.bitsToUnsigned(bits.substr(48, 8));
    data.temperature = getTemperature(temp);
    data.srssi = Bits.bitsToUnsigned(bits.substr(56, 4));
    data.src = Bits.bitsToUnsigned(bits.substr(60, 4));

    if (type === 16) {
      emit("sample", { data, topic: "measurement" });
    } else {
      emit("sample", { data, topic: "alarm" });
    }

    if (type === 16) {
      const history = {};
      let pointer = 64;
      for (let i = 1; i < 4; i++) {
        ull1 = Bits.bitsToUnsigned(bits.substr(pointer, 8));
        ull2 = Bits.bitsToUnsigned(bits.substr((pointer += 8), 8));
        history[`ullage${i}`] = getUllage(ull1, ull2);

        temp = Bits.bitsToUnsigned(bits.substr((pointer += 8), 8));
        history[`temperature${i}`] = getTemperature(temp);
        history[`srssi${i}`] = Bits.bitsToUnsigned(
          bits.substr((pointer += 8), 4),
        );
        history[`src${i}`] = Bits.bitsToUnsigned(
          bits.substr((pointer += 4), 4),
        );
        pointer += 4;
      }
      emit("sample", { data: history, topic: "measurement_history" });
    } else {
      const history = {};
      ull1 = Bits.bitsToUnsigned(bits.substr(64, 8));
      ull2 = Bits.bitsToUnsigned(bits.substr(72, 8));
      history.ullage = getUllage(ull1, ull2);

      temp = Bits.bitsToUnsigned(bits.substr(80, 8));
      history.temperature = getTemperature(temp);
      history.srssi = Bits.bitsToUnsigned(bits.substr(88, 4));
      history.src = Bits.bitsToUnsigned(bits.substr(96, 4));
      emit("sample", { history, topic: "alarm_history" });
    }
  } else if (type === 48) {
    // 16 reserved
    data.hardwareID = Bits.bitsToUnsigned(bits.substr(24, 8));
    const fmVersionMajor = Bits.bitsToUnsigned(bits.substr(32, 8));
    const fmVersionMinor = Bits.bitsToUnsigned(bits.substr(40, 8));
    data.fmVersion = `${fmVersionMajor}${fmVersionMinor}`;

    const contactReason = Bits.bitsToUnsigned(bits.substr(54, 2));
    if (contactReason === 0) {
      data.contactReason = "RESET";
    } else if (contactReason === 1) {
      data.contactReason = "SCHEDULED";
    } else if (contactReason === 2) {
      data.contactReason = "MANUAL";
    } else if (contactReason === 3) {
      data.contactReason = "ACTIVATION";
    }

    const systemRequestReset = Bits.bitsToUnsigned(bits.substr(51, 3));
    if (systemRequestReset === 0) {
      data.systemRequestReset = "POWER_ON_RESET";
    } else if (systemRequestReset === 1) {
      data.systemRequestReset = "BROWN_OUT_RESET";
    } else if (systemRequestReset === 2) {
      data.systemRequestReset = "EXTERNAL_RESET";
    } else if (systemRequestReset === 3) {
      data.systemRequestReset = "WATCHDOG_RESET";
    } else if (systemRequestReset === 4) {
      data.systemRequestReset = "CORTEX_M3_LOCKUP_RESET";
    } else if (systemRequestReset === 5) {
      data.systemRequestReset = "CORTEX_M3_SYSTEM_REQUEST_RESET";
    } else if (systemRequestReset === 6) {
      data.systemRequestReset = "EM4_RESET";
    } else if (systemRequestReset === 7) {
      data.systemRequestReset = "SYSTEM_HAS_BEEN_IN_BACKUP_MODE";
    }

    data.active = !!Bits.bitsToUnsigned(bits.substr(50, 1));
    // Reserved 56
    // Reserved 72
    data.batteryLevel = Bits.bitsToUnsigned(bits.substr(80, 8));

    const min1 = Bits.bitsToUnsigned(bits.substr(88, 8));
    const min2 = Bits.bitsToUnsigned(bits.substr(96, 8));
    data.measurements = min1 * 256 + min2;
    data.transmitPeriods = Bits.bitsToUnsigned(bits.substr(104, 8));

    const ull1 = Bits.bitsToUnsigned(bits.substr(112, 8));
    const ull2 = Bits.bitsToUnsigned(bits.substr(120, 8));
    data.ullage = getUllage(ull1, ull2);

    const temp = Bits.bitsToUnsigned(bits.substr(128, 8));
    data.temperature = getTemperature(temp);

    data.srssi = Bits.bitsToUnsigned(bits.substr(136, 4));
    data.src = Bits.bitsToUnsigned(bits.substr(140, 4));

    emit("sample", { data, topic: "lifecycle" });
  } else if (type === 67) {
    // 8 Reserved
    const length = bits.length / 4;
    let pointer = 6;
    while (pointer < length) {
      const paramRead = {};
      const dataLength = payload.substr(pointer, 2) * 2;
      paramRead.paramID = payload.substr((pointer += 2), 4);
      paramRead.value = payload.substr((pointer += 4), dataLength);
      pointer += dataLength;
      emit("sample", { data: paramRead, topic: "param_read" });
    }
  }
}
