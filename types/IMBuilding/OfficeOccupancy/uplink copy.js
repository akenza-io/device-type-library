const payloadTypes = {
  COMFORT_SENSOR: 0x01,
  PEOPLE_COUNTER: 0x02,
  BUTTONS: 0x03,
  PULSE_COUNTER: 0x04,
  TRACKER: 0x05,
  DOWNLINK: 0xf1,
};

function toHEXString(payload, index, length) {
  let HEXString = "";

  for (let i = 0; i < length; i++) {
    if (payload[index + i] < 16) {
      HEXString += "0";
    }
    HEXString += payload[index + i].toString(16);
  }

  return HEXString;
}

function readUInt16BE(payload, index) {
  return (payload[index] << 8) + payload[++index];
}

function containsIMBHeader(payload) {
  if (
    payload[0] === payloadTypes.COMFORT_SENSOR &&
    payload[1] === 0x03 &&
    payload.length === 20
  ) {
    return true;
  }
  if (
    payload[0] === payloadTypes.PEOPLE_COUNTER &&
    payload[1] === 0x06 &&
    payload.length === 23
  ) {
    return true;
  }
  if (
    payload[0] === payloadTypes.PEOPLE_COUNTER &&
    payload[1] === 0x07 &&
    payload.length === 15
  ) {
    return true;
  }
  if (
    payload[0] === payloadTypes.PEOPLE_COUNTER &&
    payload[1] === 0x08 &&
    payload.length === 14
  ) {
    return true;
  }
  if (
    payload[0] === payloadTypes.BUTTONS &&
    payload[1] === 0x03 &&
    payload.length === 14
  ) {
    return true;
  }
  if (
    payload[0] === payloadTypes.BUTTONS &&
    payload[1] === 0x04 &&
    payload.length === 23
  ) {
    return true;
  }

  return false;
}

function parseComfortSensor(bytes, parsedData) {
  switch (parsedData.payload_variant) {
    case 0x03:
      parsedData.deviceStatus = bytes[bytes.length - 10];
      parsedData.batteryVoltage = readUInt16BE(bytes, bytes.length - 9) / 100;
      parsedData.temperature = readUInt16BE(bytes, bytes.length - 7) / 100;
      parsedData.humidity = readUInt16BE(bytes, bytes.length - 5) / 100;
      parsedData.co2 = readUInt16BE(bytes, bytes.length - 3);
      parsedData.presence = bytes[bytes.length - 1] === 1;
      break;
    default:
      break;
  }
}

function parsePeopleCounter(input, parsedData) {
  switch (parsedData.payload_variant) {
    case 0x06:
      parsedData.device_status = input.bytes[input.bytes.length - 13];
      parsedData.battery_voltage =
        readUInt16BE(input.bytes, input.bytes.length - 12) / 100;
      parsedData.counter_a = readUInt16BE(input.bytes, input.bytes.length - 10);
      parsedData.counter_b = readUInt16BE(input.bytes, input.bytes.length - 8);
      parsedData.sensor_status = input.bytes[input.bytes.length - 6];
      parsedData.total_counter_a = readUInt16BE(
        input.bytes,
        input.bytes.length - 5,
      );
      parsedData.total_counter_b = readUInt16BE(
        input.bytes,
        input.bytes.length - 3,
      );
      parsedData.payload_counter = input.bytes[input.bytes.length - 1];
      break;
    case 0x07:
      parsedData.sensor_status = input.bytes[input.bytes.length - 5];
      parsedData.total_counter_a = readUInt16BE(
        input.bytes,
        input.bytes.length - 4,
      );
      parsedData.total_counter_b = readUInt16BE(
        input.bytes,
        input.bytes.length - 2,
      );
      break;
    case 0x08:
      parsedData.device_status = input.bytes[input.bytes.length - 4];
      parsedData.battery_voltage =
        readUInt16BE(input.bytes, input.bytes.length - 3) / 100;
      parsedData.sensor_status = input.bytes[input.bytes.length - 1];
      break;
    default:
      break;
  }
}

function parseButtons(input, parsedData) {
  switch (parsedData.payload_variant) {
    case 0x03:
      if (input.payloadHeader !== false) {
        parsedData.device_status = input.bytes[input.bytes.length - 4];
        parsedData.battery_voltage =
          readUInt16BE(input.bytes, input.bytes.length - 3) / 100;
      }
      parsedData.button_pressed = input.bytes[input.bytes.length - 1] !== 0;
      parsedData.button = {
        a: !!input.bytes[input.bytes.length - 1] & 0x01,
        b: !!input.bytes[input.bytes.length - 1] & 0x02,
        c: !!input.bytes[input.bytes.length - 1] & 0x04,
        d: !!input.bytes[input.bytes.length - 1] & 0x08,
        e: !!input.bytes[input.bytes.length - 1] & 0x10,
      };
      break;
    case 0x04:
      if (input.payloadHeader !== false) {
        parsedData.device_status = input.bytes[input.bytes.length - 13];
        parsedData.battery_voltage =
          readUInt16BE(input.bytes, input.bytes.length - 12) / 100;
      }
      parsedData.button = {
        a: readUInt16BE(input.bytes, input.bytes.length - 10),
        b: readUInt16BE(input.bytes, input.bytes.length - 8),
        c: readUInt16BE(input.bytes, input.bytes.length - 6),
        d: readUInt16BE(input.bytes, input.bytes.length - 4),
        e: readUInt16BE(input.bytes, input.bytes.length - 2),
      };
      break;
    default:
      break;
  }
}

function hexToBytes(hex) {
  const bytes = [];
  let c = 0;
  for (bytes, c; c < hex.length; c += 2) {
    bytes.push(parseInt(hex.substr(c, 2), 16));
  }
  return bytes;
}

function consume(event) {
  const payload = event.data.payloadHex;
  const { port } = event.data;
  const bytes = hexToBytes(payload);
  // const data = {};
  // const lifecycle = {};
  // const totalCounter = {};
  const parsedData = {};
  let payloadHeader;

  if (!containsIMBHeader(bytes)) {
    // When payload doesn't contain IMBuildings header
    // Assumes that payload is transmitted on specific recommended fport
    // e.g. payload type 2 variant 6 on FPort 26, type 2 variant 7 on FPort 27 and so on...
    switch (port) {
      case 10:
        // Assumes data is response from downlink
        parsedData.payload_type = payloadTypes.DOWNLINK;
        parsedData.payload_variant = 0x01;
        break;
      case 13:
        parsedData.payload_type = payloadTypes.COMFORT_SENSOR;
        parsedData.payload_variant = 3;
        break;
      case 26:
        parsedData.payload_type = payloadTypes.PEOPLE_COUNTER;
        parsedData.payload_variant = 6;
        break;
      case 27:
        parsedData.payload_type = payloadTypes.PEOPLE_COUNTER;
        parsedData.payload_variant = 7;
        break;
      case 28:
        parsedData.payload_type = payloadTypes.PEOPLE_COUNTER;
        parsedData.payload_variant = 8;
        break;
      case 33:
        parsedData.payload_type = payloadTypes.BUTTONS;
        parsedData.payload_variant = 3;
        payloadHeader = false;
        break;
      case 34:
        parsedData.payload_type = payloadTypes.BUTTONS;
        parsedData.payload_variant = 4;
        payloadHeader = false;
        break;
      default:
        return { errors: [] };
    }
  } else {
    parsedData.payload_type = bytes[0];
    parsedData.payload_variant = bytes[1];
    parsedData.device_id = toHEXString(bytes, 2, 8);
  }

  switch (parsedData.payload_type) {
    case payloadTypes.COMFORT_SENSOR:
      parseComfortSensor(input, parsedData);
      break;
    case payloadTypes.PEOPLE_COUNTER:
      parsePeopleCounter(input, parsedData);
      break;
    case payloadTypes.BUTTONS:
      parseButtons(input, parsedData);
      break;
    default:
      return { errors: [] };
  }

  return { data: parsedData };

  /*
  switch (bytes[1]) {
    case 0x06:
      lifecycle.deviceStatus = bytes[bytes.length - 13];
      lifecycle.voltage = readUInt16BE(bytes, bytes.length - 12) / 100;
      data.counterA = readUInt16BE(bytes, bytes.length - 10);
      data.counterB = readUInt16BE(bytes, bytes.length - 8);
      lifecycle.sensorStatus = bytes[bytes.length - 6];
      totalCounter.totalCounterA = readUInt16BE(bytes, bytes.length - 5);
      totalCounter.totalCounterB = readUInt16BE(bytes, bytes.length - 3);
      lifecycle.payloadCounter = bytes[bytes.length - 1];
      emit("sample", { data: totalCounter, topic: "totalCounter" });
      break;
    case 0x07:
      lifecycle.sensorStatus = bytes[bytes.length - 5];
      totalCounter.totalCounterA = readUInt16BE(bytes, bytes.length - 4);
      totalCounter.totalCounterB = readUInt16BE(bytes, bytes.length - 2);
      emit("sample", { data: totalCounter, topic: "totalCounter" });
      break;
    case 0x08:
      lifecycle.deviceStatus = bytes[bytes.length - 4];
      lifecycle.voltage = readUInt16BE(bytes, bytes.length - 3) / 100;
      lifecycle.sensorStatus = bytes[bytes.length - 1];
      break;
    default:
      break;
  }

  emit("sample", { data, topic: "default" });
  emit("sample", { data: lifecycle, topic: "lifecycle" });
  */
}
