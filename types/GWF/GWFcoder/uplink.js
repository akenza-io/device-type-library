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
  const bits = Bits.hexToBits(payload);
  const data = {};
  const lifecycle = {};
  const topic = "default";
  lifecycle.protocolType = Bits.bitsToUnsigned(bits.substring(0, 8));
  lifecycle.manufacturerID = Hex.hexLittleEndianToBigEndian(
    payload.substring(2, 6),
    false,
  );
  lifecycle.meterID = Number(
    `${payload.substring(12, 14)}${payload.substring(10, 12)}${payload.substring(
      8,
      10
    )}${payload.substring(6, 8)}`,
  );
  const meterMedium = Bits.bitsToUnsigned(bits.substring(56, 64));
  if (meterMedium === 3) {
    data.meterMedium = "GAS";
  } else if (meterMedium === 6) {
    data.meterMedium = "WARM_WATER";
  } else if (meterMedium === 7) {
    data.meterMedium = "WATER";
  }
  // State M-Bus
  const appError = Bits.bitsToUnsigned(bits.substring(64, 66));
  if (appError === 0) {
    lifecycle.appError = "NO_ERROR";
  } else if (appError === 1) {
    lifecycle.appError = "APPLICATION_BUSY";
  } else if (appError === 2) {
    lifecycle.appError = "ANY_APPLICATION_ERROR";
  } else if (appError === 3) {
    lifecycle.appError = "RESERVED";
  }
  lifecycle.batteryPowerLow = !!Bits.bitsToUnsigned(bits.substring(66, 67));
  lifecycle.permantError = !!Bits.bitsToUnsigned(bits.substring(67, 68));
  lifecycle.temporaryError = !!Bits.bitsToUnsigned(bits.substring(68, 69));
  lifecycle.commandError1 = !!Bits.bitsToUnsigned(bits.substring(69, 70));
  lifecycle.commandError2 = !!Bits.bitsToUnsigned(bits.substring(70, 71));
  lifecycle.commandError3 = !!Bits.bitsToUnsigned(bits.substring(71, 72));
  data.actualityDuration = Hex.hexLittleEndianToBigEndian(
    payload.substring(18, 22),
    false,
  );
  const volumeVIF = Bits.bitsToUnsigned(bits.substring(88, 96));
  data.volume = Hex.hexLittleEndianToBigEndian(payload.substring(24, 32), false);
  if (volumeVIF === 16) {
    data.volume /= 1000000;
  } else if (volumeVIF === 17) {
    data.volume /= 100000;
  } else if (volumeVIF === 18) {
    data.volume /= 10000;
  } else if (volumeVIF === 19) {
    data.volume /= 1000;
  } else if (volumeVIF === 20) {
    data.volume /= 100;
  } else if (volumeVIF === 21) {
    data.volume /= 10;
  }

  const state = event.state || {};
  data.relativeVolume = calculateIncrement(state.lastVolume, data.volume);
  state.lastVolume = data.volume;

  // Additional functions
  // reserved
  lifecycle.continuousFlow = !!Bits.bitsToUnsigned(bits.substring(129, 130));
  // reserved
  lifecycle.brokenPipe = !!Bits.bitsToUnsigned(bits.substring(131, 132));
  // reserved
  lifecycle.batteryLow = !!Bits.bitsToUnsigned(bits.substring(133, 134));
  lifecycle.backflow = !!Bits.bitsToUnsigned(bits.substring(134, 135));
  lifecycle.noUsage = !!Bits.bitsToUnsigned(bits.substring(135, 136));
  lifecycle.batteryLifetime = Bits.bitsToUnsigned(
    bits.substring(140, 141) +
    bits.substring(139, 140) +
    bits.substring(138, 139) +
    bits.substring(137, 138) +
    bits.substring(136, 137),
  );
  lifecycle.batteryLifetime *= 6; // semester to months
  lifecycle.loraLinkError = !!Bits.bitsToUnsigned(bits.substring(135, 136));
  // reserved
  // reserved
  emit("sample", { data, topic });
  emit("sample", { data: lifecycle, topic: "lifecycle" });
  emit("state", state);
}
