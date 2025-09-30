function cToF(celsius) {
  return Math.round(((celsius * 9) / 5 + 32) * 10) / 10;
}

// Used for decoding enLink LoRa Messages
// DN 23 Jun 2020 (Doc.Ver:4.15 AQ-P/P+ FW Ver:4.15)
//   Add 10 types for advanced new indoor/outdoor Air Quality units
//     with Particulate Matter sensor 'enl-aq-p+'

// --------------------------------------------------------------------------------------
const ENLINK_TEMP = 0x01; // S16  -3276.8°C -> 3276.7°C (-10..80) [Divide word by 10]
const ENLINK_RH = 0x02; // U8   0 -> 255 %RH (Actually 0..100%)
const ENLINK_LUX = 0x03; // U16  0 -> 65535 Lux
const ENLINK_PRESSURE = 0x04; // U16  0 -> 65535 mbar or hPa
const ENLINK_VOC_IAQ = 0x05; // U16  0 -> 500 IAQ Index
const ENLINK_O2PERC = 0x06; // U8   0 -> 25.5% [Divide byte by 10]
const ENLINK_CO = 0x07; // U16  0 -> 655.35 ppm (0..100 ppm) [Divide by 100]
const ENLINK_CO2 = 0x08; // U16  0 -> 65535 ppm (0..2000 ppm)
const ENLINK_OZONE = 0x09; // U16  0 -> 6.5535 ppm or 6553.5 ppb (0..1 ppm) [Divide by 10000]
const ENLINK_POLLUTANTS = 0x0a; // U16  0 -> 6553.5 kOhm (Typically 100..1500 kOhm) [Divide by 10]
const ENLINK_PM25 = 0x0b; // U16  0 -> 65535 ug/m3 (0..1000 ug/m3)
const ENLINK_PM10 = 0x0c; // U16  0 -> 65535 ug/m3 (0..1000 ug/m3)
const ENLINK_H2S = 0x0d; // U16  0 -> 655.35 ppm (0..100 ppm) [Divide by 100]
const ENLINK_COUNTER = 0x0e; // U32  0 -> 2^32
const ENLINK_MB_EXCEPTION = 0x0f; // Type Byte + MBID + Exception Code so it's Type + 2 bytes
const ENLINK_MB_INTERVAL = 0x10; // Type Byte + MBID + F32 Value - so 6 bytes
const ENLINK_MB_CUMULATIVE = 0x11; // Type Byte + MBID + F32 Value - so 6 bytes
const ENLINK_BVOC = 0x12; // F32  ppm Breath VOC Estimate equivalent
const ENLINK_DETECTION_COUNT = 0x13; // U32  Counter. Num of detections for PIR/RangeFinder
const ENLINK_OCC_TIME = 0x14; // U32  Total Occupied Time (seconds)
const ENLINK_OCC_STATUS = 0x15; // U8   Occupied Status. 1=Occupied, 0=Unoccupied

const ENLINK_TEMP_PROBE1 = 0x17; // S16  As 0x01
const ENLINK_TEMP_PROBE2 = 0x18; // S16  As 0x01
const ENLINK_TEMP_PROBE3 = 0x19; // S16  As 0x01
const ENLINK_TEMP_PROBE_IN_BAND_DURATION_S_1 = 0x1a; // U32  Seconds. Time temperature probe 1 has spent in 'in band' zone
const ENLINK_TEMP_PROBE_IN_BAND_DURATION_S_2 = 0x1b; // U32  Seconds. Time temperature probe 2 has spent in 'in band' zone
const ENLINK_TEMP_PROBE_IN_BAND_DURATION_S_3 = 0x1c; // U32  Seconds. Time temperature probe 3 has spent in 'in band' zone
const ENLINK_TEMP_PROBE_IN_BAND_ALARM_COUNT_1 = 0x1d; // U32  Count. Num times in band alarm has activated for probe 1
const ENLINK_TEMP_PROBE_IN_BAND_ALARM_COUNT_2 = 0x1e; // U32  Count. Num times in band alarm has activated for probe 2
const ENLINK_TEMP_PROBE_IN_BAND_ALARM_COUNT_3 = 0x1f; // U32  Count. Num times in band alarm has activated for probe 3
const ENLINK_TEMP_PROBE_LOW_DURATION_S_1 = 0x20; // U32  Seconds. Time probe 1 has spent below low threshold
const ENLINK_TEMP_PROBE_LOW_DURATION_S_2 = 0x21; // U32  Seconds. Time probe 2 has spent below low threshold
const ENLINK_TEMP_PROBE_LOW_DURATION_S_3 = 0x22; // U32  Seconds. Time probe 3 has spent below low threshold
const ENLINK_TEMP_PROBE_LOW_ALARM_COUNT_1 = 0x23; // U32  Count. Num times low threshold alarm has activated for probe 1
const ENLINK_TEMP_PROBE_LOW_ALARM_COUNT_2 = 0x24; // U32  Count. Num times low threshold alarm has activated for probe 2
const ENLINK_TEMP_PROBE_LOW_ALARM_COUNT_3 = 0x25; // U32  Count. Num times low threshold alarm has activated for probe 3
const ENLINK_TEMP_PROBE_HIGH_DURATION_S_1 = 0x26; // U32  Seconds. Time probe 1 has spent above high threshold
const ENLINK_TEMP_PROBE_HIGH_DURATION_S_2 = 0x27; // U32  Seconds. Time probe 2 has spent above high threshold
const ENLINK_TEMP_PROBE_HIGH_DURATION_S_3 = 0x28; // U32  Seconds. Time probe 3 has spent above high threshold
const ENLINK_TEMP_PROBE_HIGH_ALARM_COUNT_1 = 0x29; // U32  Count. Num times high threshold alarm has activated for probe 1
const ENLINK_TEMP_PROBE_HIGH_ALARM_COUNT_2 = 0x2a; // U32  Count. Num times high threshold alarm has activated for probe 2
const ENLINK_TEMP_PROBE_HIGH_ALARM_COUNT_3 = 0x2b; // U32  Count. Num times high threshold alarm has activated for probe 3
const ENLINK_DIFF_PRESSURE = 0x2c; // F32  +- 5000 Pa
const ENLINK_AIR_FLOW = 0x2d; // F32  0 -> 100 m/s
const ENLINK_VOLTAGE = 0x2e; // U16  0 -> 65.535V [Divide by 1000]
const ENLINK_CURRENT = 0x2f; // U16  0 -> 65.535mA [Divide by 1000]
const ENLINK_RESISTANCE = 0x30; // U16  0 -> 65.535kOhm [Divide by 1000]
const ENLINK_LEAK_DETECT_EVT = 0x31; // U8   1 or 0, Leak status on resistance rope
const ENLINK_VIBRATION_EVT = 0x32; // U8   1 or 0, vibration event detected

const ENLINK_PRESSURE_TX = 0x3a; // U16  Pressure/Depth Transducer (0..50,000 mbar/mm)
const ENLINK_TEMPERATURE_TX = 0x3b; // S16  Transducer Temperature -3276.8°C -> 3276.7°C (-10..80) [Divide by 10]

const ENLINK_CO2E = 0x3f; // F32  ppm CO2e Estimate Equivalent

const ENLINK_SOUND_MIN = 0x50; // F32  dB(A)
const ENLINK_SOUND_AVG = 0x51; // F32  dB(A)
const ENLINK_SOUND_MAX = 0x52; // F32  dB(A)
const ENLINK_NO = 0x53; // U16  0 -> 655.35 ppm (0..100 ppm) [Divide by 100]
const ENLINK_NO2 = 0x54; // U16  0 -> 6.5535 ppm (0..5 ppm) [Divide by 10000]
const ENLINK_NO2_20 = 0x55; // U16  0 -> 65.535 ppm (0..20 ppm) [Divide by 1000]
const ENLINK_SO2 = 0x56; // U16  0 -> 65.535 ppm (0..20 ppm) [Divide by 1000]

// Particulate Matter (Advanced Data)
const ENLINK_MC_PM1_0 = 0x57; // F32  µg/m³ Mass Concentration
const ENLINK_MC_PM2_5 = 0x58; // F32  µg/m³
const ENLINK_MC_PM4_0 = 0x59; // F32  µg/m³
const ENLINK_MC_PM10_0 = 0x5a; // F32  µg/m³
const ENLINK_NC_PM0_5 = 0x5b; // F32  #/cm³ Number Concentration
const ENLINK_NC_PM1_0 = 0x5c; // F32  #/cm³
const ENLINK_NC_PM2_5 = 0x5d; // F32  #/cm³
const ENLINK_NC_PM4_0 = 0x5e; // F32  #/cm³
const ENLINK_NC_PM10_0 = 0x5f; // F32  #/cm³
const ENLINK_PM_TPS = 0x60; // F32  µm    Typical Particle Size

// Optional KPI values that can be included in the message
const ENLINK_CPU_TEMP_DEP = 0x40; // [DEPRECIATED Aril 2020. Now 0x4E] 2 bytes Special*  0.0°C -> 255.99°C
const ENLINK_BATT_STATUS = 0x41; // U8   0=Charging; 1~254 (1.8 - 3.3V); 255=External Power (LoRaWAN Spec)
const ENLINK_BATT_VOLT = 0x42; // U16  0 -> 3600mV (3600mV=External Power)
const ENLINK_RX_RSSI = 0x43; // S16  +-32767 RSSI
const ENLINK_RX_SNR = 0x44; // S8   +-128 Signal to Noise Ratio
const ENLINK_RX_COUNT = 0x45; // U16  0 -> 65535 downlink message count
const ENLINK_TX_TIME = 0x46; // U16  0 -> 65535 ms
const ENLINK_TX_POWER = 0x47; // S8   +-128 dBm
const ENLINK_TX_COUNT = 0x48; // S16  0 -> 65535 uplink message count
const ENLINK_POWER_UP_COUNT = 0x49; // S16  0 -> 65535 counts
const ENLINK_USB_IN_COUNT = 0x4a; // S16  0 -> 65535 counts
const ENLINK_LOGIN_OK_COUNT = 0x4b; // S16  0 -> 65535 counts
const ENLINK_LOGIN_FAIL_COUNT = 0x4c; // S16  0 -> 65535 counts
const ENLINK_FAN_RUN_TIME = 0x4d; // U32  0 -> 2^32 seconds = 136 years
const ENLINK_CPU_TEMP = 0x4e; // S16  -3276.8°C -> 3276.7°C (-10..80) [Divide by 10]

// --------------------------------------------------------------------------------------
// Convert binary value bit to Signed 16 bit
function S16(bin) {
  let num = bin & 0xffff;
  if (0x8000 & num) num = -(0x010000 - num);
  return num;
}
// Convert binary value bit to Signed 8 bit
function S8(bin) {
  let num = bin & 0xff;
  if (0x80 & num) num = -(0x0100 - num);
  return num;
}
// Parse Hex Byte Array
function parseHexString(str) {
  const result = [];
  while (str.length >= 2) {
    result.push(parseInt(str.substring(0, 2), 16));

    str = str.substring(2, str.length);
  }

  return result;
}
// Convert 4 IEEE754 bytes
function fromF32(byte0, byte1, byte2, byte3) {
  const bits = (byte0 << 24) | (byte1 << 16) | (byte2 << 8) | byte3;
  const sign = bits >>> 31 === 0 ? 1.0 : -1.0;
  const e = (bits >>> 23) & 0xff;
  const m = e === 0 ? (bits & 0x7fffff) << 1 : (bits & 0x7fffff) | 0x800000;
  const f = sign * m * Math.pow(2, e - 150);
  return f;
}

function deleteUnusedKeys(data) {
  let keysRetained = false;
  Object.keys(data).forEach((key) => {
    if (data[key] === undefined) {
      delete data[key];
    } else {
      keysRetained = true;
    }
  });
  return keysRetained;
}

function consume(event) {
  const payload = event.data.payloadHex;
  const data = parseHexString(payload);
  const obj = {};
  let msg_ok = false;

  for (let i = 0; i < data.length; i++) {
    switch (data[i]) {
      // Parse Sensor Message Parts
      case ENLINK_TEMP: // Temperature
        obj.temperature_c = S16((data[i + 1] << 8) | data[i + 2]) / 10;
        i += 2;
        msg_ok = true;
        break;
      case ENLINK_RH: // Humidity %rH
        obj.humidity = data[i + 1];
        i += 1;
        msg_ok = true;
        break;
      case ENLINK_LUX: // Light Level lux
        obj.lux = (data[i + 1] << 8) | data[i + 2];
        i += 2;
        msg_ok = true;
        break;
      case ENLINK_PRESSURE: // Barometric Pressure
        obj.pressure_mbar = (data[i + 1] << 8) | data[i + 2];
        i += 2;
        msg_ok = true;
        break;
      case ENLINK_VOC_IAQ: // Indoor Air Quality (0-500)
        obj.iaq = (data[i + 1] << 8) | data[i + 2];
        i += 2;
        msg_ok = true;
        break;
      case ENLINK_O2PERC: // O2 percentage
        obj.o2perc = data[i + 1] / 10;
        i += 1;
        msg_ok = true;
        break;
      case ENLINK_CO: // Carbon Monoxide
        obj.co_ppm = ((data[i + 1] << 8) | data[i + 2]) / 100;
        i += 2;
        msg_ok = true;
        break;
      case ENLINK_CO2: // Carbon Dioxide
        obj.co2_ppm = (data[i + 1] << 8) | data[i + 2];
        i += 2;
        msg_ok = true;
        break;
      case ENLINK_OZONE: // Ozone ppm and ppb
        obj.ozone_ppm = ((data[i + 1] << 8) | data[i + 2]) / 10000;
        obj.ozone_ppb = ((data[i + 1] << 8) | data[i + 2]) / 10;
        i += 2;
        msg_ok = true;
        break;
      case ENLINK_POLLUTANTS: // Pollutants kOhm
        obj.pollutants_kohm = ((data[i + 1] << 8) | data[i + 2]) / 10;
        i += 2;
        msg_ok = true;
        break;
      case ENLINK_PM25: // Particulates @2.5
        obj.pm25 = (data[i + 1] << 8) | data[i + 2];
        i += 2;
        msg_ok = true;
        break;
      case ENLINK_PM10: // Particulates @10
        obj.pm10 = (data[i + 1] << 8) | data[i + 2];
        i += 2;
        msg_ok = true;
        break;
      case ENLINK_H2S: // Hydrogen Sulphide
        obj.h2s_ppm = ((data[i + 1] << 8) | data[i + 2]) / 100;
        i += 2;
        msg_ok = true;
        break;

      case ENLINK_COUNTER:
        if (obj.counter) {
          obj.counter.push([
            data[i + 1],
            (data[i + 2] << 24) |
              (data[i + 3] << 16) |
              (data[i + 4] << 8) |
              data[i + 5],
          ]);
        } else {
          obj.counter = [
            [
              data[i + 1],
              (data[i + 2] << 24) |
                (data[i + 3] << 16) |
                (data[i + 4] << 8) |
                data[i + 5],
            ],
          ];
        }
        i += 5;
        msg_ok = true;
        break;
      case ENLINK_MB_EXCEPTION: // Modbus Error Code
        if (obj.mb_ex) {
          obj.mb_ex.push([data[i + 1], data[i + 2]]);
        } else {
          obj.mb_ex = [[data[i + 1], data[i + 2]]];
        }
        i += 2;
        msg_ok = true;
        break;
      case ENLINK_MB_INTERVAL: // Modbus Interval Read
        if (obj.mb_int_val) {
          obj.mb_int_val.push([
            data[i + 1],
            fromF32(data[i + 2], data[i + 3], data[i + 4], data[i + 5]).toFixed(
              2,
            ),
          ]);
        } else {
          obj.mb_int_val = [
            [
              data[i + 1],
              fromF32(
                data[i + 2],
                data[i + 3],
                data[i + 4],
                data[i + 5],
              ).toFixed(2),
            ],
          ];
        }
        i += 5;
        msg_ok = true;
        break;
      case ENLINK_MB_CUMULATIVE: // Modbus Cumulative Read
        if (obj.mb_cum_val) {
          obj.mb_cum_val.push([
            data[i + 1],
            fromF32(data[i + 2], data[i + 3], data[i + 4], data[i + 5]).toFixed(
              2,
            ),
          ]);
        } else {
          obj.mb_cum_val = [
            [
              data[i + 1],
              fromF32(
                data[i + 2],
                data[i + 3],
                data[i + 4],
                data[i + 5],
              ).toFixed(2),
            ],
          ];
        }
        i += 5;
        msg_ok = true;
        break;

      case ENLINK_BVOC: // Breath VOC Estimate equivalent
        obj.bvoc = fromF32(
          data[i + 1],
          data[i + 2],
          data[i + 3],
          data[i + 4],
        ).toFixed(3);
        i += 4;
        msg_ok = true;
        break;

      case ENLINK_DETECTION_COUNT:
        obj.det_count =
          (data[i + 1] << 24) |
          (data[i + 2] << 16) |
          (data[i + 3] << 8) |
          data[i + 4];
        i += 4;
        msg_ok = true;
        break;
      case ENLINK_OCC_TIME: // Occupied time in seconds
        obj.occ_time_s =
          (data[i + 1] << 24) |
          (data[i + 2] << 16) |
          (data[i + 3] << 8) |
          data[i + 4];
        i += 4;
        msg_ok = true;
        break;
      case ENLINK_OCC_STATUS: // 1 byte U8, 1 or 0, occupancy status
        obj.occupied = !!data[i + 1];
        i += 1;
        msg_ok = true;
        break;

      case ENLINK_TEMP_PROBE1:
        obj.temp_probe_1 = S16((data[i + 1] << 8) | data[i + 2]) / 10;
        i += 2;
        msg_ok = true;
        break;
      case ENLINK_TEMP_PROBE2:
        obj.temp_probe_2 = S16((data[i + 1] << 8) | data[i + 2]) / 10;
        i += 2;
        msg_ok = true;
        break;
      case ENLINK_TEMP_PROBE3:
        obj.temp_probe_3 = S16((data[i + 1] << 8) | data[i + 2]) / 10;
        i += 2;
        msg_ok = true;
        break;
      case ENLINK_TEMP_PROBE_IN_BAND_DURATION_S_1:
        /* Cumulative detection time u32 */
        obj.temp_probe_in_band_duration_s_1 =
          (data[i + 1] << 24) |
          (data[i + 2] << 16) |
          (data[i + 3] << 8) |
          data[i + 4];
        i += 4;
        msg_ok = true;
        break;
      case ENLINK_TEMP_PROBE_IN_BAND_DURATION_S_2:
        /* Cumulative detection time u32 */
        obj.temp_probe_in_band_duration_s_2 =
          (data[i + 1] << 24) |
          (data[i + 2] << 16) |
          (data[i + 3] << 8) |
          data[i + 4];
        i += 4;
        msg_ok = true;
        break;
      case ENLINK_TEMP_PROBE_IN_BAND_DURATION_S_3:
        /* Cumulative detection time u32 */
        obj.temp_probe_in_band_duration_s_3 =
          (data[i + 1] << 24) |
          (data[i + 2] << 16) |
          (data[i + 3] << 8) |
          data[i + 4];
        i += 4;
        msg_ok = true;
        break;
      case ENLINK_TEMP_PROBE_IN_BAND_ALARM_COUNT_1:
        /* In band alarm events u16 */
        obj.temp_probe_in_band_alarm_count_1 = (data[i + 1] << 8) | data[i + 2];
        i += 2;
        msg_ok = true;
        break;
      case ENLINK_TEMP_PROBE_IN_BAND_ALARM_COUNT_2:
        /* In band alarm events u16 */
        obj.temp_probe_in_band_alarm_count_2 = (data[i + 1] << 8) | data[i + 2];
        i += 2;
        msg_ok = true;
        break;
      case ENLINK_TEMP_PROBE_IN_BAND_ALARM_COUNT_3:
        /* In band alarm events u16 */
        obj.temp_probe_in_band_alarm_count_3 = (data[i + 1] << 8) | data[i + 2];
        i += 2;
        msg_ok = true;
        break;
      case ENLINK_TEMP_PROBE_LOW_DURATION_S_1:
        /* Cumulative detection time u32 */
        obj.temp_probe_low_duration_s_1 =
          (data[i + 1] << 24) |
          (data[i + 2] << 16) |
          (data[i + 3] << 8) |
          data[i + 4];
        i += 4;
        msg_ok = true;
        break;
      case ENLINK_TEMP_PROBE_LOW_DURATION_S_2:
        /* Cumulative detection time u32 */
        obj.temp_probe_low_duration_s_2 =
          (data[i + 1] << 24) |
          (data[i + 2] << 16) |
          (data[i + 3] << 8) |
          data[i + 4];
        i += 4;
        msg_ok = true;
        break;
      case ENLINK_TEMP_PROBE_LOW_DURATION_S_3:
        /* Cumulative detection time u32 */
        obj.temp_probe_low_duration_s_3 =
          (data[i + 1] << 24) |
          (data[i + 2] << 16) |
          (data[i + 3] << 8) |
          data[i + 4];
        i += 4;
        msg_ok = true;
        break;
      case ENLINK_TEMP_PROBE_LOW_ALARM_COUNT_1:
        /* Low alarm events u16 */
        obj.temp_probe_low_alarm_count_1 = (data[i + 1] << 8) | data[i + 2];
        i += 2;
        msg_ok = true;
        break;
      case ENLINK_TEMP_PROBE_LOW_ALARM_COUNT_2:
        /* Low alarm events u16 */
        obj.temp_probe_low_alarm_count_2 = (data[i + 1] << 8) | data[i + 2];
        i += 2;
        msg_ok = true;
        break;
      case ENLINK_TEMP_PROBE_LOW_ALARM_COUNT_3:
        /* Low alarm events u16 */
        obj.temp_probe_low_alarm_count_3 = (data[i + 1] << 8) | data[i + 2];
        i += 2;
        msg_ok = true;
        break;
      case ENLINK_TEMP_PROBE_HIGH_DURATION_S_1:
        /* Cumulative detection time u32 */
        obj.temp_probe_high_duration_s_1 =
          (data[i + 1] << 24) |
          (data[i + 2] << 16) |
          (data[i + 3] << 8) |
          data[i + 4];
        i += 4;
        msg_ok = true;
        break;
      case ENLINK_TEMP_PROBE_HIGH_DURATION_S_2:
        /* Cumulative detection time u32 */
        obj.temp_probe_high_duration_s_2 =
          (data[i + 1] << 24) |
          (data[i + 2] << 16) |
          (data[i + 3] << 8) |
          data[i + 4];
        i += 4;
        msg_ok = true;
        break;
      case ENLINK_TEMP_PROBE_HIGH_DURATION_S_3:
        /* Cumulative detection time u32 */
        obj.temp_probe_high_duration_s_3 =
          (data[i + 1] << 24) |
          (data[i + 2] << 16) |
          (data[i + 3] << 8) |
          data[i + 4];
        i += 4;
        msg_ok = true;
        break;
      case ENLINK_TEMP_PROBE_HIGH_ALARM_COUNT_1:
        /* High alarm events u16 */
        obj.temp_probe_high_alarm_count_1 = (data[i + 1] << 8) | data[i + 2];
        i += 2;
        msg_ok = true;
        break;
      case ENLINK_TEMP_PROBE_HIGH_ALARM_COUNT_2:
        /* High alarm events u16 */
        obj.temp_probe_high_alarm_count_2 = (data[i + 1] << 8) | data[i + 2];
        i += 2;
        msg_ok = true;
        break;
      case ENLINK_TEMP_PROBE_HIGH_ALARM_COUNT_3:
        /* High alarm events u16 */
        obj.temp_probe_high_alarm_count_3 = (data[i + 1] << 8) | data[i + 2];
        i += 2;
        msg_ok = true;
        break;

      case ENLINK_DIFF_PRESSURE: // 4 bytes F32, +/- 5000 Pa
        obj.dp_pa = Number(
          fromF32(data[i + 1], data[i + 2], data[i + 3], data[i + 4]).toFixed(
            3,
          ),
        );
        i += 4;
        msg_ok = true;
        break;
      case ENLINK_AIR_FLOW: // 4 bytes F32, 0 -> 100m/s
        obj.af_mps = Number(
          fromF32(data[i + 1], data[i + 2], data[i + 3], data[i + 4]).toFixed(
            3,
          ),
        );
        i += 4;
        msg_ok = true;
        break;
      case ENLINK_VOLTAGE: // 2 bytes U16, 0 to 10.000 V
        obj.adc_v = ((data[i + 1] << 8) | data[i + 2]) / 1000;
        i += 2;
        msg_ok = true;
        break;
      case ENLINK_CURRENT: // 2 bytes U16, 0 to 20.000 mA
        obj.adc_ma = ((data[i + 1] << 8) | data[i + 2]) / 1000;
        i += 2;
        msg_ok = true;
        break;
      case ENLINK_RESISTANCE: // 2 bytes U16, 0 to 10.000 kOhm
        obj.adc_kohm = ((data[i + 1] << 8) | data[i + 2]) / 1000;
        i += 2;
        msg_ok = true;
        break;
      case ENLINK_LEAK_DETECT_EVT: // 1 byte U8, Leak status changed
        obj.leak_detect_event = !!data[i + 1];
        i += 1;
        msg_ok = true;
        break;
      case ENLINK_VIBRATION_EVT: // 1 byte U8, 1 or 0, vibration event detected
        obj.vibration_event = !!data[i + 1];
        i += 1;
        msg_ok = true;
        break;
      // Pressure Transducer
      case ENLINK_PRESSURE_TX:
        // u16
        obj.pressure_tx_mbar = (data[i + 1] << 8) | data[i + 2];
        i += 2;
        msg_ok = true;
        break;
      case ENLINK_TEMPERATURE_TX:
        // s16 in deci-celcius
        obj.temperature_tx_degc = S16((data[i + 1] << 8) | data[i + 2]) / 10;
        i += 2;
        msg_ok = true;
        break;

      case ENLINK_CO2E: // CO2e Estimate Equivalent
        obj.co2e_ppm = fromF32(
          data[i + 1],
          data[i + 2],
          data[i + 3],
          data[i + 4],
        ).toFixed(2);
        i += 4;
        msg_ok = true;
        break;

      case ENLINK_SOUND_MIN:
        obj.sound_min_dba = fromF32(
          data[i + 1],
          data[i + 2],
          data[i + 3],
          data[i + 4],
        ).toFixed(2);
        i += 4;
        msg_ok = true;
        break;

      case ENLINK_SOUND_AVG:
        obj.sound_avg_dba = fromF32(
          data[i + 1],
          data[i + 2],
          data[i + 3],
          data[i + 4],
        ).toFixed(2);
        i += 4;
        msg_ok = true;
        break;

      case ENLINK_SOUND_MAX:
        obj.sound_max_dba = fromF32(
          data[i + 1],
          data[i + 2],
          data[i + 3],
          data[i + 4],
        ).toFixed(2);
        i += 4;
        msg_ok = true;
        break;

      case ENLINK_NO: // Nitric Oxide
        obj.no_ppm = ((data[i + 1] << 8) | data[i + 2]) / 100;
        i += 2;
        msg_ok = true;
        break;
      case ENLINK_NO2: // Nitrogen Dioxide scaled at 0-5ppm
        obj.no2_ppm = ((data[i + 1] << 8) | data[i + 2]) / 10000;
        i += 2;
        msg_ok = true;
        break;
      case ENLINK_NO2_20: // Nitrogen Dioxide scaled at 0-20ppm
        obj.no2_20_ppm = ((data[i + 1] << 8) | data[i + 2]) / 1000;
        i += 2;
        msg_ok = true;
        break;
      case ENLINK_SO2: // Sulphur Dioxide 0-20ppm
        obj.so2_ppm = ((data[i + 1] << 8) | data[i + 2]) / 1000;
        i += 2;
        msg_ok = true;
        break;

      case ENLINK_MC_PM1_0:
        obj.mc_pm1_0 = fromF32(
          data[i + 1],
          data[i + 2],
          data[i + 3],
          data[i + 4],
        ).toFixed(2);
        i += 4;
        msg_ok = true;
        break;
      case ENLINK_MC_PM2_5:
        obj.mc_pm2_5 = fromF32(
          data[i + 1],
          data[i + 2],
          data[i + 3],
          data[i + 4],
        ).toFixed(2);
        i += 4;
        msg_ok = true;
        break;
      case ENLINK_MC_PM4_0:
        obj.mc_pm4_0 = fromF32(
          data[i + 1],
          data[i + 2],
          data[i + 3],
          data[i + 4],
        ).toFixed(2);
        i += 4;
        msg_ok = true;
        break;
      case ENLINK_MC_PM10_0:
        obj.mc_pm10_0 = fromF32(
          data[i + 1],
          data[i + 2],
          data[i + 3],
          data[i + 4],
        ).toFixed(2);
        i += 4;
        msg_ok = true;
        break;

      case ENLINK_NC_PM0_5:
        obj.nc_pm0_5 = fromF32(
          data[i + 1],
          data[i + 2],
          data[i + 3],
          data[i + 4],
        ).toFixed(2);
        i += 4;
        msg_ok = true;
        break;
      case ENLINK_NC_PM1_0:
        obj.nc_pm1_0 = fromF32(
          data[i + 1],
          data[i + 2],
          data[i + 3],
          data[i + 4],
        ).toFixed(2);
        i += 4;
        msg_ok = true;
        break;
      case ENLINK_NC_PM2_5:
        obj.nc_pm2_5 = fromF32(
          data[i + 1],
          data[i + 2],
          data[i + 3],
          data[i + 4],
        ).toFixed(2);
        i += 4;
        msg_ok = true;
        break;
      case ENLINK_NC_PM4_0:
        obj.nc_pm4_0 = fromF32(
          data[i + 1],
          data[i + 2],
          data[i + 3],
          data[i + 4],
        ).toFixed(2);
        i += 4;
        msg_ok = true;
        break;
      case ENLINK_NC_PM10_0:
        obj.nc_pm10_0 = fromF32(
          data[i + 1],
          data[i + 2],
          data[i + 3],
          data[i + 4],
        ).toFixed(2);
        i += 4;
        msg_ok = true;
        break;

      case ENLINK_PM_TPS:
        obj.pm_tps = fromF32(
          data[i + 1],
          data[i + 2],
          data[i + 3],
          data[i + 4],
        ).toFixed(2);
        i += 4;
        msg_ok = true;
        break;

      // < -------------------------------------------------------------------------------->
      // Optional KPIs
      case ENLINK_CPU_TEMP_DEP: // Optional from April 2020
        obj.cpu_temp_dep =
          data[i + 1] + Math.round((data[i + 2] * 100) / 256) / 100;
        i += 2;
        msg_ok = true;
        break;
      case ENLINK_CPU_TEMP: // New for April 2020 Ver: 4.9
        obj.cpu_temp = S16((data[i + 1] << 8) | data[i + 2]) / 10;
        i += 2;
        msg_ok = true;
        break;
      case ENLINK_BATT_STATUS:
        obj.batt_status = data[i + 1];
        i += 1;
        msg_ok = true;
        break;
      case ENLINK_BATT_VOLT:
        obj.batt_volt = ((data[i + 1] << 8) | data[i + 2]) / 1000;
        obj.batt_mv = (data[i + 1] << 8) | data[i + 2];
        i += 2;
        msg_ok = true;
        break;
      case ENLINK_RX_RSSI:
        obj.rx_rssi = S16((data[i + 1] << 8) | data[i + 2]);
        i += 2;
        msg_ok = true;
        break;
      case ENLINK_RX_SNR:
        obj.rx_snr = S8(data[i + 1]);
        i += 1;
        msg_ok = true;
        break;
      case ENLINK_RX_COUNT:
        obj.rx_count = (data[i + 1] << 8) | data[i + 2];
        i += 2;
        msg_ok = true;
        break;
      case ENLINK_TX_TIME:
        obj.tx_time_ms = (data[i + 1] << 8) | data[i + 2];
        i += 2;
        msg_ok = true;
        break;
      case ENLINK_TX_POWER:
        obj.tx_power_dbm = S8(data[i + 1]);
        i += 1;
        msg_ok = true;
        break;
      case ENLINK_TX_COUNT:
        obj.tx_count = (data[i + 1] << 8) | data[i + 2];
        i += 2;
        msg_ok = true;
        break;
      case ENLINK_POWER_UP_COUNT:
        obj.power_up_count = (data[i + 1] << 8) | data[i + 2];
        i += 2;
        msg_ok = true;
        break;
      case ENLINK_USB_IN_COUNT:
        obj.usb_in_count = (data[i + 1] << 8) | data[i + 2];
        i += 2;
        msg_ok = true;
        break;
      case ENLINK_LOGIN_OK_COUNT:
        obj.login_ok_count = (data[i + 1] << 8) | data[i + 2];
        i += 2;
        msg_ok = true;
        break;
      case ENLINK_LOGIN_FAIL_COUNT:
        obj.login_fail_count = (data[i + 1] << 8) | data[i + 2];
        i += 2;
        msg_ok = true;
        break;
      case ENLINK_FAN_RUN_TIME:
        obj.fan_run_time_s =
          (data[i + 1] << 24) |
          (data[i + 2] << 16) |
          (data[i + 3] << 8) |
          data[i + 4];
        i += 4;
        msg_ok = true;
        break;

      default:
        // something is wrong with data
        i = data.length;
        msg_ok = true;
        break;
    }
  }

  const def = {};
  def.temperature = obj.temperature_c;
  def.humidity = obj.humidity;
  def.lux = obj.lux;
  def.pressure = obj.pressure_mbar;
  def.iaq = obj.iaq;
  def.o2perc = obj.o2perc;
  def.co = obj.co_ppm;
  def.co2 = obj.co2_ppm;
  def.ozone = obj.ozone_ppm;
  def.pollutants = obj.pollutants_kohm;
  def.pm25 = obj.pm25;
  def.pm10 = obj.pm10;
  def.h2s = obj.h2s_ppm;
  def.mbEx = obj.mb_ex;
  def.mbIntVal = obj.mb_int_val;
  def.mbCumVal = obj.mb_cum_val;
  def.bvoc = obj.bvoc;
  def.detCount = obj.det_count;
  def.occTimeS = obj.occ_time_s;
  def.occupied = obj.occupied;
  def.tempProbe1 = obj.temp_probe_1;
  def.tempProbe2 = obj.temp_probe_2;
  def.tempProbe3 = obj.temp_probe_3;
  def.tempProbeInBandDurationS1 = obj.temp_probe_in_band_duration_s_1;
  def.tempProbeInBandDurationS2 = obj.temp_probe_in_band_duration_s_2;
  def.tempProbeInBandDurationS3 = obj.temp_probe_in_band_duration_s_3;
  def.tempProbeInBandAlarmCount1 = obj.temp_probe_in_band_alarm_count_1;
  def.tempProbeInBandAlarmCount2 = obj.temp_probe_in_band_alarm_count_2;
  def.tempProbeInBandAlarmCount3 = obj.temp_probe_in_band_alarm_count_3;
  def.tempProbeLowDurationS1 = obj.temp_probe_low_duration_s_1;
  def.tempProbeLowDurationS2 = obj.temp_probe_low_duration_s_2;
  def.tempProbeLowDurationS3 = obj.temp_probe_low_duration_s_3;
  def.tempProbeLowAlarmCount1 = obj.temp_probe_low_alarm_count_1;
  def.tempProbeLowAlarmCount2 = obj.temp_probe_low_alarm_count_2;
  def.tempProbeLowAlarmCount3 = obj.temp_probe_low_alarm_count_3;
  def.tempProbeHighDurationS1 = obj.temp_probe_high_duration_s_1;
  def.tempProbeHighDurationS2 = obj.temp_probe_high_duration_s_2;
  def.tempProbeHighDurationS3 = obj.temp_probe_high_duration_s_3;
  def.tempProbeHighAlarmCount1 = obj.temp_probe_high_alarm_count_1;
  def.tempProbeHighAlarmCount2 = obj.temp_probe_high_alarm_count_2;
  def.tempProbeHighAlarmCount3 = obj.temp_probe_high_alarm_count_3;
  def.dp = obj.dp_pa;
  def.af = obj.af_mps;
  def.adcV = obj.adc_v;
  def.adcMa = obj.adc_ma;
  def.adcKohm = obj.adc_kohm;
  def.leakDetectEvent = obj.leak_detect_event;
  def.vibrationEvent = obj.vibration_event;
  def.pressureTxMbar = obj.pressure_tx_mbar;
  def.temperatureTxDegc = obj.temperature_tx_degc;
  def.co2e = obj.co2e_ppm;
  def.soundMin = obj.sound_min_dba;
  def.soundAvg = obj.sound_avg_dba;
  def.soundMax = obj.sound_max_dba;
  def.no = obj.no_ppm;
  def.no2 = obj.no2_ppm;
  def.no2_20 = obj.no2_20_ppm;
  def.so2 = obj.so2_ppm;
  def.mcPm1_0 = obj.mc_pm1_0;
  def.mcPm2_5 = obj.mc_pm2_5;
  def.mcPm4_0 = obj.mc_pm4_0;
  def.mcPm10_0 = obj.mc_pm10_0;
  def.ncPm0_5 = obj.nc_pm0_5;
  def.ncPm1_0 = obj.nc_pm1_0;
  def.ncPm2_5 = obj.nc_pm2_5;
  def.ncPm4_0 = obj.nc_pm4_0;
  def.ncPm10_0 = obj.nc_pm10_0;
  def.pmTps = obj.pm_tps;

  const lifecycle = {};
  lifecycle.cpuTempDep = obj.cpu_temp_dep;
  lifecycle.cpuTemp = obj.cpu_temp;
  lifecycle.batteryVoltage = obj.batt_volt;
  lifecycle.rxRssi = obj.rx_rssi;
  lifecycle.rxSnr = obj.rx_snr;
  lifecycle.rxCount = obj.rx_count;
  lifecycle.txTimeMs = obj.tx_time_ms;
  lifecycle.txPowerDbm = obj.tx_power_dbm;
  lifecycle.txCount = obj.tx_count;
  lifecycle.powerUpCount = obj.power_up_count;
  lifecycle.usbInCount = obj.usb_in_count;
  lifecycle.loginOkCount = obj.login_ok_count;
  lifecycle.loginFailCount = obj.login_fail_count;
  lifecycle.fanRunTimeS = obj.fan_run_time_s;

  if (deleteUnusedKeys(def)) {
    if (def.temperature !== undefined) {
      def.temperatureF = cToF(def.temperature);
    }
    if (def.tempProbe1 !== undefined) {
      def.tempProbe1F = cToF(def.tempProbe1);
    }
    if (def.tempProbe2 !== undefined) {
      def.tempProbe2F = cToF(def.tempProbe2);
    }
    if (def.tempProbe3 !== undefined) {
      def.tempProbe3F = cToF(def.tempProbe3);
    }

    emit("sample", { data: def, topic: "default" });
  }

  if (deleteUnusedKeys(lifecycle)) {
    emit("sample", { data: lifecycle, topic: "lifecycle" });
  }
}
