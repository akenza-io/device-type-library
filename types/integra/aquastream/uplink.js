function consume(event) {
  const payload = event.data.payloadHex;
  const bits = Bits.hexToBits(payload);
  const data = {};
  const alarm = {};
  const device = {};

  // Length 0,8
  // Send no reply 8,8
  device.manufacturerCode = `${payload.substr(6, 2)}${payload.substr(4, 2)}`;
  device.moduleNumber = `${payload.substr(14, 2)}${payload.substr(
    12,
    2,
  )}${payload.substr(10, 2)}${payload.substr(8, 2)}`;
  device.versionNumber = parseInt(payload.substr(16, 2), 16);
  device.systemComponent = parseInt(payload.substr(18, 2), 16);
  device.meterAddress = `${payload.substr(28, 2)}${payload.substr(
    26,
    2,
  )}${payload.substr(24, 2)}${payload.substr(22, 2)}`;
  // ManufacturerCode gets sent twice
  device.meterVersion = parseInt(payload.substr(34, 2), 16);
  device.waterType = parseInt(payload.substr(36, 2), 16);
  device.transmitionCounter = parseInt(payload.substr(38, 2), 16);
  device.statusField = parseInt(payload.substr(40, 2), 16);
  device.configuration = parseInt(payload.substr(42, 4), 16);

  // dif 184,8
  // vif 192,8
  data.volume = Hex.hexLittleEndianToBigEndian(payload.substr(50, 8), false);
  data.volumeM3 = data.volume / 1000;

  // dif 232,16
  // vif 248,8
  data.backflow = Hex.hexLittleEndianToBigEndian(payload.substr(64, 8), false);

  // dif 288,8
  // vif 296,16
  alarm.tamper = !!Bits.bitsToUnsigned(bits.substr(327, 1));
  alarm.burst = !!Bits.bitsToUnsigned(bits.substr(325, 1));
  alarm.leak = !!Bits.bitsToUnsigned(bits.substr(324, 1));
  alarm.noConsumption = !!Bits.bitsToUnsigned(bits.substr(320, 1));
  alarm.batteryLow = !!Bits.bitsToUnsigned(bits.substr(319, 1));
  alarm.reverseFlow = !!Bits.bitsToUnsigned(bits.substr(318, 1));
  alarm.overflow = !!Bits.bitsToUnsigned(bits.substr(317, 1));

  // dif 328,8
  // vif 336,16
  device.batteryLifetime = Hex.hexLittleEndianToBigEndian(
    payload.substr(88, 4),
    false,
  );
  emit("sample", { data, topic: "default" });
  emit("sample", { data: alarm, topic: "alarm" });
  emit("sample", { data: device, topic: "device" });
}
