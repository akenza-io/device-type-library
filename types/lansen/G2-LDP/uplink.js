function consume(event) {
  const payload = event.data.payloadHex;
  const bits = Bits.hexToBits(payload);
  const lifecycle = {};
  const data = {};


  data.leakage = Bits.bitsToUnsigned(bits.substring(0, 8));
  data.leakage2 = Bits.bitsToUnsigned(bits.substring(8, 16));
  data.alarmTrigger = Bits.bitsToUnsigned(bits.substring(16, 17));
  data.alarmReset = Bits.bitsToUnsigned(bits.substring(17, 18));
  data.leakageDetected = Bits.bitsToUnsigned(bits.substring(18, 19));
  data.leakageDetected2 = Bits.bitsToUnsigned(bits.substring(19, 20));
  data.leakageDetectedLast24 = Bits.bitsToUnsigned(bits.substring(20, 21));
  data.leakageDetected2Last24 = Bits.bitsToUnsigned(bits.substring(21, 22));
  data.daysSinceLastLeakage = Bits.bitsToUnsigned(bits.substring(22, 35));
  data.durationLastAlarm = Bits.bitsToUnsigned(bits.substring(35, 49));
  data.durationLastAlarm2 = Bits.bitsToUnsigned(bits.substring(49, 63));

  lifecycle.totalRuntime = Bits.bitsToUnsigned(bits.substring(63, 68));
  lifecycle.runtime = Bits.bitsToUnsigned(bits.substring(68, 73));
  lifecycle.batteryVoltage = Bits.bitsToUnsigned(bits.substring(73, 77)) / 10;
  lifecycle.lowBattery = Bits.bitsToUnsigned(bits.substring(77, 78));
  lifecycle.deviceActivated = Bits.bitsToUnsigned(bits.substring(78, 79));
  lifecycle.asyncMessage = Bits.bitsToUnsigned(bits.substring(79, 80));
  // Unused

  emit("sample", { data, topic: "default" });
  emit("sample", { data: lifecycle, topic: "lifecycle" });
}
