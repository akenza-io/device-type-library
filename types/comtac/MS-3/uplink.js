function consume(event) {
  const payload = event.data.payloadHex;
  const bits = Bits.hexToBits(payload);
  const data = {};
  const lifecycle = {};

  // Which periphery is on?
  // reserved
  lifecycle.rs485 = !!Bits.bitsToUnsigned(bits.substr(1, 1));
  lifecycle.gps = !!Bits.bitsToUnsigned(bits.substr(2, 1));
  lifecycle.acc = !!Bits.bitsToUnsigned(bits.substr(3, 1));
  lifecycle.mag = !!Bits.bitsToUnsigned(bits.substr(4, 1));
  lifecycle.mic = !!Bits.bitsToUnsigned(bits.substr(5, 1));
  lifecycle.bright = !!Bits.bitsToUnsigned(bits.substr(6, 1));
  lifecycle.tempHum = !!Bits.bitsToUnsigned(bits.substr(7, 1));

  // Actual state of different components:
  lifecycle.txOnEvent = !!Bits.bitsToUnsigned(bits.substr(8, 1));
  lifecycle.magActual = !!Bits.bitsToUnsigned(bits.substr(9, 1));
  lifecycle.extCon = !!Bits.bitsToUnsigned(bits.substr(10, 1));
  lifecycle.booster = !!Bits.bitsToUnsigned(bits.substr(11, 1));
  lifecycle.extSupply = !!Bits.bitsToUnsigned(bits.substr(12, 1));
  lifecycle.dip3 = !!Bits.bitsToUnsigned(bits.substr(13, 1));
  lifecycle.dip2 = !!Bits.bitsToUnsigned(bits.substr(14, 1));
  lifecycle.dip1 = !!Bits.bitsToUnsigned(bits.substr(15, 1));
  lifecycle.batteryVoltage = Number(
    (1 + Bits.bitsToUnsigned(bits.substr(16, 8)) * 0.01).toFixed(2),
  );

  data.light = Bits.bitsToUnsigned(bits.substr(24, 8));
  data.humidity = Bits.bitsToUnsigned(bits.substr(32, 8));
  data.temperature = Bits.bitsToSigned(bits.substr(40, 16)) / 10;
  data.accX = Bits.bitsToSigned(bits.substr(56, 16)) / 1000;
  data.accY = Bits.bitsToSigned(bits.substr(72, 16)) / 1000;
  data.accZ = Bits.bitsToSigned(bits.substr(88, 16)) / 1000;
  data.gyroX = Bits.bitsToSigned(bits.substr(104, 16)) / 10;
  data.gyroY = Bits.bitsToSigned(bits.substr(120, 16)) / 10;
  data.gyroZ = Bits.bitsToSigned(bits.substr(136, 16)) / 10;
  data.magnX = Bits.bitsToSigned(bits.substr(152, 16)) / 1000;
  data.magnY = Bits.bitsToSigned(bits.substr(168, 16)) / 1000;
  data.magnZ = Bits.bitsToSigned(bits.substr(184, 16)) / 1000;

  const latitude = Bits.bitsToSigned(bits.substr(200, 32)) / 1000000;
  const longitude = Bits.bitsToSigned(bits.substr(232, 32)) / 1000000;
  const altitude = Bits.bitsToSigned(bits.substr(264, 16)) / 100;

  // GPS is off with a value 2147.483647
  if (latitude !== 2147.483647 && longitude !== 2147.483647) {
    const gps = {};
    gps.latitude = latitude;
    gps.longitude = longitude;
    gps.altitude = altitude;

    emit("sample", { data: gps, topic: "gps" });
  }
  if (lifecycle.txOnEvent === true) {
    emit("sample", { data: { eventUplink: true }, topic: "event" });
  }

  emit("sample", { data, topic: "default" });
  emit("sample", { data: lifecycle, topic: "lifecycle" });
}
