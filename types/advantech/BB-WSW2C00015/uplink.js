// Helper function to convert analog raw value to a real-world value
function calculateAnalogValue(raw, mode, neg) {
  if (mode === 0) { // Disabled
    return null;
  }

  let min = 0;
  let max = 0;
  let unit = "";

  switch (mode) {
    case 1: unit = "V"; max = 10; break; // 10V
    case 2: unit = "V"; max = 5; break; // 5V
    case 3: unit = "V"; max = 1; break; // 1V
    case 4: unit = "mA"; max = 20; break; // 20mA
    default: return null; // Unknown mode
  }

  if (neg === 1 && unit === "V") { // Supports negative voltage
    min = -max;
  }

  const value = min + ((max - min) / 65535) * raw;
  return { value: parseFloat(value.toFixed(4)), unit: unit };
}


function consume(event) {
  const payload = Hex.hexToBytes(event.data.payloadHex);
  const { port } = event.data;

  switch (port) {
    case 5: { // Modbus Uplink Data (BB-WSW2C00015)
      const data = {};
      data.slaveId = payload[0];
      data.address = (payload[1] << 8) | payload[2];

      const fl = payload[3];
      data.functionCode = (fl >> 5) & 0x07;
      data.payloadLength = fl & 0x1F;

      const tr = payload[4];
      data.transactionIndex = (tr >> 4) & 0x0F;
      data.returnCode = tr & 0x0F;

      const modbusPayloadBytes = payload.slice(5);
      data.payload = Hex.bytesToHex(modbusPayloadBytes).toUpperCase();

      emit("sample", { data: data, topic: "modbus" });
      break;
    }

    case 6: { // Sensor Uplink Data (BB-WSW2C42100)
      if (payload.length < 11) {
        // Invalid payload length
        return;
      }
      const data = {};

      // Raw Analog Data [cite: 342, 343]
      const ai1_r = (payload[0] << 8) | payload[1];
      const ai2_r = (payload[2] << 8) | payload[3];
      const ai3_r = (payload[4] << 8) | payload[5];
      const ai4_r = (payload[6] << 8) | payload[7];

      // Analog Input Mode bitfield [cite: 344, 345]
      const aim = (payload[8] << 8) | payload[9];
      const ai1_mode = (aim >> 0) & 0x07;
      const ai1_neg = (aim >> 3) & 0x01;
      const ai2_mode = (aim >> 4) & 0x07;
      const ai2_neg = (aim >> 7) & 0x01;
      const ai3_mode = (aim >> 8) & 0x07;
      const ai3_neg = (aim >> 11) & 0x01;
      const ai4_mode = (aim >> 12) & 0x07;
      const ai4_neg = (aim >> 15) & 0x01;

      data.analog_inputs = {
        ai1: calculateAnalogValue(ai1_r, ai1_mode, ai1_neg),
        ai2: calculateAnalogValue(ai2_r, ai2_mode, ai2_neg),
        ai3: calculateAnalogValue(ai3_r, ai3_mode, ai3_neg),
        ai4: calculateAnalogValue(ai4_r, ai4_mode, ai4_neg)
      };

      // Digital I/O bitfield 
      const dido = payload[10];
      data.digital_io = {
        di1_value: (dido >> 0) & 0x01,
        di1_enabled: (dido >> 1) & 0x01,
        di2_value: (dido >> 2) & 0x01,
        di2_enabled: (dido >> 3) & 0x01,
        do1_active: (dido >> 4) & 0x01,
        do1_enabled: (dido >> 5) & 0x01
      };

      emit("sample", { data: data, topic: "sensor" });
      break;
    }

    case 64: { // Common Uplink ACK
      const data = {};
      data.previousFPort = payload[0];
      data.returnCode = payload[1] === 0 ? "Success" : "Unsuccessful";
      data.checksum = (payload[2] << 8) | payload[3];

      emit("sample", { data: data, topic: "system" });
      break;
    }

    default:
      // Port not documented for these models
      break;
  }
}