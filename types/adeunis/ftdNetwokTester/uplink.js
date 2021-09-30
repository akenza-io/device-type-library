function consume(event) {
  const payload = event.data.payloadHex;
  const bits = Bits.hexToBits(payload);
  const decoded = {};
  let pointer = 8;

  const status = Bits.bitsToUnsigned(bits.substr(0, 8));

  if (status & 0x80) {
    let temperature = Bits.bitsToUnsigned(bits.substr(pointer, 8));
    if (temperature > 127) temperature -= 256;

    decoded.temperature = temperature;
    pointer += 8;
  }

  if (status & 0x40) {
    decoded.trigger = "ACCELEROMETER";
  }

  if (status & 0x20) {
    decoded.trigger = "PUSHBUTTON";
  }

  if (status & 0x10) {
    let hp = pointer / 4;

    decoded.latitude =
      Number(
        payload.substr(hp++, 1) +
          payload.substr(hp++, 1) +
          payload.substr(hp++, 1) +
          payload.substr(hp++, 1) +
          payload.substr(hp++, 1) +
          payload.substr(hp++, 1) +
          payload.substr(hp++, 1),
      ) / 100000;
    if (Number(payload.substr(hp++, 1))) {
      decoded.latitude = -decoded.latitude;
    }

    decoded.longitude =
      Number(
        payload.substr(hp++, 1) +
          payload.substr(hp++, 1) +
          payload.substr(hp++, 1) +
          payload.substr(hp++, 1) +
          payload.substr(hp++, 1) +
          payload.substr(hp++, 1) +
          payload.substr(hp++, 1),
      ) / 10000;
    if (Number(payload.substr(hp++, 1))) {
      decoded.longitude = -decoded.longitude;
    }

    decoded.reception = Number(payload.substr(hp++, 1));
    decoded.sats = Number(payload.substr(hp++, 1));

    pointer += 72;
  }

  if (status & 0x08) {
    decoded.uplink = Bits.bitsToUnsigned(bits.substr(pointer, 8));
    pointer += 8;
  }

  if (status & 0x04) {
    decoded.downlink = Bits.bitsToUnsigned(bits.substr(pointer, 8));
    pointer += 8;
  }

  if (status & 0x02) {
    decoded.battery = Bits.bitsToUnsigned(bits.substr(pointer, 16)) / 1000;
    pointer += 16;
  }

  if (status & 0x01) {
    decoded.rssi = -Bits.bitsToSigned(bits.substr(pointer, 8));
    pointer += 8;
    let snr = Bits.bitsToUnsigned(bits.substr(pointer, 8));
    pointer += 8;
    if (snr > 127) snr -= 256;

    decoded.snr = snr;
  }
  emit("sample", { data: decoded, topic: "default" });
}
