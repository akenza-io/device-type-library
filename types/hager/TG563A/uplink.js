function cToF(celsius) {
  return Math.round(((celsius * 9) / 5 + 32) * 10) / 10;
}

function getFrameType(type) {
  const types = {
    0x0: "SHORT_PERIODIC_TELEGRAM",
    0x1: "SMOKE_ALARM_EVENT",
    0x2: "BATTERY_FAULT_EVENT",
    0x3: "HW_SMOKE_CHAMBER_FAULT_EVENT",
    0x4: "FOULING_SMOKE_CHAMBER_FAULT_EVENT",
    0x5: "HW_US_ANTIMASK_FAULT_EVENT",
    0x6: "HW_IR_ANTIMASK_FAULT_EVENT",
    0x7: "AAC_FAULT_EVENT",
    0x8: "US_ANTIMASK_FAULT_EVENT",
    0x9: "IR_ANTIMASK_FAULT_EVENT",
    0xf: "LONG_PERIODIC_TELEGRAM",
  };
  return types[type] || "UNKNOWN";
}

function decodeBCD(bytes) {
  // Decode 4 bytes (LSB first) as BCD to string serialNumber
  let value = 0;
  for (let i = 3; i >= 0; i--) {
    value = value * 100 + ((bytes[i] >> 4) & 0x0f) * 10 + (bytes[i] & 0x0f);
  }
  return value.toString().padStart(8, "0");
}

function decodeDate(bytes) {
  const raw = (bytes[0] << 8) | bytes[1];
  const year = 2000 + ((raw >> 10) & 0x7f);
  const month = (raw >> 6) & 0x0f;
  const day = raw & 0x3f;
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function consume(event) {
  const bytes = Hex.hexToBytes(event.data.payloadHex);
  const frameType = bytes[0] & 0x0f;
  const version = (bytes[0] >> 4) & 0x0f;

  const config = {};
  const configByte = bytes[1];
  const periodicity = configByte & 0x07;

  switch (periodicity) {
    case 0x0:
      config.periodicity = 1;
      break;
    case 0x1:
      config.periodicity = 2;
      break;
    case 0x2:
      config.periodicity = 4;
      break;
    case 0x3:
      config.periodicity = 6;
      break;
    case 0x4:
      config.periodicity = 8;
      break;
    case 0x5:
      config.periodicity = 12;
      break;
    case 0x6:
      config.periodicity = 24;
      break;
    case 0x7:
      config.periodicity = 48;
      break;
    default:
      break;
  }

  config.longTelegramEnabled = !!((configByte >> 3) & 0x01);
  config.smokeAlertEnabled = !!((configByte >> 6) & 0x01);
  config.minorFaultsAlertEnabled = !!((configByte >> 5) & 0x01);
  config.majorFaultsAlertEnabled = !!((configByte >> 4) & 0x01);
  emit("sample", { data: config, topic: "config" });

  const data = {};
  data.frameType = getFrameType(frameType);
  data.temperature = bytes[2] > 127 ? bytes[2] - 256 : bytes[2];
  data.temperatureF = cToF(data.temperature);

  const minorStatus = (bytes[3] >> 4) & 0x0f;
  const generalStatus = bytes[3] & 0x0f;
  const majorStatus = bytes[4];

  data.mounted = (generalStatus & 0x01) !== 0;
  data.dayMode = (generalStatus & 0x02) !== 0;
  data.tempOutOfRange = (generalStatus & 0x04) !== 0;

  data.usAntimask = (minorStatus & 0x01) !== 0;
  data.irAntimask = (minorStatus & 0x02) !== 0;
  data.aacInactive = (minorStatus & 0x04) !== 0;
  data.tooLongUnmounted = (minorStatus & 0x08) !== 0;

  data.smokeAlarm = (majorStatus & 0x01) !== 0;
  data.batteryFault = (majorStatus & 0x02) !== 0;
  data.hwSmokeFault = (majorStatus & 0x04) !== 0;
  data.foulingSmokeFault = (majorStatus & 0x08) !== 0;
  data.hwUsAntimaskFault = (majorStatus & 0x10) !== 0;
  data.hwIrAntimaskFault = (majorStatus & 0x20) !== 0;
  data.aacFault = (majorStatus & 0x40) !== 0;
  emit("sample", { data, topic: "default" });

  // If long telegram (35 bytes), parse additional data
  if (frameType === 0xf && bytes.length >= 35) {
    const lifecycle = {};
    const batteryRaw = bytes[5];

    lifecycle.version = version;
    lifecycle.batteryVoltage = batteryRaw / 100 + 1;
    lifecycle.serialNumber = decodeBCD(bytes.slice(6, 10));
    lifecycle.productionDate = decodeDate(bytes.slice(10, 12));
    lifecycle.installationDate = decodeDate(bytes.slice(12, 14));
    emit("sample", { data: lifecycle, topic: "lifecycle" });
  }
}
