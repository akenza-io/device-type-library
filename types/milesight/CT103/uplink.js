/**
 * Payload Decoder for Milesight CT103
 *
 * Copyright 2024 Akenza, AG
 */

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
  const major = (byte & 0xf0) >> 4;
  const minor = byte & 0x0f;
  return "v" + major + "." + minor;
}

function readHardwareVersion(bytes) {
  const major = (bytes[0] & 0xff).toString(16);
  const minor = (bytes[1] & 0xff) >> 4;
  return "v" + major + "." + minor;
}

function readFirmwareVersion(bytes) {
  const major = (bytes[0] & 0xff).toString(16);
  const minor = (bytes[1] & 0xff).toString(16);
  return "v" + major + "." + minor;
}

function readTslVersion(bytes) {
  const major = bytes[0] & 0xff;
  const minor = bytes[1] & 0xff;
  return "v" + major + "." + minor;
}

function readSerialNumber(bytes) {
  let temp = [];
  for (let i = 0; i < bytes.length; i++) {
    temp.push(("0" + (bytes[i] & 0xff).toString(16)).slice(-2));
  }
  return temp.join("");
}

function readLoRaWANClass(type) {
  switch (type) {
    case 0:
      return "Class A";
    case 1:
      return "Class B";
    case 2:
      return "Class C";
    case 3:
      return "Class CtoB";
    default:
      return "unknown";
  }
}

function readResetEvent(status) {
  return status === 1 ? "reset" : "normal";
}

function readDeviceStatus(status) {
  return status === 1 ? "on" : "off";
}

function readYesNoStatus(status) {
  return status === 1 ? "yes" : "no";
}

function readSensorStatus(status) {
  switch (status) {
    case 1:
      return "over range alarm";
    case 2:
      return "read failed";
    default:
      return "normal";
  }
}

function readCurrentAlarm(value) {
  return {
    current_threshold_alarm: readYesNoStatus((value >> 0) & 0x01),
    current_threshold_alarm_release: readYesNoStatus((value >> 1) & 0x01),
    current_over_range_alarm: readYesNoStatus((value >> 2) & 0x01),
    current_over_range_alarm_release: readYesNoStatus((value >> 3) & 0x01),
  };
}

function readTemperatureAlarm(type) {
  switch (type) {
    case 0:
      return "temperature threshold alarm release";
    case 1:
      return "temperature threshold alarm";
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
    const channel_id = bytes[i++];
    const channel_type = bytes[i++];

    try {
      // TOTAL CURRENT
      if (channel_id === 0x03 && channel_type === 0x97) {
        defaultData.total_current = readUInt32LE(bytes.slice(i, i + 4)) / 100;
        i += 4;
      }
      // CURRENT
      else if (channel_id === 0x04 && channel_type === 0x98) {
        const currentValue = readUInt16LE(bytes.slice(i, i + 2));
        if (currentValue === 0xffff) {
          defaultData.current_sensor_status = readSensorStatus(2);
        } else {
          defaultData.current = currentValue / 100;
        }
        i += 2;
      }
      // TEMPERATURE
      else if (channel_id === 0x09 && channel_type === 0x67) {
        const tempValue = readUInt16LE(bytes.slice(i, i + 2));
        if (tempValue === 0xfffd) {
          defaultData.temperature_sensor_status = readSensorStatus(1);
        } else if (tempValue === 0xffff) {
          defaultData.temperature_sensor_status = readSensorStatus(2);
        } else {
          defaultData.temperature = readInt16LE(bytes.slice(i, i + 2)) / 10;
        }
        i += 2;
      }
      // CURRENT ALARM
      else if (channel_id === 0x84 && channel_type === 0x98) {
        alarmData.current_max = readUInt16LE(bytes.slice(i, i + 2)) / 100;
        alarmData.current_min = readUInt16LE(bytes.slice(i + 2, i + 4)) / 100;
        alarmData.current = readUInt16LE(bytes.slice(i + 4, i + 6)) / 100;
        alarmData.current_alarm = readCurrentAlarm(bytes[i + 6]);
        i += 7;
      }
      // TEMPERATURE ALARM
      else if (channel_id === 0x89 && channel_type === 0x67) {
        alarmData.temperature = readInt16LE(bytes.slice(i, i + 2)) / 10;
        alarmData.temperature_alarm = readTemperatureAlarm(bytes[i + 2]);
        i += 3;
      }
      // SYSTEM INFORMATION
      else if (channel_id === 0xff) {
        switch (channel_type) {
          case 0x01: // IPSO VERSION
            systemData.ipso_version = readProtocolVersion(bytes[i]);
            i += 1;
            break;
          case 0x09: // HARDWARE VERSION
            systemData.hardware_version = readHardwareVersion(bytes.slice(i, i + 2));
            i += 2;
            break;
          case 0x0a: // FIRMWARE VERSION
            systemData.firmware_version = readFirmwareVersion(bytes.slice(i, i + 2));
            i += 2;
            break;
          case 0xff: // TSL VERSION
            systemData.tsl_version = readTslVersion(bytes.slice(i, i + 2));
            i += 2;
            break;
          case 0x16: // SERIAL NUMBER
            systemData.sn = readSerialNumber(bytes.slice(i, i + 8));
            i += 8;
            break;
          case 0x0f: // LORAWAN CLASS TYPE
            systemData.lorawan_class = readLoRaWANClass(bytes[i]);
            i += 1;
            break;
          case 0xfe: // RESET EVENT
            systemData.reset_event = readResetEvent(1);
            i += 1; // Assuming 1 byte for event
            break;
          case 0x0b: // DEVICE STATUS
            systemData.device_status = readDeviceStatus(1);
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