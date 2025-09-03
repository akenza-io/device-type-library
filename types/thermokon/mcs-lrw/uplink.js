function consume(event) {
  const payload = event.data.payloadHex;
  const bytes = Hex.hexToBytes(payload);

  // LPP constants from Thermokon
  const LPP_TEMP = 0x0010;
  const LPP_RHUM = 0x0011;
  const LPP_VISIBLE_LIGHT = 0x0040;
  const LPP_OCCU0 = 0x0041;
  const LPP_REED0 = 0x0050;
  const LPP_VBAT = 0x0054;
  const LPP_VBAT_HI_RES = 0x8540;
  const LPP_OCCU1 = 0x9410;
  const LPP_REED1 = 0x9500;

  // Helper function for signed 16-bit integer
  function u16ToS16(u16) {
    let s16 = u16 & 0xffff;
    if (0x8000 & s16) {
      s16 = -(0x010000 - s16);
    }
    return s16;
  }

  // Helper function for signed 8-bit integer
  function u8ToS8(u8) {
    let s8 = u8 & 0xff;
    if (0x80 & s8) {
      s8 = -(0x0100 - s8);
    }
    return s8;
  }

  // Main LPP decoding function
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
        case LPP_VBAT:
          obj.VBAT = data[i] * 20; // in mV
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
        default:
          // Unknown or unhandled LPP type, log and break
          emit("log", {
            level: "warn",
            message: `Unknown LPP type: 0x${lpp.toString(16)}`
          });
          i = data.length;
          break;
      }
    }
    return obj;
  }

  const decoded = decodeLPPPayload(bytes);

  const data = {};
  const lifecycle = {};

  // Map decoded values to the 'default' topic schema
  if (decoded.TEMP !== undefined) {
    data.temperature = decoded.TEMP;
  }
  if (decoded.RHUM !== undefined) {
    data.humidity = decoded.RHUM;
  }
  if (decoded.VISIBLE_LIGHT !== undefined) {
    data.light = decoded.VISIBLE_LIGHT;
  }
  if (decoded.OCCU0_STATE !== undefined) {
    data.occupied = !!decoded.OCCU0_STATE;
  }
  if (decoded.OCCU0_CNT !== undefined) {
    data.motionCount = decoded.OCCU0_CNT;
  }
  if (decoded.OCCU1_STATE !== undefined) {
    data.occupied1 = !!decoded.OCCU1_STATE;
  }
  if (decoded.OCCU1_CNT !== undefined) {
    data.motionCount1 = decoded.OCCU1_CNT;
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

  // Map decoded values to the 'lifecycle' topic schema
  if (decoded.VBAT_HI_RES !== undefined) {
    lifecycle.batteryVoltage = decoded.VBAT_HI_RES / 1000;
  } else if (decoded.VBAT !== undefined) {
    lifecycle.batteryVoltage = decoded.VBAT / 1000;
  }

  if (Object.keys(data).length > 0) {
    emit("sample", {
      data,
      topic: "default"
    });
  }
  if (Object.keys(lifecycle).length > 0) {
    emit("sample", {
      data: lifecycle,
      topic: "lifecycle"
    });
  }
}