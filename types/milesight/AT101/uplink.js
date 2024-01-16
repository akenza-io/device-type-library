function readUInt8(bytes) {
  return bytes & 0xff;
}

function readInt8(bytes) {
  const ref = readUInt8(bytes);
  return ref > 0x7f ? ref - 0x100 : ref;
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

function readMAC(bytes) {
  const temp = [];
  for (let idx = 0; idx < bytes.length; idx++) {
    temp.push(`0${(bytes[idx] & 0xff).toString(16)}`.slice(-2));
  }
  return temp.join(":");
}

// Parse Hex Byte Array
function parseHexString(str) {
  const result = [];
  while (str.length >= 2) {
    result.push(parseInt(str.substring(0, 2), 16));
    str = str.substring(2, str.length);
  }
  return result;
}

function isEmpty(obj) {
  return Object.keys(obj).length === 0;
}

function consume(event) {
  const payload = event.data.payloadHex;
  const bytes = parseHexString(payload);

  const lifecycle = {};
  const wifi = [];
  const history = {};

  for (let i = 0; i < bytes.length; ) {
    const channelId = bytes[i++];
    const channelType = bytes[i++];
    // BATTERY
    if (channelId === 0x01 && channelType === 0x75) {
      lifecycle.batteryLevel = readUInt8(bytes[i]);
      i += 1;
    }
    // TEMPERATURE
    else if (channelId === 0x03 && channelType === 0x67) {
      const temperature = readInt16LE(bytes.slice(i, i + 2)) / 10;
      i += 2;

      emit("sample", {
        data: { temperature },
        topic: "temperature",
      });
    }
    // LOCATION
    else if (
      (channelId === 0x04 || channelId === 0x84) &&
      channelType === 0x88
    ) {
      const latitude = readInt32LE(bytes.slice(i, i + 4)) / 1000000;
      const longitude = readInt32LE(bytes.slice(i + 4, i + 8)) / 1000000;
      const status = bytes[i + 8];
      const motionStatus = ["UNKNOWN", "START", "MOVING", "STOP"][
        status & 0x0f
      ];
      const geofenceStatus = ["INSIDE", "OUTSIDE", "UNSET", "UNKOWN"][
        status >> 4
      ];
      i += 9;

      emit("sample", {
        data: { latitude, longitude, motionStatus, geofenceStatus },
        topic: "gps",
      });
    }
    // DEVICE POSITION
    else if (channelId === 0x05 && channelType === 0x00) {
      lifecycle.position = bytes[i] === 0 ? "NORMAL" : "TILT";
      i += 1;
    }
    // Wi-Fi SCAN RESULT
    else if (channelId === 0x06 && channelType === 0xd9) {
      const scan = {};
      scan.group = readUInt8(bytes[i]);
      scan.mac = readMAC(bytes.slice(i + 1, i + 7));
      scan.rssi = readInt8(bytes[i + 7]);

      const status = bytes[i + 8];
      scan.motionStatus = ["UNKNOWN", "START", "MOVING", "STOP"][status & 0x03];

      wifi.push(scan);
      i += 9;
    }
    // TAMPER STATUS
    else if (channelId === 0x07 && channelType === 0x00) {
      lifecycle.tamperStatus = bytes[i] === 0 ? "INSTALL" : "UNINSTALL";
      i += 1;
    }
    // TEMPERATURE WITH ABNORMAL
    else if (channelId === 0x83 && channelType === 0x67) {
      const temperature = readInt16LE(bytes.slice(i, i + 2)) / 10;
      const temperatureAbnormal = bytes[i + 2] !== 0;
      i += 3;
      emit("sample", {
        data: { temperature, temperatureAbnormal },
        topic: "temperature",
      });
    }
    // HISTORICAL DATA
    else if (channelId === 0x20 && channelType === 0xce) {
      const timestamp = new Date(readUInt32LE(bytes.slice(i, i + 4)) * 1000);
      const longitude = readInt32LE(bytes.slice(i + 4, i + 8)) / 1000000;
      const latitude = readInt32LE(bytes.slice(i + 8, i + 12)) / 1000000;
      i += 12;

      emit("sample", {
        data: { longitude, latitude },
        topic: "gps",
        timestamp,
      });
    } else {
      break;
    }
  }

  if (!isEmpty(lifecycle)) {
    emit("sample", { data: lifecycle, topic: "lifecycle" });
  }

  if (wifi.length > 0) {
    emit("sample", { data: { wifi }, topic: "wifi" });
  }

  if (!isEmpty(history)) {
    emit("sample", { data: history, topic: "history" });
  }
}
