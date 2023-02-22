function consume(event) {
  const payload = event.data.payloadHex;
  const bits = Bits.hexToBits(payload);
  const data = {};
  const alarm = {};
  const status = {};

  // Length // 2D
  // Send no reply // 44
  status.manufacturerCode = `${payload.substr(6, 2)}${payload.substr(4, 2)}`;
  status.moduleNumber = `${payload.substr(14, 2)}${payload.substr(
    12,
    2,
  )}${payload.substr(10, 2)}${payload.substr(8, 2)}`;
  status.versionNumber = payload.substr(16, 2);
  status.systemComponent = payload.substr(18, 2);
  // data.longTelegram = payload.substr(18, 2);
  status.meterAddress = `${payload.substr(28, 2)}${payload.substr(
    26,
    2,
  )}${payload.substr(24, 2)}${payload.substr(22, 2)}`;
  status.manufacturerCode = `${payload.substr(32, 2)}${payload.substr(30, 2)}`;
  status.meterVersion = payload.substr(34, 2);
  status.water = payload.substr(36, 2);
  status.transmitionCounter = payload.substr(38, 2);
  status.statusField = payload.substr(40, 2);
  status.configuration = payload.substr(42, 4);

  // data.dif = Bits.bitsToUnsigned(bits.substr(184, 8)); // 04
  // data.vif = Bits.bitsToUnsigned(bits.substr(192, 8)); // 13

  data.volumen = Hex.hexLittleEndianToBigEndian(payload.substr(50, 8), false);

  // data.dif = Bits.bitsToUnsigned(bits.substr(232, 16)); // 84 10
  // data.vif = Bits.bitsToUnsigned(bits.substr(248, 8)); // 13
  data.backflow = Hex.hexLittleEndianToBigEndian(payload.substr(64, 8), false);

  // data.dif = Bits.bitsToUnsigned(bits.substr(288, 8)); // 02
  // data.vif = Bits.bitsToUnsigned(bits.substr(296, 16)); // FD 17

  alarm.tamper = !!Bits.bitsToUnsigned(bits.substr(327, 1));
  alarm.burst = !!Bits.bitsToUnsigned(bits.substr(325, 1));
  alarm.leak = !!Bits.bitsToUnsigned(bits.substr(324, 1));
  alarm.noConsumption = !!Bits.bitsToUnsigned(bits.substr(320, 1));
  alarm.batteryLow = !!Bits.bitsToUnsigned(bits.substr(319, 1));
  alarm.reverseFlow = !!Bits.bitsToUnsigned(bits.substr(318, 1));
  alarm.overFlow = !!Bits.bitsToUnsigned(bits.substr(317, 1));

  // data.dif = Bits.bitsToUnsigned(bits.substr(328, 8)); // 02
  // data.vif = Bits.bitsToUnsigned(bits.substr(336, 16)); // FD 74
  data.batteryLifetime = Hex.hexLittleEndianToBigEndian(
    payload.substr(88, 4),
    false,
  );
  emit("sample", { data, topic: "default" });
  emit("sample", { data: alarm, topic: "alarm" });
  emit("sample", { data: status, topic: "status" });
}
