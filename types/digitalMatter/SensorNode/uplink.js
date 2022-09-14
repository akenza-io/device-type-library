function parseVersionUplink(buffer, index) {
  return {
    product: buffer[index],
    hardwareRev: buffer[index + 1],
    firmwareMajor: buffer[index + 2],
    firmwareMinor: buffer[index + 3],
  };
}

function parseLittleEndianInt32(buffer, offset) {
  let result =
    (buffer[offset + 3] << 24) +
    (buffer[offset + 2] << 16) +
    (buffer[offset + 1] << 8) +
    buffer[offset];

  if ((result & 0x80000000) > 0) {
    result -= 0x100000000;
  }

  return result;
}

function parseLittleEndianInt24(buffer, offset) {
  let result =
    (buffer[offset + 2] << 16) + (buffer[offset + 1] << 8) + buffer[offset];

  if ((result & 0x800000) > 0) {
    result -= 0x1000000;
  }

  return result;
}

function parseLittleEndianInt16(buffer, offset) {
  let result = (buffer[offset + 1] << 8) + buffer[offset];

  if ((result & 0x8000) > 0) {
    result -= 0x10000;
  }

  return result;
}

function parseLittleEndianUInt16(buffer, offset) {
  const result = (buffer[offset + 1] << 8) + buffer[offset];

  return result;
}

function parseGPSData(buffer, index) {
  if (buffer[index] === 255 && buffer[index + 1] === 255 && buffer[index + 2]) {
    return "NO_FIX_AVAILABLE";
  }

  return {
    latitude: 0.0000256 * parseLittleEndianInt24(buffer, index),
    longitude: 0.0000256 * parseLittleEndianInt24(buffer, index + 3),
  };
}

function parseAcknowledgementUplink(buffer, index) {
  const seqNum = buffer[index] & 0x7f;
  const downlinkState = (buffer[index] & 0x80) > 0;
  const firmwareMajor = buffer[index + 1];
  const firmwareMinor = buffer[index + 2];

  return {
    sequenceNumber: seqNum,
    downlinkAccepted: downlinkState,
    firmwareMajor,
    firmwareMinor,
  };
}

function parseBatteryVoltage(buffer, index) {
  return parseLittleEndianUInt16(buffer, index);
}

function parseAnalogIn(buffer, index) {
  return parseLittleEndianUInt16(buffer, index);
}

function parseDigitalIOState(buffer, index) {
  return {
    digital1: (buffer[index] & 1) > 0,
    digital2: (buffer[index] & 2) > 0,
    digital3: (buffer[index] & 4) > 0,
    output3v3: (buffer[index] & 8) > 0,
  };
}

function parseInputPulseCount(buffer, index) {
  const inputPulseCount = parseLittleEndianUInt16(buffer, index);

  return inputPulseCount;
}

function parseDigitalInputAlert(buffer, index) {
  const digitalState = buffer[index];
  const digitalTrigger = buffer[index + 1];
  const digitalChange1 = parseLittleEndianUInt16(buffer, index + 2);
  const digitalChange2 = parseLittleEndianUInt16(buffer, index + 4);

  return {
    digitalState,
    digitalTrigger,
    digitalChange1,
    digitalChange2,
  };
}

function parseInternalTemperature(buffer, index) {
  const internalTemperature = parseLittleEndianInt16(buffer, index) / 100;

  return internalTemperature;
}

function parseI2CTempProbe(buffer, index) {
  const tempProbe = parseLittleEndianInt16(buffer, index) / 100;

  return tempProbe;
}

function parseI2CTempRelativeHumidity(buffer, index) {
  const temperature = parseLittleEndianInt16(buffer, index) / 100;
  const relativeHumidity = buffer[index + 2] / 2;

  return {
    temperature,
    relativeHumidity,
  };
}

function parseBatteryEnergySincePower(buffer, index) {
  const batteryEnergyUsed = parseLittleEndianInt16(buffer, index);

  return batteryEnergyUsed;
}

function parseEstimatedBatteryRemaining(buffer, index) {
  const estimatedBatteryRemaining = parseLittleEndianInt16(buffer, index);

  return estimatedBatteryRemaining;
}

function parseSDISoilMoistureData(buffer, index, numSamples) {
  const data = [];

  for (let i = 0; i < numSamples; i++) {
    data.push(buffer[index + i + 1] / 2 - 5);
  }

  return data;
}

function parseSDITempData(buffer, index, numSamples) {
  const data = [];

  for (let i = 0; i < numSamples; i++) {
    data.push(buffer[index + i + 1] / 2 - 40);
  }

  return data;
}

function parseSDIINT16Data(buffer, index, numSamples) {
  const data = [];

  for (let i = 0; i < numSamples; i++) {
    data.push(parseLittleEndianInt16(buffer, index + i * 2 + 1) / 100);
  }

  return data;
}

function parseSDIINT32Data(buffer, index, numSamples) {
  const data = [];

  for (let i = 0; i < numSamples; i++) {
    data.push(parseLittleEndianInt32(buffer, index + i * 4 + 1) / 1000);
  }

  return data;
}

function parseSDIINT12Data(buffer, index, numSamples) {
  const data = [];

  for (let i = 0; i < numSamples; i++) {
    let rawVal = 0;
    const twiceOffset = i * 3;
    if ((twiceOffset & 1) > 0) {
      rawVal =
        ((buffer[index + 1 + (twiceOffset - 1) / 2] & 0xf) << 8) +
        buffer[index + 1 + (twiceOffset + 1) / 2];
    } else {
      rawVal =
        (buffer[index + 1 + twiceOffset / 2] << 4) +
        (buffer[index + 1 + twiceOffset / 2 + 1] >> 4);
    }
    data.push(rawVal / 20 - 50);
  }

  return data;
}

function getSDISize(buffer, index) {
  const numSamples = buffer[index] & 0x0f;
  const dataTypeId = buffer[index] >> 4;
  let size = 0;

  switch (dataTypeId) {
    case 0: // Soil moisture
      size = numSamples + 1;
      return size;

    case 1: // Temperature
      size = numSamples + 1;
      return size;

    case 2: // INT16
      size = numSamples * 2 + 1;
      return size;

    case 3: // INT32
      size = numSamples * 4 + 1;
      return size;

    case 4: // INT12
      size = Math.ceil(numSamples * 1.5) + 1;
      return size;

    default:
      size = 0 + 1;
      return size;
  }
}

function parseSDIMeasurement(id, buffer, index) {
  const numSamples = buffer[index] & 0x0f;
  const dataTypeId = buffer[index] >> 4;
  let data = null;

  switch (dataTypeId) {
    case 0: // Soil moisture
      data = parseSDISoilMoistureData(buffer, index, numSamples);
      return data;

    case 1: // Temperature
      data = parseSDITempData(buffer, index, numSamples);
      return data;

    case 2: // INT16
      data = parseSDIINT16Data(buffer, index, numSamples);
      return data;

    case 3: // INT32
      data = parseSDIINT32Data(buffer, index, numSamples);
      return data;

    case 4: // INT12
      data = parseSDIINT12Data(buffer, index, numSamples);
      return data;

    default:
      data = null;
      return data;
  }
}

function parseDataField(buffer, index, portId) {
  let id = buffer[index];
  let indexShift = 1;

  if (portId !== null) {
    id = portId;
    indexShift = 0;
  }

  switch (id) {
    case 0:
      return [
        {
          ID: "lifecycle",
          MessageType: "reserved",
        },
        0,
      ];

    case 1:
      return [
        {
          ID: "lifecycle",
          MessageType: "firmware",
          Value: parseVersionUplink(buffer, index + indexShift),
        },
        4,
      ];

    case 2:
      return [
        {
          ID: "lifecycle",
          MessageType: "debug",
          Value: null,
        },
        0,
      ];

    case 3:
      return [
        {
          ID: "lifecycle",
          MessageType: "acknowledge",
          Value: parseAcknowledgementUplink(buffer, index + indexShift),
        },
        4,
      ];

    case 10:
      return [
        {
          ID: "gps",
          MessageType: "gps",
          Value: parseGPSData(buffer, index + indexShift),
        },
        6,
      ];

    case 20:
      return [
        {
          ID: "lifecycle",
          MessageType: "batteryVoltage",
          Value: parseBatteryVoltage(buffer, index + indexShift),
        },
        2,
      ];

    case 21:
      return [
        {
          ID: "analog",
          MessageType: "analog1",
          Value: parseAnalogIn(buffer, index + indexShift),
        },
        2,
      ];

    case 22:
      return [
        {
          ID: "analog",
          MessageType: "analog2",
          Value: parseAnalogIn(buffer, index + indexShift),
        },
        2,
      ];

    case 23:
      return [
        {
          ID: "analog",
          MessageType: "analog3",
          Value: parseAnalogIn(buffer, index + indexShift),
        },
        2,
      ];

    case 30:
      return [
        {
          ID: "digital",
          MessageType: "digital",
          Value: parseDigitalIOState(buffer, index + indexShift),
        },
        1,
      ];

    case 31:
      return [
        {
          ID: "input",
          MessageType: "input1",
          Value: parseInputPulseCount(buffer, index + indexShift),
        },
        2,
      ];

    case 32:
      return [
        {
          ID: "input",
          MessageType: "input2",
          Value: parseInputPulseCount(buffer, index + indexShift),
        },
        2,
      ];

    case 33:
      return [
        {
          ID: "input",
          MessageType: "input3",
          Value: parseInputPulseCount(buffer, index + indexShift),
        },
        2,
      ];

    case 39:
      return [
        {
          ID: "digital",
          MessageType: "digitalAlert",
          Value: parseDigitalInputAlert(buffer, index + indexShift),
        },
        6,
      ];

    case 40:
      return [
        {
          ID: "lifecycle",
          MessageType: "internalTemperature",
          Value: parseInternalTemperature(buffer, index + indexShift),
        },
        2,
      ];

    case 41:
      return [
        {
          ID: "probe",
          MessageType: "probe1",
          Value: parseI2CTempProbe(buffer, index + indexShift),
        },
        2,
      ];

    case 42:
      return [
        {
          ID: "probe",
          MessageType: "probe2",
          Value: parseI2CTempProbe(buffer, index + indexShift),
        },
        2,
      ];

    case 43:
      return [
        {
          ID: "temperature",
          MessageType: "tempHum",
          Value: parseI2CTempRelativeHumidity(buffer, index + indexShift),
        },
        3,
      ];

    case 50:
      return [
        {
          ID: "lifecycle",
          MessageType: "batteryUsed",
          Value: parseBatteryEnergySincePower(buffer, index + indexShift),
        },
        2,
      ];

    case 51:
      return [
        {
          ID: "lifecycle",
          MessageType: "batteryRemaining",
          Value: parseEstimatedBatteryRemaining(buffer, index + indexShift),
        },
        1,
      ];

    case 128:
      return [
        {
          ID: "measurement",
          MessageType: "measurement1",
          Value: parseSDIMeasurement(id, buffer, index + indexShift, portId),
        },
        getSDISize(buffer, index + indexShift, portId),
      ];

    case 129:
      return [
        {
          ID: "measurement",
          MessageType: "measurement2",
          Value: parseSDIMeasurement(id, buffer, index + indexShift, portId),
        },
        getSDISize(buffer, index + indexShift, portId),
      ];

    case 130:
      return [
        {
          ID: "measurement",
          MessageType: "measurement3",
          Value: parseSDIMeasurement(id, buffer, index + indexShift, portId),
        },
        getSDISize(buffer, index + indexShift, portId),
      ];

    case 131:
      return [
        {
          ID: "measurement",
          MessageType: "measurement4",
          Value: parseSDIMeasurement(id, buffer, index + indexShift, portId),
        },
        getSDISize(buffer, index + indexShift, portId),
      ];

    case 132:
      return [
        {
          ID: "measurement",
          MessageType: "measurement5",
          Value: parseSDIMeasurement(id, buffer, index + indexShift, portId),
        },
        getSDISize(buffer, index + indexShift, portId),
      ];

    case 133:
      return [
        {
          ID: "measurement",
          MessageType: "measurement6",
          Value: parseSDIMeasurement(id, buffer, index + indexShift, portId),
        },
        getSDISize(buffer, index + indexShift, portId),
      ];

    case 134:
      return [
        {
          ID: "measurement",
          MessageType: "measurement7",
          Value: parseSDIMeasurement(id, buffer, index + indexShift, portId),
        },
        getSDISize(buffer, index + indexShift, portId),
      ];

    case 135:
      return [
        {
          ID: "measurement",
          MessageType: "measurement8",
          Value: parseSDIMeasurement(id, buffer, index + indexShift, portId),
        },
        getSDISize(buffer, index + indexShift, portId),
      ];

    case 136:
      return [
        {
          ID: "measurement",
          MessageType: "measurement9",
          Value: parseSDIMeasurement(id, buffer, index + indexShift, portId),
        },
        getSDISize(buffer, index + indexShift, portId),
      ];

    case 137:
      return [
        {
          ID: "measurement",
          MessageType: "measurement10",
          Value: parseSDIMeasurement(id, buffer, index + indexShift, portId),
        },
        getSDISize(buffer, index + indexShift, portId),
      ];

    case 223:
      return [
        {
          ID: "lifecycle",
          MessageType: "reserved",
        },
        0,
      ];

    default:
      return null;
  }
}

function hexToBytes(hex) {
  for (var bytes = [], c = 0; c < hex.length; c += 2) {
    bytes.push(parseInt(hex.substr(c, 2), 16));
  }
  return bytes;
}

function deleteUnusedKeys(data) {
  let keysRetained = false;
  Object.keys(data).forEach((key) => {
    if (data[key] === undefined || Number.isNaN(data[key])) {
      delete data[key];
    } else {
      keysRetained = true;
    }
  });
  return keysRetained;
}

function consume(event) {
  const bytes = hexToBytes(event.data.payloadHex);
  const { port } = event.data;

  const lifecycle = {};
  const gps = {};
  const digital = {};
  const analog = {};
  const input = {};
  const probe = {};
  const humidity = {};
  const measurement = {};

  const payloadLength = bytes.length;
  let iteratedMessageLength = 0;

  while (iteratedMessageLength < payloadLength) {
    let dataField;
    if (iteratedMessageLength === 0) {
      dataField = parseDataField(bytes, iteratedMessageLength, port);
    } else {
      dataField = parseDataField(bytes, iteratedMessageLength, null);
    }

    if (dataField === null) {
      iteratedMessageLength += 1;
    } else {
      const id = dataField[0].ID;
      const messageType = dataField[0].MessageType;
      const value = dataField[0].Value;

      if (
        typeof value === "object" &&
        !Array.isArray(value) &&
        value !== null
      ) {
        Object.keys(value).forEach((key) => {
          switch (id) {
            case "lifecycle":
              lifecycle[key] = value[key];
              break;
            case "gps":
              gps[key] = value[key];
              break;
            case "digital":
              digital[key] = value[key];
              break;
            case "analog":
              analog[key] = value[key];
              break;
            case "input":
              input[key] = value[key];
              break;
            case "probe":
              probe[key] = value[key];
              break;
            case "humidity":
              humidity[key] = value[key];
              break;
            case "measurement":
              measurement[key] = value[key];
              break;
            default:
              break;
          }
        });
      } else {
        switch (id) {
          case "lifecycle":
            lifecycle[messageType] = value;
            break;
          case "gps":
            gps[messageType] = value;
            break;
          case "digital":
            digital[messageType] = value;
            break;
          case "analog":
            analog[messageType] = value;
            break;
          case "input":
            input[messageType] = value;
            break;
          case "probe":
            probe[messageType] = value;
            break;
          case "humidity":
            humidity[messageType] = value;
            break;
          case "measurement":
            measurement[messageType] = value;
            break;
          default:
            break;
        }
      }

      if (iteratedMessageLength === 0) {
        iteratedMessageLength += dataField[1];
      } else {
        iteratedMessageLength += dataField[1] + 1;
      }
    }
  }

  if (deleteUnusedKeys(lifecycle)) {
    emit("sample", { data: lifecycle, topic: "lifecycle" });
  }

  if (deleteUnusedKeys(gps)) {
    emit("sample", { data: gps, topic: "gps" });
  }

  if (deleteUnusedKeys(digital)) {
    emit("sample", { data: digital, topic: "digital" });
  }

  if (deleteUnusedKeys(analog)) {
    emit("sample", { data: analog, topic: "analog" });
  }

  if (deleteUnusedKeys(input)) {
    emit("sample", { data: input, topic: "input" });
  }

  if (deleteUnusedKeys(probe)) {
    emit("sample", { data: probe, topic: "probe" });
  }

  if (deleteUnusedKeys(humidity)) {
    emit("sample", { data: humidity, topic: "humidity" });
  }

  if (deleteUnusedKeys(measurement)) {
    emit("sample", { data: measurement, topic: "measurement" });
  }
}
