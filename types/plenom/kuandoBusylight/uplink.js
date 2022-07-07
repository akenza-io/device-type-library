function consume(event) {
  const payload = event.data.payloadHex;
  const bits = Bits.hexToBits(payload);
  const data = {};
  const lifecycle = {};
  const topic = "default";

  lifecycle.rssi = Bits.bitsToSigned(bits.substr(0, 8));
  // reserved 24
  lifecycle.snr = Bits.bitsToSigned(bits.substr(32, 8));
  // reserved 24
  lifecycle.downlinksReceived = Hex.hexLittleEndianToBigEndian(
    payload.substr(16, 8),
    false,
  );
  lifecycle.uplinksSent = Hex.hexLittleEndianToBigEndian(
    payload.substr(24, 8),
    false,
  );
  data.lastColorRGB = `${Bits.bitsToUnsigned(
    bits.substr(128, 8),
  )},${Bits.bitsToUnsigned(bits.substr(136, 8))},${Bits.bitsToUnsigned(
    bits.substr(144, 8),
  )}`;
  data.timeOn = Bits.bitsToUnsigned(bits.substr(152, 8));
  data.timeOff = Bits.bitsToUnsigned(bits.substr(160, 8));
  lifecycle.swRevision = Bits.bitsToUnsigned(bits.substr(168, 8));
  lifecycle.hwRevision = Bits.bitsToUnsigned(bits.substr(176, 8));
  lifecycle.adrState = Bits.bitsToUnsigned(bits.substr(184, 8));

  emit("sample", { data, topic });
  emit("sample", { data: lifecycle, topic: "lifecycle" });
}
