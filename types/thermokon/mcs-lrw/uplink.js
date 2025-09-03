/**
 * Consumes the payload from an event, decodes it, and emits samples.
 * @param {object} event - The event object containing the payload.
 */
function consume(event) {
  const payload = event.data.payloadHex;
  const bytes = Hex.hexToBytes(payload);

  // LPP constants from Thermokon, extended with manufacturer's reference
  const LPP_TEMP = 0x0010;
  const LPP_RHUM = 0x0011;
  const LPP_CO2 = 0x0012;
  const LPP_VOC = 0x0013;
  const LPP_ATM_P = 0x0030;
  const LPP_DP = 0x0031;
  const LPP_FLOW = 0x0032;
  const LPP_VISIBLE_LIGHT = 0x0040;
  const LPP_OCCU0 = 0x0041;
  const LPP_REED0 = 0x0050;
  const LPP_CONDENSATION = 0x0051;
  const LPP_VBAT = 0x0054;
  const LPP_SETPOINT = 0x0063;
  const LPP_VBAT_HI_RES = 0x8540;
  const LPP_OCCU1 = 0x9410;
  const LPP_REED1 = 0x9500;
  const LPP_CONDENSATION_RAW = 0x9510;
  const LPP_DEV_KEY = 0xc000;
  const LPP_CMD = 0xc100;
  const LPP_LEARN = 0xc103;
  const LPP_BAT_TYPE = 0xc105;
  const LPP_HEARTBEAT = 0xc106;
  const LPP_MEAS_INTERVAL = 0xc108;
  const LPP_CNT_MEAS = 0xc10a;
  const LPP_BIN_LATENCY = 0xc10b;
  const LPP_TLF_MODE = 0xc120;
  const LPP_TLF_ONTIME = 0xc121;
  const LPP_TLF_INTERVAL_0 = 0xc123;
  const LPP_TLF_INTERVAL_1 = 0xc125;
  const LPP_TLF_INTERVAL_2 = 0xc127;
  const LPP_TLF_INTERVAL_3 = 0xc129;
  const LPP_TLF_INTERVAL_4 = 0xc12b;
  const LPP_TLF_INTERVAL_5 = 0xc12d;
  const LPP_LED_MODE = 0xc134;
  const LPP_LED_ONTIME = 0xc135;
  const LPP_LED_INTERVAL_0 = 0xc136;
  const LPP_LED_INTERVAL_1 = 0xc137;
  const LPP_LED_INTERVAL_2 = 0xc138;
  const LPP_LED_INTERVAL_3 = 0xc139;
  const LPP_FORCED_UPLINK = 0xc230;

  /**
   * Converts a 16-bit unsigned integer to a signed integer.
   * @param {number} u16 - The 16-bit unsigned integer.
   * @returns {number} The 16-bit signed integer.
   */
  function u16ToS16(u16) {
    let s16 = u16 & 0xffff;
    if (0x8000 & s16) {
      s16 = -(0x010000 - s16);
    }
    return s16;
  }

  /**
   * Converts an 8-bit unsigned integer to a signed integer.
   * @param {number} u8 - The 8-bit unsigned integer.
   * @returns {number} The 8-bit signed integer.
   */
  function u8ToS8(u8) {
    let s8 = u8 & 0xff;
    if (0x80 & s8) {
      s8 = -(0x0100 - s8);
    }
    return s8;
  }

  /**
   * Decodes a LoRaWAN LPP payload.
   * @param {number[]} data - The byte array of the payload.
   * @returns {object} The decoded payload as a key-value object.
   */
  function decodeLPPPayload(data) {
    const obj = {};
    let i = 0;
    while (i < data.length) {
      let lpp = 0;
      // LPP type can be 1 or 2 bytes
      if (data[i] <= 0x7f) {
        lpp = data[i];
        i++;
      } else {
        lpp = (data[i] << 8) | data[i + 1];
        i += 2;
      }

      // Check if there is enough data left for the payload
      if (i >= data.length) break;

      switch (lpp) {
        case LPP_TEMP:
          obj.TEMP = u16ToS16((data[i] << 8) | data[i + 1]) / 10;
          i += 2;
          break;
        case LPP_RHUM:
          obj.RHUM = u8ToS8(data[i]);
          i += 1;
          break;
        case LPP_CO2:
          obj.CO2 = (data[i] << 8) | data[i + 1];
          i += 2;
          break;
        case LPP_VOC:
          obj.VOC = (data[i] << 8) | data[i + 1];
          i += 2;
          break;
        case LPP_ATM_P:
          obj.ATM_P = (data[i] << 8) | data[i + 1];
          i += 2;
          break;
        case LPP_DP:
          obj.DP = u16ToS16((data[i] << 8) | data[i + 1]);
          i += 2;
          break;
        case LPP_FLOW:
          obj.FLOW = (data[i] << 8) | data[i + 1];
          i += 2;
          break;
        case LPP_VISIBLE_LIGHT:
          obj.VISIBLE_LIGHT = (data[i] << 8) | data[i + 1];
          i += 2;
          break;
        case LPP_OCCU0:
          obj.OCCU0_STATE = data[i] & 0x01;
          obj.OCCU0_CNT = data[i] >> 1;
          i += 1;
          break;
        case LPP_REED0:
          obj.REED0_STATE = data[i] & 0x01;
          obj.REED0_CNT = data[i] >> 1;
          i += 1;
          break;
        case LPP_CONDENSATION:
          obj.CONDENSATION_STATE = data[i] >>> 7;
          obj.CONDENSATION_RAW =
            u16ToS16((data[i] << 8) | data[i + 1]) & 0x0fff;
          i += 2;
          break;
        case LPP_VBAT:
          obj.VBAT = data[i] * 20; // in mV
          i += 1;
          break;
        case LPP_SETPOINT:
          obj.SETPOINT = data[i];
          i += 1;
          break;
        case LPP_VBAT_HI_RES:
          obj.VBAT_HI_RES = (data[i] << 8) | data[i + 1]; // in mV
          i += 2;
          break;
        case LPP_OCCU1:
          obj.OCCU1_STATE = data[i] & 0x01;
          obj.OCCU1_CNT = data[i] >> 1;
          i += 1;
          break;
        case LPP_REED1:
          obj.REED1_STATE = data[i] & 0x01;
          obj.REED1_CNT = data[i] >> 1;
          i += 1;
          break;
        case LPP_CONDENSATION_RAW:
          obj.CONDENSATION_RAW_ONLY = u16ToS16((data[i] << 8) | data[i + 1]);
          i += 2;
          break;
        // Configuration / Status values
        case LPP_DEV_KEY:
          obj.DEV_KEY = (data[i] << 8) | data[i + 1];
          i += 2;
          break;
        case LPP_CMD:
          obj.CMD = (data[i] << 8) | data[i + 1];
          i += 2;
          break;
        case LPP_LEARN:
          obj.LEARN = data[i];
          i += 1;
          break;
        case LPP_BAT_TYPE:
          obj.BAT_TYPE = (data[i] << 8) | data[i + 1];
          i += 2;
          break;
        case LPP_HEARTBEAT:
          obj.HEARTBEAT = ((data[i] << 8) | data[i + 1]) * 60000; // in ms
          i += 2;
          break;
        case LPP_MEAS_INTERVAL:
          obj.MEAS_INTERVAL = ((data[i] << 8) | data[i + 1]) * 1000; // in ms
          i += 2;
          break;
        case LPP_CNT_MEAS:
          obj.CNT_MEAS = (data[i] << 8) | data[i + 1];
          i += 2;
          break;
        case LPP_BIN_LATENCY:
          obj.BIN_LATENCY = ((data[i] << 8) | data[i + 1]) * 1000; // in ms
          i += 2;
          break;
        case LPP_TLF_MODE:
          obj.TLF_MODE = data[i];
          i += 1;
          break;
        case LPP_TLF_ONTIME:
          obj.TLF_ONTIME = (data[i] << 8) | data[i + 1];
          i += 2;
          break;
        case LPP_TLF_INTERVAL_0:
          obj.TLF_INTERVAL_0 = (data[i] << 8) | data[i + 1];
          i += 2;
          break;
        case LPP_TLF_INTERVAL_1:
          obj.TLF_INTERVAL_1 = (data[i] << 8) | data[i + 1];
          i += 2;
          break;
        case LPP_TLF_INTERVAL_2:
          obj.TLF_INTERVAL_2 = (data[i] << 8) | data[i + 1];
          i += 2;
          break;
        case LPP_TLF_INTERVAL_3:
          obj.TLF_INTERVAL_3 = (data[i] << 8) | data[i + 1];
          i += 2;
          break;
        case LPP_TLF_INTERVAL_4:
          obj.TLF_INTERVAL_4 = (data[i] << 8) | data[i + 1];
          i += 2;
          break;
        case LPP_TLF_INTERVAL_5:
          obj.TLF_INTERVAL_5 = (data[i] << 8) | data[i + 1];
          i += 2;
          break;
        case LPP_LED_MODE:
          obj.LED_MODE = data[i];
          i += 1;
          break;
        case LPP_LED_ONTIME:
          obj.LED_ONTIME = (data[i] << 8) | data[i + 1];
          i += 2;
          break;
        case LPP_LED_INTERVAL_0:
          obj.LED_INTERVAL_0 = (data[i] << 8) | data[i + 1];
          i += 2;
          break;
        case LPP_LED_INTERVAL_1:
          obj.LED_INTERVAL_1 = (data[i] << 8) | data[i + 1];
          i += 2;
          break;
        case LPP_LED_INTERVAL_2:
          obj.LED_INTERVAL_2 = (data[i] << 8) | data[i + 1];
          i += 2;
          break;
        case LPP_LED_INTERVAL_3:
          obj.LED_INTERVAL_3 = (data[i] << 8) | data[i + 1];
          i += 2;
          break;
        case LPP_FORCED_UPLINK:
          obj.FORCED_UPLINK = (data[i] << 8) | data[i + 1];
          i += 2;
          break;
        default:
          // Unknown or unhandled LPP type, log and break
          emit("log", {
            level: "warn",
            message: `Unknown LPP type: 0x${lpp.toString(16)} at index ${i - (lpp > 0x7f ? 2 : 1)
              }`,
          });
          i = data.length; // Stop processing
          break;
      }
    }
    return obj;
  }

  const decoded = decodeLPPPayload(bytes);

  const data = {};
  const lifecycle = {};
  const status = {};

  // Map decoded sensor values to the 'default' topic schema
  if (decoded.TEMP !== undefined) data.temperature = decoded.TEMP;
  if (decoded.RHUM !== undefined) data.humidity = decoded.RHUM;
  if (decoded.VISIBLE_LIGHT !== undefined) data.light = decoded.VISIBLE_LIGHT;
  if (decoded.CO2 !== undefined) data.co2 = decoded.CO2;
  if (decoded.VOC !== undefined) data.voc = decoded.VOC;
  if (decoded.ATM_P !== undefined) data.pressure = decoded.ATM_P;
  if (decoded.DP !== undefined) data.differentialPressure = decoded.DP;
  if (decoded.FLOW !== undefined) data.flow = decoded.FLOW;
  if (decoded.SETPOINT !== undefined) data.setpoint = decoded.SETPOINT;
  if (decoded.CONDENSATION_STATE !== undefined) { data.condensation = !!decoded.CONDENSATION_STATE; }
  if (decoded.CONDENSATION_RAW !== undefined) { data.condensationRaw = decoded.CONDENSATION_RAW; }
  if (decoded.CONDENSATION_RAW_ONLY !== undefined) { data.condensationRaw = decoded.CONDENSATION_RAW_ONLY; }

  if (decoded.OCCU0_STATE !== undefined) data.occupied = !!decoded.OCCU0_STATE;
  if (decoded.OCCU0_CNT !== undefined) data.motionCount = decoded.OCCU0_CNT;
  if (decoded.OCCU1_STATE !== undefined) data.occupied1 = !!decoded.OCCU1_STATE;
  if (decoded.OCCU1_CNT !== undefined) data.motionCount1 = decoded.OCCU1_CNT;
  if (decoded.REED0_STATE !== undefined) data.open = !!decoded.REED0_STATE;
  if (decoded.REED0_CNT !== undefined) data.contactCount = decoded.REED0_CNT;
  if (decoded.REED1_STATE !== undefined) data.open1 = !!decoded.REED1_STATE;
  if (decoded.REED1_CNT !== undefined) data.contactCount1 = decoded.REED1_CNT;

  // Map decoded lifecycle values to the 'lifecycle' topic schema
  if (decoded.VBAT_HI_RES !== undefined) {
    lifecycle.batteryVoltage = decoded.VBAT_HI_RES / 1000;
  } else if (decoded.VBAT !== undefined) {
    lifecycle.batteryVoltage = decoded.VBAT / 1000;
  }
  if (decoded.BAT_TYPE !== undefined) lifecycle.batteryType = decoded.BAT_TYPE;

  // Map decoded status/config values to the 'status' topic schema
  if (decoded.DEV_KEY !== undefined) status.deviceKey = decoded.DEV_KEY;
  if (decoded.CMD !== undefined) status.command = decoded.CMD;
  if (decoded.LEARN !== undefined) status.learn = decoded.LEARN;
  if (decoded.HEARTBEAT !== undefined) status.heartbeat = decoded.HEARTBEAT;
  if (decoded.MEAS_INTERVAL !== undefined) { status.measurementInterval = decoded.MEAS_INTERVAL; }
  if (decoded.CNT_MEAS !== undefined) { status.measurementCount = decoded.CNT_MEAS; }
  if (decoded.BIN_LATENCY !== undefined) { status.binaryInputLatency = decoded.BIN_LATENCY; }
  if (decoded.FORCED_UPLINK !== undefined) { status.forcedUplink = decoded.FORCED_UPLINK; }

  if (Object.keys(data).length > 0) {
    emit("sample", { data, topic: "default" });
  }
  if (Object.keys(lifecycle).length > 0) {
    emit("sample", { data: lifecycle, topic: "lifecycle" });
  }
  if (Object.keys(status).length > 0) {
    emit("sample", { data: status, topic: "status" });
  }
}
