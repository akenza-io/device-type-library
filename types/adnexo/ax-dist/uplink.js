function cToF(celsius) { 
 return Math.round(((celsius * 9) / 5 + 32) * 10) / 10; 
 } 

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
    topic = "status";
  } else if (port === 2) {
    data.payloadType = "RESTART";
    topic = "status";
  } else if (port === 3) {
    data.payloadType = "NEW_CONFIGURATION_ACCEPTED";
    topic = "status";
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
        case 0x52:
          data.thresholdDistance = toLittleEndian(
            payload.substr(pointer, 4),
            true,
          );
          pointer += 4;
          break;

        default:
          pointer = payload.length;
          break;
      }
    }

    data.payloadType = "REPORT_CONFIGURATION";
    topic = "status";
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
        } else if (customFields.containerHeight !== undefined) {
          scaleLength = Number(event.device.customFields.containerHeight);
        }

        if (customFields.distanceSensorSurfaceCM !== undefined) {
          sensorDistance = Number(
            event.device.customFields.distanceSensorSurfaceCM,
          );
        } else if (customFields.installationOffset !== undefined) {
          sensorDistance = Number(event.device.customFields.installationOffset);
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

    const temperature = toLittleEndian(payload.substr(4, 4), true) / 10;
    if (temperature !== -3276.8) {
      data.temperature = temperature;
 data.temperatureF = cToF(data.temperature);
    } else {
      data.temperature = null;
 data.temperatureF = cToF(data.temperature);
    }

    const lifecycle = {};
    lifecycle.batteryVoltage =
      toLittleEndian(payload.substr(8, 4), false) / 1000;
    let batteryLevel =
      Math.round((lifecycle.batteryVoltage - 2.1) / 0.01 / 10) * 10;

    if (batteryLevel > 100) {
      batteryLevel = 100;
    } else if (batteryLevel < 0) {
      batteryLevel = 0;
    }
    lifecycle.batteryLevel = batteryLevel;

    emit("sample", { data: lifecycle, topic: "lifecycle" });
    if (port === 100) {
      data.measurementType = "REGULAR_MEASUREMENT";
    } else if (port === 101) {
      data.measurementType = "EVENT_MEASUREMENT";
    } else if (port === 102) {
      data.measurementType = "MANUAL_MEASUREMENT";
    }

    topic = "measurement";
  } else if (port === 104) {
    const measurementVariance =
      toLittleEndian(payload.substr(4, 4), false) / 10;
    if (measurementVariance !== 6553.5) {
      data.measurementVariance = measurementVariance;
    } else {
      data.measurementVariance = null;
    }

    topic = "invalid_measurement";
  }

  emit("sample", { data, topic });
}
