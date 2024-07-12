function incrementValue(lastPulse, pulse) {
  // Init state && Check for the case the counter reseted
  if (lastPulse === undefined || lastPulse > pulse) {
    lastPulse = pulse;
  }
  // Calculate increment
  return pulse - lastPulse;
}

function customPulse(cPulseType, cMultiplier, cDivider, pulse) {
  let pulseType = "";
  let multiplier = 1;
  let divider = 1;
  let value = 0;

  if (cPulseType !== undefined) {
    pulseType = cPulseType;
  }

  if (cMultiplier !== undefined) {
    multiplier = Number(cMultiplier);
  }

  if (cDivider !== undefined) {
    divider = Number(cDivider);
  }

  if (pulseType !== "") {
    value = Math.round(((pulse * multiplier) / divider) * 1000) / 1000;
    return [true, pulseType, value];
  }
}

function consume(event) {
  const payload = event.data.payloadHex;
  const bits = Bits.hexToBits(payload);
  const data = {};
  const lifecycle = {};
  let topic = "default";

  const type = Bits.bitsToUnsigned(bits.substr(0, 8));
  const bitsLength = bits.length;

  switch (type) {
    // Startup
    case 0: {
      // Dev Eui 64 Reserved
      const appType = Bits.bitsToUnsigned(bits.substr(72, 8));
      switch (appType) {
        case 0x41:
          data.appType = "SENLABA";
          break;
        case 0x44:
          data.appType = "SENLABD";
          break;
        case 0x48:
          data.appType = "SENLABH";
          break;
        case 0x4d:
          data.appType = "SENLABM";
          break;
        case 0x4f:
          data.appType = "SENLABO";
          break;
        case 0x50:
          data.appType = "SENLABP";
          break;
        case 0x54:
          data.appType = "SENLABT";
          break;
        case 0x56:
          data.appType = "SENLABV";
          break;
        default:
          break;
      }

      data.firmwareVersion = `${Bits.bitsToUnsigned(
        bits.substr(80, 8),
      )}.${Bits.bitsToUnsigned(bits.substr(88, 8))}.${Bits.bitsToUnsigned(
        bits.substr(96, 8),
      )}`;

      if (Bits.bitsToUnsigned(bits.substr(104, 8))) {
        data.functionMode = "BASIC";
      } else {
        data.functionMode = "OTHER";
      }

      data.logPeriod = Bits.bitsToUnsigned(bits.substr(112, 16)) * 2;
      data.txPeriod = Bits.bitsToUnsigned(bits.substr(128, 16)) * 2;
      data.randWindow = Bits.bitsToUnsigned(bits.substr(144, 16));
      data.redundancyFactor = Bits.bitsToUnsigned(bits.substr(160, 8));
      topic = "system";
      break;
    }
    // Log
    case 2:
      lifecycle.batteryLevel = Math.round(
        (Bits.bitsToUnsigned(bits.substr(8, 8)) / 254) * 100,
      );
      // Reserved internal data (Variable length & confidential)
      data.pulseCumulutaive = Bits.bitsToUnsigned(
        bits.substr(bitsLength - 32, 32),
      );
      break;
    // Log & Wirecut
    case 7:
      lifecycle.batteryLevel = Math.round(
        (Bits.bitsToUnsigned(bits.substr(8, 8)) / 254) * 100,
      );
      data.wireCutStatus = !!Bits.bitsToUnsigned(bits.substr(16, 8));
      // Reserved internal data (Variable length & confidential)
      data.pulseCumulutaive = Bits.bitsToUnsigned(
        bits.substr(bitsLength - 32, 32),
      );
      break;
    // Log & Wirecut & DUAL Input
    case 10:
      lifecycle.batteryLevel = Math.round(
        (Bits.bitsToUnsigned(bits.substr(8, 8)) / 254) * 100,
      );
      data.wireCutStatus = !!Bits.bitsToUnsigned(bits.substr(16, 8));
      // Reserved internal data (Variable length & confidential)
      data.pulseCumulutaive1 = Bits.bitsToUnsigned(
        bits.substr(bitsLength - 64, 32),
      );
      data.pulseCumulutaive2 = Bits.bitsToUnsigned(
        bits.substr(bitsLength - 32, 32),
      );

      topic = "default";
      break;

    default:
      break;
  }

  if (data.pulseCumulutaive !== undefined) {
    data.pulse = incrementValue(event.state.lastPulse, data.pulseCumulutaive);
    event.state.lastPulse = data.pulseCumulutaive;
  }

  if (data.pulseCumulutaive1 !== undefined) {
    data.pulse1 = incrementValue(
      event.state.lastPulse1,
      data.pulseCumulutaive1,
    );
    event.state.lastPulse1 = data.pulseCumulutaive1;
  }

  if (data.pulseCumulutaive2 !== undefined) {
    data.pulse2 = incrementValue(
      event.state.lastPulse2,
      data.pulseCumulutaive2,
    );
    event.state.lastPulse2 = data.pulseCumulutaive2;
  }

  // Customfields for calculation and key name
  if (event.device !== undefined) {
    if (event.device.customFields !== undefined) {
      const { customFields } = event.device;
      let res = [false];
      if (data.pulse !== undefined) {
        res = customPulse(
          customFields.pulseType,
          customFields.multiplier,
          customFields.divider,
          data.pulse,
        );

        if (res[0]) {
          data[res[1]] = res[2];
        }
      }

      if (data.pulse1 !== undefined) {
        res = customPulse(
          customFields.pulseType1,
          customFields.multiplier1,
          customFields.divider1,
          data.pulse1,
        );

        if (res[0]) {
          data[res[1]] = res[2];
        }
      }

      if (data.pulse2 !== undefined) {
        res = customPulse(
          customFields.pulseType2,
          customFields.multiplier2,
          customFields.divider2,
          data.pulse2,
        );

        if (res[0]) {
          data[res[1]] = res[2];
        }
      }
    }
  }

  emit("state", event.state);
  emit("sample", { data, topic });

  if (lifecycle.batteryLevel !== undefined) {
    emit("sample", { data: lifecycle, topic: "lifecycle" });
  }
}
