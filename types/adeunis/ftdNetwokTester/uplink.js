function parseHexString(str) {
  let param = str;
  const result = [];
  while (param.length >= 2) {
    result.push(parseInt(param.substring(0, 2), 16));
    param = param.substring(2, param.length);
  }
  return result;
}

function consume(event) {
  const payload = event.data.payloadHex;
  const bytes = parseHexString(payload);
  const decoded = {};
  let offset = 0;

  if (offset + 1 <= bytes.length) {
    const status = bytes[offset++];
    if (status & 0x80 && offset + 1 < bytes.length) {
      let temperature = bytes[offset];
      if (temperature > 127) {
        temperature -= 256;
      }

      decoded.temperature = temperature;
      offset += 1;
    }
    if (status & 0x40) {
      decoded.trigger = "ACCELEROMETER";
    }

    if (status & 0x20) {
      decoded.trigger = "PUSHBUTTON";
    }

    if (status & 0x10 && offset + 9 <= bytes.length) {
      const gps = {};
      const latDeg10 = bytes[offset] >> 4;
      const latDeg1 = bytes[offset] & 0x0f;
      const latMin10 = bytes[offset + 1] >> 4;
      const latMin1 = bytes[offset + 1] & 0x0f;
      const latMin01 = bytes[offset + 2] >> 4;
      const latMin001 = bytes[offset + 2] & 0x0f;
      const latMin0001 = bytes[offset + 3] >> 4;
      const latSign = bytes[offset + 3] & 0x01 ? -1 : 1;
      gps.latitude =
        latSign *
        (latDeg10 * 10 +
          latDeg1 +
          (latMin10 * 10 +
            latMin1 +
            latMin01 * 0.1 +
            latMin001 * 0.01 +
            latMin0001 * 0.001) /
            60);
      const lonDeg100 = bytes[offset + 4] >> 4;
      const lonDeg10 = bytes[offset + 4] & 0x0f;
      const lonDeg1 = bytes[offset + 5] >> 4;
      const lonMin10 = bytes[offset + 5] & 0x0f;
      const lonMin1 = bytes[offset + 6] >> 4;
      const lonMin01 = bytes[offset + 6] & 0x0f;
      const lonMin001 = bytes[offset + 7] >> 4;
      const lonSign = bytes[offset + 7] & 0x01 ? -1 : 1;
      gps.longitude =
        lonSign *
        (lonDeg100 * 100 +
          lonDeg10 * 10 +
          lonDeg1 +
          (lonMin10 * 10 + lonMin1 + lonMin01 * 0.1 + lonMin001 * 0.01) / 60);
      gps.satellites = bytes[offset + 8] & 0x0f;
      emit("sample", { data: gps, topic: "gps" });
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
      decoded.voltage = ((bytes[offset] << 8) | bytes[offset + 1]) / 1000;
      offset += 2;
    }
    if (status & 0x01 && offset + 2 <= bytes.length) {
      decoded.rssi = -bytes[offset];
      let snr = bytes[offset + 1];
      if (snr > 127) {
        snr -= 256;
      }

      decoded.snr = snr;
      offset += 2;
    }
  }
  emit("sample", { data: decoded, topic: "default" });
}
