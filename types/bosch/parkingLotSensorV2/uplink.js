function consume(event) {
  const payload = event.data.payloadHex;
  const bits = Bits.hexToBits(payload);
  const { port } = event.data;
  const lifecycle = {};
  const occupancy = {};

  if (port === 1 || port === 2) {
    occupancy.occupancy = parseInt(`0x${payload}`, 16) & 0x01;
    if (payload.length > 2) {
      emit("sample", {
        data: { temperature: Bits.bitsToSigned(bits.substr(8, 8)) },
        topic: "default",
      });
    }
  }

  if (port === 3) {
    const resetDict = {
      0x01: "WATCHDOG_RESET",
      0x02: "POWER_ON_RESET",
      0x03: "SYSTEM_REQUEST_RESET",
      0x04: "EXTERNAL_PIN_RESET",
      0x05: "LOCKUP_RESET",
      0x06: "BROWNOUT_RESET",
      0x07: "OTHERS",
    };
    lifecycle.debug = `Payload hex:${payload.substring(0, 20).toUpperCase()}`;
    // Reserved 4
    lifecycle.fwVersion = `${parseInt(
      `0x${payload.substring(24, 2)}`,
      16,
    )}.${parseInt(`0x${payload.substring(26, 2)}`, 16)}.${parseInt(
      `0x${payload.substring(28, 2)}`,
      16,
    )}`;
    const resetCause = parseInt(`0x${payload.substring(30, 2)}`, 16);
    lifecycle.resetCause = resetDict[resetCause];
    occupancy.occupancy = parseInt(`0x${payload.substring(32, 2)}`, 16) & 0x01;

    emit("sample", { data: lifecycle, topic: "lifecycle" });
  }

  if (port === 4) {
    lifecycle.devEUI = `${payload.substring(0, 6)}${payload.substring(6, 10)}`;
    lifecycle.hwRevision = Bits.bitsToUnsigned(bits.substr(24, 3));
    lifecycle.productCode = Bits.bitsToUnsigned(bits.substr(27, 13));
    const prdClassExt = !!Bits.bitsToUnsigned(bits.substr(40, 8));
    if (prdClassExt) {
      lifecycle.productClassExt = "EU868";
    } else {
      lifecycle.productClassExt = "AS923";
    }

    emit("sample", { data: lifecycle, topic: "info" });
    occupancy.occupancy = parseInt(`0x${payload}`, 16) & 0x01;
  }

  if (port === 1 || port === 2 || port === 3) {
    emit("sample", { data: occupancy, topic: "occupancy" });
  }
}
