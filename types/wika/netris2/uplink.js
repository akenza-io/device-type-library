// Internal devices constants
const RAW_MIN = 2500;
const RAW_MAX = 12500;

// Depends on the sensor attached
let VALUE_RANGE_START = 0;
let VALUE_RANGE_END = 25;

const PROCESS_ALARM_TYPE = ['LOW_THRESHOLD', 'HIGH_THRESHOLD', 'FALLING_SLOPE', 'RISING_SLOPE', 'LOW_THRESHOLD_WITH_DELAY', 'HIGH_THRESHOLD_WITH_DELAY'];
const TECHNICAL_ALARM_TYPE = ['NO_ALARM', 'OPEN_CONDITION', 'SHORT_CONDITION', 'SATURATED_LOW', 'SATURATED_HIGH', 'ADC_COMMUNICATION_ERROR'];

function getValue(rawNumber) {
  return (rawNumber - RAW_MIN) * ((VALUE_RANGE_END - VALUE_RANGE_START) / (RAW_MAX - RAW_MIN)) + VALUE_RANGE_START;
}

function getTechnicalAlert(rawAlert, channel) {
  let data = {};
  let trigger = Bits.bitsToUnsigned(rawAlert.substring(0, 1));
  data.channelId = channel++;
  data.alarmStatus = "STOPPED";
  if (!trigger) {
    data.alarmStatus = "STARTED";
  }
  // Reserved 4
  data.alarmType = TECHNICAL_ALARM_TYPE[Bits.bitsToUnsigned(rawAlert.substring(5, 8))];
  return data;
}

function checkForCustomFields(device, target, fallbackValue) {
  if (device !== undefined && device.customFields !== undefined && device.customFields[target] !== undefined) {
    return device.customFields[target];
  }
  return fallbackValue;
}

function consume(event) {
  const payload = event.data.payloadHex;
  const bits = Bits.hexToBits(payload);
  let data = {};

  VALUE_RANGE_START = checkForCustomFields(event.device, "rangeStart", 0);
  VALUE_RANGE_END = checkForCustomFields(event.device, "rangeEnd", 25)

  let messageType = Bits.bitsToUnsigned(bits.substring(0, 8));
  // Reserved 8

  switch (messageType) {
    case 1:
    case 2: {
      data.ongoingAlarm = false;
      if (messageType === 2) {
        data.ongoingAlarm = true;
      }
      let channels = Bits.bitsToUnsigned(bits.substring(16, 24));
      if (channels === 1) {
        data.channel1 = getValue(Bits.bitsToUnsigned(bits.substring(24, 40)));
      } else if (channels === 2) {
        data.channel2 = getValue(Bits.bitsToUnsigned(bits.substring(24, 40)));
      } else if (channels === 3) {
        data.channel1 = getValue(Bits.bitsToUnsigned(bits.substring(24, 40)));
        data.channel2 = getValue(Bits.bitsToUnsigned(bits.substring(40, 56)));
        data.delta = data.channel1 - data.channel2;
        data.deltaReverse = data.channel2 - data.channel1;
      }
      emit("sample", { data: data, topic: "default" });
      break;
    } case 3: {
      // Reserved 8
      let pointer = 24;
      while (pointer < bits.length) {
        data = {};
        let status = Bits.bitsToUnsigned(bits.substring(pointer, pointer + 1)); pointer += 1;
        data.alarmStatus = "STOPPED";
        if (!status) {
          data.alarmStatus = "STARTED";
        }
        data.channelId = Bits.bitsToUnsigned(bits.substring(pointer, pointer + 4)) + 1; pointer += 4;
        data.alarmType = PROCESS_ALARM_TYPE[Bits.bitsToUnsigned(bits.substring(pointer, pointer + 3))]; pointer += 3;
        data.value = getValue(Bits.bitsToUnsigned(bits.substring(pointer, pointer + 16))); pointer += 16;

        emit("sample", { data: data, topic: "process_alarm" });
      }
      break;
    } case 4: {
      let channels = Bits.bitsToUnsigned(bits.substring(16, 24));
      if (channels === 1) {
        let alert = getTechnicalAlert(bits.substring(24, 32), 1);
        emit("sample", { data: alert, topic: "technical_alarm" });
      } else if (channels === 2) {
        let alert = getTechnicalAlert(bits.substring(24, 32), 2);
        emit("sample", { data: alert, topic: "technical_alarm" });
      } else if (channels === 3) {
        let alert = getTechnicalAlert(bits.substring(24, 32), 1);
        emit("sample", { data: alert, topic: "technical_alarm" });
        alert = getTechnicalAlert(bits.substring(32, 40), 2);
        emit("sample", { data: alert, topic: "technical_alarm" });
      }
      break;
    } case 6: {
      data.status = "UNKNNOWN";
      switch (Bits.bitsToUnsigned(bits.substring(16, 24))) {
        case 0x20:
          data.status = "CONFIGURATION_SUCCESS";
          break;
        case 0x30:
          data.status = "CONFIGURATION_REJECTED";
          break;
        case 0x60:
          data.status = "COMMAND_SUCCESS";
          break;
        case 0x70:
          data.status = "COMMAND_FAILED";
          break;
        default:
          break;
      }
      emit("sample", { data: data, topic: "configuration" });
      break;
    }
    case 8:
      data.nrOfSamples = Bits.bitsToUnsigned(bits.substring(16, 48));
      data.nrOfTransmissions = Bits.bitsToUnsigned(bits.substring(48, 80));
      data.batteryLevel = Bits.bitsToUnsigned(bits.substring(81, 88));
      data.internalTemperature = Bits.bitsToSigned(bits.substring(88, 96));

      emit("sample", { data: data, topic: "lifecycle" });
      break;
    default:
      break;
  }
}