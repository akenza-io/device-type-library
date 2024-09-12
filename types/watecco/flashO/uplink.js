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

function brUncompress(tagsz, argList, hexString, batch_absolute_timestamp) {
  const out = initResult();
  const buffer = createBuffer(parseHexString(hexString));
  const flag = generateFlag(buffer.getNextSample(ST_U8));

  out.batch_counter = buffer.getNextSample(ST_U8, 3);
  buffer.getNextSample(ST_U8, 1);

  const temp = prePopulateOutput(out, buffer, argList, flag, tagsz);
  let { last_timestamp } = temp;
  const { index_of_the_first_sample } = temp;

  if (flag.hasSample) {
    last_timestamp = uncompressSamplesData(
      out,
      buffer,
      index_of_the_first_sample,
      argList,
      last_timestamp,
      flag,
      tagsz,
    );
  }

  out.batch_relative_timestamp = extractTimestampFromBuffer(
    buffer,
    last_timestamp,
  );
  return adaptToExpectedFormat(out, argList, batch_absolute_timestamp);
}

/// //////////// Sub functions ///////////////

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
    batch_relative_timestamp: 0,
    series,
  };
}

function createBuffer(byteArray) {
  const index = 0;
  function bitsBuf2HuffPattern(byteArray, index, nb_bits) {
    let sourceBitStart = index;
    const sz = nb_bits - 1;
    if (byteArray.length * 8 < sourceBitStart + nb_bits) {
      throw "Verify that dest buf is large enough";
    }
    let bittoread = 0;
    let pattern = 0;
    while (nb_bits > 0) {
      if (byteArray[sourceBitStart >> 3] & (1 << (sourceBitStart & 0x07))) {
        pattern |= 1 << (sz - bittoread);
      }
      nb_bits--;
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
        throw "Mauvais sampletype";
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
        (sampleType == ST_I4 ||
          sampleType == ST_I8 ||
          sampleType == ST_I16 ||
          sampleType == ST_I24) &&
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
    getNextBifromHi(huff_coding) {
      for (let i = 2; i < 12; i++) {
        const lhuff = bitsBuf2HuffPattern(this.byteArray, this.index, i);
        for (let j = 0; j < HUFF[huff_coding].length; j++) {
          if (
            HUFF[huff_coding][j].sz == i &&
            lhuff == HUFF[huff_coding][j].lbl
          ) {
            this.index += i;
            return j;
          }
        }
      }
      throw "Bi not found in HUFF table";
    },
  };
}

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

function prePopulateOutput(out, buffer, argList, flag, tagsz) {
  let currentTimestamp = 0;
  let index_of_the_first_sample = 0;
  for (let i = 0; i < flag.nb_of_type_measure; i++) {
    const tag = {
      size: tagsz,
      lbl: buffer.getNextSample(ST_U8, tagsz),
    };
    const sampleIndex = findIndexFromArgList(argList, tag);

    if (i == 0) {
      index_of_the_first_sample = sampleIndex;
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
    last_timestamp: currentTimestamp,
    index_of_the_first_sample,
  };
}

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

function findIndexFromArgList(argList, tag) {
  for (let i = 0; i < argList.length; i++) {
    if (argList[i].taglbl === tag.lbl) {
      return i;
    }
  }
  throw "Cannot find index in argList";
}

function extractTimestampFromBuffer(buffer, baseTimestamp) {
  if (baseTimestamp) {
    const bi = buffer.getNextBifromHi(1);
    return computeTimestampFromBi(buffer, baseTimestamp, bi);
  }
  return buffer.getNextSample(ST_U32);
}

function computeTimestampFromBi(buffer, baseTimestamp, bi) {
  if (bi > BR_HUFF_MAX_INDEX_TABLE) {
    return buffer.getNextSample(ST_U32);
  }
  if (bi > 0) {
    return computeTimestampFromPositiveBi(buffer, baseTimestamp, bi);
  }
  return baseTimestamp;
}

function computeTimestampFromPositiveBi(buffer, baseTimestamp, bi) {
  return buffer.getNextSample(ST_U32, bi) + baseTimestamp + Math.pow(2, bi) - 1;
}

function getMeasure(buffer, sampletype) {
  const v = buffer.getNextSample(sampletype);
  return sampletype === ST_FL ? bytes2Float32(v) : v;
}

function bytes2Float32(bytes) {
  const sign = bytes & 0x80000000 ? -1 : 1;
  let exponent = ((bytes >> 23) & 0xff) - 127;
  let significand = bytes & ~(-1 << 23);

  if (exponent == 128) {
    return sign * (significand ? Number.NaN : Number.POSITIVE_INFINITY);
  }

  if (exponent == -127) {
    if (significand == 0) {
      return sign * 0.0;
    }
    exponent = -126;
    significand /= 1 << 22;
  } else {
    significand = (significand | (1 << 23)) / (1 << 23);
  }

  return sign * significand * Math.pow(2, exponent);
}

function uncompressSamplesData(
  out,
  buffer,
  index_of_the_first_sample,
  argList,
  last_timestamp,
  flag,
  tagsz,
) {
  if (flag.isCommonTimestamp) {
    return handleCommonTimestamp(
      out,
      buffer,
      index_of_the_first_sample,
      argList,
      flag,
      tagsz,
    );
  }
  return handleSeparateTimestamp(
    out,
    buffer,
    argList,
    last_timestamp,
    flag,
    tagsz,
  );
}

function handleCommonTimestamp(
  out,
  buffer,
  index_of_the_first_sample,
  argList,
  flag,
  tagsz,
) {
  // number of sample
  const nb_sample_to_parse = buffer.getNextSample(ST_U8, 8);
  const tag = {};

  const temp = initTimestampCommonTable(
    out,
    buffer,
    nb_sample_to_parse,
    index_of_the_first_sample,
  );
  const { timestampCommon } = temp;
  const { lastTimestamp } = temp;

  for (let j = 0; j < flag.nb_of_type_measure; j++) {
    let first_null_delta_value = 1;
    tag.lbl = buffer.getNextSample(ST_U8, tagsz);
    const sampleIndex = findIndexFromArgList(argList, tag);
    for (let i = 0; i < nb_sample_to_parse; i++) {
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
            if (first_null_delta_value) {
              // First value is yet recorded starting from the header
              first_null_delta_value = 0;
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

function initTimestampCommonTable(
  out,
  buffer,
  nbSampleToParse,
  firstSampleIndex,
) {
  const timestampCommon = [];
  let lastTimestamp = 0;
  const timestampCoding = buffer.getNextSample(ST_U8, 2);
  for (let i = 0; i < nbSampleToParse; i++) {
    // delta timestamp
    const bi = buffer.getNextBifromHi(timestampCoding);
    if (bi <= BR_HUFF_MAX_INDEX_TABLE) {
      if (i == 0) {
        timestampCommon.push(
          out.series[firstSampleIndex].uncompressSamples[0]
            .data_relative_timestamp,
        );
      } else if (bi > 0) {
        var precedingTimestamp = timestampCommon[i - 1];
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

function handleSeparateTimestamp(
  out,
  buffer,
  argList,
  last_timestamp,
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
        if (currentMeasure.data_relative_timestamp > last_timestamp) {
          last_timestamp = currentMeasure.data_relative_timestamp;
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
  return last_timestamp;
}

function adaptToExpectedFormat(out, argList, batchAbsoluteTimestamp) {
  const returnedGlobalObject = {
    // batch_counter: out.batch_counter,
    // batch_relative_timestamp: out.batch_relative_timestamp
  };
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
              out.batch_relative_timestamp,
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
  if (exponent == 128) {
    return sign * (significand ? Number.NaN : Number.POSITIVE_INFINITY);
  }

  if (exponent == -127) {
    if (significand == 0) return sign * 0.0;
    exponent = -126;
    significand /= 1 << 22;
  } else significand = (significand | (1 << 23)) / (1 << 23);

  return sign * significand * Math.pow(2, exponent);
}

function Decoder(bytes, port) {
  // Decode an uplink message from a buffer
  // (array) of bytes to an object of fields.
  var decoded = {};
  let attributID = -1;
  let cmdID = -1;
  let clusterdID = -1;
  let decodedBatch = {};
  let index = 0;

  const lora = {};

  // decoded.lora.port  = port;

  // Get raw payload
  const bytes_len_ = bytes.length;
  let temp_hex_str = "";

  lora.payload = "";

  for (let j = 0; j < bytes_len_; j++) {
    temp_hex_str = bytes[j].toString(16).toUpperCase();
    if (temp_hex_str.length == 1) {
      temp_hex_str = `0${temp_hex_str}`;
    }
    lora.payload += temp_hex_str;
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
      attributID = -1;
      cmdID = -1;
      clusterdID = -1;
      // endpoint
      decoded.zclheader.endpoint =
        ((bytes[0] & 0xe0) >> 5) | ((bytes[0] & 0x06) << 2);
      // command ID
      cmdID = bytes[1];
      decoded.zclheader.cmdID = decimalToHex(cmdID, 2);
      // Cluster ID
      clusterdID = bytes[2] * 256 + bytes[3];
      decoded.zclheader.clusterdID = decimalToHex(clusterdID, 4);

      // decode report and read atrtribut response
      if ((cmdID === 0x0a) | (cmdID === 0x8a) | (cmdID === 0x01)) {
        const stdData = {};
        var tab = [];

        // Attribut ID
        attributID = bytes[4] * 256 + bytes[5];
        decoded.zclheader.attributID = decimalToHex(attributID, 4);

        if (cmdID === 0x8a) {
          decoded.zclheader.alarm = 1;
        } else {
          decoded.zclheader.alarm = 0;
        }

        // data index start
        if ((cmdID === 0x0a) | (cmdID === 0x8a)) index = 7;
        // if (cmdID === 0x01) {index = 8; decoded.zclheader.status = bytes[6];}

        // binary input counter
        if ((clusterdID === 0x000f) & (attributID === 0x0402)) {
          stdData.label = "Index1";
          stdData.value =
            bytes[index] * 256 * 256 * 256 +
            bytes[index + 1] * 256 * 256 +
            bytes[index + 2] * 256 +
            bytes[index + 3];
          stdData.date = lDate;
          tab.push(stdData);
        }

        // binary input present value
        if ((clusterdID === 0x000f) & (attributID === 0x0055)) {
          // if (decoded.zclheader.endpoint < 3){
          //   stdData.label = "Index"+(decoded.zclheader.endpoint+1) ;
          // }

          // if ((decoded.zclheader.endpoint >= 3)&&(decoded.zclheader.endpoint < 6)){
          //   stdData.label = "State"+(decoded.zclheader.endpoint-2) ;
          // }
          stdData.label = "Index1";
          stdData.value = bytes[index];
          stdData.date = lDate;
          tab.push(stdData);
        }

        // lorawan message type
        if ((clusterdID === 0x8004) & (attributID === 0x0000)) {
          if (bytes[index] === 1) {
            stdData.message_type = "confirmed";
          }
          if (bytes[index] === 0) {
            stdData.message_type = "unconfirmed";
          }
        }

        // lorawan retry
        if ((clusterdID === 0x8004) & (attributID === 0x0001)) {
          stdData.nb_retry = bytes[index];
        }

        // lorawan reassociation
        if ((clusterdID === 0x8004) & (attributID === 0x0002)) {
          stdData.period_in_minutes = bytes[index + 1] * 256 + bytes[index + 2];
          stdData.nb_err_frames = bytes[index + 3] * 256 + bytes[index + 4];
        }

        // configuration node power desc

        let index2;
        if ((clusterdID === 0x0050) & (attributID === 0x0006)) {
          index2 = index + 3;
          if ((bytes[index + 2] & 0x01) === 0x01) {
            tab.push({
              label: "ExternalPowerVoltage",
              value: (bytes[index2] * 256 + bytes[index2 + 1]) / 1000,
              date: lDate,
            });
            index2 += 2;
          }
          if ((bytes[index + 2] & 0x04) === 0x04) {
            tab.push({
              label: "BatteryVoltage",
              value: (bytes[index2] * 256 + bytes[index2 + 1]) / 1000,
              date: lDate,
            });
            index2 += 2;
          }
          if ((bytes[index + 2] & 0x02) === 0x02) {
            decoded.data.rechargeable_battery_voltage =
              (bytes[index2] * 256 + bytes[index2 + 1]) / 1000;
            index2 += 2;
          }
          if ((bytes[index + 2] & 0x08) === 0x08) {
            decoded.data.solar_harvesting_voltage =
              (bytes[index2] * 256 + bytes[index2 + 1]) / 1000;
            index2 += 2;
          }
          if ((bytes[index + 2] & 0x10) === 0x10) {
            decoded.data.tic_harvesting_voltage =
              (bytes[index2] * 256 + bytes[index2 + 1]) / 1000;
            index2 += 2;
          }
        }
        decoded.data = tab;
      }

      // decode configuration response
      if (cmdID === 0x07) {
        // AttributID
        attributID = bytes[6] * 256 + bytes[7];
        decoded.zclheader.attributID = decimalToHex(attributID, 4);
        // status
        decoded.zclheader.status = bytes[4];
        // batch
        decoded.zclheader.decodedBatch = bytes[5];
      }

      // decode read configuration response
      if (cmdID === 0x09) {
        // AttributID
        attributID = bytes[6] * 256 + bytes[7];
        decoded.zclheader.attributID = decimalToHex(attributID, 4);
        // status
        decoded.zclheader.status = bytes[4];
        // batch
        decoded.zclheader.decodedBatch = bytes[5];
        // AttributType
        decoded.zclheader.attribut_type = bytes[8];
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
    } else {
      var decoded = {};

      /*
        TODO: No Hardcode
        This function needs to be filled with all the different channels and indexes depending on the batch report.
        Maybe make them customfields.
      */

      const brData = brUncompress(
        4,
        [
          { taglbl: 0, resol: 1, sampletype: 10, lblname: "Index1", divide: 1 },
          { taglbl: 1, resol: 1, sampletype: 10, lblname: "Index2", divide: 1 },
          { taglbl: 2, resol: 1, sampletype: 10, lblname: "Index3", divide: 1 },
          { taglbl: 3, resol: 1, sampletype: 10, lblname: "State1", divide: 1 },
          { taglbl: 4, resol: 1, sampletype: 10, lblname: "State2", divide: 1 },
          { taglbl: 5, resol: 1, sampletype: 10, lblname: "State3", divide: 1 },
          {
            taglbl: 6,
            resol: 100,
            sampletype: 6,
            lblname: "BatteryLevel",
            divide: 1,
          },
          {
            taglbl: 7,
            resol: 1,
            sampletype: 6,
            lblname: "MultiState",
            divide: 1,
          },
        ],
        lora.payload,
        lDate,
      );

      const data_length = brData.datas.length;
      var tab = [];
      for (let i = 0; i < data_length; i++) {
        tab.push({
          label: brData.datas[i].data.label,
          value: brData.datas[i].data.value,
          date: brData.datas[i].date,
        });
      }

      decoded.data = tab;

      decoded.zclheader = {};
      decoded.zclheader.report = "batch";
    }
  }
  return decoded;
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

function consume(event) {
  const payload = event.data.payloadHex;
  const { port } = event.data;
  const raw = Decoder(Hex.hexToBytes(payload), port);
  const state = event.state || {};

  raw.data.forEach((point) => {
    const data = {};
    if (point.label === "BatteryVoltage") {
      emit("sample", {
        data: { batteryVoltage: point.value },
        topic: "lifecycle",
      });
    } else {
      const phase = point.label.substr(-1);
      data.pulse = point.value;

      data.relativePulse = calculateIncrement(
        state[`lastPulse${phase}`],
        data.pulse,
      );
      state[`lastPulse${phase}`] = data.pulse;

      // Customfields
      if (event.device !== undefined) {
        if (event.device.customFields !== undefined) {
          const { customFields } = event.device;
          let pulseType = "";
          let multiplier = 1;
          let divider = 1;

          if (customFields[`pulseType${phase}`] !== undefined) {
            pulseType = customFields[`pulseType${phase}`];
          }

          if (customFields[`multiplier${phase}`] !== undefined) {
            multiplier = Number(customFields[`multiplier${phase}`]);
          }

          if (customFields[`divider${phase}`] !== undefined) {
            divider = Number(customFields[`divider${phase}`]);
          }

          if (data.relativePulse !== undefined) {
            if (pulseType !== "") {
              data[pulseType] =
                Math.round(
                  ((data.relativePulse * multiplier) / divider) * 1000,
                ) / 1000;
              data[`${pulseType}Cumulative`] =
                Math.round(((data.pulse * multiplier) / divider) * 1000) / 1000;
            }
          }
        }
      }
      emit("sample", { data, topic: `phase${phase}` });
    }
  });

  emit("state", state);
}
