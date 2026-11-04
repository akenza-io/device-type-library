// Watteco PT1000 400°C decoder
// Based on the official Watteco codec (pt1000_400c v1.1.1): https://github.com/actility/device-catalog/tree/main/vendors/watteco

/// //////////// Device configuration ///////////////

// Size of the batch tags in bits
const BATCH_TAG_SIZE = 1;

// Series of the batch reports
// sampletype: 1 boolean, 4 uint8, 6 uint16, 7 int16, 9 int24, 10 uint32, 12 float
// resol: resolution of the compressed deltas, divide: divider of the decoded value
// measurement/endpoint: decoded the same way as the standard reports
const BATCH_ARGUMENTS = [
  {
    taglbl: 0,
    sampletype: 7,
    resol: 1,
    divide: 10,
    measurement: "temperature",
    endpoint: 0,
    label: "temperature",
  },
  {
    taglbl: 1,
    sampletype: 6,
    resol: 100,
    divide: 1000,
    measurement: "batteryVoltage",
    endpoint: 0,
    label: "battery_voltage",
  },
];

// Topic and key of the measurements, an array contains one entry per endpoint
// Counters output the pulse count and the pulses since the last uplink
const MEASUREMENTS = { temperature: { topic: "default", key: "temperature" } };

// Decoder of the TIC (french electricity meter teleinformation) clusters
const TIC_DECODER = null;

/// //////////// Watteco codec ///////////////
// Shared by all Watteco device types, only the device configuration above differs

const STANDARD_PORT = 125;

// ZCL command IDs
const CMD_READ_ATTRIBUTE_RESPONSE = 0x01;
const CMD_CONFIGURE_REPORTING_RESPONSE = 0x07;
const CMD_READ_REPORTING_CONFIGURATION_RESPONSE = 0x09;
const CMD_REPORT_ATTRIBUTES = 0x0a;
const CMD_REPORT_ATTRIBUTES_ALARM = 0x8a;

// Size in bytes of the ZCL attribute types
const ATTRIBUTE_TYPE_SIZE = {
  0x08: 1, // general8
  0x09: 2, // general16
  0x0a: 3, // general24
  0x0b: 4, // general32
  0x10: 1, // boolean
  0x18: 1, // bitmap8
  0x19: 2, // bitmap16
  0x20: 1, // uint8
  0x21: 2, // uint16
  0x22: 3, // uint24
  0x23: 4, // uint32
  0x28: 1, // int8
  0x29: 2, // int16
  0x2a: 3, // int24
  0x2b: 4, // int32
  0x30: 1, // enum8
  0x39: 4, // single precision float
};

const EDGE_SELECTION = {
  0: "NONE",
  1: "FALLING_EDGE",
  2: "RISING_EDGE",
  3: "BOTH_EDGES",
  5: "POLLING_AND_FALLING_EDGE",
  6: "POLLING_AND_RISING_EDGE",
  7: "POLLING_AND_BOTH_EDGES",
};

const CAUSE_REQUEST = ["NONE", "SHORT", "LONG", "RESERVED"];

// Topic of the measurements which are the same for all devices
const DEFAULT_TOPICS = {
  batteryVoltage: "lifecycle",
  externalVoltage: "lifecycle",
  rechargeableBatteryVoltage: "lifecycle",
  solarHarvestingVoltage: "lifecycle",
  ticHarvestingVoltage: "lifecycle",
  firmwareVersion: "configuration",
  kernel: "configuration",
  manufacturer: "configuration",
  model: "configuration",
  productionDate: "configuration",
  position: "configuration",
  applicationName: "configuration",
  messageType: "configuration",
  retries: "configuration",
  rejoinPeriod: "configuration",
  rejoinErrorFrames: "configuration",
  dataRate: "configuration",
  abpDevAddress: "configuration",
  otaAppEui: "configuration",
  polarity: "configuration",
  edgeSelection: "configuration",
  debouncePeriod: "configuration",
  pollPeriod: "configuration",
  forceNotify: "configuration",
  analogType: "configuration",
  powerDuration: "configuration",
};

// Configuration values which belong to one input of the device
const INPUT_CONFIGURATION = [
  "polarity",
  "edgeSelection",
  "debouncePeriod",
  "pollPeriod",
  "forceNotify",
];

/// //////////// Helpers ///////////////

function readUnsigned(bytes, start, length) {
  let value = 0;
  for (let i = 0; i < length; i++) {
    value = value * 256 + bytes[start + i];
  }
  return value;
}

function readSigned(bytes, start, length) {
  const value = readUnsigned(bytes, start, length);
  const limit = Math.pow(2, length * 8);
  return value >= limit / 2 ? value - limit : value;
}

function bytesToFloat32(value) {
  const sign = value & 0x80000000 ? -1 : 1;
  let exponent = ((value >> 23) & 0xff) - 127;
  let significand = value & 0x7fffff;

  if (exponent === 128) {
    return sign * (significand ? Number.NaN : Number.POSITIVE_INFINITY);
  }
  if (exponent === -127) {
    if (significand === 0) {
      return 0;
    }
    exponent = -126;
    significand /= 1 << 22;
  } else {
    significand = (significand | (1 << 23)) / (1 << 23);
  }
  return sign * significand * Math.pow(2, exponent);
}

function readFloat(bytes, start) {
  return bytesToFloat32(readUnsigned(bytes, start, 4));
}

// Removes the noise of floating point calculations
function round(value) {
  return Math.round(value * 1000000) / 1000000;
}

function readString(bytes, start) {
  const length = bytes[start];
  let result = "";
  for (let i = 0; i < length; i++) {
    result += String.fromCharCode(bytes[start + 1 + i]);
  }
  return result;
}

function readDottedDecimal(bytes, start, length) {
  const parts = [];
  for (let i = 0; i < length; i++) {
    parts.push(String(bytes[start + i]));
  }
  return parts.join(".");
}

function toHex(value, length) {
  return `0x${value.toString(16).padStart(length, "0")}`;
}

// Reads a number whose size and sign are given by the ZCL attribute type
function readNumber(bytes, start, attributeType) {
  if (attributeType === 0x39) {
    return round(readFloat(bytes, start));
  }
  const size = ATTRIBUTE_TYPE_SIZE[attributeType];
  if (size === undefined) {
    return null;
  }
  if (attributeType >= 0x28 && attributeType <= 0x2b) {
    return readSigned(bytes, start, size);
  }
  return readUnsigned(bytes, start, size);
}

/// //////////// Batch decoding ///////////////

// Batch sample types
const ST_I4 = 3;
const ST_U8 = 4;
const ST_I8 = 5;
const ST_U16 = 6;
const ST_I16 = 7;
const ST_I24 = 9;
const ST_U32 = 10;
const ST_FL = 12;

// Number of bits per sample type, indexed by sample type
const ST_SIZE = [0, 1, 4, 4, 8, 8, 16, 16, 24, 24, 32, 32, 32];

const BR_HUFF_MAX_INDEX_TABLE = 14;
const NUMBER_OF_SERIES = 16;

const HUFF = [
  [
    { sz: 2, lbl: 0x000 },
    { sz: 2, lbl: 0x001 },
    { sz: 2, lbl: 0x003 },
    { sz: 3, lbl: 0x005 },
    { sz: 4, lbl: 0x009 },
    { sz: 5, lbl: 0x011 },
    { sz: 6, lbl: 0x021 },
    { sz: 7, lbl: 0x041 },
    { sz: 8, lbl: 0x081 },
    { sz: 10, lbl: 0x200 },
    { sz: 11, lbl: 0x402 },
    { sz: 11, lbl: 0x403 },
    { sz: 11, lbl: 0x404 },
    { sz: 11, lbl: 0x405 },
    { sz: 11, lbl: 0x406 },
    { sz: 11, lbl: 0x407 },
  ],
  [
    { sz: 7, lbl: 0x06f },
    { sz: 5, lbl: 0x01a },
    { sz: 4, lbl: 0x00c },
    { sz: 3, lbl: 0x003 },
    { sz: 3, lbl: 0x007 },
    { sz: 2, lbl: 0x002 },
    { sz: 2, lbl: 0x000 },
    { sz: 3, lbl: 0x002 },
    { sz: 6, lbl: 0x036 },
    { sz: 9, lbl: 0x1bb },
    { sz: 9, lbl: 0x1b9 },
    { sz: 10, lbl: 0x375 },
    { sz: 10, lbl: 0x374 },
    { sz: 10, lbl: 0x370 },
    { sz: 11, lbl: 0x6e3 },
    { sz: 11, lbl: 0x6e2 },
  ],
  [
    { sz: 4, lbl: 0x009 },
    { sz: 3, lbl: 0x005 },
    { sz: 2, lbl: 0x000 },
    { sz: 2, lbl: 0x001 },
    { sz: 2, lbl: 0x003 },
    { sz: 5, lbl: 0x011 },
    { sz: 6, lbl: 0x021 },
    { sz: 7, lbl: 0x041 },
    { sz: 8, lbl: 0x081 },
    { sz: 10, lbl: 0x200 },
    { sz: 11, lbl: 0x402 },
    { sz: 11, lbl: 0x403 },
    { sz: 11, lbl: 0x404 },
    { sz: 11, lbl: 0x405 },
    { sz: 11, lbl: 0x406 },
    { sz: 11, lbl: 0x407 },
  ],
];

// Reads the batch payload bit by bit, starting with the least significant bit of each byte
function createBitReader(bytes) {
  // Reads nbBits as a huffman pattern (first read bit is the most significant one)
  function peekHuffmanPattern(position, nbBits) {
    if (bytes.length * 8 < position + nbBits) {
      throw new Error("Batch: payload too short");
    }
    let pattern = 0;
    for (let i = 0; i < nbBits; i++) {
      if (bytes[(position + i) >> 3] & (1 << ((position + i) & 0x07))) {
        pattern |= 1 << (nbBits - 1 - i);
      }
    }
    return pattern;
  }

  return {
    position: 0,

    getNextSample(sampleType, nbBitsInput) {
      const nbBits = nbBitsInput || ST_SIZE[sampleType];
      let bitPosition = this.position;
      this.position += nbBits;

      if (sampleType === ST_FL && nbBits !== 32) {
        throw new Error("Batch: invalid sample type");
      }

      let value = 0;
      let nbBytes = Math.floor((nbBits - 1) / 8) + 1;
      let bitsFromByte = nbBits % 8;
      if (bitsFromByte === 0) {
        bitsFromByte = 8;
      }

      while (nbBytes > 0) {
        let bitIndex = 0;
        while (bitsFromByte > 0) {
          if (bytes[bitPosition >> 3] & (1 << (bitPosition & 0x07))) {
            value |= 1 << ((nbBytes - 1) * 8 + bitIndex);
          }
          bitsFromByte--;
          bitIndex++;
          bitPosition++;
        }
        nbBytes--;
        bitsFromByte = 8;
      }

      // Propagate the sign bit for signed sample types
      const isSigned =
        sampleType === ST_I4 ||
        sampleType === ST_I8 ||
        sampleType === ST_I16 ||
        sampleType === ST_I24;
      if (isSigned && value & (1 << (nbBits - 1))) {
        for (let i = nbBits; i < 32; i++) {
          value |= 1 << i;
        }
      }
      return value;
    },

    // Returns the index (bi) of the next huffman code of the given table
    getNextBiFromHuffman(table) {
      for (let size = 2; size < 12; size++) {
        const pattern = peekHuffmanPattern(this.position, size);
        for (let i = 0; i < HUFF[table].length; i++) {
          if (HUFF[table][i].sz === size && HUFF[table][i].lbl === pattern) {
            this.position += size;
            return i;
          }
        }
      }
      throw new Error("Batch: bi not found in huffman table");
    },
  };
}

function findArgumentIndex(tagLabel) {
  for (let i = 0; i < BATCH_ARGUMENTS.length; i++) {
    if (BATCH_ARGUMENTS[i].taglbl === tagLabel) {
      return i;
    }
  }
  throw new Error(`Batch: unknown tag ${tagLabel}`);
}

function readMeasure(reader, sampleType) {
  const value = reader.getNextSample(sampleType);
  return sampleType === ST_FL ? bytesToFloat32(value) : value;
}

function timestampFromBi(reader, baseTimestamp, bi) {
  if (bi > BR_HUFF_MAX_INDEX_TABLE) {
    return reader.getNextSample(ST_U32);
  }
  if (bi > 0) {
    return (
      reader.getNextSample(ST_U32, bi) + baseTimestamp + Math.pow(2, bi) - 1
    );
  }
  return baseTimestamp;
}

function readTimestamp(reader, baseTimestamp) {
  if (baseTimestamp) {
    return timestampFromBi(
      reader,
      baseTimestamp,
      reader.getNextBiFromHuffman(1),
    );
  }
  return reader.getNextSample(ST_U32);
}

// Computes a value from its delta to the preceding value
function deltaValue(reader, precedingValue, codingType, resolution, bi) {
  const raw = reader.getNextSample(ST_U16, bi);
  if (codingType === 0) {
    // ADLC
    if (raw >= Math.pow(2, bi - 1)) {
      return raw * resolution + precedingValue;
    }
    return (raw + 1 - Math.pow(2, bi)) * resolution + precedingValue;
  }
  if (codingType === 1) {
    // Positive
    return (raw + Math.pow(2, bi) - 1) * resolution + precedingValue;
  }
  // Negative
  return precedingValue - (raw + Math.pow(2, bi) - 1) * resolution;
}

function lastSample(series) {
  return series.samples[series.samples.length - 1];
}

function decodeCommonTimestampSamples(
  reader,
  series,
  firstSeriesIndex,
  header,
) {
  const nbSamples = reader.getNextSample(ST_U8, 8);
  const timestampCoding = reader.getNextSample(ST_U8, 2);

  // Timestamps shared by all series
  const timestamps = [];
  let lastTimestamp = 0;
  for (let i = 0; i < nbSamples; i++) {
    const bi = reader.getNextBiFromHuffman(timestampCoding);
    if (bi > BR_HUFF_MAX_INDEX_TABLE) {
      timestamps.push(reader.getNextSample(ST_U32));
    } else if (i === 0) {
      timestamps.push(series[firstSeriesIndex].samples[0].timestamp);
    } else if (bi > 0) {
      timestamps.push(
        reader.getNextSample(ST_U32, bi) +
          timestamps[i - 1] +
          Math.pow(2, bi) -
          1,
      );
    } else {
      timestamps.push(timestamps[i - 1]);
    }
    lastTimestamp = timestamps[i];
  }

  for (let j = 0; j < header.nbOfTypeMeasure; j++) {
    let firstNullDelta = true;
    const index = findArgumentIndex(
      reader.getNextSample(ST_U8, BATCH_TAG_SIZE),
    );
    const current = series[index];

    for (let i = 0; i < nbSamples; i++) {
      const available = reader.getNextSample(ST_U8, 1);
      if (available) {
        const bi = reader.getNextBiFromHuffman(current.codingTable);
        let value;
        if (bi > BR_HUFF_MAX_INDEX_TABLE) {
          value = reader.getNextSample(BATCH_ARGUMENTS[index].sampletype);
        } else if (bi > 0) {
          value = deltaValue(
            reader,
            lastSample(current).value,
            current.codingType,
            BATCH_ARGUMENTS[index].resol,
            bi,
          );
        } else if (firstNullDelta) {
          // First value is already recorded from the header
          firstNullDelta = false;
          continue;
        } else {
          ({ value } = lastSample(current));
        }
        current.samples.push({ timestamp: timestamps[i], value });
      }
    }
  }
  return lastTimestamp;
}

function decodeSeparateTimestampSamples(reader, series, lastTimestamp, header) {
  for (let j = 0; j < header.nbOfTypeMeasure; j++) {
    const index = findArgumentIndex(
      reader.getNextSample(ST_U8, BATCH_TAG_SIZE),
    );
    const current = series[index];
    const nbSamples = reader.getNextSample(ST_U8, 8);

    if (nbSamples) {
      const timestampCoding = reader.getNextSample(ST_U8, 2);
      for (let i = 0; i < nbSamples; i++) {
        const preceding = lastSample(current);
        let bi = reader.getNextBiFromHuffman(timestampCoding);
        const timestamp = timestampFromBi(reader, preceding.timestamp, bi);
        if (timestamp > lastTimestamp) {
          lastTimestamp = timestamp;
        }

        let value;
        bi = reader.getNextBiFromHuffman(current.codingTable);
        if (bi > BR_HUFF_MAX_INDEX_TABLE) {
          value = reader.getNextSample(BATCH_ARGUMENTS[index].sampletype);
        } else if (bi > 0) {
          value = deltaValue(
            reader,
            preceding.value,
            current.codingType,
            BATCH_ARGUMENTS[index].resol,
            bi,
          );
        } else {
          ({ value } = preceding);
        }
        current.samples.push({ timestamp, value });
      }
    }
  }
  return lastTimestamp;
}

// Decodes a compressed batch report into a list of measurements
function decodeBatch(bytes, receivedAt) {
  const reader = createBitReader(bytes);

  const series = [];
  for (let i = 0; i < NUMBER_OF_SERIES; i++) {
    series.push({ codingType: 0, codingTable: 0, samples: [] });
  }

  const flags = reader.getNextSample(ST_U8);
  const header = {
    isCommonTimestamp: (flags >> 1) & 0x01,
    hasSample: !((flags >> 2) & 0x01),
    nbOfTypeMeasure: (flags >> 4) & 0x0f,
  };

  // Batch counter (3 bits) and one reserved bit
  reader.getNextSample(ST_U8, 3);
  reader.getNextSample(ST_U8, 1);

  // First sample of every measure type
  let lastTimestamp = 0;
  let firstSeriesIndex = 0;
  for (let i = 0; i < header.nbOfTypeMeasure; i++) {
    const tagLabel = reader.getNextSample(ST_U8, BATCH_TAG_SIZE);
    const index = findArgumentIndex(tagLabel);
    if (i === 0) {
      firstSeriesIndex = index;
    }

    lastTimestamp = readTimestamp(reader, lastTimestamp);
    series[index] = {
      codingType: 0,
      codingTable: 0,
      samples: [
        {
          timestamp: lastTimestamp,
          value: readMeasure(reader, BATCH_ARGUMENTS[index].sampletype),
        },
      ],
    };
    if (header.hasSample) {
      series[index].codingType = reader.getNextSample(ST_U8, 2);
      series[index].codingTable = reader.getNextSample(ST_U8, 2);
    }
  }

  if (header.hasSample) {
    if (header.isCommonTimestamp) {
      lastTimestamp = decodeCommonTimestampSamples(
        reader,
        series,
        firstSeriesIndex,
        header,
      );
    } else {
      lastTimestamp = decodeSeparateTimestampSamples(
        reader,
        series,
        lastTimestamp,
        header,
      );
    }
  }

  // Timestamps are relative to the moment the batch was sent
  const batchTimestamp = readTimestamp(reader, lastTimestamp);

  const measurements = [];
  series.forEach((current, index) => {
    current.samples.forEach((sample) => {
      const argument = BATCH_ARGUMENTS[index];
      const timestamp = new Date(
        receivedAt.getTime() - (batchTimestamp - sample.timestamp) * 1000,
      );

      if (argument.measurement === "multiState") {
        // One bit per pin state
        for (let bit = 0; bit < 10; bit++) {
          measurements.push({
            name: "pinState",
            endpoint: bit,
            value: ((sample.value >> bit) & 0x01) === 1,
            timestamp,
          });
        }
      } else {
        measurements.push({
          name: argument.measurement,
          endpoint: argument.endpoint,
          value: argument.boolean
            ? sample.value !== 0
            : round(sample.value / argument.divide),
          timestamp,
        });
      }
    });
  });
  return measurements;
}

/// //////////// Standard frame decoding ///////////////

function decodeBasicCluster(bytes, attributeId, start) {
  switch (attributeId) {
    case 0x0002:
      return {
        firmwareVersion: `${bytes[start]}.${bytes[start + 1]}.${bytes[start + 2]}.${readUnsigned(bytes, start + 3, 3)}`,
      };
    case 0x0003:
      return { kernel: readString(bytes, start) };
    case 0x0004:
      return { manufacturer: readString(bytes, start) };
    case 0x0005:
      return { model: readString(bytes, start) };
    case 0x0006:
      return { productionDate: readString(bytes, start) };
    case 0x0010:
      return { position: readString(bytes, start) };
    case 0x8001:
      return { applicationName: readString(bytes, start) };
    default:
      return null;
  }
}

function decodeBinaryInputCluster(bytes, attributeId, start, attributeType) {
  switch (attributeId) {
    case 0x0402:
      return { index: readUnsigned(bytes, start, 4) };
    case 0x0055:
      return { pinState: bytes[start] !== 0 };
    case 0x0054:
      return { polarity: bytes[start] === 1 ? "REVERSE" : "NORMAL" };
    case 0x0400:
      return {
        edgeSelection:
          EDGE_SELECTION[bytes[start]] !== undefined
            ? EDGE_SELECTION[bytes[start]]
            : null,
      };
    case 0x0401:
      return { debouncePeriod: readNumber(bytes, start, attributeType) };
    case 0x0403:
      return { pollPeriod: readNumber(bytes, start, attributeType) };
    case 0x0404:
      return { forceNotify: readNumber(bytes, start, attributeType) };
    default:
      return null;
  }
}

function decodeAnalogInputCluster(bytes, attributeId, start) {
  switch (attributeId) {
    case 0x0055:
      return { analog: round(readFloat(bytes, start)) };
    case 0x0100: {
      let analogType = null;
      if (bytes[start + 1] === 0x05) {
        analogType = "PPM";
      } else if (bytes[start + 1] === 0xff && bytes[start + 3] === 0x00) {
        analogType = "MA";
      } else if (bytes[start + 1] === 0xff && bytes[start + 3] === 0x01) {
        analogType = "MV";
      }
      return { analogType };
    }
    case 0x8003:
      return { powerDuration: readUnsigned(bytes, start, 2) };
    default:
      return null;
  }
}

function decodeConfigurationCluster(bytes, attributeId, start) {
  // Node power descriptor
  if (attributeId !== 0x0006) {
    return null;
  }
  const powerSources = bytes[start + 2];
  let position = start + 3;
  const result = {};

  // The voltages are only present if the matching power source flag is set
  const voltages = [
    { mask: 0x01, name: "externalVoltage" },
    { mask: 0x02, name: "rechargeableBatteryVoltage" },
    { mask: 0x04, name: "batteryVoltage" },
    { mask: 0x08, name: "solarHarvestingVoltage" },
    { mask: 0x10, name: "ticHarvestingVoltage" },
  ];
  voltages.forEach((voltage) => {
    if (powerSources & voltage.mask) {
      result[voltage.name] = readUnsigned(bytes, position, 2) / 1000;
      position += 2;
    }
  });
  return result;
}

function decodeLorawanCluster(bytes, attributeId, start) {
  switch (attributeId) {
    case 0x0000:
      return {
        messageType: bytes[start] === 1 ? "CONFIRMED" : "UNCONFIRMED",
      };
    case 0x0001:
      return { retries: bytes[start] };
    case 0x0002:
      return {
        rejoinPeriod: readUnsigned(bytes, start + 1, 2),
        rejoinErrorFrames: readUnsigned(bytes, start + 3, 2),
      };
    case 0x0003:
      return { dataRate: bytes[start + 2] };
    case 0x0004:
      return { abpDevAddress: readDottedDecimal(bytes, start + 1, 4) };
    case 0x0005:
      return { otaAppEui: readDottedDecimal(bytes, start + 1, 8) };
    default:
      return null;
  }
}

// Reads consecutive signed values, the first value starts after one byte
function readSignedFields(bytes, start, names, size, divider) {
  const result = {};
  names.forEach((name, i) => {
    result[name] = round(
      readSigned(bytes, start + 1 + i * size, size) / divider,
    );
  });
  return result;
}

function decodeVoltageQualityCluster(bytes, start) {
  const result = {};
  const frequencies = ["frequency", "frequencyMin", "frequencyMax"];
  const voltages = [
    "vrms",
    "vrmsMin",
    "vrmsMax",
    "vpeak",
    "vpeakMin",
    "vpeakMax",
  ];
  const counts = ["overVoltage", "sagVoltage", "brownoutNumber"];

  // The frequency is sent as an offset to 22.232 kHz
  frequencies.forEach((name, i) => {
    result[name] = round(
      (readSigned(bytes, start + 1 + i * 2, 2) + 22232) / 1000,
    );
  });
  voltages.forEach((name, i) => {
    result[name] = round(readSigned(bytes, start + 7 + i * 2, 2) / 10);
  });
  counts.forEach((name, i) => {
    result[name] = readSigned(bytes, start + 19 + i * 2, 2);
  });
  return result;
}

// Decodes the attribute of a report or read attribute response into { name: value }
function decodeAttribute(bytes, clusterId, attributeId, start, attributeType) {
  switch (clusterId) {
    case 0x0000:
      return decodeBasicCluster(bytes, attributeId, start);
    case 0x0006:
      // On/off
      return attributeId === 0x0000 ? { output: bytes[start] === 1 } : null;
    case 0x000c:
      return decodeAnalogInputCluster(bytes, attributeId, start);
    case 0x000f:
      return decodeBinaryInputCluster(bytes, attributeId, start, attributeType);
    case 0x0013:
      // Multistate output
      return attributeId === 0x0055 ? { outputValue: bytes[start] } : null;
    case 0x0050:
      return decodeConfigurationCluster(bytes, attributeId, start);
    case 0x0052:
      // Simple metering
      if (attributeId !== 0x0000) {
        return null;
      }
      return {
        activeEnergy: readSigned(bytes, start + 1, 3),
        reactiveEnergy: readSigned(bytes, start + 4, 3),
        sampleCount: readUnsigned(bytes, start + 7, 2),
        activePower: readSigned(bytes, start + 9, 2),
        reactivePower: readSigned(bytes, start + 11, 2),
      };
    case 0x0400:
      return attributeId === 0x0000
        ? { illuminance: readUnsigned(bytes, start, 2) }
        : null;
    case 0x0402:
      if (attributeId > 0x0002) {
        return null;
      }
      return {
        [["temperature", "minTemperature", "maxTemperature"][attributeId]]:
          readSigned(bytes, start, 2) / 100,
      };
    case 0x0403:
      return attributeId === 0x0000
        ? { pressure: readSigned(bytes, start, 2) }
        : null;
    case 0x0405:
      if (attributeId > 0x0002) {
        return null;
      }
      return {
        [["humidity", "minHumidity", "maxHumidity"][attributeId]]:
          readUnsigned(bytes, start, 2) / 100,
      };
    case 0x0406:
      return attributeId === 0x0000 ? { occupancy: bytes[start] !== 0 } : null;
    case 0x8004:
      return decodeLorawanCluster(bytes, attributeId, start);
    case 0x8008:
      return attributeId === 0x0000
        ? { differentialPressure: readUnsigned(bytes, start, 2) }
        : null;
    case 0x800a:
      // Energy and power metering
      if (attributeId !== 0x0000) {
        return null;
      }
      return readSignedFields(
        bytes,
        start,
        [
          "positiveActiveEnergy",
          "negativeActiveEnergy",
          "positiveReactiveEnergy",
          "negativeReactiveEnergy",
          "positiveActivePower",
          "negativeActivePower",
          "positiveReactivePower",
          "negativeReactivePower",
        ],
        4,
        1,
      );
    case 0x800b:
      // Voltage and current metering
      if (attributeId !== 0x0000) {
        return null;
      }
      return {
        ...readSignedFields(bytes, start, ["vrms", "irms"], 2, 10),
        angle: readSigned(bytes, start + 5, 2),
      };
    case 0x800c:
      return attributeId === 0x0000
        ? { concentration: readUnsigned(bytes, start, 2) }
        : null;
    case 0x800d: {
      // Voltage and current multi metering
      if (attributeId !== 0x0000) {
        return null;
      }
      const result = {};
      ["A", "B", "C"].forEach((phase, i) => {
        result[`vrms${phase}`] = round(
          readSigned(bytes, start + 1 + i * 6, 2) / 10,
        );
        result[`irms${phase}`] = round(
          readSigned(bytes, start + 3 + i * 6, 2) / 10,
        );
        result[`angle${phase}`] = readSigned(bytes, start + 5 + i * 6, 2);
      });
      return result;
    }
    case 0x800e:
      return attributeId === 0x0000
        ? { number: readNumber(bytes, start, attributeType) }
        : null;
    case 0x8010: {
      // Energy and power multi metering
      if (attributeId > 0x0001) {
        return null;
      }
      const type = attributeId === 0x0000 ? "Energy" : "Power";
      const names = [];
      ["A", "B", "C", "ABC"].forEach((phase) => {
        names.push(`active${type}${phase}`, `reactive${type}${phase}`);
      });
      return readSignedFields(bytes, start, names, 4, 1);
    }
    case 0x8052:
      return attributeId === 0x0000
        ? decodeVoltageQualityCluster(bytes, start)
        : null;
    default:
      return null;
  }
}

// Multi binary input: one bit per pin, pin 1 to 8 are in the second byte
function decodeMultiBinaryInputCluster(bytes, attributeId, start) {
  if (attributeId !== 0x0000) {
    return [];
  }
  const states = bytes[start] * 256 + bytes[start + 1];
  const measurements = [];
  for (let pin = 0; pin < 10; pin++) {
    measurements.push({
      name: "pinState",
      endpoint: pin,
      value: ((states >> pin) & 0x01) === 1,
    });
  }
  return measurements;
}

function decodeReportParameters(value) {
  return {
    newModeConfiguration: (value & 0x80) !== 0,
    causeRequest: CAUSE_REQUEST[(value >> 4) & 0x03],
    securedIfAlarm: (value & 0x08) !== 0,
    secured: (value & 0x04) !== 0,
    noHeaderPort: (value & 0x02) !== 0,
    batch: (value & 0x01) !== 0,
  };
}

// Reporting interval: highest bit set means the value is given in minutes
function readInterval(bytes, start) {
  if (bytes[start] & 0x80) {
    return ((bytes[start] & 0x7f) * 256 + bytes[start + 1]) * 60;
  }
  return bytes[start] * 256 + bytes[start + 1];
}

function decodeStandardFrame(bytes) {
  const frame = {
    endpoint: ((bytes[0] & 0xe0) >> 5) | ((bytes[0] & 0x06) << 2),
    commandId: bytes[1],
    clusterId: bytes[2] * 256 + bytes[3],
    measurements: [],
    reportingConfiguration: null,
  };

  switch (frame.commandId) {
    case CMD_REPORT_ATTRIBUTES:
    case CMD_REPORT_ATTRIBUTES_ALARM:
    case CMD_READ_ATTRIBUTE_RESPONSE: {
      const attributeId = bytes[4] * 256 + bytes[5];
      // A read attribute response contains an additional status byte
      const start = frame.commandId === CMD_READ_ATTRIBUTE_RESPONSE ? 8 : 7;
      const attributeType = bytes[start - 1];

      let data = null;
      if (frame.clusterId === 0x8005) {
        frame.measurements = decodeMultiBinaryInputCluster(
          bytes,
          attributeId,
          start,
        );
      } else if (frame.clusterId >= 0x0053 && frame.clusterId <= 0x0057) {
        // TIC frames are only decoded by the TIC devices
        if (TIC_DECODER !== null) {
          frame.measurements = TIC_DECODER(
            frame.clusterId,
            attributeId,
            bytes.slice(start + 1),
          );
        }
      } else {
        data = decodeAttribute(
          bytes,
          frame.clusterId,
          attributeId,
          start,
          attributeType,
        );
      }

      if (data !== null) {
        Object.keys(data).forEach((name) => {
          frame.measurements.push({
            name,
            endpoint: frame.endpoint,
            value: data[name],
          });
        });
      }
      break;
    }
    case CMD_CONFIGURE_REPORTING_RESPONSE:
    case CMD_READ_REPORTING_CONFIGURATION_RESPONSE:
      frame.reportingConfiguration = {
        clusterId: toHex(frame.clusterId, 4),
        attributeId: toHex(bytes[6] * 256 + bytes[7], 4),
        status: bytes[4],
        ...decodeReportParameters(bytes[5]),
      };
      if (frame.commandId === CMD_READ_REPORTING_CONFIGURATION_RESPONSE) {
        frame.reportingConfiguration.minReportInterval = readInterval(bytes, 9);
        frame.reportingConfiguration.maxReportInterval = readInterval(
          bytes,
          11,
        );
      }
      break;
    default:
      break;
  }
  return frame;
}

/// //////////// Akenza output ///////////////

// Only devices with counters keep values in the state
const USES_STATE = Object.keys(MEASUREMENTS).some((name) =>
  []
    .concat(MEASUREMENTS[name])
    .some((route) => route !== null && route.counter !== undefined),
);

// Returns the topic and key of a measurement, or null if the device does not output it
function routeMeasurement(measurement) {
  if (measurement.topic !== undefined) {
    return { topic: measurement.topic, key: measurement.key };
  }
  const routes = MEASUREMENTS[measurement.name];
  if (Array.isArray(routes)) {
    // One route per endpoint
    return routes[measurement.endpoint] || null;
  }
  if (routes !== undefined) {
    return routes;
  }
  if (DEFAULT_TOPICS[measurement.name] !== undefined) {
    return { topic: DEFAULT_TOPICS[measurement.name], key: measurement.name };
  }
  return null;
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

// Adds the pulse count, the pulses since the last uplink and the customfield conversion
function addPulses(event, state, data, counter, pulse) {
  data.pulse = pulse;
  data.relativePulse = calculateIncrement(state[`lastPulse${counter}`], pulse);
  state[`lastPulse${counter}`] = pulse;

  // Customfields
  if (event.device !== undefined && event.device.customFields !== undefined) {
    const { customFields } = event.device;
    const pulseType = customFields[`pulseType${counter}`];

    if (pulseType !== undefined && pulseType !== "") {
      let multiplier = 1;
      let divider = 1;
      if (customFields[`multiplier${counter}`] !== undefined) {
        multiplier = Number(customFields[`multiplier${counter}`]);
      }
      if (customFields[`divider${counter}`] !== undefined) {
        divider = Number(customFields[`divider${counter}`]);
      }

      data[pulseType] =
        Math.round(((data.relativePulse * multiplier) / divider) * 1000) / 1000;
      data[`${pulseType}Cumulative`] =
        Math.round(((data.pulse * multiplier) / divider) * 1000) / 1000;
    }
  }
}

// Groups the measurements into one sample per topic and timestamp and emits them
function emitMeasurements(event, state, measurements) {
  const samples = [];

  measurements.forEach((measurement) => {
    const route = routeMeasurement(measurement);
    if (route === null) {
      return;
    }

    const time = measurement.timestamp ? measurement.timestamp.getTime() : 0;
    let sample = samples.find(
      (s) => s.topic === route.topic && s.time === time,
    );
    if (sample === undefined) {
      sample = {
        topic: route.topic,
        time,
        timestamp: measurement.timestamp,
        data: {},
        pulses: [],
      };
      samples.push(sample);
    }

    if (route.counter !== undefined) {
      sample.pulses.push({ counter: route.counter, value: measurement.value });
    } else {
      if (INPUT_CONFIGURATION.indexOf(measurement.name) !== -1) {
        sample.data.input = measurement.endpoint + 1;
      }
      sample.data[route.key] = measurement.value;
    }
  });

  // Chronological order, so the pulse increments are calculated correctly
  samples.sort((a, b) => a.time - b.time);

  samples.forEach((sample) => {
    sample.pulses.forEach((pulse) => {
      addPulses(event, state, sample.data, pulse.counter, pulse.value);
    });

    const output = { data: sample.data, topic: sample.topic };
    if (sample.timestamp !== undefined) {
      output.timestamp = sample.timestamp;
    }
    emit("sample", output);
  });
}

function consume(event) {
  const { port } = event.data;
  const bytes = Hex.hexToBytes(event.data.payloadHex);
  const state = event.state || {};

  if (port === undefined || port === STANDARD_PORT) {
    // The lowest bit of the first byte distinguishes standard (1) and batch (0) frames
    if (bytes[0] & 0x01) {
      const frame = decodeStandardFrame(bytes);
      if (frame.reportingConfiguration !== null) {
        emit("sample", {
          data: frame.reportingConfiguration,
          topic: "reporting_configuration",
        });
      }
      emitMeasurements(event, state, frame.measurements);
    } else if (BATCH_ARGUMENTS.length > 0) {
      emitMeasurements(event, state, decodeBatch(bytes, new Date()));
    }
  }

  if (USES_STATE) {
    emit("state", state);
  }
}
