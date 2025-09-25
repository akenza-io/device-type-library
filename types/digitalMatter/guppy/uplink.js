function cToF(celsius) {
  return Math.round(((celsius * 9) / 5 + 32) * 10) / 10;
}

function decoder(bytes, port) {
  // Decode an uplink message from a buffer
  // (array) of bytes to an object of fields.
  const decoded = {};

  if (bytes == null) {
    return null;
  }

  if (port === 1) {
    if (bytes.length !== 2 && bytes.length !== 4) {
      return null;
    }

    decoded.type = "status";

    decoded.inTrip = (bytes[0] & 0x1) !== 0;
    decoded.batteryVoltage = 2.0 + 0.014 * (bytes[0] >> 1);
    decoded.temperature = -40.0 + 0.5 * bytes[1];
    decoded.temperatureF = cToF(decoded.temperature);

    if (bytes.length >= 4) {
      decoded.manDown = (bytes[2] & 0x1) !== 0;
      decoded.inclinationDeg = (bytes[2] >> 1) * 1.5;
      decoded.azimuthDeg = bytes[3] * 1.5;

      // The direction of 'down' in rectangular coordinates, unit vector.
      decoded.downUnit = [
        Math.sin((decoded.inclinationDeg * Math.PI) / 180) *
        Math.sin((decoded.azimuthDeg * Math.PI) / 180),
        Math.cos((decoded.inclinationDeg * Math.PI) / 180),
        Math.sin((decoded.inclinationDeg * Math.PI) / 180) *
        Math.cos((decoded.azimuthDeg * Math.PI) / 180),
      ];

      const d = decoded.downUnit;

      // The azimuthal angles about each axis, right-handed, in degrees.
      // You can set up triggers on these angles. These trigger angles
      // are not well defined if the inclination is within 7 degrees of
      // vertical, and will not trigger within that range.
      const hypX = Math.sqrt(d[1] * d[1] + d[2] * d[2]);
      const hypY = Math.sqrt(d[2] * d[2] + d[0] * d[0]);
      const hypZ = Math.sqrt(d[0] * d[0] + d[1] * d[1]);
      decoded.xyzAzimuthDeg = [
        hypX < 0.125 ? null : (Math.atan2(d[2], d[1]) * 180) / Math.PI,
        hypY < 0.125 ? null : decoded.azimuthDeg,
        hypZ < 0.125 ? null : (Math.atan2(d[1], d[0]) * 180) / Math.PI,
      ];
      if (decoded.xyzAzimuthDeg[0] < 0) {
        decoded.xyzAzimuthDeg[0] += 360;
      }
      if (decoded.xyzAzimuthDeg[2] < 0) {
        decoded.xyzAzimuthDeg[2] += 360;
      }

      // The angle between each axis and 'down', in degrees.
      // You can set up triggers on these angles.
      // They are always well defined.
      let iX = 1 - ((d[0] - 1) * (d[0] - 1) + d[1] * d[1] + d[2] * d[2]) / 2;
      let iZ = 1 - (d[0] * d[0] + d[1] * d[1] + (d[2] - 1) * (d[2] - 1)) / 2;
      iX = Math.max(iX, -1);
      iX = Math.min(iX, +1);
      iZ = Math.max(iZ, -1);
      iZ = Math.min(iZ, +1);
      decoded.xyzInclinationDeg = [
        (Math.acos(iX) * 180) / Math.PI,
        decoded.inclinationDeg,
        (Math.acos(iZ) * 180) / Math.PI,
      ];

      // Clean up the floats for display
      decoded.batteryVoltage = parseFloat(
        decoded.batteryVoltage.toPrecision(3),
      );
      decoded.downUnit[0] = parseFloat(decoded.downUnit[0].toPrecision(4));
      decoded.downUnit[1] = parseFloat(decoded.downUnit[1].toPrecision(4));
      decoded.downUnit[2] = parseFloat(decoded.downUnit[2].toPrecision(4));
      if (decoded.xyzAzimuthDeg[0] !== null) {
        decoded.xyzAzimuthDeg[0] = parseFloat(
          decoded.xyzAzimuthDeg[0].toPrecision(4),
        );
      }
      if (decoded.xyzAzimuthDeg[2] !== null) {
        decoded.xyzAzimuthDeg[2] = parseFloat(
          decoded.xyzAzimuthDeg[2].toPrecision(4),
        );
      }
      decoded.xyzInclinationDeg[0] = parseFloat(
        decoded.xyzInclinationDeg[0].toPrecision(4),
      );
      decoded.xyzInclinationDeg[2] = parseFloat(
        decoded.xyzInclinationDeg[2].toPrecision(4),
      );
    }
  } else if (port === 2) {
    if (bytes.length !== 3) {
      return null;
    }

    decoded.type = "downlink_ack";

    decoded.sequenceNumber = bytes[0] & 0x7f;
    decoded.accepted = (bytes[0] & 0x80) !== 0;
    decoded.fwMaj = bytes[1];
    decoded.fwMin = bytes[2];
  } else if (port === 3) {
    if (bytes.length !== 7) {
      return null;
    }

    decoded.type = "lifecycle";

    decoded.initialVoltage = 2.0 + 0.014 * (bytes[0] & 0x7f);
    decoded.uptimeWeeks = (bytes[0] >> 7) + bytes[1] * 2;
    decoded.txCount = 32 * (bytes[2] + bytes[3] * 256);
    decoded.tripCount = 32 * (bytes[4] + bytes[5] * 256);
    decoded.wakeupsPerTrip = bytes[6];

    // Clean up the floats for display
    decoded.initialvoltage = parseFloat(decoded.initialvoltage.toPrecision(3));
  } else if (port === 4) {
    if (bytes.length !== 8) {
      return null;
    }

    decoded.type = "rtc_request";

    decoded.rtcWasSet = (bytes[0] & 0x01) !== 0;
    decoded.cookie =
      (bytes[0] + bytes[1] * 256 + bytes[2] * 65536 + bytes[3] * 16777216) >>>
      1;

    // seconds since 2013-01-01
    const timestamp =
      bytes[4] + bytes[5] * 256 + bytes[6] * 65536 + bytes[7] * 16777216;

    // Date() takes milliseconds since 1970-01-01
    decoded.time = new Date((timestamp + 1356998400) * 1000).toUTCString();
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
