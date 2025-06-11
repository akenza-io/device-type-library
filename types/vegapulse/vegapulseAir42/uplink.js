function bytesToFloat(bytesToDecode) {
  // Assume LSB (least significant byte first).
  const bits = bytesToDecode[0] << 24 | bytesToDecode[1] << 16 | bytesToDecode[2] << 8 | bytesToDecode[3];

  const sign = (bits >>> 31 === 0) ? 1.0 : -1.0;
  const e = bits >>> 23 & 0xff;
  const m = (e === 0) ? (bits & 0x7fffff) << 1 : (bits & 0x7fffff) | 0x800000;
  if (e === 0xff) {
    if ((bits & 0x7fffff) === 0) {
      return sign / 0;
    }
    return NaN;

  }
  const f = sign * m * Math.pow(2, e - 150);
  return f;
}

function bytesToInt16(bytesToDecode) {
  const tmpInt16 = (bytesToDecode[0] << 24 >> 16) | bytesToDecode[1];
  return tmpInt16;
}

function bytesToUInt16(bytesToDecode) {
  const tmpInt16 = bytesToDecode[0] * 256 + bytesToDecode[1];
  return tmpInt16;
}

function bytesToUInt32(bytesToDecode) {
  const tmpUInt32 = bytesToDecode[0] * 256 * 256 * 256 + bytesToDecode[1] * 256 * 256 + bytesToDecode[2] * 256 + bytesToDecode[3];
  return tmpUInt32;
}

function bytesToString(bytesToDecode) {
  let str = '';
  for (let i = 0; i < bytesToDecode.length; i++) {
    const chr = bytesToDecode[i];
    if (chr === 0) { break; }
    str += String.fromCharCode(chr);
  }
  return str;
}

function namurStatus(status) {
  let namur = "NONE";
  switch (status) {
    case 0:
      namur = "GOOD";
      break;
    case 1:
      namur = "FUNCTION_CHECK";
      break;
    case 2:
      namur = "MAINTENANCE_REQUEST";
      break;
    case 3:
      namur = "OUT_OF_SPECIFICATION";
      break;
    case 4:
      namur = "FAILURE";
      break;
    default:
      break;
  }
  return namur;
}


function isEmpty(obj) {
  if (obj === undefined) {
    return true;
  }
  return Object.keys(obj).length === 0;
}

function getFillLevel(device, distance) {
  if (device !== undefined && distance !== undefined) {
    if (device.customFields !== undefined) {
      const { customFields } = device;
      let scaleLength = null;
      let sensorDistance = 0;

      if (customFields.containerHeight !== undefined) {
        scaleLength = Number(device.customFields.containerHeight);
      }

      if (customFields.installationOffset !== undefined) {
        sensorDistance = Number(device.customFields.installationOffset);
      }

      if (scaleLength !== null) {
        const percentExact =
          (100 / scaleLength) * (scaleLength - (distance - sensorDistance));
        let fillLevel = Math.round(percentExact);
        if (fillLevel > 100) {
          fillLevel = 100;
        } else if (fillLevel < 0) {
          fillLevel = 0;
        }
        return fillLevel;
      }
    }
  }
  return undefined;
}

function measuredValueUnit(byte) {
  let unit = "UNKNOWN";
  switch (byte) {
    case 0x2C:
      unit = "FEET";
      break;
    case 0x2D:
      unit = "METERS";
      break;
    case 0x2F:
      unit = "INCHES";
      break;
    case 0x31:
      unit = "MILLIMETERS";
      break;
    default:
      break;
  }
  return unit;
}

function baseDistanceCalculation(sensorMeasurementUnit, baseDistance) {
  // Always cast baseDistance to CM and go from there
  switch (sensorMeasurementUnit) {
    case "FEET":
      baseDistance *= 30.48;
      break;
    case "METERS":
      baseDistance *= 100;
      break;
    case "INCHES":
      baseDistance *= 2.54;
      break;
    case "MILLIMETERS":
      baseDistance /= 10;
      break;
    default:
      break;
  }
  return baseDistance;
}


function differentMeasurementUnits(baseDistance) {
  const distance = {};
  distance.distanceMM = baseDistance * 10;
  distance.distanceCM = baseDistance;
  distance.distanceM = baseDistance / 100;
  distance.distanceInch = baseDistance / 2.54;
  distance.distanceFt = baseDistance / 30.48;

  return distance;
}

function consume(event) {
  const bytes = Hex.hexToBytes(event.data.payloadHex);
  let distance = {};
  const temperature = {};
  const lifecycle = {};
  const gps = {};
  const system = {};
  const schedule = {};

  const packetIdentifier = bytes[0];

  if (packetIdentifier === 2 || packetIdentifier === 3 || packetIdentifier === 4 || packetIdentifier === 5) {
    lifecycle.namurState = namurStatus(bytes[1]);
    distance.sensorMeasurementUnit = measuredValueUnit(bytes[6]);
    const baseDistance = baseDistanceCalculation(distance.sensorMeasurementUnit, bytesToFloat(bytes.slice(2, 6)));
    distance = Object.assign(differentMeasurementUnits(baseDistance), distance);

    lifecycle.batteryLevel = bytes[7];
    temperature.temperature = bytesToInt16(bytes.slice(8, 10)) / 10;

    if (packetIdentifier === 2) {
      distance.inclinationDegree = bytes[10];
    } else if (packetIdentifier === 3) {
      gps.latitude = bytesToFloat(bytes.slice(10, 14));
      gps.longitude = bytesToFloat(bytes.slice(14, 18));
      distance.inclinationDegree = bytes[18];
    } else if (packetIdentifier === 4) {
      distance.detailedState = bytesToUInt32(bytes.slice(10, 14));
      distance.inclinationDegree = bytes[14];
    } else if (packetIdentifier === 5) {
      gps.latitude = bytesToFloat(bytes.slice(10, 14));
      gps.longitude = bytesToFloat(bytes.slice(14, 18));
      distance.detailedState = bytesToUInt32(bytes.slice(18, 22));
      distance.inclinationDegree = bytes[22];
    }
  } else if (packetIdentifier === 6) {
    lifecycle.namurState = namurStatus(bytes[1]);
    gps.latitude = bytesToFloat(bytes.slice(2, 6));
    gps.longitude = bytesToFloat(bytes.slice(6, 10));
  } else if (packetIdentifier === 7) {
    lifecycle.namurState = namurStatus(bytes[1]);
    distance.detailedState = bytesToUInt32(bytes.slice(2, 6));
  } else if ((packetIdentifier >= 8 && packetIdentifier <= 15) || (packetIdentifier >= 18 && packetIdentifier <= 22)) {
    let position = 1; // skip identifier
    if ([10, 11, 14, 15, 19, 20, 21, 22].indexOf(packetIdentifier) !== -1) {
      lifecycle.namurState = namurStatus(bytes[position]);
      position++;
    } else {
      lifecycle.namurState = namurStatus(0);
    }

    if ([8, 9, 10, 11, 12, 13, 14, 15, 18, 19].indexOf(packetIdentifier) !== -1) {
      const rawDistance = bytesToFloat(bytes.slice(position, position + 4));
      position += 4;
      distance.sensorMeasurementUnit = measuredValueUnit(bytes[position]);
      const baseDistance = baseDistanceCalculation(distance.sensorMeasurementUnit, rawDistance);
      distance = Object.assign(differentMeasurementUnits(baseDistance), distance);

      position++;
    }

    if ([12, 13, 14, 15, 22].indexOf(packetIdentifier) !== -1) {
      if (!(bytes[position] === 0x80) && !(bytes[position + 1] === 0x00)) {
        distance.percentValue = bytesToInt16(bytes.slice(position, position + 2)) / 100;
      }
      position += 2;

      if (!(bytes[position] === 0x80) && !(bytes[position + 1] === 0x00)) {
        distance.linearPercentValue = bytesToInt16(bytes.slice(position, position + 2)) / 100;
      }
      position += 2;

      distance.scaledValue = bytesToFloat(bytes.slice(position, position + 4));
      // 1 Byte reserved for scaled unit value
      position += 5;
    }

    if ([8, 9, 10, 11, 12, 13, 14, 15, 18, 19].indexOf(packetIdentifier) !== -1) {
      lifecycle.batteryLevel = bytes[position];
      position++;
    }

    if ([9, 11, 13, 15, 21].indexOf(packetIdentifier) !== -1) {
      gps.latitude = bytesToFloat(bytes.slice(position, position + 4));
      if (Number.isNaN(gps.latitude) && (bytes[position] & 0x80) > 0) { // NaN with sign bit set = GPS not attempted, otherwise GPS failed
        delete gps.latitude;
      }
      position += 4;

      gps.longitude = bytesToFloat(bytes.slice(position, position + 4));
      if (Number.isNaN(gps.longitude) && (bytes[position] & 0x80) > 0) { // NaN with sign bit set = GPS not attempted, otherwise GPS failed
        delete gps.longitude;
      }
      position += 4;
    }

    if ([10, 11, 14, 15, 20].indexOf(packetIdentifier) !== -1) {
      distance.detailedState = bytesToUInt32(bytes.slice(position, position + 4));
      position += 4;
    }

    if ([8, 9, 10, 11, 12, 13, 14, 15, 18, 20].indexOf(packetIdentifier) !== -1) {
      if (!(bytes[position] === 0x80) && !(bytes[position + 1] === 0x00)) {
        temperature.temperature = bytesToInt16(bytes.slice(position, position + 2)) / 10;
      }
      position += 3;
    }

    if ([8, 9, 10, 11, 12, 13, 14, 15, 18, 19].indexOf(packetIdentifier) !== -1) {
      distance.inclinationDegree = bytes[position];
      position++;
    }
  } else if ([16, 17, 23, 24, 25, 26].indexOf(packetIdentifier) !== -1) {
    let position = 1; // skip identifier

    if ([23, 24, 25, 26].indexOf(packetIdentifier) !== -1) {
      lifecycle.namurState = namurStatus(bytes[position]);
      position++;
    }

    if ([16, 23].indexOf(packetIdentifier) !== -1) {
      system.information = bytes[position];
      position++;
    }

    if ([16, 23].indexOf(packetIdentifier) !== -1) {
      system.dtmId = bytesToUInt32(bytes.slice(position, position + 4));
      position += 4;
      system.manufacturerId = bytesToUInt32(bytes.slice(position, position + 4));
      position += 4;
    }

    if ([16, 24].indexOf(packetIdentifier) !== -1) {
      system.deviceType = bytesToUInt32(bytes.slice(position, position + 4));
      position += 4;

      system.softwareVersionAscii = `${bytes[position]}.${bytes[position + 1]}.${bytes[position + 2]}.${bytes[position + 3]}`;
      position += 4;
    }

    if ([16, 25].indexOf(packetIdentifier) !== -1) {
      // Days (bits 0-7 (LSB = 0))
      const daysRaw = bytes[position] >>> 1 & 0x7f;
      const days = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
      schedule.days = "";
      for (let i = 0; i < 7; i++) {
        if ((daysRaw & (1 << i)) > 0) {
          schedule.days = `${schedule.days + days[i]}, `;
        }
      }
      schedule.days = schedule.days.substring(0, schedule.days.length - 2);

      // startTimeMinutes (bits 8-18)
      schedule.startTimeMinutes = ((bytes[position] & 0x01) << 10) | (bytes[position + 1] << 2) | ((bytes[position + 2] & 0xC0) >>> 6);

      // EndTimeMinutes (bits 19-29)
      schedule.endTimeMinutes = ((bytes[position + 2] & 0x3F) << 5) | ((bytes[position + 3] & 0xF8) >>> 3);

      // MeasureIntervalMinutes (bits 30-40)
      schedule.measureIntervalMinutes = ((bytes[position + 3] & 0x07) << 8) | bytes[position + 4];

      // TransmissionIntervalMinutes (bits 46-56)
      schedule.transmissionIntervalMinutes = ((bytes[position + 5] & 0x07) << 8) | bytes[position + 6];

      position += 7;

      schedule.changeCounter = bytesToUInt16(bytes.slice(position, position + 2));
      position += 2;
    }

    if ([16, 26].indexOf(packetIdentifier) !== -1) {
      system.scaledMin = bytesToFloat(bytes.slice(position, position + 4));
      position += 4;

      system.scaledMax = bytesToFloat(bytes.slice(position, position + 4));
      position += 4;
    }

    if (packetIdentifier === 17) {
      system.deviceName = bytesToString(bytes.slice(position, position + 19));
      position += 19;

      system.deviceTag = bytesToString(bytes.slice(position, position + 19));
      position += 19;
    }
  }

  if (!isEmpty(distance)) {
    const fillLevel = getFillLevel(event.device, distance.distanceCM);
    if (fillLevel !== undefined) {
      distance.fillLevel = fillLevel;
    }

    emit("sample", { data: distance, topic: "distance" });
  }

  if (!isEmpty(temperature)) {
    emit("sample", { data: temperature, topic: "temperature" });
  }

  if (!isEmpty(lifecycle)) {
    emit("sample", { data: lifecycle, topic: "lifecycle" });
  }

  if (!isEmpty(gps)) {
    emit("sample", { data: gps, topic: "gps" });
  }

  if (!isEmpty(system)) {
    emit("sample", { data: system, topic: "system" });
  }

  if (!isEmpty(schedule)) {
    emit("sample", { data: schedule, topic: "schedule" });
  }

}
