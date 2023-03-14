function zeroPad(str) {
  str = str.toString();
  return str.length === 1 ? `0${str}` : str;
}

function numberOfBitsSet(info) {
  let units = info & 0x03ff;
  let count = 0;
  while (units !== 0) {
    count += units & 1;
    units >>= 1;
  }
  return count;
}

function toNumber(bytes) {
  let i = 0;
  for (let x = 0; x < bytes.length; x++) {
    i |= +(bytes[x] << (x * 8));
  }
  return i;
}

function toBitArrray(bytes) {
  const bitArray = [];
  for (let x = 0; x < bytes.length; x++) {
    for (let b = bytes[x], i = 0; i < 8; i++) {
      bitArray.push((b & 0x80) !== 0 ? 1 : 0);
      b *= 2;
    }
  }

  return bitArray;
}

function parseTimestamp(value) {
  // format HHHHHMMMMMMSSSSSS  12h notation
  let hours = value >> 12;
  const minutes = (value >> 6) & 0x3f;
  const seconds = value & 0x3f;
  const utc = new Date();

  if (utc.getHours() < hours) {
    hours = 23 - (11 - hours); // midnight (0 < 11)
    utc.setDate(utc.getDate() - 1);
  } else {
    hours = utc.getHours() > 12 && hours < 12 ? hours + 12 : hours; // Convert to 24h notation
  }
  return Date.parse(
    `${utc.getFullYear()}-${zeroPad(utc.getMonth() + 1)}-${zeroPad(
      utc.getDate(),
    )}T${zeroPad(hours)}:${zeroPad(minutes)}:${zeroPad(seconds)}`,
  );
}

function parseMeasurement(bits) {
  let cnt = 1;
  let value = 0;
  for (let i = 0; i < 10; i++) {
    if (bits[9 - i]) {
      value += cnt;
    }
    cnt += cnt;
  }
  return (value / 10 + 30).toFixed(1); // Don't forget the offset of 30dB!
}

function consume(event) {
  const payload = Array.from(Hex.hexToBytes(event.data.payloadHex));
  let data = {};

  switch (payload[0] >> 6) {
    case 0x00: // MEASUREMENT WITHOUT PAYLOAD DESCRIPTION
      break;
    case 0x01: {
      let payloadIndex = 2; // Skip the message type and info bytes

      data = {
        bat: 0,
        location: null,
        transmitInterval: null,
        measurements: [],
      };

      const info = (payload[0] << 8) | payload[1];
      const batSet = (info & 0x2000) !== 0;
      const locSet = (info & 0x1000) !== 0;
      const firstTsSet = (info & 0x0800) !== 0;
      const dBAslowtTsSet = (info & 0x0400) !== 0;

      //
      // Calculate sample count
      const skip =
        payloadIndex +
        (batSet ? 1 : 0) +
        (locSet ? 8 : 0) +
        (firstTsSet ? 2 : 0) +
        (dBAslowtTsSet ? 2 : 0);
      const totalBitsPerSample = numberOfBitsSet(info) * 10;
      const totalBitsInPayload = (payload.length - skip) * 8;
      const remainder = totalBitsInPayload % totalBitsPerSample;
      const sampleCount = (totalBitsInPayload - remainder) / totalBitsPerSample;

      //
      // Parse battery voltage
      data.bat = batSet ? payload[payloadIndex++] / 10 : 0.0;

      //
      // Parse latitude and longitude
      if (locSet) {
        data.location = {
          latitude:
            toNumber(payload.slice(payloadIndex, (payloadIndex += 4))) / 1e7,
          longitude:
            toNumber(payload.slice(payloadIndex, (payloadIndex += 4))) / 1e7,
        };
      }

      //
      // Parse the timestamps
      let firstTimestamp = null;
      let dBAslowtTimestamp = null;
      let sampleInterval = 0;

      if (firstTsSet && dBAslowtTsSet) {
        const firstTS =
          payload[payloadIndex++] | (payload[payloadIndex++] << 8);
        const dBAslowtTS =
          payload[payloadIndex++] | (payload[payloadIndex++] << 8);

        if (firstTS !== 0xffff) {
          // Timestamps available
          firstTimestamp = parseTimestamp(firstTS);
          dBAslowtTimestamp = parseTimestamp(dBAslowtTS);
          sampleInterval =
            (dBAslowtTimestamp - firstTimestamp) /
            (sampleCount > 2 ? sampleCount - 1 : 1);
          data.transmitInterval = sampleInterval * sampleCount;
        } else {
          // Parse the transmit interval to millis (HHHHMMMMMMSSSSSS)
          const hMillis = (dBAslowtTS >> 12) * 60 * 60 * 1000;
          const mMillis = ((dBAslowtTS >> 6) & 0x3f) * 60 * 1000;
          const sMillis = dBAslowtTS & (0x3f * 1000);

          data.transmitInterval = hMillis + mMillis + sMillis;

          // Calculate the first timestamp
          sampleInterval = data.transmitInterval / sampleCount;
          firstTimestamp = new Date() - data.transmitInterval + sampleInterval;
        }
      } else if (firstTsSet && !dBAslowtTsSet) {
        // Not recommended
        const firstTS =
          payload[payloadIndex++] | (payload[payloadIndex++] << 8);
        dBAslowtTimestamp = new Date();

        if (firstTS !== 0xffff) {
          // Timestamp present
          firstTimestamp = parseTimestamp(firstTS);
          sampleInterval =
            (dBAslowtTimestamp - firstTimestamp) /
            (sampleCount > 2 ? sampleCount - 1 : 1);
          data.transmitInterval = sampleInterval * sampleCount;
        } else {
          // first timestamp unknown!
          data.transmitInterval = 60000; // WARNING! Unknown transmit interval!
          sampleInterval = data.transmitInterval / sampleCount;
          firstTimestamp =
            dBAslowtTimestamp - data.transmitInterval + sampleInterval;
        }
      } else if (!firstTsSet && dBAslowtTsSet) {
        // Not recommended
        const dBAslowtTS =
          payload[payloadIndex++] | (payload[payloadIndex++] << 8);

        // Has the GPS found a fix?
        if (data.location.latitude !== 0 && data.location.longitude !== 0) {
          dBAslowtTimestamp = parseTimestamp(dBAslowtTS);
          data.transmitInterval = 60000; // WARNING! Unknown transmit interval!

          // Calculate the first timestamp
          sampleInterval = data.transmitInterval / sampleCount;
          firstTimestamp =
            dBAslowtTimestamp - data.transmitInterval + sampleInterval;
        } else {
          // Parse the transmit interval to millis (HHHHMMMMMMSSSSSS)
          const hMillis = (dBAslowtTS >> 12) * 60 * 60 * 1000;
          const mMillis = ((dBAslowtTS >> 6) & 0x3f) * 60 * 1000;
          const sMillis = dBAslowtTS & (0x3f * 1000);

          data.transmitInterval = hMillis + mMillis + sMillis;

          // Calculate the first timestamp
          sampleInterval = data.transmitInterval / sampleCount;
          firstTimestamp = new Date() - data.transmitInterval + sampleInterval;
        }
      }

      //
      // Parse the samples
      const bitArray = toBitArrray(payload.slice(payloadIndex, payload.length));
      let index = 0;
      for (let i = 0; i < sampleCount; i++) {
        const measurement = {};

        if (info & 0x0200) {
          measurement.dBAfast = Number(
            parseMeasurement(bitArray.slice(index, (index += 10))),
          );
        }
        if (info & 0x0100) {
          measurement.dBAslow = Number(
            parseMeasurement(bitArray.slice(index, (index += 10))),
          );
        }
        if (info & 0x0080) {
          measurement.dBCfast = Number(
            parseMeasurement(bitArray.slice(index, (index += 10))),
          );
        }
        if (info & 0x0040) {
          measurement.dBCslow = Number(
            parseMeasurement(bitArray.slice(index, (index += 10))),
          );
        }
        if (info & 0x0020) {
          measurement.leqA = Number(
            parseMeasurement(bitArray.slice(index, (index += 10))),
          );
        }
        if (info & 0x0010) {
          measurement.leqC = Number(
            parseMeasurement(bitArray.slice(index, (index += 10))),
          );
        }
        if (info & 0x0008) {
          measurement.positivePeakHoldA = Number(
            parseMeasurement(bitArray.slice(index, (index += 10))),
          );
        }
        if (info & 0x0004) {
          measurement.negativePeakHoldA = Number(
            parseMeasurement(bitArray.slice(index, (index += 10))),
          );
        }
        if (info & 0x0002) {
          measurement.positivePeakHoldC = Number(
            parseMeasurement(bitArray.slice(index, (index += 10))),
          );
        }
        if (info & 0x0001) {
          measurement.negativePeakHoldC = Number(
            parseMeasurement(bitArray.slice(index, (index += 10))),
          );
        }

        measurement.timestamp = new Date(firstTimestamp).toString();
        data.measurements.push(measurement);

        firstTimestamp += sampleInterval; // Timestamp of the next sample.
      }

      let batteryLevel = Math.round((data.bat - 4.5) / 0.023 / 10) * 10;

      if (batteryLevel > 100) {
        batteryLevel = 100;
      } else if (batteryLevel < 0) {
        batteryLevel = 0;
      }

      const lifecycle = {
        batteryLevel,
        batteryVoltage: data.bat,
        transmitInterval: data.transmitInterval,
      };

      const { measurements } = data;

      measurements.forEach((measurement) => {
        const { timestamp } = measurement;
        delete measurement.timestamp;

        if (Object.keys(measurement).length > 0) {
          emit("sample", {
            data: measurement,
            topic: "default",
            timestamp: new Date(timestamp),
          });
        }

        emit("sample", {
          data: lifecycle,
          topic: "lifecycle",
          timestamp: new Date(timestamp),
        });

        if (Object.keys(data.location).length > 0) {
          emit("sample", {
            data: data.location,
            topic: "gps",
            timestamp: new Date(timestamp),
          });
        }
      });

      break;
    }
    case 0x02: {
      // RECEIVED SETTINGS (response of the settings request downlink)
      const settings = {};

      settings.adr = !!payload[1];
      settings.spreadingFactor = payload[2];
      settings.correction = ((payload[3] & 127) - (payload[3] & 128)) / 10;
      const gpsMode = payload[4];

      switch (gpsMode) {
        case 0:
          settings.gpsMode = "OFF";
          break;
        case 1:
          settings.gpsMode = "ONCE";
          break;
        case 2:
          settings.gpsMode = "INTERVAL";
          break;
        default:
          break;
      }

      settings.gpsInterval =
        payload[5] |
        (payload[6] << 8) |
        (payload[7] << 16) |
        (payload[8] << 24);
      settings.sampleCount = payload[9];
      settings.transmitInterval =
        payload[10] |
        (payload[11] << 8) |
        (payload[12] << 16) |
        (payload[13] << 24);

      settings.enableLed = (payload[14] & 0x80) !== 0;
      settings.enableHeadphone = (payload[14] & 0x40) !== 0;
      settings.enableTransmissionSync = (payload[14] & 0x20) !== 0;
      settings.useMsgInfo = (payload[14] & 0x10) !== 0;
      settings.useBat = (payload[14] & 0x08) !== 0;
      settings.useFirstTimestamp = (payload[14] & 0x04) !== 0;
      settings.useLastTimestamp = (payload[14] & 0x02) !== 0;
      settings.useLAf = (payload[14] & 0x01) !== 0;

      settings.useLAs = (payload[15] & 0x80) !== 0;
      settings.useLCf = (payload[15] & 0x40) !== 0;
      settings.useLCs = (payload[15] & 0x20) !== 0;
      settings.useLAeq = (payload[15] & 0x10) !== 0;
      settings.useLCeq = (payload[15] & 0x08) !== 0;
      settings.useLAmax = (payload[15] & 0x04) !== 0;
      settings.useLAmin = (payload[15] & 0x02) !== 0;
      settings.useLCmax = (payload[15] & 0x01) !== 0;
      settings.useLCmin = (payload[16] & 0x80) !== 0;

      emit("sample", { data: settings, topic: "settings" });
      break;
    }
    case 0x03: // RECEIVED ACK (CRC) (response of the settings update downlink)
      emit("sample", { data: { acknowledge: true }, topic: "acknowledge" });
      break;
    default: {
      break;
    }
  }
}
