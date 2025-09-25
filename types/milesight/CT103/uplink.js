function cToF(celsius) { 
 return Math.round(((celsius * 9) / 5 + 32) * 10) / 10; 
 } 

// Helper functions to read little-endian values from a byte array
function readUInt16LE(bytes) {
  const value = (bytes[1] << 8) + bytes[0];
  return value & 0xffff;
}

function readInt16LE(bytes) {
  const ref = readUInt16LE(bytes);
  return ref > 0x7fff ? ref - 0x10000 : ref;
}

function readUInt32LE(bytes) {
  const value = (bytes[3] << 24) + (bytes[2] << 16) + (bytes[1] << 8) + bytes[0];
  return (value & 0xffffffff) >>> 0;
}

// Helper functions to decode specific data types
function readProtocolVersion(byte) {

  const minor = byte & 0x0f;
  return `V${minor}`;
}

function readHardwareVersion(bytes) {
  const major = (bytes[0] & 0xff).toString(16);
  const minor = (bytes[1] & 0xff) >> 4;
  return `v${major}.${minor}`;
}

function readFirmwareVersion(bytes) {
  const major = (bytes[0] & 0xff).toString(16);
  const minor = (bytes[1] & 0xff).toString(16);
  return `v${major}.${minor}`;
}

function readTslVersion(bytes) {
  const major = bytes[0] & 0xff;
  const minor = bytes[1] & 0xff;
  return `v${major}.${minor}`;
}

function readSerialNumber(bytes) {
  const temp = [];
  for (let i = 0; i < bytes.length; i++) {
    temp.push((`0${(bytes[i] & 0xff).toString(16)}`).slice(-2));
  }
  return temp.join("");
}

function readLoRaWANClass(type) {
  switch (type) {
    case 0:
      return "CLASS_A";
    case 1:
      return "CLASS_B";
    case 2:
      return "CLASS_C";
    case 3:
      return "CLASS_C_TO_B";
    default:
      return "unknown";
  }
}


function readDeviceStatus(status) {
  return status === 1 ? "on" : "off";
}

function readCurrentAlarmStatus(value) {
  switch (value) {
    case 0x01:
      return "CURRENT_THRESHOLD_ALARM";
    case 0x02:
      return "CURRENT_THRESHOLD_ALARM_DISMISS";
    case 0x04:
      return "CURRENT_OVER_RANGE_ALARM";
    case 0x08:
      return "CURRENT_OVER_RANGE_ALARM_DISMISS";
    case 0x05:
      return "CURRENT_THRESHOLD_ALARM_OVER_RANGE_ALARM";
    case 0x0a:
      return "CURRENT_THRESHOLD_ALARM_OVER_RANGE_ALARM_DISMISS";
    default:
      return "unknown";
  }
}

function readTemperatureAlarmStatus(type) {
  switch (type) {
    case 0:
      return "TEMPERATURE_THRESHOLD_ALARM_RELEASE";
    case 1:
      return "TEMPERATURE_THRESHOLD_ALARM";
    default:
      return "unknown";
  }
}

function consume(event) {
  const bytes = Hex.hexToBytes(event.data.payloadHex);
  const defaultData = {};
  const alarmData = {};
  const systemData = {};

  for (let i = 0; i < bytes.length;) {
    const channelId = bytes[i++];
    const channelType = bytes[i++];

    try {
      // TOTAL CURRENT
      if (channelId === 0x03 && channelType === 0x97) {
        defaultData.totalCurrent = readUInt32LE(bytes.slice(i, i + 4)) / 100;
        i += 4;
      }
      // CURRENT
      else if (channelId === 0x04 && channelType === 0x98) {
        const currentValue = readUInt16LE(bytes.slice(i, i + 2));
        if (currentValue !== 0xffff) {
          defaultData.current = currentValue / 100;
        }
        i += 2;
      }
      // TEMPERATURE
      else if (channelId === 0x09 && channelType === 0x67) {
        const tempValue = readUInt16LE(bytes.slice(i, i + 2));
        if (tempValue !== 0xfffd && tempValue !== 0xffff) {
          defaultData.temperature = readInt16LE(bytes.slice(i, i + 2)) / 10;
 defaultData.temperatureF = cToF(defaultData.temperature);
        }
        i += 2;
      }
      // CURRENT ALARM
      else if (channelId === 0x84 && channelType === 0x98) {
        alarmData.currentMax = readUInt16LE(bytes.slice(i, i + 2)) / 100;
        alarmData.currentMin = readUInt16LE(bytes.slice(i + 2, i + 4)) / 100;
        // latest current (bytes i+4..i+5) is not emitted per schema
        const statusByte = bytes[i + 6];
        const currentAlarmStatus = readCurrentAlarmStatus(statusByte);
        if (currentAlarmStatus !== "unknown") {
          alarmData.currentAlarmStatus = currentAlarmStatus;
        }
        i += 7;
      }
      // TEMPERATURE ALARM
      else if (channelId === 0x89 && channelType === 0x67) {
        const tempAlarmStatus = readTemperatureAlarmStatus(bytes[i + 2]);
        if (tempAlarmStatus !== "unknown") {
          alarmData.temperatureAlarmStatus = tempAlarmStatus;
 alarmData.temperatureF = cToF(alarmData.temperature);
        }
        i += 3;
      }
      // SYSTEM INFORMATION
      else if (channelId === 0xff) {
        switch (channelType) {
          case 0x01: // PROTOCOL VERSION
            systemData.protocolVersion = readProtocolVersion(bytes[i]);
            i += 1;
            break;
          case 0x09: // HARDWARE VERSION
            systemData.hardwareVersion = readHardwareVersion(bytes.slice(i, i + 2));
            i += 2;
            break;
          case 0x0a: // SOFTWARE VERSION
            systemData.softwareVersion = readFirmwareVersion(bytes.slice(i, i + 2));
            i += 2;
            break;
          case 0xff: // TSL VERSION
            systemData.tslVersion = readTslVersion(bytes.slice(i, i + 2));
            i += 2;
            break;
          case 0x16: // SERIAL NUMBER
            systemData.sn = readSerialNumber(bytes.slice(i, i + 8));
            i += 8;
            break;
          case 0x0f: // LORAWAN CLASS TYPE
            systemData.lorawanClass = readLoRaWANClass(bytes[i]);
            i += 1;
            break;
          case 0x0b: // DEVICE STATUS
            // Follow manufacturer decoder: treat as Power On event
            systemData.deviceStatus = readDeviceStatus(1);
            i += 1;
            break;
          default: // Unknown system channel type
            // Attempt to find the end of the current TLV block if possible
            // This part is tricky without a defined length, so we break to be safe
            i = bytes.length;
            break;
        }
      } else {
        // Unknown channel, stop processing to avoid errors
        i = bytes.length;
      }
    } catch (e) {
      // In case of an error (e.g., slicing beyond array length), stop processing
      i = bytes.length;
    }
  }

  if (Object.keys(defaultData).length > 0) {
    emit("sample", {
      data: defaultData,
      topic: "default"
    });
  }
  if (Object.keys(alarmData).length > 0) {
    emit("sample", {
      data: alarmData,
      topic: "alarm"
    });
  }
  if (Object.keys(systemData).length > 0) {
    emit("sample", {
      data: systemData,
      topic: "system"
    });
  }
}