function toLittleEndianSigned(hex) {
  // Creating little endian hex DCBA
  const hexArray = [];
  let tempHex = hex;
  while (tempHex.length >= 2) {
    hexArray.push(tempHex.substring(0, 2));
    tempHex = tempHex.substring(2, tempHex.length);
  }
  hexArray.reverse();
  // To signed
  return Bits.bitsToSigned(Bits.hexToBits(hexArray.join("")));
}

function consume(event) {
  const payload = event.data.payload_hex;
  const bits = Bits.hexToBits(payload);
  const data = {};
  const lifecycle = {};
  const topic = "default";

  lifecycle.version = Bits.bitsToUnsigned(bits.substr(0, 8));
  lifecycle.manufacturerID = Bits.bitsToUnsigned(bits.substr(8, 8)); // LSB
  lifecycle.meterID = Bits.bitsToUnsigned(bits.substr(16, 32)); // BCD
  const meterMedium = Bits.bitsToUnsigned(bits.substr(48, 8));
  if (meterMedium === 3) {
    lifecycle.meterMedium = "GAS";
  } else if (meterMedium === 6) {
    lifecycle.meterMedium = "WARM_WATER";
  } else if (meterMedium === 7) {
    lifecycle.meterMedium = "WATER";
  }

  // State M-Bus
  const appError = Bits.bitsToUnsigned(bits.substr(56, 2));
  if (appError === 0) {
    lifecycle.appError = "NO_ERROR";
  } else if (appError === 1) {
    lifecycle.appError = "APPLICATION_BUSY";
  } else if (appError === 2) {
    lifecycle.appError = "ANY_APPLICATION_ERROR";
  } else if (appError === 3) {
    lifecycle.appError = "RESERVED";
  }
  lifecycle.powerLow = !!Bits.bitsToUnsigned(bits.substr(58, 1));
  lifecycle.permantError = !!Bits.bitsToUnsigned(bits.substr(59, 1));
  lifecycle.temporaryError = !!Bits.bitsToUnsigned(bits.substr(60, 1));
  lifecycle.commandError1 = !!Bits.bitsToUnsigned(bits.substr(61, 1));
  lifecycle.commandError2 = !!Bits.bitsToUnsigned(bits.substr(62, 1));
  lifecycle.commandError3 = !!Bits.bitsToUnsigned(bits.substr(63, 1));

  data.actualityDuration = Bits.bitsToUnsigned(bits.substr(64, 16)); // LSB
  data.volumeVIF = Bits.bitsToUnsigned(bits.substr(80, 8));
  data.volume = Bits.bitsToUnsigned(bits.substr(88, 16)); // LSB + MSB ?

  // Additional functions
  // reserved
  lifecycle.continuousFlow = !!Bits.bitsToUnsigned(bits.substr(105, 1));
  lifecycle.reserve = !!Bits.bitsToUnsigned(bits.substr(104, 1));
  lifecycle.reserve = !!Bits.bitsToUnsigned(bits.substr(104, 1));
  lifecycle.reserve = !!Bits.bitsToUnsigned(bits.substr(104, 1));
  lifecycle.reserve = !!Bits.bitsToUnsigned(bits.substr(104, 1));
  lifecycle.reserve = !!Bits.bitsToUnsigned(bits.substr(104, 1));
  lifecycle.reserve = !!Bits.bitsToUnsigned(bits.substr(104, 1));
  lifecycle.reserve = !!Bits.bitsToUnsigned(bits.substr(104, 1));

  // data.temperature = Bits.bitsToSigned(bits.substr(40, 16)) / 100;

  emit("sample", { data, topic });
  emit("sample", { data: lifecycle, topic: "lifecycle" });
}
