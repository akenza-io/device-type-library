function consume(event) {
  const payload = event.data.payloadHex;
  const bits = Bits.hexToBits(payload);
  const data = {};
  const alarm = {};
  const lifecycle = {};

  // Length 0,8
  // Send no reply 8,8
  lifecycle.manufacturerCode = `${payload.substring(6, 8)}${payload.substring(4, 6)}`;
  lifecycle.moduleNumber = `${payload.substring(14, 16)}${payload.substring(
    12,
    14
  )}${payload.substring(10, 12)}${payload.substring(8, 10)}`;
  lifecycle.versionNumber = parseInt(payload.substring(16, 18), 16);
  lifecycle.systemComponent = parseInt(payload.substring(18, 20), 16);
  lifecycle.meterAddress = `${payload.substring(28, 30)}${payload.substring(
    26,
    28
  )}${payload.substring(24, 26)}${payload.substring(22, 24)}`;
  // ManufacturerCode gets sent twice
  lifecycle.meterVersion = parseInt(payload.substring(34, 36), 16);
  lifecycle.waterType = parseInt(payload.substring(36, 38), 16);
  lifecycle.transmitionCounter = parseInt(payload.substring(38, 40), 16);
  lifecycle.statusField = parseInt(payload.substring(40, 42), 16);
  lifecycle.configuration = parseInt(payload.substring(42, 46), 16);

  // dif 184,8
  // vif 192,8
  data.volume = Hex.hexLittleEndianToBigEndian(payload.substring(50, 58), false);
  data.volumeM3 = data.volume / 1000;

  // dif 232,16
  // vif 248,8
  data.backflow = Hex.hexLittleEndianToBigEndian(payload.substring(64, 72), false);

  // dif 288,8
  // vif 296,16
  alarm.tamperAlarm = !!Bits.bitsToUnsigned(bits.substring(327, 328));
  alarm.burstAlarm = !!Bits.bitsToUnsigned(bits.substring(325, 326));
  alarm.leak = !!Bits.bitsToUnsigned(bits.substring(324, 325));
  alarm.noConsumption = !!Bits.bitsToUnsigned(bits.substring(320, 321));
  alarm.batteryLow = !!Bits.bitsToUnsigned(bits.substring(319, 320));
  alarm.reverseFlow = !!Bits.bitsToUnsigned(bits.substring(318, 319));
  alarm.overflow = !!Bits.bitsToUnsigned(bits.substring(317, 318));

  // dif 328,8
  // vif 336,16
  lifecycle.batteryLifetime = Hex.hexLittleEndianToBigEndian(
    payload.substring(88, 92),
    false,
  );
  emit("sample", { data, topic: "default" });
  emit("sample", { data: alarm, topic: "alarm" });
  emit("sample", { data: lifecycle, topic: "lifecycle" });
}
