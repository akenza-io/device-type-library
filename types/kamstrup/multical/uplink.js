// CMi41xx
const packetTypes = {
  // CMi4110
  0x00: ["CMi4110", "Standard", "Landis+Gyr"],
  0x01: ["CMi4110", "Compact", "Landis+Gyr"],
  0x02: ["CMi4110", "JSON", "Landis+Gyr"],
  0x03: ["CMi4110", "Scheduled Daily Redundant", "Landis+Gyr", ["", "", "", "accAt24", ""]],
  0x04: ["CMi4110", "Scheduled Extended", "Landis+Gyr"],
  0x3F: ["CMi4110", "Scheduled Extended+", "Landis+Gyr", ["", "tariff1", "tariff2", "tariff3", "", ""]],
  0x40: ["CMi4110", "Scheduled Extended+ 2", "Landis+Gyr"],
  0x41: ["CMi4110", "Compact Tariff", "Landis+Gyr", ["", "tariff1", "tariff2", "tariff3", "", ""]],
  0x46: ["CMi4110", "Maximum Flow", "Landis+Gyr"],
  0x47: ["CMi4110", "Scheduled Daily Redundant Tariff", "Landis+Gyr", ["at24", "", "", "", "", ""]],
  0x48: ["CMi4110", "Scheduled Daily Redundant Tariff 2", "Landis+Gyr"],
  0x49: ["CMi4110", "Scheduled Monthly", "Landis+Gyr"],
  0x4A: ["CMi4110", "Scheduled Daily", "Landis+Gyr", ["at24", "", "", "", "", ""]],
  0x57: ["CMi4110", "Scheduled Daily Extended", "Landis+Gyr"],
  0x58: ["CMi4110", "Scheduled Daily Extended 2", "Landis+Gyr"],
  0x59: ["CMi4110", "Scheduled Monthly Extended", "Landis+Gyr"],
  0x5A: ["CMi4110", "Scheduled Monthly Extended 2", "Landis+Gyr"],

  // CMi4111
  0x05: ["CMi4111", "Standard", "Landis+Gyr"],
  0x06: ["CMi4111", "Compact", "Landis+Gyr"],
  0x07: ["CMi4111", "JSON", "Landis+Gyr"],
  0x08: ["CMi4111", "Scheduled - Daily redundant", "Landis+Gyr", ["", "", "", "", "", "accAt24"]],
  0x09: ["CMi4111", "Scheduled - Extended", "Landis+Gyr"],
  0x0A: ["CMi4111", "Combined heat/cooling", "Landis+Gyr"],
  0x0B: ["CMi4111", "Simple billing", "Landis+Gyr"],
  0x0C: ["CMi4111", "Plausibility check", "Landis+Gyr"],
  0x0D: ["CMi4111", "Monitoring", "Landis+Gyr"],

  // CMi4130
  0x0F: ["CMi4130", "Standard", "Itron"],
  0x10: ["CMi4130", "Compact", "Itron"],
  0x11: ["CMi4130", "JSON", "Itron"],
  0x12: ["CMi4130", "Scheduled - Daily redundant", "Itron", ["", "", "", "", "", "accAt24"]],
  0x13: ["CMi4130", "Scheduled - Extended", "Itron"],
  0x14: ["CMi4130", "Combined heat/cooling", "Itron"],

  // CMi4140
  0x15: ["CMi4140", "Standard", "Kamstrup"],
  0x16: ["CMi4140", "Compact", "Kamstrup"],
  0x17: ["CMi4140", "JSON", "Kamstrup"],
  0x18: ["CMi4140", "Scheduled Daily Redundant", "Kamstrup"],
  0x19: ["CMi4140", "Scheduled Extended", "Kamstrup"],
  0x1A: ["CMi4140", "Combined heating/cooling", "Kamstrup"],
  0x1B: ["CMi4140", "Heat Intelligence", "Kamstrup", ["E1", "E3", "", "", "", ""]],
  0x3B: ["CMi4140", "Scheduled Extended+", "Kamstrup"],
  0x3C: ["CMi4140", "Scheduled Extended+ 2", "Kamstrup"],
  0x1C: ["CMi4140", "Pulse", "Kamstrup"],
  0x1D: ["CMi4140", "Pulse 2", "Kamstrup"],
  0x4D: ["CMi4140", "Pulse Extended", "Kamstrup"],
  0x4E: ["CMi4140", "Pulse Extended 2", "Kamstrup"],
  0x4F: ["CMi4140", "DR0 message", "Kamstrup"],
  0x51: ["CMi4140", "Scheduled Daily Extended", "Kamstrup"],
  0x52: ["CMi4140", "Scheduled Daily Extended 2", "Kamstrup"],
  0x53: ["CMi4140", "Maximum Flow", "Kamstrup"],

  // CMi4160
  0x1E: ["CMi4160", "Standard", "Diehl"],
  0x1F: ["CMi4160", "Compact", "Diehl"],
  0x20: ["CMi4160", "JSON", "Diehl"],
  0x21: ["CMi4160", "Scheduled - Daily redundant", "Diehl"],
  0x22: ["CMi4160", "Scheduled - Extended", "Diehl"],
  0x23: ["CMi4160", "Combined heat/cooling", "Diehl"],
  0x3D: ["CMi4160", "Scheduled Extended+", "Diehl"],
  0x3E: ["CMi4160", "Scheduled Extended+ 2", "Diehl"],
  0x5D: ["CMi4160", "Max Flow", "Diehl"],

  // CMi4240
  0x5B: ["CMi4240", "DR0 Primary Energy", "Kamstrup"],

  // CMi4270
  0x5C: ["CMi4270", "DR0 Primary Energy", "Engelmann"],
  0x61: ["CMi4270", "DR0 Secondary Energy", "Engelmann"],

  // CMi4170
  0x24: ["CMi4170", "Standard", "Engelmann"],
  0x25: ["CMi4170", "Compact", "Engelmann"],
  0x26: ["CMi4170", "JSON", "Engelmann"],
  0x27: ["CMi4170", "Scheduled - daily redundant", "Engelmann"],
  0x28: ["CMi4170", "Scheduled - Extended", "Engelmann"],
  0x29: ["CMi4170", "Combined heat/cooling", "Engelmann"],
  0x2C: ["CMi4170", "Engelmann", "Engelmann"],
  0x2D: ["CMi4170", "Engelmann 2", "Engelmann"],
  0x50: ["CMi4170", "DR0 message", "Engelmann"],
};

// DR0 Primary/Secondary Energy carry a fixed layout instead of M-Bus records
const dr0Formats = [0x5b, 0x5c, 0x61];

const valueMap = {
  // energy
  0x0400: ["energy", "Wh", 0.001],
  0x0401: ["energy", "Wh", 0.01],
  0x0402: ["energy", "Wh", 0.1],
  0x0403: ["energy", "Wh", 1],
  0x0404: ["energy", "Wh", 10],
  0x0405: ["energy", "Wh", 100],
  0x0406: ["energy", "kWh", 1],
  0x0407: ["energy", "kWh", 10],
  0x0408: ["energy", "J", 1],
  0x0409: ["energy", "J", 10],
  0x040a: ["energy", "J", 100],
  0x040b: ["energy", "J", 1000],
  0x040c: ["energy", "J", 10000],
  0x040d: ["energy", "J", 100000],
  0x040e: ["energy", "MJ", 1],
  0x040f: ["energy", "MJ", 10],
  0x04fb: {
    0x0c: ["energy", "GCal", 0.0001],
    0x0d: ["energy", "MCal", 1],
    0x0e: ["energy", "MCal", 10],
    0x0f: ["energy", "MCal", 100],
    // cooling energy
    0x8c: ["coolingEnergy", "GCal", 0.0001],
    0x8d: ["coolingEnergy", "MCal", 1],
    0x8e: ["coolingEnergy", "MCal", 10],
    0x8f: ["coolingEnergy", "MCal", 100],
  },

  0x4400: ["accumulatedEnergy", "Wh", 0.001],
  0x4401: ["accumulatedEnergy", "Wh", 0.01],
  0x4402: ["accumulatedEnergy", "Wh", 0.1],
  0x4403: ["accumulatedEnergy", "Wh", 1],
  0x4404: ["accumulatedEnergy", "Wh", 10],
  0x4405: ["accumulatedEnergy", "Wh", 100],
  0x4406: ["accumulatedEnergy", "kWh", 1],
  0x4407: ["accumulatedEnergy", "kWh", 10],
  0x440e: ["accumulatedEnergy", "MJ", 1],
  0x440f: ["accumulatedEnergy", "MJ", 10],
  0x44fb: {
    0x0d: ["accumulatedEnergy", "MCal", 1],
    0x0e: ["accumulatedEnergy", "MCal", 10],
    0x0f: ["accumulatedEnergy", "MCal", 100],
  },



  // cooling energy, have additional 0xff02 flag
  0x0480: ["coolingEnergy", "Wh", 0.001],
  0x0481: ["coolingEnergy", "Wh", 0.01],
  0x0482: ["coolingEnergy", "Wh", 0.1],
  0x0483: ["coolingEnergy", "Wh", 1],
  0x0484: ["coolingEnergy", "Wh", 10],
  0x0485: ["coolingEnergy", "Wh", 100],
  0x0486: ["coolingEnergy", "kWh", 1],
  0x0487: ["coolingEnergy", "kWh", 10],
  0x0488: ["coolingEnergy", "J", 1],
  0x0489: ["coolingEnergy", "J", 10],
  0x048a: ["coolingEnergy", "J", 100],
  0x048b: ["coolingEnergy", "J", 1000],
  0x048c: ["coolingEnergy", "J", 10000],
  0x048d: ["coolingEnergy", "J", 100000],
  0x048e: ["coolingEnergy", "MJ", 1],
  0x048f: ["coolingEnergy", "MJ", 10],

  // energy E8, E9
  0x04ff: {
    0x07: ["energyE8", "m³*°C", 1],
    0x08: ["energyE9", "m³*°C", 1],
  },

  // volume
  0x0410: ["volume", "m³", 0.000001],
  0x0411: ["volume", "m³", 0.00001],
  0x0412: ["volume", "m³", 0.0001],
  0x0413: ["volume", "m³", 0.001],
  0x0414: ["volume", "m³", 0.01],
  0x0415: ["volume", "m³", 0.1],
  0x0416: ["volume", "m³", 1],
  0x0417: ["volume", "m³", 10],

  // power
  0x0228: ["power", "W", 0.001],
  0x0229: ["power", "W", 0.01],
  0x022a: ["power", "W", 0.1],
  0x022b: ["power", "W", 1],
  0x022c: ["power", "W", 10],
  0x022d: ["power", "W", 100],
  0x022e: ["power", "kW", 1],
  0x022f: ["power", "kW", 10],

  // flow
  0x0238: ["flow", "m³/h", 0.000001],
  0x0239: ["flow", "m³/h", 0.00001],
  0x023a: ["flow", "m³/h", 0.0001],
  0x023b: ["flow", "m³/h", 0.001],
  0x023c: ["flow", "m³/h", 0.01],
  0x023d: ["flow", "m³/h", 0.1],
  0x023e: ["flow", "m³/h", 1],
  0x023f: ["flow", "m³/h", 10],

  // forwardTemperature
  0x1258: ["maxForwardTemperature", "°C", 0.001],
  0x1259: ["maxForwardTemperature", "°C", 0.01],
  0x125a: ["maxForwardTemperature", "°C", 0.1],
  0x125b: ["maxForwardTemperature", "°C", 1],

  0x0258: ["forwardTemperature", "°C", 0.001],
  0x0259: ["forwardTemperature", "°C", 0.01],
  0x025a: ["forwardTemperature", "°C", 0.1],
  0x025b: ["forwardTemperature", "°C", 1],

  // returnTemperature
  0x125c: ["maxReturnTemperature", "°C", 0.001],
  0x125d: ["maxReturnTemperature", "°C", 0.01],
  0x125e: ["maxReturnTemperature", "°C", 0.1],
  0x125f: ["maxReturnTemperature", "°C", 1],

  0x025c: ["returnTemperature", "°C", 0.001],
  0x025d: ["returnTemperature", "°C", 0.01],
  0x025e: ["returnTemperature", "°C", 0.1],
  0x025f: ["returnTemperature", "°C", 1],

  // storage 1 (value at the scheduled due date) - Scheduled Daily/Monthly Extended
  0x4410: ["accumulatedVolume", "m³", 0.000001],
  0x4411: ["accumulatedVolume", "m³", 0.00001],
  0x4412: ["accumulatedVolume", "m³", 0.0001],
  0x4413: ["accumulatedVolume", "m³", 0.001],
  0x4414: ["accumulatedVolume", "m³", 0.01],
  0x4415: ["accumulatedVolume", "m³", 0.1],
  0x4416: ["accumulatedVolume", "m³", 1],
  0x4417: ["accumulatedVolume", "m³", 10],

  0x4228: ["power", "W", 0.001],
  0x4229: ["power", "W", 0.01],
  0x422a: ["power", "W", 0.1],
  0x422b: ["power", "W", 1],
  0x422c: ["power", "W", 10],
  0x422d: ["power", "W", 100],
  0x422e: ["power", "kW", 1],
  0x422f: ["power", "kW", 10],

  0x4238: ["flow", "m³/h", 0.000001],
  0x4239: ["flow", "m³/h", 0.00001],
  0x423a: ["flow", "m³/h", 0.0001],
  0x423b: ["flow", "m³/h", 0.001],
  0x423c: ["flow", "m³/h", 0.01],
  0x423d: ["flow", "m³/h", 0.1],
  0x423e: ["flow", "m³/h", 1],
  0x423f: ["flow", "m³/h", 10],

  0x4258: ["forwardTemperature", "°C", 0.001],
  0x4259: ["forwardTemperature", "°C", 0.01],
  0x425a: ["forwardTemperature", "°C", 0.1],
  0x425b: ["forwardTemperature", "°C", 1],

  0x425c: ["returnTemperature", "°C", 0.001],
  0x425d: ["returnTemperature", "°C", 0.01],
  0x425e: ["returnTemperature", "°C", 0.1],
  0x425f: ["returnTemperature", "°C", 1],

  // type G date (2 bytes), 4th element selects the date decoder
  0x426c: ["dueDate", null, null, "G"],

  // DIF+DIFE keys: maximum flow (function field 01) and its date,
  // plus the due-date energy register, used by the Max Flow formats
  0xd201: {
    0x38: ["maxFlow", "m³/h", 0.000001],
    0x39: ["maxFlow", "m³/h", 0.00001],
    0x3a: ["maxFlow", "m³/h", 0.0001],
    0x3b: ["maxFlow", "m³/h", 0.001],
    0x3c: ["maxFlow", "m³/h", 0.01],
    0x3d: ["maxFlow", "m³/h", 0.1],
    0x3e: ["maxFlow", "m³/h", 1],
    0x3f: ["maxFlow", "m³/h", 10],
  },
  0xc201: {
    0x6c: ["maxFlowDate", null, null, "G"],
  },
  0x8401: {
    0x00: ["energyAtDueDate", "Wh", 0.001],
    0x01: ["energyAtDueDate", "Wh", 0.01],
    0x02: ["energyAtDueDate", "Wh", 0.1],
    0x03: ["energyAtDueDate", "Wh", 1],
    0x04: ["energyAtDueDate", "Wh", 10],
    0x05: ["energyAtDueDate", "Wh", 100],
    0x06: ["energyAtDueDate", "kWh", 1],
    0x07: ["energyAtDueDate", "kWh", 10],
  },

  // storage 1, BCD - CMi4110 Scheduled Daily/Monthly Extended.
  // 0x4c10 is deliberately absent: a 0x10 second byte is read as a
  // tariff DIFE elsewhere (see 0x0c10), so it is too ambiguous to map.
  0x4c00: ["energy", "Wh", 0.001],
  0x4c01: ["energy", "Wh", 0.01],
  0x4c02: ["energy", "Wh", 0.1],
  0x4c03: ["energy", "Wh", 1],
  0x4c04: ["energy", "Wh", 10],
  0x4c05: ["energy", "Wh", 100],

  0x4c11: ["volume", "m³", 0.00001],
  0x4c12: ["volume", "m³", 0.0001],
  0x4c13: ["volume", "m³", 0.001],

  0x4b28: ["power", "W", 0.001],
  0x4b29: ["power", "W", 0.01],
  0x4b2a: ["power", "W", 0.1],
  0x4b2b: ["power", "W", 1],
  0x4b2c: ["power", "W", 10],
  0x4b2d: ["power", "W", 100],
  0x4b2e: ["power", "kW", 1],
  0x4b2f: ["power", "kW", 10],

  0x4b38: ["flow", "m³/h", 0.000001],
  0x4b39: ["flow", "m³/h", 0.00001],
  0x4b3a: ["flow", "m³/h", 0.0001],
  0x4b3b: ["flow", "m³/h", 0.001],
  0x4b3c: ["flow", "m³/h", 0.01],
  0x4b3d: ["flow", "m³/h", 0.1],
  0x4b3e: ["flow", "m³/h", 1],
  0x4b3f: ["flow", "m³/h", 10],

  0x4a58: ["forwardTemperature", "°C", 0.001],
  0x4a59: ["forwardTemperature", "°C", 0.01],
  0x4a5a: ["forwardTemperature", "°C", 0.1],
  0x4a5b: ["forwardTemperature", "°C", 1],

  0x4a5c: ["returnTemperature", "°C", 0.001],
  0x4a5d: ["returnTemperature", "°C", 0.01],
  0x4a5e: ["returnTemperature", "°C", 0.1],
  0x4a5f: ["returnTemperature", "°C", 1],

  // storage 2 (value at the due date), reached through a DIFE
  0x8201: {
    0x6c: ["dueDate", null, null, "G"],
  },
  0x8c11: {
    0x04: ["tariff1energyAtDueDate", "Wh", 10],
    0x06: ["tariff1energyAtDueDate", "kWh", 1],
  },
  0x8c21: {
    0x04: ["tariff2energyAtDueDate", "Wh", 10],
    0x06: ["tariff2energyAtDueDate", "kWh", 1],
  },
  0x8b01: {
    0x28: ["powerAtDueDate", "W", 0.001],
    0x29: ["powerAtDueDate", "W", 0.01],
    0x2a: ["powerAtDueDate", "W", 0.1],
    0x2b: ["powerAtDueDate", "W", 1],
    0x2c: ["powerAtDueDate", "W", 10],
    0x2d: ["powerAtDueDate", "W", 100],
    0x2e: ["powerAtDueDate", "kW", 1],
    0x2f: ["powerAtDueDate", "kW", 10],
  },

  // storage 3, function field 01 = maximum, BCD (0xd201 is the binary form)
  0xdb01: {
    0x38: ["maxFlow", "m³/h", 0.000001],
    0x39: ["maxFlow", "m³/h", 0.00001],
    0x3a: ["maxFlow", "m³/h", 0.0001],
    0x3b: ["maxFlow", "m³/h", 0.001],
    0x3c: ["maxFlow", "m³/h", 0.01],
    0x3d: ["maxFlow", "m³/h", 0.1],
    0x3e: ["maxFlow", "m³/h", 1],
    0x3f: ["maxFlow", "m³/h", 10],
  },

  0x07ff: {
    0xa0: ["powerFlows", null, null, "PFTT"],
    0x21: ["meterInfo", null, null, "MIEF"],
  },

  // bcd values
  0x0a58: ["forwardTemperature", "°C", 0.001],
  0x0a59: ["forwardTemperature", "°C", 0.01],
  0x0a5a: ["forwardTemperature", "°C", 0.1],
  0x0a5b: ["forwardTemperature", "°C", 1],

  0x0a5c: ["returnTemperature", "°C", 0.001],
  0x0a5d: ["returnTemperature", "°C", 0.01],
  0x0a5e: ["returnTemperature", "°C", 0.1],
  0x0a5f: ["returnTemperature", "°C", 1],

  0x0b2b: ["power", "kW", 0.001],
  0x0b2c: ["power", "kW", 0.01],
  0x0b2d: ["power", "kW", 0.1],
  0x0b2e: ["power", "kW", 1],

  0x0b38: ["flow", "m³/h", 0.000001],
  0x0b39: ["flow", "m³/h", 0.00001],
  0x0b3a: ["flow", "m³/h", 0.0001],
  0x0b3b: ["flow", "m³/h", 0.001],
  0x0b3c: ["flow", "m³/h", 0.01],
  0x0b3d: ["flow", "m³/h", 0.1],
  0x0b3e: ["flow", "m³/h", 1],

  0x0c06: ["energy", "kWh", 1],
  0x0c07: ["energy", "MWh", 0.01],
  // 4-byte BCD energy with a DIFE tariff byte, emitted without the DIF
  // extension bit by some firmware. Tariff is the DIFE high nibble and
  // storage the low one, so 0x10/0x20/0x30 are tariff 1/2/3 at storage 0;
  // see 0x8c11/0x8c21 for the same tariffs at storage 2.
  0x0c10: { 0x06: ["energy", "kWh", 1], 0x07: ["energy", "MWh", 0.01] },
  0x0c20: { 0x06: ["energy", "kWh", 1], 0x07: ["energy", "MWh", 0.01] },
  0x0c30: { 0x06: ["energy", "kWh", 1], 0x07: ["energy", "MWh", 0.01] },
  0x0cfb: {
    0x00: ["energy", "MWh", 0.1],
    0x01: ["energy", "MWh", 1],
    0x08: ["energy", "GJ", 0.1],
    0x09: ["energy", "GJ", 1],
  },
  0x0c0e: ["energy", "GJ", 0.001],
  0x0c0f: ["energy", "GJ", 0.01],

  0x0c14: ["volume", "m³", 0.01],
  0x0c15: ["volume", "m³", 0.1],
  0x0c16: ["volume", "m³", 1],

  0x8402: {
    0x03: ["tarif2energy", "Wh", 1],
  },
  0x8403: {
    0x03: ["tarif3energy", "Wh", 1],
  },
  0x8440: {
    0x13: ["pulse1volume", "m³", 0.001],
    0x14: ["pulse1volume", "m³", 0.01],
    0x15: ["pulse1volume", "m³", 0.1],
    0x06: ["pulse1energy", "MWh", 0.001],
    0x07: ["pulse1energy", "MWh", 0.01],
  },
  0x8480: {
    0x04: {
      0x13: ["pulse2volume", "m³", 0.001],
      0x14: ["pulse2volume", "m³", 0.01],
      0x15: ["pulse2volume", "m³", 0.1],
      0x06: ["pulse2energy", "MWh", 0.001],
      0x07: ["pulse2energy", "MWh", 0.01],
    }
  },
  0x84c0: {
    0x04: {
      0x13: ["pulse3volume", "m³", 0.001],
      0x14: ["pulse3volume", "m³", 0.01],
      0x15: ["pulse3volume", "m³", 0.1],
      0x06: ["pulse3energy", "MWh", 0.001],
      0x07: ["pulse3energy", "MWh", 0.01],
    }
  },
  0x8c01: {
    0x04: ["energyAtDueDate", "Wh", 10],
    0x06: ["energyAtDueDate", "kWh", 1],
    0x13: ["volumeAtDueDate", "m³", 0.001],
  },
  0x8c10: ["tariff1energy", null, 1],
  0x8c20: ["tariff2energy", null, 1],
  0x9b01: {
    0x3b: ["maxFlow", "m³/h", 0.001]
  },

  0x4c06: ["energy", "kWh", 1],
  0x4c07: ["energy", "MWh", 0.01],
  0x4cfb: {
    0x00: ["energy", "MWh", 0.1],
    0x01: ["energy", "MWh", 1],
    0x08: ["energy", "GJ", 0.1],
    0x09: ["energy", "GJ", 1],
  },
  0x4c0e: ["energy", "GJ", 0.001],
  0x4c0f: ["energy", "GJ", 0.01],

  0x4c14: ["volume", "m³", 0.01],
  0x4c15: ["volume", "m³", 0.1],
  0x4c16: ["volume", "m³", 1],

  0xb401: {
    0x00: ["previousMonthEnergy", "Wh", 0.001],
    0x01: ["previousMonthEnergy", "Wh", 0.01],
    0x02: ["previousMonthEnergy", "Wh", 0.1],
    0x03: ["previousMonthEnergy", "Wh", 1],
    0x04: ["previousMonthEnergy", "Wh", 10],
    0x05: ["previousMonthEnergy", "Wh", 100],
    0x06: ["previousMonthEnergy", "kWh", 1],
    0x07: ["previousMonthEnergy", "kWh", 10],
    0x0e: ["previousMonthEnergy", "MJ", 1],
    0x0f: ["previousMonthEnergy", "MJ", 10],
  },

  0x0424: ["operatingTime", "s", 1],
  0x0425: ["operatingTime", "min", 1],
  0x0426: ["operatingTime", "h", 1],
  0x0427: ["operatingTime", "days", 1],
  // VIFE 0x18 marks an operating-time register as the missing time; it does
  // not touch the unit, which stays in the VIF's low two bits (0x24 + n).
  0x02a4: {
    0x18: ["missingTime", "s", 1],
  },
  0x02a5: {
    0x18: ["missingTime", "min", 1],
  },
  0x02a6: {
    0x18: ["missingTime", "h", 1],
  },
  0x02a7: {
    0x18: ["missingTime", "days", 1],
  },

  0x0420: ["S", "s", 1],
  0x0421: ["Min", "min", 1],
  0x0422: ["H", "h", 1],
  0x0423: ["Days", "days", 1],

  0xcc10: {
    0x04: ["at24tariff1energy", "Wh", 10],
    0x07: ["at24tariff1energy", null, 1],
  },
  0xcc20: {
    0x04: ["at24tariff2energy", "Wh", 10],
    0x07: ["at24tariff2energy", null, 1],
  },

  // meterID
  0x0c78: ["meterId", null, null],
  0x0c79: ["customerMeterId", null, null],
  0x06ff: {
    0x21: ["meterId", null, null],
  },
  0x0779: ["enhancedMeterId", null, null],

  // error and warning flags
  0x01fd: {
    0x17: ["errorFlags", null, 1],
  },
  0x02fd: {
    0x17: ["errorFlags", null, 1],
  },
  0x04fd: {
    0x17: ["errorFlags", null, 1],
  }
};

function readUInt8(bytes) {
  return bytes & 0xff;
}

// 48-bit unsigned LE. JS bitwise operators only work on 32 bits, so the
// upper two bytes are added arithmetically.
function readUInt48LE(bytes) {
  return readUInt16LE(bytes.slice(4, 6)) * 0x100000000 + readUInt32LE(bytes.slice(0, 4));
}

function readInt24LE(bytes) {
  const ref = readUIntDCB(bytes);
  return ref > 0x7fffff ? ref - 0x1000000 : ref;
}

// IEEE 754 single precision, little endian
function readFloat32LE(bytes) {
  const raw = readUInt32LE(bytes);
  const sign = raw >>> 31 ? -1 : 1;
  const exponent = (raw >>> 23) & 0xff;
  const mantissa = raw & 0x7fffff;
  if (exponent === 0xff) return mantissa ? NaN : sign * Infinity;
  if (exponent === 0) return sign * mantissa * Math.pow(2, -149);
  return sign * (1 + mantissa / 0x800000) * Math.pow(2, exponent - 127);
}

// BCD, least significant byte first. A leading 0xf nibble marks a negative value.
function readBCD(bytes) {
  let digits = "";
  for (let i = bytes.length - 1; i >= 0; i--) {
    digits += ("0" + bytes[i].toString(16)).slice(-2);
  }
  return digits[0] === "f" ? -parseInt(digits.slice(1), 10) : parseInt(digits, 10);
}

function readUIntDCB(bytes) {
  const value =
    (bytes[2] << 16) + (bytes[1] << 8) + bytes[0];
  return (value & 0xffffff) >>> 0;
}

function readUInt32LE(bytes) {
  const value =
    (bytes[3] << 24) + (bytes[2] << 16) + (bytes[1] << 8) + bytes[0];
  return (value & 0xffffffff) >>> 0;
}

function readInt32LE(bytes) {
  const ref = readUInt32LE(bytes);
  return ref > 0x7fffffff ? ref - 0x100000000 : ref;
}

function readUInt16LE(bytes) {
  const value = (bytes[1] << 8) + bytes[0];
  return value & 0xffff;
}

function readInt16LE(bytes) {
  const ref = readUInt16LE(bytes);
  return ref > 0x7fff ? ref - 0x10000 : ref;
}

function decodeUplink(input) {
  let r = input.bytes;
  let pos = 0;
  let measurementNo = 0;
  let data = {};
  let traces = [];
  let trace = {};
  let debug = input.debug || false;

  try {

    // Message Format Identifier (1 byte)
    data.messageFormat = readUInt8(r[pos]); pos++;
    const messageFormat = data.messageFormat.toString(16).padStart(2, "0");
    const packetInfo = packetTypes[data.messageFormat];
    if (typeof (packetInfo) === "undefined") {

      throw new Error(`Unsupported message format ${messageFormat}`);
    }

    data.messageFormatInfo = packetInfo.slice(0, 3);

    if (data.messageFormatInfo[1] === "JSON") {
      // specific json format
      const jsonString = r.toString("utf8", 1);
      const measurements = JSON.parse(jsonString);
      const unified = {
        "messageFormat": data.messageFormat.toString(16).padStart(2, "0"),
        "energy": measurements.E,
        "energyUnit": measurements.U,
        "meterId": measurements.ID,
      }

      if (debug) {
        traces.push(
          {
            headerStart: 0,
            headerInfo: jsonString,
            dataStart: 1,
            dataEnd: r.length - 2,
          }
        );
      }

      return {
        data: { ...data, ...unified },
        payload: r.join(""),
        traces: traces,
        errors: []
      };
    }

    // The DR0 formats are a fixed layout, not M-Bus records: a packed 32-bit
    // meter ID (the ID in bits 27:0, the function field for the value in bits
    // 31:30 and for the ID in bits 29:28), then a VIF chain and a 32-bit value.
    if (dr0Formats.indexOf(data.messageFormat) !== -1) {
      const packed = readUInt32LE(r.slice(pos, pos + 4)); pos += 4;
      data.meterId = packed & 0x0fffffff;
      if (((packed >>> 28) & 0x3) === 3) data.meterIdError = true;

      const vifs = [readUInt8(r[pos])]; pos++;
      for (let b = vifs[0]; b & 0x80;) {
        b = readUInt8(r[pos]); pos++;
        vifs.push(b);
      }

      // look the VIF chain up as though a 32-bit integer DIF preceded it
      let map = valueMap[0x0400 | vifs[0]];
      let vifNo = 1;
      while (typeof (map) !== "undefined" && !Array.isArray(map)) {
        map = map[vifs[vifNo++]];
      }
      if (typeof (map) === "undefined") {
        throw new Error(`Unknown measurement ${(0x0400 | vifs[0]).toString(16)}`);
      }

      let value = readInt32LE(r.slice(pos, pos + 4)); pos += 4;
      const name = map[0];
      if (map[1] != null) data[name + "Unit"] = map[1];
      if (map[2] != null) value *= map[2];
      if (((packed >>> 30) & 0x3) === 3) data[name + "Error"] = true;
      data[name] = Number.isInteger(value) ? value : parseFloat(value.toPrecision(8), 10);

      data.messageFormat = messageFormat;
      return {
        data: data,
        payload: r.join(""),
        traces: traces,
        errors: []
      };
    }

    while (pos < (r.length)) {
      trace = {
        headerStart: pos
      };

      // Read the DIB/VIB structurally: DIFEs follow for as long as the
      // previous byte has bit 7 set, then the VIF and its VIFEs the same
      // way. The lookup key is rebuilt from the decoded fields below, so
      // no raw byte pattern is matched and a DIFE can never be read as a
      // VIF (or the other way round).
      //
      const difByte = readUInt8(r[pos]); pos++;

      const difes = [];
      for (let b = difByte; b & 0x80;) {
        b = readUInt8(r[pos]); pos++;
        difes.push(b);
      }

      const vifByte = readUInt8(r[pos]); pos++;
      const vifs = [vifByte];
      for (let b = vifByte; b & 0x80;) {
        b = readUInt8(r[pos]); pos++;
        vifs.push(b);
      }

      let size = difByte & 0xf;
      const functionField = (difByte >> 4) & 0x3;

      // Normalised lookup key: data field, function field and storage bit 0,
      // with the extension bit set when DIFEs are present, then the first
      // DIFE if there is one, otherwise the VIF. Any remaining DIFEs and the
      // whole VIF chain are matched one level at a time as subtypes, which is
      // what lets a double DIFE (Kamstrup Pulse) be represented at all.
      const dif = ((difes.length ? 0x80 : 0) | (difByte & 0x7f)) << 8
        | (difes.length ? difes[0] : vifs[0]);
      const subKeys = difes.length ? difes.slice(1).concat(vifs) : vifs.slice(1);

      // check for specific timestamp dib
      if (dif == 0x046d || dif == 0x346d) {
        trace.dataStart = pos;
        const ts = r.slice(pos, pos + 4); pos += 4;
        if (!(ts[0] & 0x80)) {
          let year = 1900 + 100 * (ts[1] >> 5);
          year += ((ts[3] >> 4) << 3) | (ts[2] >> 5);
          if (year < 2000) year += 100; // century bit not set by some firmware
          data.timeStamp = year + "-" +
            ("0" + (ts[3] & 0x0f)).substr(-2) + "-" +
            ("0" + (ts[2] & 0x1f)).substr(-2) + "T" +
            ("0" + (ts[1] & 0x1f)).substr(-2) + ":" +
            ("0" + (ts[0] & 0x7f)).substr(-2) + "Z";
        }
        if (debug) {
          traces.push(
            {
              ...trace, ...{
                headerInfo: ["timeStamp", null, null],
                dataEnd: pos - 1,
              }
            }
          );
        }

        measurementNo++;
        continue;
      }

      const errorState = functionField === 3;
      const name16 = (dif & 0x0fff).toString(16);
      // An explicit entry wins (e.g. 0xb401). Otherwise an error-state record
      // is looked up as its instantaneous form: only the function field bits
      // (0x3000) are cleared, the extension and storage bits must stay.
      let map = valueMap[dif];
      if (typeof (map) === "undefined" && errorState) {
        map = valueMap[dif & ~0x3000];
      }
      if (typeof (map) === "undefined") {
        throw new Error(`Unknown measurement ${name16}`);
      }

      let subKeyNo = 0;
      while (!Array.isArray(map)) {
        const subType = subKeys[subKeyNo++];
        const subMap = (subType === undefined) ? undefined : map[subType];
        if (typeof (subMap) === "undefined") throw new Error(`Unknown measurement ${name16} subtype ${subType === undefined ? "missing" : subType.toString(16)}`);

        map = subMap;
      }

      // get default measurement name, or a specific one from the packet definition
      const prefix = (packetInfo.length > 3) ? packetInfo[3][measurementNo] : '';
      let name = prefix + map[0];

      // Cooling energy carries its 0xff02/0xff03 signature as the last two
      // VIFEs. 0xff03 is the firmware's incorrMountEnergy: a reading taken
      // with the meter mounted the wrong way round.
      if (name === "coolingEnergy" && vifs.length >= 3 && vifs[vifs.length - 2] === 0xff
        && vifs[vifs.length - 1] === 0x03) {
        name = "error" + name;
      }

      trace.headerInfo = [name, map[1], map[2]];
      trace.dataStart = pos;

      // zero-length records (DIF data field 0) carry no value
      if (size === 0) {
        measurementNo++;
        trace.dataEnd = pos - 1;
        if (debug) {
          traces.push(trace);
        }
        continue;
      }

      // PFTT: a scale byte in the last VIFE, then four signed INT16 LE
      // sub-values. The temperatures are fixed at hundredths of a degree,
      // unlike the standalone 0x5a/0x5e records which are tenths. The record
      // carries one function field OR'd from all four sub-values, so an error
      // state taints every one of them and cannot be narrowed down.
      if (map[3] === "PFTT") {
        const scale = vifs[vifs.length - 1];
        const parts = [
          ["forwardTemperature", "°C", 0.01],
          ["returnTemperature", "°C", 0.01],
          ["flow", "m³/h", Math.pow(10, (scale & 0x0f) - 6)],
          ["power", "W", Math.pow(10, (scale >> 4) - 3)],
        ];
        for (let i = 0; i < parts.length; i++) {
          const partName = parts[i][0];
          const partValue = readInt16LE(r.slice(pos + i * 2, pos + i * 2 + 2)) * parts[i][2];
          data[partName + "Unit"] = parts[i][1];
          data[partName] = Number.isInteger(partValue) ? partValue : parseFloat(partValue.toPrecision(8), 10);
          if (errorState) {
            data[partName + "Error"] = true;
          }
        }
        pos += 8;
        measurementNo++;
        trace.dataEnd = pos - 1;
        if (debug) {
          traces.push(trace);
        }
        continue;
      }

      // MIEF: 8 bytes holding the error flags and the packed meter ID
      if (map[3] === "MIEF") {
        data.errorFlags = readInt32LE(r.slice(pos, pos + 4));
        const packed = readUInt32LE(r.slice(pos + 4, pos + 8)); pos += 8;
        data.meterId = packed & 0x0fffffff;
        if (((packed >>> 28) & 0x3) === 3) data.meterIdError = true;
        if (((packed >>> 30) & 0x3) === 3) data.errorFlagsError = true;
        measurementNo++;
        trace.dataEnd = pos - 1;
        if (debug) {
          traces.push(trace);
        }
        continue;
      }

      // type G date (2 bytes): day, month and a 7-bit year
      if (map[3] === "G") {
        const d = r.slice(pos, pos + 2); pos += 2;
        data[name] = (2000 + ((d[0] >> 5) | ((d[1] >> 4) << 3))) + "-" +
          ("0" + (d[1] & 0x0f)).substr(-2) + "-" +
          ("0" + (d[0] & 0x1f)).substr(-2);
        measurementNo++;
        trace.dataEnd = pos - 1;
        if (debug) {
          traces.push(trace);
        }
        continue;
      }

      // read the value
      let value = 0;
      switch (size) {
        case 0x1: value = readUInt8(r[pos]); break;
        case 0x2: value = readInt16LE(r.slice(pos, pos + 2)); break;
        case 0x3: value = readInt24LE(r.slice(pos, pos + 3)); break;
        case 0x4: value = readInt32LE(r.slice(pos, pos + 4)); break;
        case 0x5: {
          value = readFloat32LE(r.slice(pos, pos + 4)); size = 4;
        } break;
        case 0x6: {
          value = readUInt48LE(r.slice(pos, pos + 6)); size = 6;
        } break;
        case 0x7: {
          // opaque 8-byte composites (powerFlows): keep the raw bytes
          value = r.subarray(pos, pos + 8).toString("hex"); size = 8;
        } break;
        case 0x9: {
          value = readBCD(r.slice(pos, pos + 1)); size = 1;
        } break;
        case 0xa: {
          const bcd = r.readUInt16LE(pos).toString(16);
          value = parseInt(bcd, 10); size = 2;
        } break;
        case 0xb: {
          // readUIntLE, not readUInt32LE: a 6-digit BCD value as the
          // last record of a telegram has no 4th byte to read.
          const bcd = readUIntDCB(r.slice(pos, pos + 3)).toString(16);
          value = bcd[0] === 'f' ? -parseInt(bcd.slice(1), 10) : parseInt(bcd, 10); size = 3;
        } break;
        case 0xc: {
          const bcd = readUInt32LE(r.slice(pos, pos + 4)).toString(16);
          value = parseInt(bcd, 10); size = 4;
        } break;
        case 0xd: {
          // variable length, the first data byte (LVAR) gives type and length
          const lvar = readUInt8(r[pos]);
          let len;
          if (lvar <= 0xbf) {
            // ASCII, transmitted last character first
            len = lvar;
            value = String.fromCharCode.apply(null, r.slice(pos + 1, pos + 1 + len).reverse());
          } else if (lvar >= 0xc0 && lvar <= 0xdf) {
            // BCD, 0xc0-0xcf positive and 0xd0-0xdf negative
            len = lvar & 0x0f;
            value = readBCD(r.slice(pos + 1, pos + 1 + len));
            if (lvar >= 0xd0) value = -value;
          } else if (lvar >= 0xe0 && lvar <= 0xef) {
            // binary, unsigned LE
            len = lvar & 0x0f;
            value = 0;
            for (let i = len - 1; i >= 0; i--) value = value * 256 + r[pos + 1 + i];
          } else {
            throw new Error(`Unsupported variable length type ${lvar.toString(16)} in ${name16}`);
          }
          size = 1 + len;
        } break;
        case 0xe: {
          value = readBCD(r.slice(pos, pos + 6)); size = 6;
        } break;
        default:
          throw new Error(`Unsupported data field ${size.toString(16)} in ${name16}`);
      }
      pos += size;

      // set units
      if (map[1] != null) {
        data[name + "Unit"] = map[1];
      }

      // apply multiplier
      if (map[2] != null && typeof (value) !== "string") {
        value *= map[2];
      }

      // set error flag (function field 3 = value recorded during error state)
      if (errorState) {
        data[name + "Error"] = true
      };

      // normalize and store the floating point value
      data[name] = (typeof (value) !== "number" || Number.isInteger(value)) ? value : parseFloat(value.toPrecision(8), 10);
      measurementNo++;

      trace.dataEnd = pos - 1;

      if (debug) {
        traces.push(trace);
      }
    }

  } catch (e) {
    traces.push(trace);
    data.messageFormat = data.messageFormat.toString(16).padStart(2, "0"); // change to hex representation

    return {
      data: data,
      payload: r.join(""),
      traces: traces,
      errors: [e.message],
    }
  }

  data.messageFormat = data.messageFormat.toString(16).padStart(2, "0"); // change to hex representation

  return {
    data: data,
    payload: r.join(""),
    traces: traces,
    errors: []
  };
}

function calculateIncrement(lastValue, currentValue) {
  // Check if current value exists
  if (currentValue === undefined || Number.isNaN(currentValue)) {
    return 0;
  }

  // Init state && Check for the case the counter reseted
  if (lastValue === undefined || lastValue > currentValue) {
    lastValue = currentValue;
  }
  // Calculate increment
  return currentValue - lastValue;
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
  const bytes = Hex.hexToBytes(payload);
  const decoded = decodeUplink({ bytes: bytes });

  const decodedData = decoded.data;
  const decodedErrors = decoded.errors;

  if (decodedData.energy !== undefined) {
    if (decodedData.energyUnit == "Wh") {
      decodedData.energy /= 1000;
      decodedData.energyUnit = "kWh"
    }

    const state = event.state || {};
    decodedData.energyConsumption = calculateIncrement(
      state.lastEnergy,
      decodedData.energy,
    );
    state.lastEnergy = decodedData.energy;
    emit("state", state);
  }

  // Create info object
  const packetInfo = {};
  Object.keys(decodedData).forEach((key) => {
    if (key.search("Unit") !== -1) {
      packetInfo[key] = decodedData[key];
      delete decodedData[key];
    }
  })
  packetInfo.messageFormatInfo = decodedData.messageFormatInfo;
  packetInfo.meterId = decodedData.meterId;
  packetInfo.messageFormat = decodedData.messageFormat;
  packetInfo.errorFlags = decodedData.errorFlags;
  packetInfo.operatingTime = decodedData.operatingTime;
  packetInfo.missingTime = decodedData.missingTime;
  packetInfo.customerMeterId = decodedData.customerMeterId;
  packetInfo.enhancedMeterId = decodedData.enhancedMeterId;
  packetInfo.operatingTime = decodedData.operatingTime;
  packetInfo.missingTime = decodedData.missingTime;
  packetInfo.customerMeterId = decodedData.customerMeterId;
  packetInfo.enhancedMeterId = decodedData.enhancedMeterId;

  delete decodedData.operatingTime;
  delete decodedData.missingTime;
  delete decodedData.customerMeterId;
  delete decodedData.enhancedMeterId;
  delete decodedData.messageFormatInfo;
  delete decodedData.meterId;
  delete decodedData.messageFormat;
  delete decodedData.errorFlags;
  delete decodedData.S;
  delete decodedData.Min;
  delete decodedData.H;
  delete decodedData.Days;

  // Create info object
  const errors = {};
  errors.numberOfErrors = decodedErrors.length;
  errors.errorMessages = decodedErrors;

  let hasErrorFlags = false;
  Object.keys(decodedData).forEach((key) => {
    if (/error/i.test(key)) {
      errors[key] = decodedData[key];
      delete decodedData[key];
      hasErrorFlags = true;
    }
  })

  if (deleteUnusedKeys(decodedData)) {
    emit("sample", { data: decodedData, topic: "default" });
  }

  if (deleteUnusedKeys(packetInfo)) {
    emit("sample", { data: packetInfo, topic: "packet_info" });
  }

  if (deleteUnusedKeys(errors)) {
    if (errors.numberOfErrors > 0 || hasErrorFlags) {
      emit("sample", { data: errors, topic: "error" });
    }
  }
}