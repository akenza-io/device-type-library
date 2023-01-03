const TYPE_TEMP = 0x01; // temp 2 bytes -3276.8°C -->3276.7°C
const TYPE_RH = 0x02; // Humidity 1 byte  0-100%
const TYPE_ACC = 0x03; // acceleration 3 bytes X,Y,Z -128 --> 127 +/-63=1G
const TYPE_LIGHT = 0x04; // Light 2 bytes 0-->65535 Lux
const TYPE_MOTION = 0x05; // No of motion 1 byte  0-255
const TYPE_CO2 = 0x06; // Co2 2 bytes 0-65535 ppm
const TYPE_VDD = 0x07; // VDD 2byte 0-65535mV
const TYPE_ANALOG1 = 0x08; // VDD 2byte 0-65535mV
const TYPE_GPS = 0x09; // 3bytes lat 3bytes long binary
const TYPE_PULSE1 = 0x0a; // 2bytes relative pulse count
const TYPE_PULSE1_ABS = 0x0b; // 4bytes no 0->0xFFFFFFFF
const TYPE_EXT_TEMP1 = 0x0c; // 2bytes -3276.5C-->3276.5C
const TYPE_EXT_DIGITAL = 0x0d; // 1bytes value 1 or 0
const TYPE_EXT_DISTANCE = 0x0e; // 2bytes distance in mm
const TYPE_ACC_MOTION = 0x0f; // 1byte number of vibration/motion
const TYPE_IR_TEMP = 0x10; // 2bytes internal temp 2bytes external temp -3276.5C-->3276.5C
const TYPE_OCCUPANCY = 0x11; // 1byte data
const TYPE_WATERLEAK = 0x12; // 1byte data 0-255
const TYPE_GRIDEYE = 0x13; // 65byte temperature data 1byte ref+64byte external temp
const TYPE_PRESSURE = 0x14; // 4byte pressure data (hPa)
const TYPE_SOUND = 0x15; // 2byte sound data (peak/avg)
const TYPE_PULSE2 = 0x16; // 2bytes 0-->0xFFFF
const TYPE_PULSE2_ABS = 0x17; // 4bytes no 0->0xFFFFFFFF
const TYPE_ANALOG2 = 0x18; // 2bytes batteryVoltage in mV
const TYPE_EXT_TEMP2 = 0x19; // 2bytes -3276.5C-->3276.5C

function bin16dec(bin) {
  let num = bin & 0xffff;
  if (0x8000 & num) num = -(0x010000 - num);
  return num;
}

function bin8dec(bin) {
  let num = bin & 0xff;
  if (0x80 & num) num = -(0x0100 - num);
  return num;
}

function DecodeElsysPayload(data) {
  const obj = {};
  for (let i = 0; i < data.length; i++) {
    switch (data[i]) {
      case TYPE_TEMP: // Temperature
        var temp = (data[i + 1] << 8) | data[i + 2];
        temp = bin16dec(temp);
        obj.temperature = temp / 10;
        i += 2;
        break;
      case TYPE_RH: // Humidity
        var rh = data[i + 1];
        obj.humidity = rh;
        i += 1;
        break;
      case TYPE_ACC: // Acceleration 63 = 1G
        obj.accX = Math.round(bin8dec(data[i + 1]) / 63);
        obj.accY = Math.round(bin8dec(data[i + 2]) / 63);
        obj.accZ = Math.round(bin8dec(data[i + 3]) / 63);
        i += 3;
        break;
      case TYPE_LIGHT: // Light
        obj.light = (data[i + 1] << 8) | data[i + 2];
        i += 2;
        break;
      case TYPE_MOTION: // Motion sensor(PIR)
        obj.motion = data[i + 1];
        i += 1;
        break;
      case TYPE_CO2: // CO2
        obj.co2 = (data[i + 1] << 8) | data[i + 2];
        i += 2;
        break;
      case TYPE_VDD: // Battery level
        obj.vdd = (data[i + 1] << 8) | data[i + 2];
        i += 2;
        break;
      case TYPE_ANALOG1: // Analog input 1
        obj.analog1 = (data[i + 1] << 8) | data[i + 2];
        i += 2;
        break;
      case TYPE_GPS: // gps
        obj.lat = (data[i + 1] << 16) | (data[i + 2] << 8) | data[i + 3];
        obj.long = (data[i + 4] << 16) | (data[i + 5] << 8) | data[i + 6];
        i += 6;
        break;
      case TYPE_PULSE1: // Pulse input 1
        obj.pulse1 = (data[i + 1] << 8) | data[i + 2];
        i += 2;
        break;
      case TYPE_PULSE1_ABS: // Pulse input 1 absolute value
        var pulseAbs =
          (data[i + 1] << 24) |
          (data[i + 2] << 16) |
          (data[i + 3] << 8) |
          data[i + 4];
        obj.pulseAbs1 = pulseAbs;
        i += 4;
        break;
      case TYPE_EXT_TEMP1: // External temp
        var temp = (data[i + 1] << 8) | data[i + 2];
        temp = bin16dec(temp);
        obj.externalTemperature1 = temp / 10;
        i += 2;
        break;
      case TYPE_EXT_DIGITAL: // Digital input
        obj.digital = !!data[i + 1];
        i += 1;
        break;
      case TYPE_EXT_DISTANCE: // Distance sensor input
        obj.distance = (data[i + 1] << 8) | data[i + 2];
        i += 2;
        break;
      case TYPE_ACC_MOTION: // Acc motion
        obj.accMotion = data[i + 1];
        i += 1;
        break;
      case TYPE_IR_TEMP: // IR temperature
        var iTemp = (data[i + 1] << 8) | data[i + 2];
        iTemp = bin16dec(iTemp);
        var eTemp = (data[i + 3] << 8) | data[i + 4];
        eTemp = bin16dec(eTemp);
        obj.irInternalTemperature = iTemp / 10;
        obj.irExternalTemperature = eTemp / 10;
        i += 4;
        break;
      case TYPE_OCCUPANCY: // Body occupancy
        obj.occupancy = data[i + 1];
        i += 1;
        break;
      case TYPE_WATERLEAK: // Water leak
        obj.waterleak = !!data[i + 1];
        i += 1;
        break;
      case TYPE_GRIDEYE: // Grideye data
        i += 65;
        break;
      case TYPE_PRESSURE: // External Pressure
        var temp =
          (data[i + 1] << 24) |
          (data[i + 2] << 16) |
          (data[i + 3] << 8) |
          data[i + 4];
        obj.pressure = temp / 1000;
        i += 4;
        break;
      case TYPE_SOUND: // Sound
        obj.soundPeak = data[i + 1];
        obj.soundAvg = data[i + 2];
        i += 2;
        break;
      case TYPE_PULSE2: // Pulse 2
        obj.pulse2 = (data[i + 1] << 8) | data[i + 2];
        i += 2;
        break;
      case TYPE_PULSE2_ABS: // Pulse input 2 absolute value
        obj.pulseAbs2 =
          (data[i + 1] << 24) |
          (data[i + 2] << 16) |
          (data[i + 3] << 8) |
          data[i + 4];
        i += 4;
        break;
      case TYPE_ANALOG2: // Analog input 2
        obj.analog2 = (data[i + 1] << 8) | data[i + 2];
        i += 2;
        break;
      case TYPE_EXT_TEMP2: // External temp 2
        var temp = (data[i + 1] << 8) | data[i + 2];
        temp = bin16dec(temp);
        obj.externalTemperature2 = temp / 10;
        i += 2;
        break;
      default:
        // somthing is wrong with data
        i = data.length;
        break;
    }
  }
  return obj;
}

function deleteUnusedKeys(data) {
  let keysRetained = false;
  Object.keys(data).forEach((key) => {
    if (data[key] === undefined || isNaN(data[key])) {
      delete data[key];
    } else {
      keysRetained = true;
    }
  });
  return keysRetained;
}

function consume(event) {
  const res = DecodeElsysPayload(Hex.hexToBytes(event.data.payloadHex));
  const data = {};
  const lifecycle = {};
  const occupancy = {};
  const noise = {};

  // Default values
  data.temperature = res.temperature;
  data.humidity = res.humidity;
  data.accX = res.accX;
  data.accY = res.accY;
  data.accZ = res.accZ;
  data.light = res.light;
  data.co2 = res.co2;
  data.reed = res.digital;
  data.distance = res.distance;
  data.accMotion = res.accMotion;
  data.waterleak = res.waterleak;
  data.pressure = res.pressure;
  data.lat = res.lat;
  data.long = res.long;
  data.analog1 = res.analog1;
  data.analog2 = res.analog2;
  data.pulse1 = res.pulse1;
  data.pulse2 = res.pulse2;
  data.pulseAbs1 = res.pulseAbs1;
  data.pulseAbs2 = res.pulseAbs2;
  data.externalTemperature1 = res.externalTemperature1;
  data.externalTemperature2 = res.externalTemperature2;

  // Occupancy values
  occupancy.motion = res.motion;
  occupancy.occupancy = res.occupancy;

  // Noise values
  noise.soundPeak = res.soundPeak;
  noise.soundAvg = res.soundAvg;

  // Lifecycle values
  if (res.vdd !== undefined) {
    lifecycle.batteryVoltage = res.vdd / 1000;
    let batteryLevel =
      Math.round((lifecycle.batteryVoltage - 3) / 0.006 / 10) * 10;

    if (batteryLevel > 100) {
      batteryLevel = 100;
    } else if (batteryLevel < 0) {
      batteryLevel = 0;
    }
    lifecycle.batteryLevel = batteryLevel;
  }

  if (deleteUnusedKeys(data)) {
    emit("sample", { data, topic: "default" });
  }

  if (deleteUnusedKeys(lifecycle)) {
    emit("sample", { data: lifecycle, topic: "lifecycle" });
  }

  if (deleteUnusedKeys(occupancy)) {
    emit("sample", { data: occupancy, topic: "occupancy" });
  }

  if (deleteUnusedKeys(noise)) {
    emit("sample", { data: noise, topic: "noise" });
  }
}
