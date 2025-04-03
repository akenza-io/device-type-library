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

function consume(event) {
  const payload = event.data.payloadHex;
  const bytes = Hex.hexToBytes(payload);
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
        case 0x06:
          lifecycle.deviceStatus = bytes[bytes.length - 13];
          lifecycle.batteryVoltage =
            readUInt16BE(bytes, bytes.length - 12) / 100;
          data.counterA = readUInt16BE(bytes, bytes.length - 10);
          data.counterB = readUInt16BE(bytes, bytes.length - 8);
          lifecycle.sensorStatus = bytes[bytes.length - 6];
          totalCounter.totalCounterA = readUInt16BE(bytes, bytes.length - 5);
          totalCounter.totalCounterB = readUInt16BE(bytes, bytes.length - 3);
          lifecycle.payloadCounter = bytes[bytes.length - 1];
          emit("sample", { data, topic: "default" });
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
          lifecycle.deviceStatus = bytes[bytes.length - 4];
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
          lifecycle.deviceStatus = bytes[bytes.length - 13];
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

  emit("sample", { data: lifecycle, topic: "lifecycle" });
}
