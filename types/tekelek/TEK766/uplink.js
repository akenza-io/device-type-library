function getUllage(ull1, ull2) {
  return ull1 * 256 + ull2;
}
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
  let data = {};
  let topic = "default";
  const type = Bits.bitsToUnsigned(bits.substr(0, 8));
  // 8-16 prodID
  if (type === 16 || type === 69) {
    data.limit1 = !!Number(bits.substr(23, 1));
    data.limit2 = !!Number(bits.substr(22, 1));
    data.limit3 = !!Number(bits.substr(21, 1));
    // 24 reserved
    let ull1 = Bits.bitsToUnsigned(bits.substr(32, 8));
    let ull2 = Bits.bitsToUnsigned(bits.substr(40, 8));
    data.ullage = getUllage(ull1, ull2);

    let temp = Bits.bitsToUnsigned(bits.substr(48, 8));
    data.temperature = getTemperature(temp);
    data.srssi = Bits.bitsToUnsigned(bits.substr(56, 4));
    data.src = Bits.bitsToUnsigned(bits.substr(60, 4));

    if (type === 16) {
      emit("sample", { data, topic: "current" });

      topic = "measurement_history";
      data = {};
      let pointer = 64;
      for (let i = 1; i < 4; i++) {
        ull1 = Bits.bitsToUnsigned(bits.substr(pointer, 8));
        ull2 = Bits.bitsToUnsigned(bits.substr((pointer += 8), 8));
        data[`ullage${i}`] = getUllage(ull1, ull2);

        temp = Bits.bitsToUnsigned(bits.substr((pointer += 8), 8));
        data[`temperature${i}`] = getTemperature(temp);
        data[`srssi${i}`] = Bits.bitsToUnsigned(bits.substr((pointer += 8), 4));
        data[`src${i}`] = Bits.bitsToUnsigned(bits.substr((pointer += 4), 4));
        pointer += 4;
      }
    } else {
      emit("sample", { data, topic: "current_alarm" });

      topic = "alarm_history";
      data = {};
      ull1 = Bits.bitsToUnsigned(bits.substr(64, 8));
      ull2 = Bits.bitsToUnsigned(bits.substr(72, 8));
      data.ullage = getUllage(ull1, ull2);

      temp = Bits.bitsToUnsigned(bits.substr(80, 8));
      data.temperature = getTemperature(temp);
      data.srssi = Bits.bitsToUnsigned(bits.substr(88, 4));
      data.src = Bits.bitsToUnsigned(bits.substr(96, 4));
    }
  } else if (type === 48) {
    topic = "lifecycle";
    // 16 reserved
    data.hardwareID = Bits.bitsToUnsigned(bits.substr(24, 8));
    data.fmVersion = `${Bits.bitsToUnsigned(
      bits.substr(32, 8),
    )}.${Bits.bitsToUnsigned(bits.substr(40, 8))}`;
    data.manualContact = Bits.bitsToUnsigned(bits.substr(54, 2));
    data.systemRequestReset = Bits.bitsToUnsigned(bits.substr(51, 3));
    data.aktive = Bits.bitsToUnsigned(bits.substr(50, 1));
    // Reserved 56
    data.RSSI = -Bits.bitsToUnsigned(bits.substr(64, 8));
    // Reserved 72
    data.battery = Bits.bitsToUnsigned(bits.substr(80, 8));

    const min1 = Bits.bitsToUnsigned(bits.substr(88, 8));
    const min2 = Bits.bitsToUnsigned(bits.substr(96, 8));
    data.meassurements = min1 * 256 + min2;
    data.transmitPeriods = Bits.bitsToUnsigned(bits.substr(104, 8));

    const ull1 = Bits.bitsToUnsigned(bits.substr(112, 8));
    const ull2 = Bits.bitsToUnsigned(bits.substr(120, 8));
    data.ullage = getUllage(ull1, ull2);

    const temp = Bits.bitsToUnsigned(bits.substr(128, 8));
    data.temperature = getTemperature(temp);

    data.srssi = Bits.bitsToUnsigned(bits.substr(136, 4));
    data.src = Bits.bitsToUnsigned(bits.substr(140, 4));
  } else if (type === 67) {
    // 16 Reserved
    topic = "param_read";
  } else if (type === 71) {
    topic = "diagnostic_read";
  }

  emit("sample", { data, topic });
}
