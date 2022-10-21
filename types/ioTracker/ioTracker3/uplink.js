function decoder(bytes) {
  const decoded = {};

  let index = 0;

  function toSignedChar(byte) {
    return (byte & 127) - (byte & 128);
  }

  function toSignedShort(byte1, byte2) {
    const sign = byte1 & (1 << 7);
    const x = ((byte1 & 0xff) << 8) | (byte2 & 0xff);

    if (sign) {
      return 0xffff0000 | x;
    }

    return x;
  }

  function toUnsignedShort(byte1, byte2) {
    return (byte1 << 8) + byte2;
  }

  function toSignedInteger(byte1, byte2, byte3, byte4) {
    return (
      (byte1 & 0x80 ? -1 : 1) * ((byte1 & 0x7f) << 24) +
      (byte2 << 16) +
      (byte3 << 8) +
      byte4
    );
  }

  function bytesToHexString(bytes) {
    if (!bytes) {
      return null;
    }
    bytes = new Uint8Array(bytes);
    const hexBytes = [];

    for (let i = 0; i < bytes.length; ++i) {
      let byteString = bytes[i].toString(16);
      if (byteString.length < 2) {
        byteString = `0${byteString}`;
      }
      hexBytes.push(byteString);
    }
    return hexBytes.join("");
  }

  function substring(source, offset, length) {
    const buffer = new Uint8Array(length);
    for (let i = 0; i < length; i++) {
      buffer[i] = source[offset + i];
    }
    return bytesToHexString(buffer);
  }

  function parseBluetoothBeacons00() {
    const beaconStatus = bytes[index++];
    const beaconType = beaconStatus & 0x03;
    const rssiRaw = beaconStatus >> 2;
    const rssi = 27 - rssiRaw * 2;
    let beacon;

    switch (beaconType) {
      case 0x00:
        beacon = {
          type: "ibeacon",
          rssi,
          uuid: substring(bytes, index, 2),
          major: substring(bytes, index + 2, 2),
          minor: substring(bytes, index + 4, 2),
        };
        index += 6;
        return beacon;

      case 0x01:
        beacon = {
          type: "eddystone",
          rssi,
          instance: substring(bytes, index, 6),
        };
        index += 6;
        return beacon;

      case 0x02:
        beacon = {
          type: "altbeacon",
          rssi,
          id1: substring(bytes, index, 2),
          id2: substring(bytes, index + 2, 2),
          id3: substring(bytes, index + 4, 2),
        };
        index += 6;
        return beacon;

      case 0x03:
        beacon = {
          type: "fullbeacon",
          rssi,
          id1: substring(bytes, index, 2),
          id2: substring(bytes, index + 2, 2),
          id3: substring(bytes, index + 4, 2),
        };
        index += 6;
        return beacon;

      default:
        return null;
    }
  }
  function parseBluetoothBeacons01() {
    const beaconStatus = bytes[index++];
    const beaconType = beaconStatus & 0x03;
    const rssiRaw = beaconStatus >> 2;
    const rssi = 27 - rssiRaw * 2;
    let beacon;

    switch (beaconType) {
      case 0x00:
        beacon = {
          type: "ibeacon",
          rssi,
          uuid: substring(bytes, index, 16),
          major: substring(bytes, index + 16, 2),
          minor: substring(bytes, index + 18, 2),
        };
        index += 20;
        return beacon;

      case 0x01:
        beacon = {
          type: "eddystone",
          rssi,
          namespace: substring(bytes, index, 10),
          instance: substring(bytes, index + 10, 6),
        };
        index += 16;
        return beacon;

      case 0x02:
        beacon = {
          type: "altbeacon",
          rssi,
          id1: substring(bytes, index, 16),
          id2: substring(bytes, index + 16, 2),
          id3: substring(bytes, index + 18, 2),
        };
        index += 20;
        return beacon;

      case 0x03:
        beacon = {
          type: "fullbeacon",
          rssi,
          id1: substring(bytes, index, 16),
          id2: substring(bytes, index + 16, 2),
          id3: substring(bytes, index + 18, 2),
        };
        index += 20;
        return beacon;

      default:
        return null;
    }
  }
  function parseBluetoothBeacons02() {
    const beaconStatus = bytes[index++];
    const beaconType = beaconStatus & 0x03;
    const slotMatch = (beaconStatus >> 2) & 0x07;
    const rssiRaw = bytes[index++] & 63;
    const rssi = 27 - rssiRaw * 2;
    let beacon;

    switch (beaconType) {
      case 0x00:
        beacon = {
          type: "ibeacon",
          rssi,
          slot: slotMatch,
          major: substring(bytes, index, 2),
          minor: substring(bytes, index + 2, 2),
        };
        index += 4;
        return beacon;

      case 0x01:
        beacon = {
          type: "eddystone",
          rssi,
          slot: slotMatch,
          instance: substring(bytes, index, 6),
        };
        index += 6;
        return beacon;

      case 0x02:
        beacon = {
          type: "altbeacon",
          rssi,
          slot: slotMatch,
          id2: substring(bytes, index, 2),
          id3: substring(bytes, index + 2, 2),
        };
        index += 4;
        return beacon;

      case 0x03:
        beacon = {
          type: "fullbeacon",
          rssi,
          slot: slotMatch,
          id2: substring(bytes, index, 2),
          id3: substring(bytes, index + 2, 2),
        };
        index += 6;
        return beacon;

      default:
        return null;
    }
  }

  const headerByte = bytes[index++];

  if (headerByte & 1) {
    decoded.uplinkReason = "BUTTON";
  } else if (headerByte & 2) {
    decoded.uplinkReason = "MOVEMENT";
  } else if (headerByte & 4) {
    decoded.uplinkReason = "GPIO";
  } else {
    decoded.uplinkReason = "STATUS";
  }

  decoded.containsGps = !!(headerByte & 8);
  decoded.containsOnboardSensors = !!(headerByte & 16);
  decoded.containsSpecial = !!(headerByte & 32);
  decoded.crc = bytes[index++];
  decoded.batteryLevel = Math.round((bytes[index++] / 254) * 100);

  if (decoded.containsOnboardSensors) {
    const sensorContent = bytes[index++];
    decoded.sensorContent = {
      containsTemperature: !!(sensorContent & 1),
      containsLight: !!(sensorContent & 2),
      containsAccelerometerCurrent: !!(sensorContent & 4),
      containsAccelerometerMax: !!(sensorContent & 8),
      containsWifiPositioningData: !!(sensorContent & 16),
      buttonEventInfo: !!(sensorContent & 32),
      containsExternalSensors: !!(sensorContent & 64),
      containsBluetoothData: false,
    };
    const hasSecondSensorContent = !!(sensorContent & 128);

    if (hasSecondSensorContent) {
      const sensorContent2 = bytes[index++];
      decoded.sensorContent.containsBluetoothData = !!(sensorContent2 & 1);
      decoded.sensorContent.containsRelativeHumidity = !!(sensorContent2 & 2);
      decoded.sensorContent.containsAirPressure = !!(sensorContent2 & 4);
      decoded.sensorContent.containsManDown = !!(sensorContent2 & 8);
    }

    if (decoded.sensorContent.containsTemperature) {
      decoded.temperature = toSignedShort(bytes[index++], bytes[index++]) / 100;
    }

    if (decoded.sensorContent.containsLight) {
      const value = (bytes[index++] << 8) + bytes[index++];
      const exponent = (value >> 12) & 0xff;
      decoded.light = ((value & 0x0fff) << exponent) / 100;
    }

    if (decoded.sensorContent.containsAccelerometerCurrent) {
      decoded.accelerometer = {
        x: toSignedShort(bytes[index++], bytes[index++]) / 1000,
        y: toSignedShort(bytes[index++], bytes[index++]) / 1000,
        z: toSignedShort(bytes[index++], bytes[index++]) / 1000,
      };
    }

    if (decoded.sensorContent.containsAccelerometerMax) {
      decoded.maxAccelerationNew =
        toSignedShort(bytes[index++], bytes[index++]) / 1000;
      decoded.maxAccelerationHistory =
        toSignedShort(bytes[index++], bytes[index++]) / 1000;
    }

    if (decoded.sensorContent.containsWifiPositioningData) {
      const wifiInfo = bytes[index++];
      const numAccessPoints = wifiInfo & 7;

      const wifiStatus = ((wifiInfo & 8) >> 2) + ((wifiInfo & 16) >> 3);
      const containsSignalStrength = wifiInfo & 32;
      let wifiStatusDescription;

      switch (wifiStatus) {
        case 0:
          wifiStatusDescription = "success";
          break;

        case 1:
          wifiStatusDescription = "failed";
          break;

        case 2:
          wifiStatusDescription = "no_access_points";
          break;

        default:
          wifiStatusDescription = `unknown (${wifiStatus})`;
      }

      decoded.wifiInfo = {
        status: wifiStatusDescription,
        statusCode: wifiStatus,
        accessPoints: [],
      };

      for (let i = 0; i < numAccessPoints; i++) {
        const macAddress = [
          bytes[index++].toString(16),
          bytes[index++].toString(16),
          bytes[index++].toString(16),
          bytes[index++].toString(16),
          bytes[index++].toString(16),
          bytes[index++].toString(16),
        ];
        let signalStrength;

        if (containsSignalStrength) {
          signalStrength = toSignedChar(bytes[index++]);
        } else {
          signalStrength = null;
        }

        decoded.wifiInfo.accessPoints.push({
          macAddress: macAddress.join(":"),
          signalStrength,
        });
      }
    }

    if (decoded.sensorContent.containsExternalSensors) {
      const type = bytes[index++];

      switch (type) {
        case 0x0a:
          decoded.externalSensor = {
            type: "battery",
            batteryA: toUnsignedShort(bytes[index++], bytes[index++]),
            batteryB: toUnsignedShort(bytes[index++], bytes[index++]),
          };
          break;

        case 0x65:
          decoded.externalSensor = {
            type: "detectSwitch",
            value: bytes[index++],
          };
          break;
        default:
          break;
      }
    }

    if (decoded.sensorContent.containsBluetoothData) {
      const bluetoothInfo = bytes[index++];
      const numBeacons = bluetoothInfo & 7;
      const bluetoothStatus = (bluetoothInfo >> 3) & 0x03;
      const addSlotInfo = (bluetoothInfo >> 5) & 0x03;
      let bluetoothStatusDescription;

      switch (bluetoothStatus) {
        case 0:
          bluetoothStatusDescription = "success";
          break;

        case 1:
          bluetoothStatusDescription = "failed";
          break;

        case 2:
          bluetoothStatusDescription = "no_access_points";
          break;

        default:
          bluetoothStatusDescription = `unknown (${bluetoothStatus})`;
      }

      decoded.bluetoothInfo = {
        status: bluetoothStatusDescription,
        statusCode: bluetoothStatus,
        addSlotInfo,
        beacons: [],
      };

      for (let a = 0; a < numBeacons; a++) {
        let beacon;
        switch (addSlotInfo) {
          case 0x00:
            beacon = parseBluetoothBeacons00();
            break;

          case 0x01:
            beacon = parseBluetoothBeacons01();
            break;

          case 0x02:
            beacon = parseBluetoothBeacons02();
            break;

          default:
            return { errors: ["Invalid addSlotInfo type"] };
        }
        if (beacon === null) {
          return { errors: ["Invalid beacon type"] };
        }

        decoded.bluetoothInfo.beacons.push(beacon);
      }
    }

    if (decoded.sensorContent.containsRelativeHumidity) {
      decoded.relativeHumidity =
        toUnsignedShort(bytes[index++], bytes[index++]) / 100;
    }

    if (decoded.sensorContent.containsAirPressure) {
      decoded.airPressure =
        (bytes[index++] << 16) + (bytes[index++] << 8) + bytes[index++];
    }

    if (decoded.sensorContent.containsManDown) {
      const manDownData = bytes[index++];
      const manDownState = manDownData & 0x0f;
      let manDownStateLabel;
      switch (manDownState) {
        case 0x00:
          manDownStateLabel = "ok";
          break;
        case 0x01:
          manDownStateLabel = "sleeping";
          break;
        case 0x02:
          manDownStateLabel = "preAlarm";
          break;
        case 0x03:
          manDownStateLabel = "alarm";
          break;
        default:
          manDownStateLabel = `${manDownState}`;
          break;
      }
      decoded.manDown = {
        state: manDownStateLabel,
        positionAlarm: !!(manDownData & 0x10),
        movementAlarm: !!(manDownData & 0x20),
      };
    }
  }

  if (decoded.containsGps) {
    decoded.gps = {};
    decoded.gps.navStat = bytes[index++];
    decoded.gps.latitude =
      toSignedInteger(
        bytes[index++],
        bytes[index++],
        bytes[index++],
        bytes[index++],
      ) / 10000000;
    decoded.gps.longitude =
      toSignedInteger(
        bytes[index++],
        bytes[index++],
        bytes[index++],
        bytes[index++],
      ) / 10000000;
    decoded.gps.altitude = toUnsignedShort(bytes[index++], bytes[index++]) / 10;
    decoded.gps.hAcc = bytes[index++];
    decoded.gps.vAcc = bytes[index++];
    decoded.gps.sog = toUnsignedShort(bytes[index++], bytes[index++]) / 10;
    decoded.gps.cog = toUnsignedShort(bytes[index++], bytes[index++]) / 10;
    decoded.gps.hdop = bytes[index++] / 10;
    decoded.gps.numSvs = bytes[index++];
  }

  return decoded;
}

function consume(event) {
  const payload = event.data.payloadHex;
  const decoded = decoder(Hex.hexToBytes(payload));
  const gps = {};
  const lifecycle = {};

  if (decoded.gps !== undefined) {
    if (Object.keys(decoded.gps).length > 0) {
      gps.navStat = decoded.gps.navStat;
      gps.longitude = decoded.gps.longitude;
      gps.latitude = decoded.gps.latitude;
      gps.altitude = decoded.gps.altitude;
      gps.hAcc = decoded.gps.hAcc;
      gps.vAcc = decoded.gps.vAcc;
      gps.sog = decoded.gps.sog;
      gps.cog = decoded.gps.cog;
      gps.hdop = decoded.gps.hdop;
      gps.numSvs = decoded.gps.numSvs;

      emit("sample", { data: decoded.gps, topic: "gps" });
      delete decoded.gps;
    }
  }

  // Redundant data is only used as flags
  delete decoded.containsGps;
  delete decoded.containsOnboardSensors;
  delete decoded.containsSpecial;

  if (decoded.sensorContent !== undefined) {
    delete decoded.sensorContent;
  }

  lifecycle.batteryLevel = decoded.batteryLevel;
  lifecycle.uplinkReason = decoded.uplinkReason;
  lifecycle.crc = decoded.crc;

  emit("sample", {
    data: lifecycle,
    topic: "lifecycle",
  });
  delete decoded.batteryLevel;
  delete decoded.uplinkReason;
  delete decoded.crc;

  emit("sample", { data: decoded, topic: "default" });
}
