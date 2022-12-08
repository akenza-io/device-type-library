function decoder(bytes, port) {
  const decoded = {};
  if (port === 1) {
    decoded.type = "position";

    decoded.latitude =
      bytes[0] + bytes[1] * 256 + bytes[2] * 65536 + bytes[3] * 16777216;
    if (decoded.latitude >= 0x80000000) decoded.latitude -= 0x100000000;
    decoded.latitude /= 1e7;
    decoded.longitude =
      bytes[4] + bytes[5] * 256 + bytes[6] * 65536 + bytes[7] * 16777216;
    if (decoded.longitude >= 0x80000000) decoded.longitude -= 0x100000000;
    decoded.longitude /= 1e7;
    decoded.inTrip = (bytes[8] & 0x1) !== 0;
    decoded.fixFailed = (bytes[8] & 0x2) !== 0;
    decoded.manDown = (bytes[8] & 0x4) !== 0;
    decoded.headingDeg = (bytes[9] & 0x7) * 45;
    decoded.speedKmph = (bytes[9] >> 3) * 5;
    decoded.voltage = Math.round(bytes[10] * 0.025 * 100) / 100;
  } else if (port === 2) {
    decoded.type = "downlink_ack";

    decoded.sequenceNumber = bytes[0] & 0x7f;
    decoded.accepted = (bytes[0] & 0x80) !== 0;
    decoded.fwMaj = bytes[1];
    decoded.fwMin = bytes[2];
  } else if (port === 3) {
    decoded.type = "lifecycle";

    decoded.initialBatV =
      (bytes[0] & 0xf) !== 0 ? 4.0 + (bytes[0] & 0xf) * 0.1 : null;
    decoded.txCount = 32 * ((bytes[0] >> 4) + (bytes[1] & 0x7f) * 16);
    decoded.tripCount =
      32 * ((bytes[1] >> 7) + (bytes[2] & 0xff) * 2 + (bytes[3] & 0x0f) * 512);
    decoded.gpsSuccesses = 32 * ((bytes[3] >> 4) + (bytes[4] & 0x3f) * 16);
    decoded.gpsFails = 32 * ((bytes[4] >> 6) + (bytes[5] & 0x3f) * 4);
    decoded.aveGpsFixS = 1 * ((bytes[5] >> 6) + (bytes[6] & 0x7f) * 4);
    decoded.aveGpsFailS = 1 * ((bytes[6] >> 7) + (bytes[7] & 0xff) * 2);
    decoded.aveGpsFreshenS = 1 * ((bytes[7] >> 8) + (bytes[8] & 0xff) * 1);
    decoded.wakeupsPerTrip = 1 * ((bytes[8] >> 8) + (bytes[9] & 0x7f) * 1);
    decoded.uptimeWeeks = 1 * ((bytes[9] >> 7) + (bytes[10] & 0xff) * 2);
  }

  return decoded;
}

function hexToBytes(hex) {
  for (var bytes = [], c = 0; c < hex.length; c += 2) {
    bytes.push(parseInt(hex.substr(c, 2), 16));
  }
  return bytes;
}

function consume(event) {
  const payload = event.data.payloadHex;
  const { port } = event.data;
  const data = decoder(hexToBytes(payload), port);
  const topic = data.type;
  delete data.type;
  emit("sample", { data, topic });
}
