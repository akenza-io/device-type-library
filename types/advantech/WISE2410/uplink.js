// Helper functions to read little-endian values
function readInt16Le(bytes) {
  const value = (bytes[1] << 8) | bytes[0];
  return value & 0x8000 ? value - 0x10000 : value;
}

function readUint16Le(bytes) {
  return (bytes[1] << 8) | bytes[0];
}

function readUint24Le(bytes) {
  return (bytes[2] << 16) | (bytes[1] << 8) | bytes[0];
}

function readInt32Le(bytes) {
  const value =
    (bytes[3] << 24) | (bytes[2] << 16) | (bytes[1] << 8) | bytes[0];
  return value & 0x80000000 ? value - 0x100000000 : value;
}

// --- Constants from Advantech Documentation ---

// Payload Types
const PAYLOAD_SENSOR_DATA = 0x50;
const PAYLOAD_DEVICE_DATA = 0x60;

// Sensor Types/Ranges
const SENSOR_RANGE_TEMP_C = 0x00;
const SENSOR_RANGE_TEMP_F = 0x01;
const SENSOR_RANGE_TEMP_K = 0x02;
const SENSOR_RANGE_ACCELEROMETER_G = 0x04;
const SENSOR_RANGE_ACCELEROMETER_MS2 = 0x05;

// Sensor Masks
const SENSOR_MASK_STATUS = 0x01;
const SENSOR_MASK_EVENT = 0x02;
const SENSOR_MASK_VALUE = 0x04;
const SENSOR_MASK_MAX_VALUE = 0x08;
const SENSOR_MASK_MIN_VALUE = 0x10;

// Sensor Axis Masks
const SENSOR_AXIS_X_MASK = 0x01;
const SENSOR_AXIS_Y_MASK = 0x02;
const SENSOR_AXIS_Z_MASK = 0x04;

// Sensor Extend Mask (Vibration Features & Massive Data)
const SENSOR_EXTMASK_B = 0x01; // Bit 0 indicates if it's Massive Data (Mask B) or Vibration Features (Mask A)
const SENSOR_EXTMASK_VELOCITY = 0x01;
const SENSOR_EXTMASK_PEAK = 0x02;
const SENSOR_EXTMASK_RMS = 0x04;
const SENSOR_EXTMASK_KURTOSIS = 0x08;
const SENSOR_EXTMASK_CRESTFACTOR = 0x10;
const SENSOR_EXTMASK_SKEWNESS = 0x20;
const SENSOR_EXTMASK_STDDEVIATION = 0x40;
const SENSOR_EXTMASK_DISPLACEMENT = 0x80;

// Device Status Masks
const DEVICE_MASK_EVENT = 0x01;
const DEVICE_MASK_POWER_SOURCE = 0x02;
const DEVICE_MASK_BATTERY_LEVEL = 0x04;
const DEVICE_MASK_BATTERY_VOLTAGE = 0x08;
const DEVICE_MASK_TIMESTAMP = 0x10;
const DEVICE_MASK_POSITION = 0x20;

function consume(event) {
  const bytes = Hex.hexToBytes(event.data.payloadHex);
  let i = 0;

  // --- 1. WHDR Header Parsing ---
  if (bytes.length < 4) {
    emit("log", {
      error: "Payload too short for header",
    });
    return;
  }
  const frameControl = bytes[i++];
  if (!(frameControl & 0x80)) {
    emit("log", {
      error: "Fragmentation not supported",
    });
    return;
  }
  i++; // Skip sequence number
  const totalLength = bytes[i++];
  const addressMode = frameControl & 0x0c;
  if (addressMode === 0x04) i += 2; // 2-byte address
  else if (addressMode === 0x08) i += 8; // 8-byte address

  // --- 2. WPayload Parsing ---
  let climate = {};
  let lifecycle = {};
  let vibration = {};
  let location = {};

  const payloadEnd = i + totalLength;

  while (i < payloadEnd && i < bytes.length) {
    const ioHeader = bytes[i];
    const ioType = ioHeader & 0xf0;
    const ioRange = ioHeader & 0x0f;
    const dataStart = i;

    let len = 0;
    if (i + 1 < bytes.length) {
      len = bytes[i + 1];
    } else {
      break; // Not enough data for a full IO block
    }

    i++; // Move past ioHeader
    i++; // Move past len byte

    // --- PAYLOAD_SENSOR_DATA ---
    if (ioType === PAYLOAD_SENSOR_DATA) {
      const maskByte = bytes[i++];

      if (
        ioRange === SENSOR_RANGE_TEMP_C ||
        ioRange === SENSOR_RANGE_TEMP_F ||
        ioRange === SENSOR_RANGE_TEMP_K
      ) {
        if (maskByte & SENSOR_MASK_STATUS) i += 1;
        if (maskByte & SENSOR_MASK_EVENT) i += 2;
        if (maskByte & SENSOR_MASK_VALUE) {
          // read temp and always covert to Celsius
          climate.temperature = (readInt32Le(bytes.slice(i, i + 4)) / 1000).toFixed(2);
          if (ioRange === SENSOR_RANGE_TEMP_F) {
            // covert from Fahrenheit to Celsius
            climate.temperature = ((climate.temperature - 32) * 5 / 9).toFixed(2);
          }
          else if (ioRange === SENSOR_RANGE_TEMP_K) {
            // covert from Kelvin to Celsius
            climate.temperature = (climate.temperature - 273.15).toFixed(2);
          }
          i += 4;
        }
        if (maskByte & SENSOR_MASK_MAX_VALUE) i += 4;
        if (maskByte & SENSOR_MASK_MIN_VALUE) i += 4;
      } else if (
        ioRange === SENSOR_RANGE_ACCELEROMETER_G ||
        ioRange === SENSOR_RANGE_ACCELEROMETER_MS2
      ) {
        const axisMask = (maskByte & 0xe0) >> 5;
        const featureMask = maskByte & 0x1f;

        if (!(featureMask & SENSOR_EXTMASK_B)) {
          // Mask A: Vibration Features
          const extMask = bytes[i++];
          const hasSensorEvent = !!(featureMask & SENSOR_MASK_EVENT);

          const parseAxis = (axisChar) => {
            let axisData = {};
            if (hasSensorEvent) {
              axisData[`sensorEvent${axisChar}`] = readUint16Le(
                bytes.slice(i, i + 2)
              );
              i += 2;
            }
            const scale = ioRange === SENSOR_RANGE_ACCELEROMETER_G ? 1000 : 100;
            if (extMask & SENSOR_EXTMASK_VELOCITY) {
              axisData[`velocityRms${axisChar}`] =
                readInt16Le(bytes.slice(i, i + 2)) / 100;
              i += 2;
            }
            if (extMask & SENSOR_EXTMASK_PEAK) {
              axisData[`accelerationPeak${axisChar}`] =
                readInt16Le(bytes.slice(i, i + 2)) / scale;
              i += 2;
            }
            if (extMask & SENSOR_EXTMASK_RMS) {
              axisData[`accelerationRms${axisChar}`] =
                readInt16Le(bytes.slice(i, i + 2)) / scale;
              i += 2;
            }
            if (extMask & SENSOR_EXTMASK_KURTOSIS) {
              axisData[`kurtosis${axisChar}`] =
                readInt16Le(bytes.slice(i, i + 2)) / 100;
              i += 2;
            }
            if (extMask & SENSOR_EXTMASK_CRESTFACTOR) {
              axisData[`crestFactor${axisChar}`] =
                readInt16Le(bytes.slice(i, i + 2)) / 100;
              i += 2;
            }
            if (extMask & SENSOR_EXTMASK_SKEWNESS) {
              axisData[`skewness${axisChar}`] =
                readInt16Le(bytes.slice(i, i + 2)) / 100;
              i += 2;
            }
            if (extMask & SENSOR_EXTMASK_STDDEVIATION) {
              axisData[`standardDeviation${axisChar}`] =
                readInt16Le(bytes.slice(i, i + 2)) / 100;
              i += 2;
            }
            if (extMask & SENSOR_EXTMASK_DISPLACEMENT) {
              axisData[`displacement${axisChar}`] = readUint16Le(
                bytes.slice(i, i + 2)
              );
              i += 2;
            }
            Object.assign(vibration, axisData);
          };

          if (axisMask & SENSOR_AXIS_X_MASK) parseAxis("X");
          if (axisMask & SENSOR_AXIS_Y_MASK) parseAxis("Y");
          if (axisMask & SENSOR_AXIS_Z_MASK) parseAxis("Z");
        }
      }
    } else if (ioType === PAYLOAD_DEVICE_DATA) {
      // --- PAYLOAD_DEVICE_DATA ---
      const mask = bytes[i++];
      if (mask & DEVICE_MASK_EVENT) {
        lifecycle.deviceEvent = bytes[i++];
      }
      if (mask & DEVICE_MASK_POWER_SOURCE) {
        const source = bytes[i++];
        if (source & 0b10) lifecycle.powerSource = "BATTERY";
        else if (source & 0b01) lifecycle.powerSource = "POWER_LINE";
      }
      if (mask & DEVICE_MASK_BATTERY_LEVEL) {
        lifecycle.batteryLevel = bytes[i++];
      }
      if (mask & DEVICE_MASK_BATTERY_VOLTAGE) {
        lifecycle.batteryVoltage = readUint16Le(bytes.slice(i, i + 2)) / 1000;
        i += 2;
      }
      if (mask & DEVICE_MASK_TIMESTAMP) {
        //lifecycle.timestamp = read_uint32_le(bytes.slice(i, i + 4));
        i += 4;
      }
      if (mask & DEVICE_MASK_POSITION) {
        const posStatus = bytes[i++];
        let lat = readUint24Le(bytes.slice(i, i + 3)) / 100000;
        i += 3;
        let lon = readUint24Le(bytes.slice(i, i + 3)) / 100000;
        i += 3;
        if (posStatus & 0b10) lat = -lat; // South
        if (posStatus & 0b01) lon = -lon; // West
        location.latitude = lat;
        location.longitude = lon;
      }
    }

    // Jump to the end of this IO block to ensure we start the next one correctly.
    i = dataStart + len + 2;
  }

  // --- 3. Emit All Parsed Data ---
  if (Object.keys(climate).length > 0) {
    emit("sample", {
      data: climate,
      topic: "climate",
    });
  }
  if (Object.keys(lifecycle).length > 0) {
    emit("sample", {
      data: lifecycle,
      topic: "lifecycle",
    });
  }
  if (Object.keys(vibration).length > 0) {
    emit("sample", {
      data: vibration,
      topic: "default",
    });
  }
  if (Object.keys(location).length > 0) {
    emit("sample", {
      data: location,
      topic: "gps",
    });
  }
}
