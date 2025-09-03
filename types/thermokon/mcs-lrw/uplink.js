// LPP constants from Thermokon Datasheet Revision C (12.03.2025)
const LPP_TEMP = 0x10;
const LPP_RHUM = 0x11;
const LPP_CO2 = 0x12;
const LPP_VOC = 0x13;
const LPP_ATM_P = 0x30;
const LPP_DP = 0x31;
const LPP_FLOW = 0x32;
const LPP_VISIBLE_LIGHT = 0x40;
const LPP_OCCU0 = 0x41;
const LPP_REED0 = 0x50;
const LPP_CONDENSATION = 0x51;
const LPP_VBAT = 0x54;
const LPP_SETPOINT = 0x63;
const LPP_REED1 = 0x9500;

// Configuration & Device Parameters from Datasheet
const LPP_DEV_KEY = 0xc000;
const LPP_CMD = 0xc100;
const LPP_HEARTBEAT = 0xc106;
const LPP_HYSTERESIS = 0xc107;
const LPP_MEAS_INTERVAL = 0xc108;
const LPP_BIN_LATENCY = 0xc10b;
const LPP_OCCU_DISABLE_TIME = 0x8413;
const LPP_OCCU_FOLLOWUP_TIME = 0x8414;

// LoRaWAN Configuration from Datasheet
const LPP_LW_PORT = 0xc216;
const LPP_LW_ADR = 0xc217;
const LPP_LW_DR = 0xc218;
const LPP_LW_TX_POWER = 0xc219;
const LPP_LW_CHANNEL_MASK = 0xc21a;
const LPP_LW_NB_TRANS = 0xc21b;
const LPP_LW_REJOIN_INTERVAL = 0xc21c;
const LPP_LW_CONFIRMATION = 0xc21d;

// Older constants from Manufacturer Decoder for compatibility
const LPP_VBAT_HI_RES = 0x8540;
const LPP_CONDENSATION_RAW_ONLY = 0x9510;
const LPP_LEARN = 0xc103;
const LPP_BAT_TYPE = 0xc105;
const LPP_CNT_MEAS = 0xc10a;

function u16ToS16(u16) {
  let s16 = u16 & 0xffff;
  if (0x8000 & s16) {
    s16 = -(0x010000 - s16);
  }
  return s16;
}

function u8ToS8(u8) {
  let s8 = u8 & 0xff;
  if (0x80 & s8) {
    s8 = -(0x0100 - s8);
  }
  return s8;
}

function decodeLPPPayload(data) {
  const obj = {};
  let i = 0;
  while (i < data.length) {
    let lpp = 0;
    if (data[i] <= 0x7f) {
      lpp = data[i];
      i++;
    } else {
      lpp = (data[i] << 8) | data[i + 1];
      i += 2;
    }

    if (i >= data.length) break;

    switch (lpp) {
      // Measured Variables (as per your correct datasheet logic)
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
      case LPP_CONDENSATION: {
        const rawCondensation = (data[i] << 8) | data[i + 1];
        obj.CONDENSATION_STATE = (rawCondensation >> 15) & 0x01;
        obj.CONDENSATION_RAW = rawCondensation & 0x7fff;
        i += 2;
        break;
      }
      case LPP_VBAT:
        obj.VBAT = data[i] / 0.05;
        i += 1;
        break;
      case LPP_SETPOINT:
        obj.SETPOINT = u8ToS8(data[i]);
        i += 1;
        break;
      case LPP_REED1:
        obj.REED1_STATE = data[i] & 0x01;
        obj.REED1_CNT = data[i] >> 1;
        i += 1;
        break;

      // Older/Compatibility Fields from Manufacturer's Decoder
      case LPP_VBAT_HI_RES:
        obj.VBAT_HI_RES = (data[i] << 8) | data[i + 1]; // in mV
        i += 2;
        break;
      case LPP_CONDENSATION_RAW_ONLY:
        obj.CONDENSATION_RAW_ONLY = u16ToS16((data[i] << 8) | data[i + 1]);
        i += 2;
        break;
      case LPP_LEARN:
        obj.LEARN = data[i];
        i++;
        break;
      case LPP_BAT_TYPE:
        obj.BAT_TYPE = (data[i] << 8) | data[i + 1];
        i += 2;
        break;
      case LPP_CNT_MEAS:
        obj.CNT_MEAS = (data[i] << 8) | data[i + 1];
        i += 2;
        break;

      // Configuration (as per your correct datasheet logic)
      case LPP_DEV_KEY:
        obj.DEV_KEY = (data[i] << 8) | data[i + 1];
        i += 2;
        break;
      case LPP_CMD:
        obj.CMD = (data[i] << 8) | data[i + 1];
        i += 2;
        break;
      case LPP_HEARTBEAT:
        obj.HEARTBEAT = (data[i] << 8) | data[i + 1];
        i += 2;
        break;
      case LPP_HYSTERESIS:
        obj.HYSTERESIS = (data[i] << 8) | data[i + 1];
        i += 2;
        break;
      case LPP_MEAS_INTERVAL:
        obj.MEAS_INTERVAL = (data[i] << 8) | data[i + 1];
        i += 2;
        break;
      case LPP_BIN_LATENCY:
        obj.BIN_LATENCY = (data[i] << 8) | data[i + 1];
        i += 2;
        break;
      case LPP_OCCU_DISABLE_TIME:
        obj.OCCU_DISABLE_TIME = (data[i] << 8) | data[i + 1];
        i += 2;
        break;
      case LPP_OCCU_FOLLOWUP_TIME:
        obj.OCCU_FOLLOWUP_TIME = (data[i] << 8) | data[i + 1];
        i += 2;
        break;
      case LPP_LW_PORT:
        obj.LW_PORT = (data[i] << 8) | data[i + 1];
        i += 2;
        break;
      case LPP_LW_ADR:
        obj.LW_ADR = (data[i] << 8) | data[i + 1];
        i += 2;
        break;
      case LPP_LW_DR:
        obj.LW_DR = (data[i] << 8) | data[i + 1];
        i += 2;
        break;
      case LPP_LW_TX_POWER:
        obj.LW_TX_POWER = (data[i] << 8) | data[i + 1];
        i += 2;
        break;
      case LPP_LW_CHANNEL_MASK:
        obj.LW_CHANNEL_MASK = (data[i] << 8) | data[i + 1];
        i += 2;
        break;
      case LPP_LW_NB_TRANS:
        obj.LW_NB_TRANS = (data[i] << 8) | data[i + 1];
        i += 2;
        break;
      case LPP_LW_REJOIN_INTERVAL:
        obj.LW_REJOIN_INTERVAL = (data[i] << 8) | data[i + 1];
        i += 2;
        break;
      case LPP_LW_CONFIRMATION:
        obj.LW_CONFIRMATION = (data[i] << 8) | data[i + 1];
        i += 2;
        break;

      default:
        i = data.length;
        break;
    }
  }
  return obj;
}

/**
 * Consumes the payload from an event, decodes it based on the Thermokon datasheet,
 * and includes extra fields for backward compatibility with older manufacturer code.
 * @param {object} event - The event object containing the payload.
 */
function consume(event) {
  const payload = event.data.payloadHex;
  const bytes = Hex.hexToBytes(payload);

  const decoded = decodeLPPPayload(bytes);

  const data = {};
  const lifecycle = {};
  const status = {};

  // Map sensor values to 'default' topic
  if (decoded.TEMP !== undefined) {
    data.temperature = decoded.TEMP;
  }
  if (decoded.RHUM !== undefined) {
    data.humidity = decoded.RHUM;
  }
  if (decoded.CO2 !== undefined) {
    data.co2 = decoded.CO2;
  }
  if (decoded.VOC !== undefined) {
    data.voc = decoded.VOC;
  }
  if (decoded.ATM_P !== undefined) {
    data.pressure = decoded.ATM_P;
  }
  if (decoded.DP !== undefined) {
    data.differentialPressure = decoded.DP;
  }
  if (decoded.FLOW !== undefined) {
    data.flow = decoded.FLOW;
  }
  if (decoded.VISIBLE_LIGHT !== undefined) {
    data.light = decoded.VISIBLE_LIGHT;
  }
  if (decoded.SETPOINT !== undefined) {
    data.setpoint = decoded.SETPOINT;
  }
  if (decoded.CONDENSATION_STATE !== undefined) {
    data.condensation = !!decoded.CONDENSATION_STATE;
  }
  if (decoded.CONDENSATION_RAW !== undefined) {
    data.condensationRaw = decoded.CONDENSATION_RAW;
  }
  if (decoded.CONDENSATION_RAW_ONLY !== undefined) {
    data.condensationRaw = decoded.CONDENSATION_RAW_ONLY;
  }
  if (decoded.OCCU0_STATE !== undefined) {
    data.occupied = !!decoded.OCCU0_STATE;
  }
  if (decoded.OCCU0_CNT !== undefined) {
    data.motionCount = decoded.OCCU0_CNT;
  }
  if (decoded.REED0_STATE !== undefined) {
    data.open = !!decoded.REED0_STATE;
  }
  if (decoded.REED0_CNT !== undefined) {
    data.contactCount = decoded.REED0_CNT;
  }
  if (decoded.REED1_STATE !== undefined) {
    data.open1 = !!decoded.REED1_STATE;
  }
  if (decoded.REED1_CNT !== undefined) {
    data.contactCount1 = decoded.REED1_CNT;
  }

  // Map lifecycle values to 'lifecycle' topic
  if (decoded.VBAT_HI_RES !== undefined) {
    lifecycle.batteryVoltage = decoded.VBAT_HI_RES / 1000;
  } else if (decoded.VBAT !== undefined) {
    lifecycle.batteryVoltage = decoded.VBAT / 1000;
  }
  if (decoded.BAT_TYPE !== undefined) {
    lifecycle.batteryType = decoded.BAT_TYPE;
  }

  // Map status/config values to 'status' topic
  if (decoded.DEV_KEY !== undefined) {
    status.deviceKey = decoded.DEV_KEY;
  }
  if (decoded.CMD !== undefined) {
    status.controlCommand = decoded.CMD;
  }
  if (decoded.HEARTBEAT !== undefined) {
    status.heartbeatInterval = decoded.HEARTBEAT;
  }
  if (decoded.HYSTERESIS !== undefined) {
    status.hysteresis = decoded.HYSTERESIS;
  }
  if (decoded.MEAS_INTERVAL !== undefined) {
    status.measurementInterval = decoded.MEAS_INTERVAL;
  }
  if (decoded.BIN_LATENCY !== undefined) {
    status.digitalInputLatency = decoded.BIN_LATENCY;
  }
  if (decoded.OCCU_DISABLE_TIME !== undefined) {
    status.occupancyDisablingTime = decoded.OCCU_DISABLE_TIME;
  }
  if (decoded.OCCU_FOLLOWUP_TIME !== undefined) {
    status.occupancyFollowUpTime = decoded.OCCU_FOLLOWUP_TIME;
  }
  if (decoded.LW_PORT !== undefined) {
    status.lorawanPort = decoded.LW_PORT;
  }
  if (decoded.LW_ADR !== undefined) {
    status.lorawanAdr = decoded.LW_ADR;
  }
  if (decoded.LW_DR !== undefined) {
    status.lorawanDataRate = decoded.LW_DR;
  }
  if (decoded.LW_TX_POWER !== undefined) {
    status.lorawanTxPower = decoded.LW_TX_POWER;
  }
  if (decoded.LW_CHANNEL_MASK !== undefined) {
    status.lorawanChannelMask = decoded.LW_CHANNEL_MASK;
  }
  if (decoded.LW_NB_TRANS !== undefined) {
    status.lorawanNbTrans = decoded.LW_NB_TRANS;
  }
  if (decoded.LW_REJOIN_INTERVAL !== undefined) {
    status.lorawanRejoinInterval = decoded.LW_REJOIN_INTERVAL;
  }
  if (decoded.LW_CONFIRMATION !== undefined) {
    status.lorawanConfirmation = decoded.LW_CONFIRMATION;
  }
  // Legacy status fields
  if (decoded.LEARN !== undefined) {
    status.learn = decoded.LEARN;
  }
  if (decoded.CNT_MEAS !== undefined) {
    status.measurementCount = decoded.CNT_MEAS;
  }

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
