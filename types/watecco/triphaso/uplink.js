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

  if (port === 125) {
    // batch
    decodedBatch = !(bytes[0] & 0x01);

    // trame standard
    if (decodedBatch === false) {
      decoded.zclheader = {};
      decoded.zclheader.report = "standard";
      let attributeID = -1;
      let cmdID = -1;
      let clusterdID = -1;
      // endpoint
      decoded.zclheader.endpoint =
        ((bytes[0] & 0xe0) >> 5) | ((bytes[0] & 0x06) << 2);

      let key = "";
      let topic = "";
      switch (decoded.zclheader.endpoint) {
        case 0:
          key = "A";
          topic = "a";
          break;
        case 1:
          key = "B";
          topic = "b";
          break;
        case 2:
          key = "C";
          topic = "c";
          break;
        case 3:
          key = "ABC";
          topic = "abc";
          break;
        default:
          break;
      }
      // command ID
      cmdID = bytes[1];
      decoded.zclheader.cmdID = decimalToHex(cmdID, 2);
      // Cluster ID
      clusterdID = bytes[2] * 256 + bytes[3];
      decoded.zclheader.clusterdID = decimalToHex(clusterdID, 4);

      // decode report and read attribute response
      if ((cmdID === 0x0a) | (cmdID === 0x8a) | (cmdID === 0x01)) {
        const tab = {};

        // attribute ID
        attributeID = bytes[4] * 256 + bytes[5];
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

          phase[`pActiveEnergy${key}`] = UintToInt(
            bytes[index + 1] * 256 * 256 * 256 +
              bytes[index + 2] * 256 * 256 +
              bytes[index + 3] * 256 +
              bytes[index + 4],
            4,
          );
          phase[`nActiveEnergy${key}`] = UintToInt(
            bytes[index + 5] * 256 * 256 * 256 +
              bytes[index + 6] * 256 * 256 +
              bytes[index + 7] * 256 +
              bytes[index + 8],
            4,
          );
          phase[`pReactiveEnergy${key}`] = UintToInt(
            bytes[index + 9] * 256 * 256 * 256 +
              bytes[index + 10] * 256 * 256 +
              bytes[index + 11] * 256 +
              bytes[index + 12],
            4,
          );
          phase[`nReactiveEnergy${key}`] = UintToInt(
            bytes[index + 13] * 256 * 256 * 256 +
              bytes[index + 14] * 256 * 256 +
              bytes[index + 15] * 256 +
              bytes[index + 16],
            4,
          );
          phase[`pActivePowerW${key}`] = UintToInt(
            bytes[index + 17] * 256 * 256 * 256 +
              bytes[index + 18] * 256 * 256 +
              bytes[index + 19] * 256 +
              bytes[index + 20],
            4,
          );
          phase[`nActivePowerW${key}`] = UintToInt(
            bytes[index + 21] * 256 * 256 * 256 +
              bytes[index + 22] * 256 * 256 +
              bytes[index + 23] * 256 +
              bytes[index + 24],
            4,
          );
          phase[`pReactivePowerVar${key}`] = UintToInt(
            bytes[index + 25] * 256 * 256 * 256 +
              bytes[index + 26] * 256 * 256 +
              bytes[index + 27] * 256 +
              bytes[index + 28],
            4,
          );
          phase[`nReactivePowerVar${key}`] = UintToInt(
            bytes[index + 29] * 256 * 256 * 256 +
              bytes[index + 30] * 256 * 256 +
              bytes[index + 31] * 256 +
              bytes[index + 32],
            4,
          );

          emit("sample", {
            topic: `phase_${topic}`,
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
        attributeID = bytes[6] * 256 + bytes[7];
        decoded.zclheader.attributeID = decimalToHex(attributeID, 4);
        // status
        decoded.zclheader.status = bytes[4];
        // batch
        decoded.zclheader.decodedBatch = bytes[5];
      }

      // decode read configuration response
      if (cmdID === 0x09) {
        // attributeID
        attributeID = bytes[6] * 256 + bytes[7];
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
