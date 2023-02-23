function consume(event) {
  const payload = event.data.payloadHex;
  const bits = Bits.hexToBits(payload);
  const data = {};
  const alarm = {};
  const device = {};

  // Length // 2D
  // Send no reply // 44
  device.manufacturerCode = `${payload.substr(6, 2)}${payload.substr(4, 2)}`;
  device.moduleNumber = `${payload.substr(14, 2)}${payload.substr(
    12,
    2,
  )}${payload.substr(10, 2)}${payload.substr(8, 2)}`;
  device.versionNumber = payload.substr(16, 2);
  device.systemComponent = payload.substr(18, 2);
  // data.longTelegram = payload.substr(18, 2);
  device.meterAddress = `${payload.substr(28, 2)}${payload.substr(
    26,
    2,
  )}${payload.substr(24, 2)}${payload.substr(22, 2)}`;
  // device.manufacturerCode = `${payload.substr(32, 2)}${payload.substr(30, 2)}`; Gets sent twice
  device.meterVersion = payload.substr(34, 2);
  device.waterType = payload.substr(36, 2);
  device.transmitionCounter = payload.substr(38, 2);
  device.statusField = payload.substr(40, 2);
  device.configuration = payload.substr(42, 4);

  // dif = Bits.bitsToUnsigned(bits.substr(184, 8));
  // vif = Bits.bitsToUnsigned(bits.substr(192, 8));
  data.volume = Hex.hexLittleEndianToBigEndian(payload.substr(50, 8), false);
  data.volumeM3 = data.volume / 1000;

  // data.dif = Bits.bitsToUnsigned(bits.substr(232, 16));
  // data.vif = Bits.bitsToUnsigned(bits.substr(248, 8));
  data.backflow = Hex.hexLittleEndianToBigEndian(payload.substr(64, 8), false);

  // data.dif = Bits.bitsToUnsigned(bits.substr(288, 8)); // 02
  // data.vif = Bits.bitsToUnsigned(bits.substr(296, 16)); // FD 17

  alarm.tamper = !!Bits.bitsToUnsigned(bits.substr(327, 1));
  alarm.burst = !!Bits.bitsToUnsigned(bits.substr(325, 1));
  alarm.leak = !!Bits.bitsToUnsigned(bits.substr(324, 1));
  alarm.noConsumption = !!Bits.bitsToUnsigned(bits.substr(320, 1));
  alarm.batteryLow = !!Bits.bitsToUnsigned(bits.substr(319, 1));
  alarm.reverseFlow = !!Bits.bitsToUnsigned(bits.substr(318, 1));
  alarm.overflow = !!Bits.bitsToUnsigned(bits.substr(317, 1));

  // data.dif = Bits.bitsToUnsigned(bits.substr(328, 8)); // 02
  // data.vif = Bits.bitsToUnsigned(bits.substr(336, 16)); // FD 74
  device.batteryLifetime = Hex.hexLittleEndianToBigEndian(
    payload.substr(88, 4),
    false,
  );
  emit("sample", { data, topic: "default" });
  emit("sample", { data: alarm, topic: "alarm" });
  emit("sample", { data: device, topic: "device" });
}
