function consume(event) {
  const payload = event.data.payloadHex;
  const { port } = event.data;
  const bytes = Hex.hexToBytes(payload);
  const data = {};

  if (port === 1 || port === 2) {
    const gps = {};
    const digital = {};
    const lifecycle = {};
    switch (bytes[0] & 0x3) {
      case 0:
        gps.tripType = "NO_TRIP";
        break;
      case 1:
        gps.tripType = "IGNITION";
        break;
      case 2:
        gps.tripType = "MOVEMENT";
        break;
      case 3:
        gps.tripType = "RUN";
        break;
      default:
        break;
    }
    gps.latitude =
      (bytes[0] & 0xf0) +
      bytes[1] * 256 +
      bytes[2] * 65536 +
      bytes[3] * 16777216;
    if (gps.latitude >= 0x80000000) {
      gps.latitude -= 0x100000000;
    }
    gps.latitude /= 1e7;

    gps.longitude =
      (bytes[4] & 0xf0) +
      bytes[5] * 256 +
      bytes[6] * 65536 +
      bytes[7] * 16777216;
    if (gps.longitude >= 0x80000000) {
      gps.longitude -= 0x100000000;
    }
    gps.longitude /= 1e7;

    digital.extPower = (bytes[0] & 0x4) !== 0;
    gps.gpsFixCurrent = (bytes[0] & 0x8) !== 0;
    digital.ignition = (bytes[4] & 0x1) !== 0;
    digital.digitalInput1 = (bytes[4] & 0x2) !== 0;
    digital.digitalInput2 = (bytes[4] & 0x4) !== 0;
    digital.digitalOutput = (bytes[4] & 0x8) !== 0;
    gps.headingDeg = bytes[8] * 2;
    gps.speedKmph = bytes[9];
    lifecycle.batteryVoltage = parseFloat((bytes[10] * 0.02).toFixed(3));

    if (port === 1) {
      digital.extVoltage = parseFloat(
        (0.001 * (bytes[11] + bytes[12] * 256)).toFixed(3),
      );
      digital.analogInput = parseFloat(
        (0.001 * (bytes[13] + bytes[14] * 256)).toFixed(3),
      );
      lifecycle.internalTemperature = bytes[15];
      if (lifecycle.internalTemperature >= 0x80) {
        gps.gpsAccuracy = bytes[16];
      }
    }

    emit("sample", { data: gps, topic: "gps" });
    emit("sample", { data: digital, topic: "digital" });
    emit("sample", { data: lifecycle, topic: "lifecycle" });
  } else if (port === 4) {
    // Calculates runtime in seconds in msb
    const runTime =
      bytes[0] + bytes[1] * 256 + bytes[2] * 65536 + bytes[3] * 16777216;
    const runtimeDays = Math.floor(runTime / 86400);
    const runtimeHours = Math.floor((runTime % 86400) / 3600);
    const runtimeMinutes = Math.floor((runTime % 3600) / 60);
    const runtimeSeconds = runTime % 60;

    data.runtime = `${runtimeDays}d${runtimeHours}h${runtimeMinutes}m${runtimeSeconds}s`;
    data.odometer =
      0.01 *
      (bytes[4] + bytes[5] * 256 + bytes[6] * 65536 + bytes[7] * 16777216);
    data.odometer = parseFloat(data.odometer.toFixed(2) / 10);
    emit("sample", { data, topic: "odometer" });
  } else if (port === 5) {
    data.sequenceNumber = bytes[0] & 0x7f;
    data.accepted = (bytes[0] & 0x80) !== 0;
    data.fwMaj = bytes[1];
    data.fwMin = bytes[2];
    emit("sample", { data, topic: "downlink_ack" });
  }
}
