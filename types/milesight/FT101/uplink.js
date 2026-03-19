function readUInt8(bytes) {
  return bytes & 0xff;
}

function readUInt16LE(bytes) {
  const value = (bytes[1] << 8) + bytes[0];
  return value & 0xffff;
}

function readInt16LE(bytes) {
  const ref = readUInt16LE(bytes);
  return ref > 0x7fff ? ref - 0x10000 : ref;
}

function readUInt32LE(bytes) {
  const value =
    (bytes[3] << 24) + (bytes[2] << 16) + (bytes[1] << 8) + bytes[0];
  return (value & 0xffffffff) >>> 0;
}

function readInt32LE(bytes) {
  const ref = readUInt32LE(bytes);
  return ref > 0x7fffffff ? ref - 0x100000000 : ref;
}

function getValue(map, key) {
  let value = map[key];
  if (!value) value = "unknown";
  return value;
}

function readProtocolVersion(bytes) {
  const major = (bytes & 0xf0) >> 4;
  const minor = bytes & 0x0f;
  return `v${major}.${minor}`;
}

function readHardwareVersion(bytes) {
  const major = bytes[0] & 0xff;
  const minor = (bytes[1] & 0xff) >> 4;
  return `v${major}.${minor}`;
}

function readFirmwareVersion(bytes) {
  const major = bytes[0] & 0xff;
  const minor = bytes[1] & 0xff;
  return `v${major}.${minor}`;
}

function readTslVersion(bytes) {
  const major = bytes[0] & 0xff;
  const minor = bytes[1] & 0xff;
  return `v${major}.${minor}`;
}

function readSerialNumber(bytes) {
  const temp = [];
  for (let idx = 0; idx < bytes.length; idx++) {
    temp.push(`0${(bytes[idx] & 0xff).toString(16)}`.slice(-2));
  }
  return temp.join("");
}

function readLoRaWANClass(type) {
  const lorawanClassMap = {
    0: "A",
    1: "B",
    2: "C",
    3: "C_TO_B",
  };
  return getValue(lorawanClassMap, type);
}

function isEmpty(obj) {
  if (obj === undefined) {
    return true;
  }
  return Object.keys(obj).length === 0;
}

function consume(event) {
  const payload = event.data.payloadHex;
  const bytes = Hex.hexToBytes(payload);
  const lifecycle = {};
  const data = {};

  if (bytes.length > 4) {
    for (let i = 0; i < bytes.length; ) {
      const channelId = bytes[i++];
      const channelType = bytes[i++];

      // IPSO VERSION
      if (channelId === 0xff && channelType === 0x01) {
        lifecycle.ipsoVersion = readProtocolVersion(bytes[i]);
        i += 1;
      }
      // HARDWARE VERSION
      else if (channelId === 0xff && channelType === 0x09) {
        lifecycle.hardwareVersion = readHardwareVersion(bytes.slice(i, i + 2));
        i += 2;
      }
      // FIRMWARE VERSION
      else if (channelId === 0xff && channelType === 0x0a) {
        lifecycle.firmwareVersion = readFirmwareVersion(bytes.slice(i, i + 2));
        i += 2;
      }
      // DEVICE STATUS
      else if (channelId === 0xff && channelType === 0x0b) {
        lifecycle.deviceStatus = "ON";
        i += 1;
      }
      // LORAWAN CLASS
      else if (channelId === 0xff && channelType === 0x0f) {
        lifecycle.lorawanClass = readLoRaWANClass(bytes[i]);
        i += 1;
      }
      // PRODUCT SERIAL NUMBER
      else if (channelId === 0xff && channelType === 0x16) {
        lifecycle.sn = readSerialNumber(bytes.slice(i, i + 8));
        i += 8;
      }
      // TSL VERSION
      else if (channelId === 0xff && channelType === 0xff) {
        lifecycle.tslVersion = readTslVersion(bytes.slice(i, i + 2));
        i += 2;
      }
      // LOCATION
      else if (channelId === 0x03 && channelType === 0xa1) {
        data.longitude = readInt32LE(bytes.slice(i, i + 4)) / 1000000;
        data.latitude = readInt32LE(bytes.slice(i + 4, i + 8)) / 1000000;
        i += 8;
      }
      // SIGNAL STRENGTH
      else if (channelId === 0x04 && channelType === 0xa2) {
        data.rssi = readInt16LE(bytes.slice(i, i + 2)) / 10;
        data.snr = readInt16LE(bytes.slice(i + 2, i + 4)) / 10;
        i += 4;
      }
      // SF
      else if (channelId === 0x05 && channelType === 0xa3) {
        data.spreadingFactor = readUInt8(bytes[i]);
        i += 1;
      }
      // TX POWER
      else if (channelId === 0x06 && channelType === 0xa4) {
        data.txPower = readInt16LE(bytes.slice(i, i + 2)) / 100;
        i += 2;
      } else {
        break;
      }
    }
  } else {
    // Get meta from the server if info is not in the message
    data.latitude = Number(event.uplinkMetrics.latitude);
    if (data.latitude === 0) {
      delete data.latitude;
    }
    data.longitude = Number(event.uplinkMetrics.longitude);
    if (data.longitude === 0) {
      delete data.longitude;
    }
    data.rssi = event.uplinkMetrics.rssi;
    data.snr = event.uplinkMetrics.snr;
    data.spreadingFactor = event.uplinkMetrics.sf;
    data.txPower = event.uplinkMetrics.txPower;
  }

  // Meta from server
  data.frameCountUp = event.uplinkMetrics.frameCountUp;
  data.frameCountDown = event.uplinkMetrics.frameCountDown;
  data.gatewaysInRange = event.uplinkMetrics.numberOfGateways;

  if (!isEmpty(data)) {
    emit("sample", { data, topic: "default" });
  }

  if (!isEmpty(lifecycle)) {
    emit("sample", { data: lifecycle, topic: "lifecycle" });
  }
}
