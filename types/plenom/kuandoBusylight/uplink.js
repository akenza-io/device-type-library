function consume(event) {
  const payload = event.data.payloadHex;
  if (payload != undefined && payload != null && payload.length !== 0) {
    const bits = Bits.hexToBits(payload);
    const data = {};
    const lifecycle = {};
    const topic = "default";

    lifecycle.rssi = Bits.bitsToSigned(bits.substring(0, 8));
    // reserved 24
    lifecycle.snr = Bits.bitsToSigned(bits.substring(32, 40));
    // reserved 24
    lifecycle.downlinksReceived = Hex.hexLittleEndianToBigEndian(
      payload.substring(16, 24),
      false,
    );
    lifecycle.uplinksSent = Hex.hexLittleEndianToBigEndian(
      payload.substring(24, 32),
      false,
    );
    data.lastColorRGB = `${Bits.bitsToUnsigned(
      bits.substring(128, 136),
    )},${Bits.bitsToUnsigned(
      bits.substring(144, 152),
    )},${Bits.bitsToUnsigned(bits.substring(136, 144))}`;
    data.timeOn = Bits.bitsToUnsigned(bits.substring(152, 160));
    data.timeOff = Bits.bitsToUnsigned(bits.substring(160, 168));
    lifecycle.swRevision = Bits.bitsToUnsigned(bits.substring(168, 176));
    lifecycle.hwRevision = Bits.bitsToUnsigned(bits.substring(176, 184));
    lifecycle.adrState = Bits.bitsToUnsigned(bits.substring(184, 192));

    emit("sample", { data, topic });
    emit("sample", { data: lifecycle, topic: "lifecycle" });
  }
}
