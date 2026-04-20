// Internal devices constants
const RAW_MIN = 2500;
const RAW_MAX = 12500;

// Depends on the sensor attached
let PRESSURE_MIN_BAR = 0;
let PRESSURE_MAX_BAR = 25;

const PROCESS_ALARM_TYPE = ['LOW_THRESHOLD', 'HIGH_THRESHOLD', 'FALLING_SLOPE', 'RISING_SLOPE', 'LOW_THRESHOLD_WITH_DELAY', 'HIGH_THRESHOLD_WITH_DELAY'];
const TECHNICAL_ALARM_TYPE = ['NO_ALARM', 'OPEN_CONDITION', 'SHORT_CONDITION', 'SATURATED_LOW', 'SATURATED_HIGH', 'ADC_COMMUNICATION_ERROR'];

function getValue(rawNumber) {
  return (rawNumber - RAW_MIN) * ((PRESSURE_MAX_BAR - PRESSURE_MIN_BAR) / (RAW_MAX - RAW_MIN)) + PRESSURE_MIN_BAR;
}

function getTechnicalAlert(rawAlert, channel) {
  let data = {};
  let trigger = Bits.bitsToUnsigned(rawAlert.substr(0, 1));
  data.channelId = channel++;
  data.alarmStatus = "STOPPED";
  if (!trigger) {
    data.alarmStatus = "STARTED";
  }
  // Reserved 4
  data.alarmType = TECHNICAL_ALARM_TYPE[Bits.bitsToUnsigned(rawAlert.substr(5, 3))];
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

  PRESSURE_MIN_BAR = checkForCustomFields(event.device, "pressureMin", 0);
  PRESSURE_MAX_BAR = checkForCustomFields(event.device, "pressureMax", 25)

  let messageType = Bits.bitsToUnsigned(bits.substr(0, 8));
  // Reserved 8

  switch (messageType) {
    case 1:
    case 2: {
      data.ongoingAlarm = false;
      if (messageType === 2) {
        data.ongoingAlarm = true;
      }
      let channels = Bits.bitsToUnsigned(bits.substr(16, 8));
      if (channels === 1) {
        data.channel1 = getValue(Bits.bitsToUnsigned(bits.substr(24, 16)));
      } else if (channels === 2) {
        data.channel2 = getValue(Bits.bitsToUnsigned(bits.substr(24, 16)));
      } else if (channels === 3) {
        data.channel1 = getValue(Bits.bitsToUnsigned(bits.substr(24, 16)));
        data.channel2 = getValue(Bits.bitsToUnsigned(bits.substr(40, 16)));
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
        let status = Bits.bitsToUnsigned(bits.substr(pointer, 1)); pointer += 1;
        data.alarmStatus = "STOPPED";
        if (!status) {
          data.alarmStatus = "STARTED";
        }
        data.channelId = Bits.bitsToUnsigned(bits.substr(pointer, 4)) + 1; pointer += 4;
        data.alarmType = PROCESS_ALARM_TYPE[Bits.bitsToUnsigned(bits.substr(pointer, 3))]; pointer += 3;
        data.value = getValue(Bits.bitsToUnsigned(bits.substr(pointer, 16))); pointer += 16;

        emit("sample", { data: data, topic: "process_alarm" });
      }
      break;
    } case 4: {
      let channels = Bits.bitsToUnsigned(bits.substr(16, 8));
      if (channels === 1) {
        let alert = getTechnicalAlert(bits.substr(24, 8), 1);
        emit("sample", { data: alert, topic: "technical_alarm" });
      } else if (channels === 2) {
        let alert = getTechnicalAlert(bits.substr(24, 8), 2);
        emit("sample", { data: alert, topic: "technical_alarm" });
      } else if (channels === 3) {
        let alert = getTechnicalAlert(bits.substr(24, 8), 1);
        emit("sample", { data: alert, topic: "technical_alarm" });
        alert = getTechnicalAlert(bits.substr(32, 8), 2);
        emit("sample", { data: alert, topic: "technical_alarm" });
      }
      break;
    } case 6: {
      data.status = "UNKNNOWN";
      switch (Bits.bitsToUnsigned(bits.substr(16, 8))) {
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
      data.nrOfSamples = Bits.bitsToUnsigned(bits.substr(16, 32));
      data.nrOfTransmissions = Bits.bitsToUnsigned(bits.substr(48, 32));
      data.batteryLevel = Bits.bitsToUnsigned(bits.substr(81, 7));
      data.internalTemperature = Bits.bitsToSigned(bits.substr(88, 8));

      emit("sample", { data: data, topic: "lifecycle" });
      break;
    default:
      break;
  }
}