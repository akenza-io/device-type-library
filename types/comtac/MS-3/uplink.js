function consume(event) {
  const payload = event.data.payloadHex;
  const bits = Bits.hexToBits(payload);
  const data = {};
  const lifecycle = {};

  // Which periphery is on?
  // reserved
  lifecycle.rs485 = !!Bits.bitsToUnsigned(bits.substring(1, 2));
  lifecycle.gps = !!Bits.bitsToUnsigned(bits.substring(2, 3));
  lifecycle.acc = !!Bits.bitsToUnsigned(bits.substring(3, 4));
  lifecycle.mag = !!Bits.bitsToUnsigned(bits.substring(4, 5));
  lifecycle.mic = !!Bits.bitsToUnsigned(bits.substring(5, 6));
  lifecycle.bright = !!Bits.bitsToUnsigned(bits.substring(6, 7));
  lifecycle.tempHum = !!Bits.bitsToUnsigned(bits.substring(7, 8));

  // Actual state of different components:
  lifecycle.txOnEvent = !!Bits.bitsToUnsigned(bits.substring(8, 9));
  lifecycle.magActual = !!Bits.bitsToUnsigned(bits.substring(9, 10));
  lifecycle.extCon = !!Bits.bitsToUnsigned(bits.substring(10, 11));
  lifecycle.booster = !!Bits.bitsToUnsigned(bits.substring(11, 12));
  lifecycle.extSupply = !!Bits.bitsToUnsigned(bits.substring(12, 13));
  lifecycle.dip3 = !!Bits.bitsToUnsigned(bits.substring(13, 14));
  lifecycle.dip2 = !!Bits.bitsToUnsigned(bits.substring(14, 15));
  lifecycle.dip1 = !!Bits.bitsToUnsigned(bits.substring(15, 16));
  lifecycle.batteryVoltage = Number(
    (1 + Bits.bitsToUnsigned(bits.substring(16, 24)) * 0.01).toFixed(2),
  );

  data.light = Bits.bitsToUnsigned(bits.substring(24, 32));
  data.humidity = Bits.bitsToUnsigned(bits.substring(32, 40));
  data.temperature = Bits.bitsToSigned(bits.substring(40, 56)) / 10;
  data.accX = Bits.bitsToSigned(bits.substring(56, 72)) / 1000;
  data.accY = Bits.bitsToSigned(bits.substring(72, 88)) / 1000;
  data.accZ = Bits.bitsToSigned(bits.substring(88, 104)) / 1000;
  data.gyroX = Bits.bitsToSigned(bits.substring(104, 120)) / 10;
  data.gyroY = Bits.bitsToSigned(bits.substring(120, 136)) / 10;
  data.gyroZ = Bits.bitsToSigned(bits.substring(136, 152)) / 10;
  data.magnX = Bits.bitsToSigned(bits.substring(152, 168)) / 1000;
  data.magnY = Bits.bitsToSigned(bits.substring(168, 184)) / 1000;
  data.magnZ = Bits.bitsToSigned(bits.substring(184, 200)) / 1000;

  const latitude = Bits.bitsToSigned(bits.substring(200, 232)) / 1000000;
  const longitude = Bits.bitsToSigned(bits.substring(232, 264)) / 1000000;
  const altitude = Bits.bitsToSigned(bits.substring(264, 280)) / 100;

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
