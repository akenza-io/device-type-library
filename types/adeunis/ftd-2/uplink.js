function parseHexString(str) {
  var result = [];
  while (str.length >= 2) {
    result.push(parseInt(str.substring(0, 2), 16));
    str = str.substring(2, str.length);
  }

  return result;
}

function consume(event) {
  var payload = event.data.payload_hex;
  var bytes = parseHexString(payload);
  var decoded = {};
  var offset = 0;

  if (offset + 1 <= bytes.length) {
    var status = bytes[offset++];
    if (status & 0x80 && offset + 1 < bytes.length) {
      var temperature = bytes[offset];
      if (temperature > 127) temperature = temperature - 256;

      decoded.temperature = temperature;
      offset += 1;
    }

    if (status & 0x40) {
      decoded.trigger = "accelerometer";
    }

    if (status & 0x20) {
      decoded.trigger = "pushbutton";
    }

    if (status & 0x10 && offset + 9 <= bytes.length) {
      var latDeg10 = bytes[offset] >> 4;
      var latDeg1 = bytes[offset] & 0x0f;
      var latMin10 = bytes[offset + 1] >> 4;
      var latMin1 = bytes[offset + 1] & 0x0f;
      var latMin01 = bytes[offset + 2] >> 4;
      var latMin001 = bytes[offset + 2] & 0x0f;
      var latMin0001 = bytes[offset + 3] >> 4;
      var latSign = bytes[offset + 3] & 0x01 ? -1 : 1;
      decoded.latitude =
        latSign *
        (latDeg10 * 10 +
          latDeg1 +
          (latMin10 * 10 +
            latMin1 +
            latMin01 * 0.1 +
            latMin001 * 0.01 +
            latMin0001 * 0.001) /
            60);
      var lonDeg100 = bytes[offset + 4] >> 4;
      var lonDeg10 = bytes[offset + 4] & 0x0f;
      var lonDeg1 = bytes[offset + 5] >> 4;
      var lonMin10 = bytes[offset + 5] & 0x0f;
      var lonMin1 = bytes[offset + 6] >> 4;
      var lonMin01 = bytes[offset + 6] & 0x0f;
      var lonMin001 = bytes[offset + 7] >> 4;
      var lonSign = bytes[offset + 7] & 0x01 ? -1 : 1;
      decoded.longitude =
        lonSign *
        (lonDeg100 * 100 +
          lonDeg10 * 10 +
          lonDeg1 +
          (lonMin10 * 10 + lonMin1 + lonMin01 * 0.1 + lonMin001 * 0.01) / 60);
      decoded.altitude = 0; // altitude information not available
      decoded.sats = bytes[offset + 8] & 0x0f; // number of satellites
      offset += 9;
    }

    if (status & 0x08 && offset + 1 <= bytes.length) {
      decoded.uplink = bytes[offset];
      offset += 1;
    }

    if (status & 0x04 && offset + 1 <= bytes.length) {
      decoded.downlink = bytes[offset];
      offset += 1;
    }

    if (status & 0x02 && offset + 2 <= bytes.length) {
      decoded.battery = (bytes[offset] << 8) | bytes[offset + 1];
      offset += 2;
    }

    if (status & 0x01 && offset + 2 <= bytes.length) {
      decoded.rssi = -bytes[offset];
      var snr = bytes[offset + 1];
      if (snr > 127) snr = snr - 256;

      decoded.snr = snr;
      offset += 2;
    }
  }
  emit("sample", { data: decoded, topic: "uplink" });
}
