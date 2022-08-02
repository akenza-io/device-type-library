function toLittleEndian(hex, signed) {
  // Creating little endian hex DCBA
  const hexArray = [];
  let tempHex = hex;
  while (tempHex.length >= 2) {
    hexArray.push(tempHex.substring(0, 2));
    tempHex = tempHex.substring(2, tempHex.length);
  }
  hexArray.reverse();

  if (signed) {
    return Bits.bitsToSigned(Bits.hexToBits(hexArray.join("")));
  }
  return Bits.bitsToUnsigned(Bits.hexToBits(hexArray.join("")));
}

function consume(event) {
  const payload = event.data.payloadHex;
  const bits = Bits.hexToBits(payload);
  const { port } = event.data;
  const data = {};
  let topic = "default";

  if (port === 1) {
    data.payloadType = "ECHO";
    data.echo = payload;
    topic = "lifecycle";
  } else if (port === 2) {
    data.payloadType = "RESTART";
    topic = "lifecycle";
  } else if (port === 3) {
    data.payloadType = "NEW_CONFIGURATION_ACCEPTED";
    topic = "lifecycle";
  } else if (port === 4) {
    let pointer = 0;

    while (pointer < payload.length) {
      const header = Bits.bitsToUnsigned(bits.substr(pointer * 4, 8));
      pointer += 2;

      switch (header) {
        case 0x04:
          data.measurementInterval = toLittleEndian(
            payload.substr(pointer, 8),
            false,
          );
          pointer += 8;
          break;
        case 0x05:
          data.sendInterval = toLittleEndian(payload.substr(pointer, 2), false);
          pointer += 2;
          break;
        case 0x06:
          data.joinInterval = toLittleEndian(payload.substr(pointer, 8), false);
          pointer += 8;
          break;
        case 0x07:
          data.reedActive = !!toLittleEndian(payload.substr(pointer, 2), false);
          pointer += 2;
          break;
        case 0x15:
          data.areaConfig = toLittleEndian(payload.substr(pointer, 32), false); // Map
          pointer += 32;
          break;
        case 0x16:
          data.timingBudget = toLittleEndian(payload.substr(pointer, 4), false);
          pointer += 4;
          break;
        case 0x17:
          data.range = toLittleEndian(payload.substr(pointer, 2), false);
          if (data.range === 1) {
            data.range = "SHORT_RANGE";
          } else if (data.range === 2) {
            data.range = "LONG_RANGE";
          }
          pointer += 2;
          break;
        case 0x23:
          data.magnitudeTolerance = toLittleEndian(
            payload.substr(pointer, 4),
            false,
          );
          pointer += 4;
          break;
        case 0x24:
          data.tiltTolerance = toLittleEndian(
            payload.substr(pointer, 4),
            false,
          );
          pointer += 4;
          break;
        case 0x25:
          data.averagingSamples = toLittleEndian(
            payload.substr(pointer, 4),
            false,
          );
          pointer += 4;
          break;
        case 0x26:
          data.notificationSettings = toLittleEndian(
            payload.substr(pointer, 2),
            false,
          );
          pointer += 2;
          break;
        case 0x27:
          data.notificationTimeout = toLittleEndian(
            payload.substr(pointer, 4),
            false,
          );
          pointer += 4;
          break;

        default:
          pointer = payload.length;
          break;
      }
    }

    data.payloadType = "REPORT_CONFIGURATION";
    topic = "lifecycle";
  } else if (port === 5) {
    const errorPort = Bits.bitsToUnsigned(bits.substr(0, 8));
    const errorCode = Bits.bitsToUnsigned(bits.substr(0, 8));

    if (errorPort === 2) {
      data.errorOn = "RESTART";
    } else if (errorPort === 3) {
      data.errorOn = "PARAM_CHANGE";
    } else if (errorPort === 4) {
      data.errorOn = "PARAM_READ";
    }

    if (errorCode === 1) {
      data.errorCode = "PARAM_UNKNOWN";
    } else if (errorCode === 2) {
      data.errorCode = "PARAM_READ_ONLY";
    } else if (errorCode === 4) {
      data.errorCode = "PARAM_NOT_READABLE";
    } else if (errorCode === 8) {
      data.errorCode = "COMMAND_STRUCTURE_WRONG";
    }
    topic = "error";
  } else if (port === 99) {
    data.xAxisAccelerometer = toLittleEndian(payload.substr(0, 4), true);
    data.yAxisAccelerometer = toLittleEndian(payload.substr(4, 4), true);
    data.zAxisAccelerometer = toLittleEndian(payload.substr(8, 4), true);

    topic = "acceleration";
  } else if (port === 100 || port === 101 || port === 102) {
    const distance = toLittleEndian(payload.substr(0, 4), false) / 10;
    if (distance !== 6553.5) {
      data.distance = distance;
    } else {
      data.distance = null;
    }

    if (event.device !== undefined && data.distance !== undefined) {
      if (event.device.customFields !== undefined) {
        const { customFields } = event.device;
        let scaleLength = null;
        let sensorDistance = 0;

        if (customFields.tankHeightCm !== undefined) {
          scaleLength = Number(event.device.customFields.tankHeightCm);
        }

        if (customFields.distanceSensorSurfaceCM !== undefined) {
          sensorDistance = Number(
            event.device.customFields.distanceSensorSurfaceCM,
          );
        }

        if (scaleLength !== null) {
          const percentExact =
            (100 / scaleLength) *
            (scaleLength - (data.distance - sensorDistance));
          let fillLevel = Math.round(percentExact);
          if (fillLevel > 100) {
            fillLevel = 100;
          } else if (fillLevel < 0) {
            fillLevel = 0;
          }
          data.fillLevel = fillLevel;
        }
      }
    }

    const topLeft = toLittleEndian(payload.substr(4, 4), false) / 10;
    const topCenter = toLittleEndian(payload.substr(8, 4), false) / 10;
    const topRight = toLittleEndian(payload.substr(12, 4), false) / 10;

    const middleLeft = toLittleEndian(payload.substr(16, 4), false) / 10;
    const middleCenter = toLittleEndian(payload.substr(20, 4), false) / 10;
    const middleRight = toLittleEndian(payload.substr(24, 2), false) / 10;

    const bottomLeft = toLittleEndian(payload.substr(28, 4), false) / 10;
    const bottomCenter = toLittleEndian(payload.substr(32, 4), false) / 10;
    const bottomRight = toLittleEndian(payload.substr(36, 4), false) / 10;

    if (topLeft !== 6553.5) {
      data.topLeft = topLeft;
    } else {
      data.topLeft = null;
    }

    if (topCenter !== 6553.5) {
      data.topCenter = topCenter;
    } else {
      data.topCenter = null;
    }

    if (topRight !== 6553.5) {
      data.topRight = topRight;
    } else {
      data.topRight = null;
    }

    if (middleLeft !== 6553.5) {
      data.middleLeft = middleLeft;
    } else {
      data.middleLeft = null;
    }

    if (middleCenter !== 6553.5) {
      data.middleCenter = middleCenter;
    } else {
      data.middleCenter = null;
    }

    if (middleRight !== 6553.5) {
      data.middleRight = middleRight;
    } else {
      data.middleRight = null;
    }

    if (bottomLeft !== 6553.5) {
      data.bottomLeft = bottomLeft;
    } else {
      data.bottomLeft = null;
    }

    if (bottomCenter !== 6553.5) {
      data.bottomCenter = bottomCenter;
    } else {
      data.bottomCenter = null;
    }

    if (bottomRight !== 6553.5) {
      data.bottomRight = bottomRight;
    } else {
      data.bottomRight = null;
    }

    const flags = toLittleEndian(payload.substr(40, 4), false);
    data.errorFlags = [];

    if (flags & 0x01) {
      data.errorFlags.push(
        "Sigma Warning: The signal is too weak, the measurement is probably not accurate. This is often due to ambient light.",
      );
    }

    if (flags & 0x02) {
      data.errorFlags.push(
        "Singal Failure: Signal is too weak for a measurement.",
      );
    }

    if (flags & 0x08) {
      data.errorFlags.push("No target detected.");
    }

    if (flags & 0x40) {
      data.errorFlags.push("Target is too far away.");
    }

    if (flags & 0x80) {
      data.errorFlags.push("Communication error.");
    }

    const temperature = toLittleEndian(payload.substr(44, 4), true);
    if (temperature !== -32768) {
      data.temperature = temperature;
    } else {
      data.temperature = null;
    }

    data.voltage = toLittleEndian(payload.substr(48, 4), false) / 1000;
    let batteryLevel = Math.round((data.voltage - 2.1) / 0.01 / 10) * 10;

    if (batteryLevel > 100) {
      batteryLevel = 100;
    } else if (batteryLevel < 0) {
      batteryLevel = 0;
    }
    data.batteryLevel = batteryLevel;

    if (port === 100) {
      data.measurementType = "REGULAR_MEASUREMENT";
    } else if (port === 101) {
      data.measurementType = "EVENT_MEASUREMENT";
    } else if (port === 102) {
      data.measurementType = "MANUAL_MEASUREMENT";
    }

    topic = "measurement";
  }

  emit("sample", { data, topic });
}
