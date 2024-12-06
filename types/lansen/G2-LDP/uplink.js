function consume(event) {
  const payload = event.data.payloadHex;
  const bits = Bits.hexToBits(payload);
  const lifecycle = {};
  const data = {};


  data.leakage = Bits.bitsToUnsigned(bits.substr(0, 8));
  data.leakage_2 = Bits.bitsToUnsigned(bits.substr(8, 8));
  data.alarmTrigger = Bits.bitsToUnsigned(bits.substr(16, 1));
  data.alarmReset = Bits.bitsToUnsigned(bits.substr(17, 1));
  data.leakageDetected = Bits.bitsToUnsigned(bits.substr(18, 1));
  data.leakageDetected_2 = Bits.bitsToUnsigned(bits.substr(19, 1));
  data.leakageDetectedLast24 = Bits.bitsToUnsigned(bits.substr(20, 1));
  data.leakageDetectedLast24_2 = Bits.bitsToUnsigned(bits.substr(21, 1));
  data.daysSinceLastLeakage = Bits.bitsToUnsigned(bits.substr(22, 13));
  data.durationLastAlarm = Bits.bitsToUnsigned(bits.substr(35, 14));
  data.durationLastAlarm_2 = Bits.bitsToUnsigned(bits.substr(49, 14));

  lifecycle.totalRuntime = Bits.bitsToUnsigned(bits.substr(63, 5));
  lifecycle.runtime = Bits.bitsToUnsigned(bits.substr(68, 5));
  lifecycle.batteryVoltage = Bits.bitsToUnsigned(bits.substr(73, 4)) / 10;
  lifecycle.lowBattery = Bits.bitsToUnsigned(bits.substr(77, 1));
  lifecycle.deviceActivated = Bits.bitsToUnsigned(bits.substr(78, 1));
  lifecycle.asyncMessage = Bits.bitsToUnsigned(bits.substr(79, 1));
  // Unused

  emit("sample", { data, topic: "default" });
  emit("sample", { data: lifecycle, topic: "lifecycle" });
}
