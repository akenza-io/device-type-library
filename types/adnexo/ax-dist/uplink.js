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
        case 0x01:
          data.appEui = payload.substr(pointer, 16);
          pointer += 16;
          break;
        case 0x02:
          data.appKey = payload.substr(pointer, 32);
          pointer += 32;
          break;
        case 0x03:
          data.devEui = payload.substr(pointer, 16);
          pointer += 16;
          break;
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
          data.reed = toLittleEndian(payload.substr(pointer, 2), false);
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
  } else if (port === 100 || port === 101 || port === 102) {
    const distance = toLittleEndian(payload.substr(0, 4), false) / 10;
    if (distance !== 6553.5) {
      data.distance = distance;
    } else {
      data.distance = null;
    }

    if (event.device !== undefined && data.distance !== undefined) {
      if (event.device.customFields !== undefined) {
        const scaleLength = Number(
          event.device.customFields["Height of the tank in cm"],
        );
        const sensorDistance = Number(
          event.device.customFields["Distance of sensor to surface in cm"],
        );

        if (
          scaleLength !== NaN &&
          scaleLength !== undefined &&
          sensorDistance !== NaN &&
          scaleLength !== undefined
        ) {
          const percentExact =
            (100 / scaleLength) *
            (scaleLength - (data.distance - sensorDistance));
          let percent = Math.round(percentExact);
          if (percent > 100) {
            percent = 100;
          } else if (percent < 0) {
            percent = 0;
          }
          data.percent = percent;
        }
      }
    }

    const temperature = toLittleEndian(payload.substr(4, 4), true) / 10;
    if (temperature !== -3276.8) {
      data.temperature = temperature;
    } else {
      data.temperature = null;
    }

    data.voltage = toLittleEndian(payload.substr(8, 4), false) / 1000;
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
  } else if (port === 104) {
    const measVariance = toLittleEndian(payload.substr(4, 4), false) / 10;
    if (measVariance !== 6553.5) {
      data.measVariance = measVariance;
    } else {
      data.measVariance = null;
    }

    topic = "invalid_measurement";
  }

  emit("sample", { data, topic });
}
