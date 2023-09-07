// Source https://lora.watteco.fr/Lora/
const ST_UNDEF = 0;
const ST_BL = 1;
const ST_U4 = 2;
const ST_I4 = 3;
const ST_U8 = 4;
const ST_I8 = 5;
const ST_U16 = 6;
const ST_I16 = 7;
const ST_U24 = 8;
const ST_I24 = 9;
const ST_U32 = 10;
const ST_I32 = 11;
const ST_FL = 12;

const ST = {};
ST[ST_UNDEF] = 0;
ST[ST_BL] = 1;
ST[ST_U4] = 4;
ST[ST_I4] = 4;
ST[ST_U8] = 8;
ST[ST_I8] = 8;
ST[ST_U16] = 16;
ST[ST_I16] = 16;
ST[ST_U24] = 24;
ST[ST_I24] = 24;
ST[ST_U32] = 32;
ST[ST_I32] = 32;
ST[ST_FL] = 32;

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

// }}}

// {{{ Polyfills
Math.trunc =
  Math.trunc ||
  function (x) {
    if (isNaN(x)) {
      return NaN;
    }
    if (x > 0) {
      return Math.floor(x);
    }
    return Math.ceil(x);
  };
// }}}

/**
 * brUncompress main function
 */
function brUncompress(tagsz, argList, hexString, batchAbsoluteTimestamp) {
  const out = initResult();
  const buffer = createBuffer(parseHexString(hexString));
  const flag = generateFlag(buffer.getNextSample(ST_U8));

  out.batch_counter = buffer.getNextSample(ST_U8, 3);
  buffer.getNextSample(ST_U8, 1);

  const temp = prePopulateOutput(out, buffer, argList, flag, tagsz);
  let { lastTimestamp } = temp;
  const { indexOfTheFirstSample } = temp;

  if (flag.hasSample) {
    lastTimestamp = uncompressSamplesData(
      out,
      buffer,
      indexOfTheFirstSample,
      argList,
      lastTimestamp,
      flag,
      tagsz,
    );
  }

  out.batchRelativeTimestamp = extractTimestampFromBuffer(
    buffer,
    lastTimestamp,
  );
  return adaptToExpectedFormat(out, argList, batchAbsoluteTimestamp);
}

/// //////////// Sub functions ///////////////

/**
 * Init br_uncompress result data structure
 */
function initResult() {
  const series = [];
  let i = 0;
  while (i < NUMBER_OF_SERIES) {
    series.push({
      codingType: 0,
      codingTable: 0,
      resolution: null,
      uncompressSamples: [],
    });
    i += 1;
  }
  return {
    batch_counter: 0,
    batchRelativeTimestamp: 0,
    series,
  };
}

/**
 * Function to create a buffer from a byteArray. Allow to read sample from the
 * byteArray to extract data.
 */
function createBuffer(byteArray) {
  /**
   * Retrieve the pattern for HUFF table lookup
   */
  function bitsBuf2HuffPattern(byteArray, index, nbBits) {
    let sourceBitStart = index;
    const sz = nbBits - 1;
    if (byteArray.length * 8 < sourceBitStart + nbBits) {
      return "WRONG_LENGTH";
    }
    let bittoread = 0;
    let pattern = 0;
    while (nbBits > 0) {
      if (byteArray[sourceBitStart >> 3] & (1 << (sourceBitStart & 0x07))) {
        pattern |= 1 << (sz - bittoread);
      }
      nbBits--;
      bittoread++;
      sourceBitStart++;
    }
    return pattern;
  }

  return {
    index: 0,
    byteArray,
    getNextSample(sampleType, nbBitsInput) {
      let nbBits = nbBitsInput || ST[sampleType];
      let sourceBitStart = this.index;
      this.index += nbBits;
      if (sampleType === ST_FL && nbBits !== 32) {
        return "WRONG_SAMPLETYPE";
      }

      let u32 = 0;
      let nbytes = Math.trunc((nbBits - 1) / 8) + 1;
      let nbitsfrombyte = nbBits % 8;
      if (nbitsfrombyte === 0 && nbytes > 0) {
        nbitsfrombyte = 8;
      }

      while (nbytes > 0) {
        let bittoread = 0;
        while (nbitsfrombyte > 0) {
          const idx = sourceBitStart >> 3;
          if (this.byteArray[idx] & (1 << (sourceBitStart & 0x07))) {
            u32 |= 1 << ((nbytes - 1) * 8 + bittoread);
          }
          nbitsfrombyte--;
          bittoread++;
          sourceBitStart += 1;
        }
        nbytes--;
        nbitsfrombyte = 8;
      }
      // Propagate the sign bit if 1
      if (
        (sampleType === ST_I4 ||
          sampleType === ST_I8 ||
          sampleType === ST_I16 ||
          sampleType === ST_I24) &&
        u32 & (1 << (nbBits - 1))
      ) {
        for (let i = nbBits; i < 32; i++) {
          u32 |= 1 << i;
          nbBits++;
        }
      }
      return u32;
    },

    /**
     * Extract sz and bi from Huff table
     */
    getNextBifromHi(huffCoding) {
      for (let i = 2; i < 12; i++) {
        const lhuff = bitsBuf2HuffPattern(this.byteArray, this.index, i);
        for (let j = 0; j < HUFF[huffCoding].length; j++) {
          if (
            HUFF[huffCoding][j].sz === i &&
            lhuff === HUFF[huffCoding][j].lbl
          ) {
            this.index += i;
            return j;
          }
        }
      }
      return "BI_NOT_FOUND_IN_HUFF";
    },
  };
}

/**
 * Convert the hex string given as parameter to a ByteArray
 */
function parseHexString(str) {
  str = str
    .split("")
    .filter((x) => !isNaN(parseInt(x, 16)))
    .join("");
  const result = [];
  while (str.length >= 2) {
    result.push(parseInt(str.substring(0, 2), 16));
    str = str.substring(2, str.length);
  }
  return result;
}

/**
 * Generate a flag object from an integer value.
 */
function generateFlag(flagAsInt) {
  let binbase = flagAsInt.toString(2);

  // leftpad
  while (binbase.length < 8) {
    binbase = `0${binbase}`;
  }

  return {
    isCommonTimestamp: parseInt(binbase[binbase.length - 2], 2),
    hasSample: !parseInt(binbase[binbase.length - 3], 2),
    batch_req: parseInt(binbase[binbase.length - 4], 2),
    nb_of_type_measure: parseInt(binbase.substring(0, 4), 2),
  };
}

/**
 * Prepopulate output with relative timestamp and measure of the first sample
 * for each series.
 */
function prePopulateOutput(out, buffer, argList, flag, tagsz) {
  let currentTimestamp = 0;
  let indexOfTheFirstSample = 0;
  for (let i = 0; i < flag.nb_of_type_measure; i++) {
    const tag = {
      size: tagsz,
      lbl: buffer.getNextSample(ST_U8, tagsz),
    };
    const sampleIndex = findIndexFromArgList(argList, tag);

    if (i === 0) {
      indexOfTheFirstSample = sampleIndex;
    }

    currentTimestamp = extractTimestampFromBuffer(buffer, currentTimestamp);
    out.series[sampleIndex] = computeSeries(
      buffer,
      argList[sampleIndex].sampletype,
      tag.lbl,
      currentTimestamp,
    );
    if (flag.hasSample) {
      out.series[sampleIndex].codingType = buffer.getNextSample(ST_U8, 2);
      out.series[sampleIndex].codingTable = buffer.getNextSample(ST_U8, 2);
    }
  }
  return {
    lastTimestamp: currentTimestamp,
    indexOfTheFirstSample,
  };
}

/**
 * Initialize next series from buffer
 */
function computeSeries(buffer, sampletype, label, currentTimestamp) {
  return {
    uncompressSamples: [
      {
        data_relative_timestamp: currentTimestamp,
        data: {
          value: getMeasure(buffer, sampletype),
          label,
        },
      },
    ],
    codingType: 0,
    codingTable: 0,
    resolution: null,
  };
}

/**
 * Return the index of tag lbl in the argument list
 */
function findIndexFromArgList(argList, tag) {
  for (let i = 0; i < argList.length; i++) {
    if (argList[i].taglbl === tag.lbl) {
      return i;
    }
  }
  throw "Cannot find index in argList";
}

/**
 * Extract a new time stamp using Huff table, optionnaly from a baseTimestamp
 */
function extractTimestampFromBuffer(buffer, baseTimestamp) {
  if (baseTimestamp) {
    const bi = buffer.getNextBifromHi(1);
    return computeTimestampFromBi(buffer, baseTimestamp, bi);
  }
  return buffer.getNextSample(ST_U32);
}

/**
 * Compute a new timestamp from a previous one, regarding bi value
 */
function computeTimestampFromBi(buffer, baseTimestamp, bi) {
  if (bi > BR_HUFF_MAX_INDEX_TABLE) {
    return buffer.getNextSample(ST_U32);
  }
  if (bi > 0) {
    return computeTimestampFromPositiveBi(buffer, baseTimestamp, bi);
  }
  return baseTimestamp;
}

/**
 * Compute a new timestamp from a previous one, regarding posotive bi value
 */
function computeTimestampFromPositiveBi(buffer, baseTimestamp, bi) {
  return buffer.getNextSample(ST_U32, bi) + baseTimestamp + Math.pow(2, bi) - 1;
}

/**
 * Extract the measure from the buffer, handling float case
 */

function getMeasure(buffer, sampletype) {
  const v = buffer.getNextSample(sampletype);
  return sampletype === ST_FL ? bytes2Float32(v) : v;
}

/**
 * Convert bytes to a float32 representation.
 */
function bytes2Float32(bytes) {
  const sign = bytes & 0x80000000 ? -1 : 1;
  let exponent = ((bytes >> 23) & 0xff) - 127;
  let significand = bytes & ~(-1 << 23);

  if (exponent === 128) {
    return sign * (significand ? Number.NaN : Number.POSITIVE_INFINITY);
  }

  if (exponent === -127) {
    if (significand === 0) {
      return sign * 0.0;
    }
    exponent = -126;
    significand /= 1 << 22;
  } else {
    significand = (significand | (1 << 23)) / (1 << 23);
  }

  return sign * significand * Math.pow(2, exponent);
}

/**
 * Uncompress samples data presenting common timestamp or separate timestamp
 */
function uncompressSamplesData(
  out,
  buffer,
  indexOfTheFirstSample,
  argList,
  lastTimestamp,
  flag,
  tagsz,
) {
  if (flag.isCommonTimestamp) {
    return handleCommonTimestamp(
      out,
      buffer,
      indexOfTheFirstSample,
      argList,
      flag,
      tagsz,
    );
  }
  return handleSeparateTimestamp(
    out,
    buffer,
    argList,
    lastTimestamp,
    flag,
    tagsz,
  );
}

/**
 * Uncompress data in case of common timestamp
 */
function handleCommonTimestamp(
  out,
  buffer,
  indexOfTheFirstSample,
  argList,
  flag,
  tagsz,
) {
  // number of sample
  const nbSampleToParse = buffer.getNextSample(ST_U8, 8);
  const tag = {};

  const temp = initTimestampCommonTable(
    out,
    buffer,
    nbSampleToParse,
    indexOfTheFirstSample,
  );
  const { timestampCommon } = temp;
  const { lastTimestamp } = temp;

  for (let j = 0; j < flag.nb_of_type_measure; j++) {
    let firstNullDeltaValue = 1;
    tag.lbl = buffer.getNextSample(ST_U8, tagsz);
    const sampleIndex = findIndexFromArgList(argList, tag);
    for (let i = 0; i < nbSampleToParse; i++) {
      // Available bit
      const available = buffer.getNextSample(ST_U8, 1);
      if (available) {
        // Delta value
        const bi = buffer.getNextBifromHi(out.series[sampleIndex].codingTable);
        const currentMeasure = {
          data_relative_timestamp: 0,
          data: {},
        };
        if (bi <= BR_HUFF_MAX_INDEX_TABLE) {
          const precedingValue =
            out.series[sampleIndex].uncompressSamples[
              out.series[sampleIndex].uncompressSamples.length - 1
            ].data.value;
          if (bi > 0) {
            currentMeasure.data.value = completeCurrentMeasure(
              buffer,
              precedingValue,
              out.series[sampleIndex].codingType,
              argList[sampleIndex].resol,
              bi,
            );
          } else {
            // (bi <= 0)
            if (firstNullDeltaValue) {
              // First value is yet recorded starting from the header
              firstNullDeltaValue = 0;
              continue;
            } else {
              currentMeasure.data.value = precedingValue;
            }
          }
        } else {
          // bi > BR_HUFF_MAX_INDEX_TABLE
          currentMeasure.data.value = buffer.getNextSample(
            argList[sampleIndex].sampletype,
          );
        }
        currentMeasure.data_relative_timestamp = timestampCommon[i];
        out.series[sampleIndex].uncompressSamples.push(currentMeasure);
      }
    }
  }
  return lastTimestamp;
}

/**
 * Initialize common timestamp table. Returns the table and last calculated timestamp
 */
function initTimestampCommonTable(
  out,
  buffer,
  nbSampleToParse,
  firstSampleIndex,
) {
  const timestampCommon = [];
  let lastTimestamp = 0;
  const timestampCoding = buffer.getNextSample(ST_U8, 2);
  let precedingTimestamp = 0;
  for (let i = 0; i < nbSampleToParse; i++) {
    // delta timestamp
    const bi = buffer.getNextBifromHi(timestampCoding);
    if (bi <= BR_HUFF_MAX_INDEX_TABLE) {
      if (i === 0) {
        timestampCommon.push(
          out.series[firstSampleIndex].uncompressSamples[0]
            .data_relative_timestamp,
        );
      } else if (bi > 0) {
        precedingTimestamp = timestampCommon[i - 1];
        timestampCommon.push(
          buffer.getNextSample(ST_U32, bi) +
            precedingTimestamp +
            Math.pow(2, bi) -
            1,
        );
      } else {
        timestampCommon.push(precedingTimestamp);
      }
    } else {
      timestampCommon.push(buffer.getNextSample(ST_U32));
    }
    lastTimestamp = timestampCommon[i];
  }
  return {
    timestampCommon,
    lastTimestamp,
  };
}

/**
 * Complete current measure from the preceding one
 */
function completeCurrentMeasure(buffer, precedingValue, codingType, resol, bi) {
  const currentValue = buffer.getNextSample(ST_U16, bi);
  if (codingType === 0) {
    // ADLC
    return computeAdlcValue(currentValue, resol, precedingValue, bi);
  }
  if (codingType === 1) {
    // Positive
    return (currentValue + Math.pow(2, bi) - 1) * resol + precedingValue;
  }
  // Negative
  return precedingValue - (currentValue + (Math.pow(2, bi) - 1)) * resol;
}

/**
 * Return current value in ADLC case
 */
function computeAdlcValue(currentValue, resol, precedingValue, bi) {
  if (currentValue >= Math.pow(2, bi - 1)) {
    return currentValue * resol + precedingValue;
  }
  return (currentValue + 1 - Math.pow(2, bi)) * resol + precedingValue;
}

/**
 * Uncompress data in case of separate timestamp
 */
function handleSeparateTimestamp(
  out,
  buffer,
  argList,
  lastTimestamp,
  flag,
  tagsz,
) {
  const tag = {};
  for (let i = 0; i < flag.nb_of_type_measure; i++) {
    tag.lbl = buffer.getNextSample(ST_U8, tagsz);
    const sampleIndex = findIndexFromArgList(argList, tag);
    const compressSampleNb = buffer.getNextSample(ST_U8, 8);
    if (compressSampleNb) {
      const timestampCoding = buffer.getNextSample(ST_U8, 2);
      for (let j = 0; j < compressSampleNb; j++) {
        const precedingRelativeTimestamp =
          out.series[sampleIndex].uncompressSamples[
            out.series[sampleIndex].uncompressSamples.length - 1
          ].data_relative_timestamp;
        const currentMeasure = {
          data_relative_timestamp: 0,
          data: {},
        };
        let bi = buffer.getNextBifromHi(timestampCoding);
        currentMeasure.data_relative_timestamp = computeTimestampFromBi(
          buffer,
          precedingRelativeTimestamp,
          bi,
        );
        if (currentMeasure.data_relative_timestamp > lastTimestamp) {
          lastTimestamp = currentMeasure.data_relative_timestamp;
        }
        bi = buffer.getNextBifromHi(out.series[sampleIndex].codingTable);
        if (bi <= BR_HUFF_MAX_INDEX_TABLE) {
          const precedingValue =
            out.series[sampleIndex].uncompressSamples[
              out.series[sampleIndex].uncompressSamples.length - 1
            ].data.value;
          if (bi > 0) {
            currentMeasure.data.value = completeCurrentMeasure(
              buffer,
              precedingValue,
              out.series[sampleIndex].codingType,
              argList[sampleIndex].resol,
              bi,
            );
          } else {
            // bi <= 0
            currentMeasure.data.value = precedingValue;
          }
        } else {
          // bi > BR_HUFF_MAX_INDEX_TABLE
          currentMeasure.data.value = buffer.getNextSample(
            argList[sampleIndex].sampletype,
          );
        }
        out.series[sampleIndex].uncompressSamples.push(currentMeasure);
      }
    }
  }
  return lastTimestamp;
}

/**
 * Translate brUncompress output data to expected structure
 */
function adaptToExpectedFormat(out, argList, batchAbsoluteTimestamp) {
  const returnedGlobalObject = {};
  if (batchAbsoluteTimestamp) {
    returnedGlobalObject.b_ts = batchAbsoluteTimestamp;
  }
  returnedGlobalObject.datas = out.series.reduce(
    (acc, current, index) =>
      acc.concat(
        current.uncompressSamples.map((item) => {
          const returned = {
            // data_relative_timestamp: item.data_relative_timestamp,
            data: {
              value: argList[index].divide
                ? item.data.value / argList[index].divide
                : item.data.value,
            },
          };
          if (argList[index].lblname) {
            returned.data.label = argList[index].lblname;
          }
          if (batchAbsoluteTimestamp) {
            returned.date = computeDataAbsoluteTimestamp(
              batchAbsoluteTimestamp,
              out.batchRelativeTimestamp,
              item.data_relative_timestamp,
            );
          }
          return returned;
        }),
      ),
    [],
  );
  return returnedGlobalObject;
}

/**
 * Compute data absolute timestamp from batch absolute timestamp (bat), batch
 * relative timestamp (brt) and data relative timestamp (drt)
 */
function computeDataAbsoluteTimestamp(bat, brt, drt) {
  return new Date(new Date(bat) - (brt - drt) * 1000).toISOString();
}

function UintToInt(Uint, Size) {
  if (Size === 2) {
    if ((Uint & 0x8000) > 0) {
      Uint -= 0x10000;
    }
  }
  if (Size === 3) {
    if ((Uint & 0x800000) > 0) {
      Uint -= 0x1000000;
    }
  }
  if (Size === 4) {
    if ((Uint & 0x80000000) > 0) {
      Uint -= 0x100000000;
    }
  }
  return Uint;
}

const Int32UnsignedToSigned = (uint32) =>
  Int32Array.from(Uint32Array.of(uint32))[0];

function decimalToHex(d, padding) {
  let hex = Number(d).toString(16).toUpperCase();
  padding =
    typeof padding === "undefined" || padding === null
      ? (padding = 2)
      : padding;

  while (hex.length < padding) {
    hex = `0${hex}`;
  }

  return `0x${hex}`;
}

function Bytes2Float32(bytes) {
  const sign = bytes & 0x80000000 ? -1 : 1;
  let exponent = ((bytes >> 23) & 0xff) - 127;
  let significand = bytes & ~(-1 << 23);
  if (exponent === 128) {
    return sign * (significand ? Number.NaN : Number.POSITIVE_INFINITY);
  }

  if (exponent === -127) {
    if (significand === 0) return sign * 0.0;
    exponent = -126;
    significand /= 1 << 22;
  } else significand = (significand | (1 << 23)) / (1 << 23);

  return sign * significand * Math.pow(2, exponent);
}

function consume(event) {
  const bytes = Hex.hexToBytes(event.data.payloadHex);
  const { port } = event.data;

  const decoded = {};
  let decodedBatch = {};
  const lora = {};

  const bytesLen = bytes.length;
  let tempHexStr = "";

  lora.payload = "";

  for (let j = 0; j < bytesLen; j++) {
    tempHexStr = bytes[j].toString(16).toUpperCase();
    if (tempHexStr.length === 1) {
      tempHexStr = `0${tempHexStr}`;
    }
    lora.payload += tempHexStr;
  }

  const date = new Date();
  const lDate = date.toISOString();

  if (port === 125) {
    // batch
    decodedBatch = !(bytes[0] & 0x01);

    // trame standard
    if (decodedBatch === false) {
      decoded.zclheader = {};
      decoded.zclheader.report = "standard";
      const attributeeID = -1;
      let cmdID = -1;
      let clusterdID = -1;
      // endpoint
      decoded.zclheader.endpoint =
        ((bytes[0] & 0xe0) >> 5) | ((bytes[0] & 0x06) << 2);
      // command ID
      cmdID = bytes[1];
      decoded.zclheader.cmdID = decimalToHex(cmdID, 2);
      // Cluster ID
      clusterdID = bytes[2] * 256 + bytes[3];
      decoded.zclheader.clusterdID = decimalToHex(clusterdID, 4);

      // decode report and read attribute response
      if ((cmdID === 0x0a) | (cmdID === 0x8a) | (cmdID === 0x01)) {
        const stdData = {};
        const tab = {};

        // attribute ID
        const attributeID = bytes[4] * 256 + bytes[5];
        decoded.zclheader.attributeID = decimalToHex(attributeID, 4);

        if (cmdID === 0x8a) {
          decoded.zclheader.alarm = 1;
        } else {
          decoded.zclheader.alarm = 0;
        }

        let index = 0;
        // data index start
        if ((cmdID === 0x0a) | (cmdID === 0x8a)) {
          index = 7;
        }
        // if (cmdID === 0x01) {index = 8; decoded.zclheader.status = bytes[6];}

        // on/off present value
        if ((clusterdID === 0x0006) & (attributeID === 0x0000)) {
          const state = bytes[index];
          if (state === 0) {
            tab[`output${decoded.zclheader.endpoint + 1}`] = "OFF";
          }
          if (state === 1) {
            tab[`output${decoded.zclheader.endpoint + 1}`] = "ON";
          }
        }

        // energy and power metering
        if ((clusterdID === 0x800a) & (attributeID === 0x0000)) {
          const phase = {};
          phase.pActiveEnergy = UintToInt(
            bytes[index + 1] * 256 * 256 * 256 +
              bytes[index + 2] * 256 * 256 +
              bytes[index + 3] * 256 +
              bytes[index + 4],
            4,
          );
          phase.nActiveEnergy = UintToInt(
            bytes[index + 5] * 256 * 256 * 256 +
              bytes[index + 6] * 256 * 256 +
              bytes[index + 7] * 256 +
              bytes[index + 8],
            4,
          );
          phase.pReactiveEnergy = UintToInt(
            bytes[index + 9] * 256 * 256 * 256 +
              bytes[index + 10] * 256 * 256 +
              bytes[index + 11] * 256 +
              bytes[index + 12],
            4,
          );
          phase.nReactiveEnergy = UintToInt(
            bytes[index + 13] * 256 * 256 * 256 +
              bytes[index + 14] * 256 * 256 +
              bytes[index + 15] * 256 +
              bytes[index + 16],
            4,
          );
          phase.pActivePowerW = UintToInt(
            bytes[index + 17] * 256 * 256 * 256 +
              bytes[index + 18] * 256 * 256 +
              bytes[index + 19] * 256 +
              bytes[index + 20],
            4,
          );
          phase.nActivePowerW = UintToInt(
            bytes[index + 21] * 256 * 256 * 256 +
              bytes[index + 22] * 256 * 256 +
              bytes[index + 23] * 256 +
              bytes[index + 24],
            4,
          );
          phase.pReactivePowerVar = UintToInt(
            bytes[index + 25] * 256 * 256 * 256 +
              bytes[index + 26] * 256 * 256 +
              bytes[index + 27] * 256 +
              bytes[index + 28],
            4,
          );
          phase.nReactivePowerVar = UintToInt(
            bytes[index + 29] * 256 * 256 * 256 +
              bytes[index + 30] * 256 * 256 +
              bytes[index + 31] * 256 +
              bytes[index + 32],
            4,
          );

          emit("sample", {
            topic: "phase",
            data: phase,
          });
        }

        // energy and power metering
        if ((clusterdID === 0x800b) & (attributeID === 0x0000)) {
          const phaseVariables = {};
          phaseVariables.vrms =
            UintToInt(bytes[index + 1] * 256 + bytes[index + 2], 2) / 10;
          phaseVariables.irms =
            UintToInt(bytes[index + 3] * 256 + bytes[index + 4], 2) / 10;
          phaseVariables.angle = UintToInt(
            bytes[index + 5] * 256 + bytes[index + 6],
            2,
          );

          emit("sample", { topic: "phase_variables", data: phaseVariables });
        }
        // energy and power multi metering
        if ((clusterdID === 0x8010) & (attributeID === 0x0000)) {
          const energy = {};

          energy.activeEnergyWhPhaseA = Int32UnsignedToSigned(
            bytes[index + 1] * 256 * 256 * 256 +
              bytes[index + 2] * 256 * 256 +
              bytes[index + 3] * 256 +
              bytes[index + 4],
          );
          energy.reactiveEnergyWhPhaseA = Int32UnsignedToSigned(
            bytes[index + 5] * 256 * 256 * 256 +
              bytes[index + 6] * 256 * 256 +
              bytes[index + 7] * 256 +
              bytes[index + 8],
          );
          energy.activeEnergyWhPhaseB = Int32UnsignedToSigned(
            bytes[index + 9] * 256 * 256 * 256 +
              bytes[index + 10] * 256 * 256 +
              bytes[index + 11] * 256 +
              bytes[index + 12],
          );
          energy.reactiveEnergyWhPhaseB = Int32UnsignedToSigned(
            bytes[index + 13] * 256 * 256 * 256 +
              bytes[index + 14] * 256 * 256 +
              bytes[index + 15] * 256 +
              bytes[index + 16],
          );
          energy.activeEnergyWhPhaseC = Int32UnsignedToSigned(
            bytes[index + 17] * 256 * 256 * 256 +
              bytes[index + 18] * 256 * 256 +
              bytes[index + 19] * 256 +
              bytes[index + 20],
          );
          energy.reactiveEnergyWhPhaseC = Int32UnsignedToSigned(
            bytes[index + 21] * 256 * 256 * 256 +
              bytes[index + 22] * 256 * 256 +
              bytes[index + 23] * 256 +
              bytes[index + 24],
          );
          energy.activeEnergyWhPhaseABC = Int32UnsignedToSigned(
            bytes[index + 25] * 256 * 256 * 256 +
              bytes[index + 26] * 256 * 256 +
              bytes[index + 27] * 256 +
              bytes[index + 28],
          );
          energy.reactiveEnergyWhPhaseABC = Int32UnsignedToSigned(
            bytes[index + 29] * 256 * 256 * 256 +
              bytes[index + 30] * 256 * 256 +
              bytes[index + 31] * 256 +
              bytes[index + 32],
          );
          energy.endpoint = decoded.zclheader.endpoint + 1;

          emit("sample", { topic: "energy", data: energy });
        } else if ((clusterdID === 0x8010) & (attributeID === 0x0001)) {
          const power = {};

          power.activePowerWhPhaseA = Int32UnsignedToSigned(
            bytes[index + 1] * 256 * 256 * 256 +
              bytes[index + 2] * 256 * 256 +
              bytes[index + 3] * 256 +
              bytes[index + 4],
          );
          power.reactivePowerWhPhaseA = Int32UnsignedToSigned(
            bytes[index + 5] * 256 * 256 * 256 +
              bytes[index + 6] * 256 * 256 +
              bytes[index + 7] * 256 +
              bytes[index + 8],
          );
          power.activePowerWhPhaseB = Int32UnsignedToSigned(
            bytes[index + 9] * 256 * 256 * 256 +
              bytes[index + 10] * 256 * 256 +
              bytes[index + 11] * 256 +
              bytes[index + 12],
          );
          power.reactivePowerWhPhaseB = Int32UnsignedToSigned(
            bytes[index + 13] * 256 * 256 * 256 +
              bytes[index + 14] * 256 * 256 +
              bytes[index + 15] * 256 +
              bytes[index + 16],
          );
          power.activePowerWhPhaseC = Int32UnsignedToSigned(
            bytes[index + 17] * 256 * 256 * 256 +
              bytes[index + 18] * 256 * 256 +
              bytes[index + 19] * 256 +
              bytes[index + 20],
          );
          power.reactivePowerWhPhaseC = Int32UnsignedToSigned(
            bytes[index + 21] * 256 * 256 * 256 +
              bytes[index + 22] * 256 * 256 +
              bytes[index + 23] * 256 +
              bytes[index + 24],
          );
          power.activePowerWhPhaseABC = Int32UnsignedToSigned(
            bytes[index + 25] * 256 * 256 * 256 +
              bytes[index + 26] * 256 * 256 +
              bytes[index + 27] * 256 +
              bytes[index + 28],
          );
          power.reactivePowerWhPhaseABC = Int32UnsignedToSigned(
            bytes[index + 29] * 256 * 256 * 256 +
              bytes[index + 30] * 256 * 256 +
              bytes[index + 31] * 256 +
              bytes[index + 32],
          );

          power.endpoint = decoded.zclheader.endpoint + 1;

          emit("sample", { topic: "power", data: power });
        }
        // voltage and current multi metering
        if ((clusterdID === 0x800d) & (attributeID === 0x0000)) {
          const variables = {};

          variables.vrmsA =
            UintToInt(bytes[index + 1] * 256 + bytes[index + 2], 2) / 10;
          variables.irmsA =
            UintToInt(bytes[index + 3] * 256 + bytes[index + 4], 2) / 10;
          variables.angleA =
            UintToInt(bytes[index + 5] * 256 + bytes[index + 6], 2) / 10;
          variables.vrmsB =
            UintToInt(bytes[index + 7] * 256 + bytes[index + 8], 2) / 10;
          variables.irmsB =
            UintToInt(bytes[index + 9] * 256 + bytes[index + 10], 2) / 10;
          variables.angleB =
            UintToInt(bytes[index + 11] * 256 + bytes[index + 12], 2) / 10;
          variables.vrmsC =
            UintToInt(bytes[index + 13] * 256 + bytes[index + 14], 2) / 10;
          variables.irmsC =
            UintToInt(bytes[index + 15] * 256 + bytes[index + 16], 2) / 10;
          variables.angleC =
            UintToInt(bytes[index + 17] * 256 + bytes[index + 18], 2) / 10;

          emit("sample", { topic: "variables", data: variables });
        }
      }

      // decode configuration response
      if (cmdID === 0x07) {
        // attributeID
        const attributeID = bytes[6] * 256 + bytes[7];
        decoded.zclheader.attributeID = decimalToHex(attributeID, 4);
        // status
        decoded.zclheader.status = bytes[4];
        // batch
        decoded.zclheader.decodedBatch = bytes[5];
      }

      // decode read configuration response
      if (cmdID === 0x09) {
        // attributeID
        const attributeID = bytes[6] * 256 + bytes[7];
        decoded.zclheader.attributeID = decimalToHex(attributeID, 4);
        // status
        decoded.zclheader.status = bytes[4];
        // batch
        decoded.zclheader.decodedBatch = bytes[5];
        // attributeType
        decoded.zclheader.attribute_type = bytes[8];
        // min
        decoded.zclheader.min = {};
        if ((bytes[9] & 0x80) === 0x80) {
          decoded.zclheader.min.value = (bytes[9] - 0x80) * 256 + bytes[10];
          decoded.zclheader.min.unity = "minutes";
        } else {
          decoded.zclheader.min.value = bytes[9] * 256 + bytes[10];
          decoded.zclheader.min.unity = "seconds";
        }
        // max
        decoded.zclheader.max = {};
        if ((bytes[9] & 0x80) === 0x80) {
          decoded.zclheader.max.value = (bytes[9] - 0x80) * 256 + bytes[10];
          decoded.zclheader.max.unity = "minutes";
        } else {
          decoded.zclheader.max.value = bytes[9] * 256 + bytes[10];
          decoded.zclheader.max.unity = "seconds";
        }
      }
    }
  }
}
