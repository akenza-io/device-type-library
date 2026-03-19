// Also change other IMBuildings uplinks if changing this
const payloadTypes = {
  COMFORT_SENSOR: 0x01,
  PEOPLE_COUNTER: 0x02,
  BUTTONS: 0x03,
  PULSE_COUNTER: 0x04,
  TRACKER: 0x05,
  DOWNLINK: 0xf1,
};

function readUInt16BE(payload, index) {
  return (payload[index] << 8) + payload[++index];
}

function deviceStatus(status) {
  switch (status) {
    case 0x00:
      status = "NO_STATUS";
      break;
    case 0x01:
      status = "STARTUP";
      break;
    case 0x02:
      status = "RECONNECT";
      break;
    case 0x04:
      status = "SETTINGS_CHANGED";
      break;
    case 0x08:
      status = "BATTERY_NOT_FULL";
      break;
    default:
      status = "RESERVED";
      break;
  }
  return status;
}

function sensorStatus(status) {
  switch (status) {
    case 0x80:
      status = "INFRARED_BLOCKED";
      break;
    case 0x40:
      status = "RECEIVER_DISTURBANCE";
      break;
    case 0x20:
      status = "RECEIVER_LOW_BATTERY";
      break;
    case 0x10:
      status = "RESERVED";
      break;
    case 0x08:
      status = "RESERVED";
      break;
    case 0x04:
      status = "SENSOR_POWER_UP";
      break;
    case 0x02:
      status = "IR_SIGNAL_NOT_AT_FULL_STRENGTH";
      break;
    case 0x01:
      status = "RESERVED";
      break;
    default:
      status = "RESERVED";
      break;
  }
  return status;
}

function consume(event) {
  let payload;
  let bytes;

  // NBIOT
  if (event.data.reports !== undefined) {
    payload = event.data.reports[0].value;
    bytes = Hex.hexToBytes(payload);
  } else {
    // LoRa
    payload = event.data.payloadHex;
    bytes = Hex.hexToBytes(payload);
  }

  const bits = Bits.hexToBits(payload);
  const data = {};
  const lifecycle = {};
  const totalCounter = {};
  const payloadType = bytes[0];
  const payloadVariant = bytes[1];

  switch (payloadType) {
    case payloadTypes.COMFORT_SENSOR: {
      lifecycle.deviceStatus = bytes[bytes.length - 10];
      lifecycle.batteryVoltage = readUInt16BE(bytes, bytes.length - 9) / 100;
      data.temperature = readUInt16BE(bytes, bytes.length - 7) / 100;
      data.humidity = readUInt16BE(bytes, bytes.length - 5) / 100;
      data.co2 = readUInt16BE(bytes, bytes.length - 3);
      data.presence = bytes[bytes.length - 1] === 1;
      emit("sample", { data, topic: "default" });
      break;
    }
    case payloadTypes.PEOPLE_COUNTER: {
      switch (payloadVariant) {
        case 0x04: {
          lifecycle.deviceID = `${bytes[bytes.length - 22]}${bytes[bytes.length - 21]
            }${bytes[bytes.length - 20]}${bytes[bytes.length - 19]}${bytes[bytes.length - 18]
            }${bytes[bytes.length - 17]}`;
          lifecycle.deviceStatus = deviceStatus(
            Bits.bitsToUnsigned(bits.substr(64, 8)),
          );

          lifecycle.batteryVoltage =
            Bits.bitsToUnsigned(bits.substr(72, 16)) / 100;
          lifecycle.rssi = Bits.bitsToSigned(bits.substr(88, 8));
          data.counterA = Bits.bitsToUnsigned(bits.substr(152, 16));
          data.counterB = Bits.bitsToUnsigned(bits.substr(168, 16));
          lifecycle.sensorStatus = sensorStatus(
            Bits.bitsToUnsigned(bits.substr(184, 8)),
          );

          emit("sample", { data, topic: "default" });
          break;
        }
        case 0x06:
          lifecycle.deviceStatus = deviceStatus(bytes[bytes.length - 13]);
          lifecycle.batteryVoltage =
            readUInt16BE(bytes, bytes.length - 12) / 100;
          data.counterA = readUInt16BE(bytes, bytes.length - 10);
          data.counterB = readUInt16BE(bytes, bytes.length - 8);
          lifecycle.sensorStatus = sensorStatus(bytes[bytes.length - 6]);
          totalCounter.totalCounterA = readUInt16BE(bytes, bytes.length - 5);
          totalCounter.totalCounterB = readUInt16BE(bytes, bytes.length - 3);
          lifecycle.payloadCounter = bytes[bytes.length - 1];
          emit("sample", { data, topic: "default" });
          emit("sample", { data: totalCounter, topic: "total_counter" });
          break;
        case 0x07:
          lifecycle.sensorStatus = sensorStatus(bytes[bytes.length - 5]);
          totalCounter.totalCounterA = readUInt16BE(bytes, bytes.length - 4);
          totalCounter.totalCounterB = readUInt16BE(bytes, bytes.length - 2);
          emit("sample", { data: totalCounter, topic: "total_counter" });
          break;
        case 0x08:
          lifecycle.deviceStatus = deviceStatus(bytes[bytes.length - 4]);
          lifecycle.batteryVoltage =
            readUInt16BE(bytes, bytes.length - 3) / 100;
          lifecycle.sensorStatus = bytes[bytes.length - 1];
          break;
        default:
          break;
      }
      break;
    }
    case payloadTypes.BUTTONS: {
      switch (payloadVariant) {
        case 0x03:
          lifecycle.deviceStatus = deviceStatus(bytes[bytes.length - 4]);
          lifecycle.batteryVoltage =
            readUInt16BE(bytes, bytes.length - 3) / 100;
          data.buttonPressed = bytes[bytes.length - 1] !== 0;

          data.great = bytes[bytes.length - 1] & 0x01;
          data.good = bytes[bytes.length - 1] & 0x02;
          data.mid = bytes[bytes.length - 1] & 0x04;
          data.bad = bytes[bytes.length - 1] & 0x08;
          data.worst = bytes[bytes.length - 1] & 0x10;

          break;
        case 0x04:
          lifecycle.deviceStatus = deviceStatus(bytes[bytes.length - 13]);
          lifecycle.batteryVoltage =
            readUInt16BE(bytes, bytes.length - 12) / 100;

          data.great = readUInt16BE(bytes, bytes.length - 10);
          data.good = readUInt16BE(bytes, bytes.length - 8);
          data.mid = readUInt16BE(bytes, bytes.length - 6);
          data.bad = readUInt16BE(bytes, bytes.length - 4);
          data.worst = readUInt16BE(bytes, bytes.length - 2);
          break;
        default:
          break;
      }
      emit("sample", { data, topic: "default" });
      break;
    }
    default:
      emit("sample", {
        data: { reason: "UNSUPORTED_PAYLOAD", payload },
        topic: "error",
      });
      break;
  }

  if (Object.keys(lifecycle).length !== 0) {
    if (lifecycle.batteryVoltage !== undefined) {
      // Voltage drops of at 2.1V (0%) max voltage is 3.0V (100%)
      // ((Max voltage - voltage now) * voltage to percent - inverting) getting rid of the -
      let batteryLevel = Math.round(
        ((lifecycle.batteryVoltage - 2.1) / 0.9) * 100,
      );

      if (batteryLevel > 100) {
        batteryLevel = 100;
      } else if (batteryLevel < 0) {
        batteryLevel = 0;
      }
      lifecycle.batteryLevel = batteryLevel;
    }
    emit("sample", { data: lifecycle, topic: "lifecycle" });
  }
}
