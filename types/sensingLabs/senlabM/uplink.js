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

      data.logPeriod = Bits.bitsToUnsigned(bits.substr(112, 16));
      data.txPeriod = Bits.bitsToUnsigned(bits.substr(128, 16));
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
      data.pulse = Bits.bitsToUnsigned(bits.substr(bitsLength - 32, 32));
      break;
    // Log & Wirecut
    case 7:
      lifecycle.batteryLevel = Math.round(
        (Bits.bitsToUnsigned(bits.substr(8, 8)) / 254) * 100,
      );
      data.wireCutStatus = !!Bits.bitsToUnsigned(bits.substr(16, 8));
      // Reserved internal data (Variable length & confidential)
      data.pulse = Bits.bitsToUnsigned(bits.substr(bitsLength - 32, 32));
      break;
    // Log & Wirecut & DUAL Input
    case 10:
      lifecycle.batteryLevel = Math.round(
        (Bits.bitsToUnsigned(bits.substr(8, 8)) / 254) * 100,
      );
      data.wireCutStatus = !!Bits.bitsToUnsigned(bits.substr(16, 8));
      // Reserved internal data (Variable length & confidential)
      data.pulse1 = Bits.bitsToUnsigned(bits.substr(bitsLength - 64, 32));
      data.pulse2 = Bits.bitsToUnsigned(bits.substr(bitsLength - 32, 32));

      topic = "default";
      break;

    default:
      break;
  }

  // Customfields
  if (event.device !== undefined) {
    if (event.device.customFields !== undefined) {
      const { customFields } = event.device;
      let pulseType = "";
      let multiplier = 1;
      let divider = 1;

      if (customFields.pulseType !== undefined) {
        pulseType = event.device.customFields.pulseType;
      }

      if (customFields.multiplier !== undefined) {
        multiplier = Number(event.device.customFields.multiplier);
      }

      if (customFields.divider !== undefined) {
        divider = Number(event.device.customFields.divider);
      }

      if (data.pulse !== undefined) {
        if (pulseType !== "") {
          data[pulseType] =
            Math.round(((data.pulse * multiplier) / divider) * 1000) / 1000;
        }
      }
    }
  }

  emit("sample", { data, topic });

  if (lifecycle.batteryLevel !== undefined) {
    emit("sample", { data: lifecycle, topic: "lifecycle" });
  }
}
