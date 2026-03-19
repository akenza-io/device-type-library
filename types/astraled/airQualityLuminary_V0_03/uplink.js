function cToF(celsius) {
  return Math.round(((celsius * 9) / 5 + 32) * 10) / 10;
}

// Decoder Protocol Version 0.03

function bytesToFloat(bytes) {
  const bitsFloat = bytes;
  const sign = bitsFloat >>> 31 === 0 ? 1.0 : -1.0;
  const e = (bitsFloat >>> 23) & 0xff;
  const m =
    e === 0 ? (bitsFloat & 0x7fffff) << 1 : (bitsFloat & 0x7fffff) | 0x800000;
  const f = sign * m * Math.pow(2, e - 150);
  return f;
}
function swap16(val) {
  return ((val & 0xff) << 8) | ((val >> 8) & 0xff);
}
function swap32(val) {
  return (
    ((val << 24) & 0xff000000) |
    ((val << 8) & 0x00ff0000) |
    ((val >> 8) & 0x0000ff00) |
    ((val >> 24) & 0x000000ff)
  );
}
function getByte(buff, nr) {
  return Bits.bitsToUnsigned(buff.substr(nr * 8, 8));
}
function getWord(buff, nr) {
  return swap16(Bits.bitsToUnsigned(buff.substr(nr * 8, 16)));
}
function getLong(buff, nr) {
  return swap32(Bits.bitsToUnsigned(buff.substr(nr * 8, 32)));
}
function getFloat(buff, nr) {
  return bytesToFloat(getLong(buff, nr));
}

function consume(event) {
  const { payloadHex } = event.data;
  const buff = Bits.hexToBits(payloadHex);

  const dataSize = payloadHex.length / 2;

  const data = {};
  const lifecycle = {};

  let rdPos = 0;

  do {
    const paraSize = getByte(buff, rdPos++) & 0x3f; // get size
    const paraType = getByte(buff, rdPos++); // get type

    switch (paraType) {
      case 1:
        lifecycle.protocolVersion = `V:${getByte(buff, rdPos + 1)}.${getByte(
          buff,
          rdPos,
        )}`;
        break;
      case 2:
        lifecycle.appVersion = `V:${getByte(buff, rdPos + 2)}.${getByte(
          buff,
          rdPos + 1,
        )}p${getByte(buff, rdPos)}`;
        break;
      case 3:
        lifecycle.loraStackVersion = `V:${getByte(buff, rdPos + 2)}.${getByte(
          buff,
          rdPos + 1,
        )}.${getByte(buff, rdPos)}`;
        break;
      case 4:
        lifecycle.loraVersion = `V:${getByte(buff, rdPos + 2)}.${getByte(
          buff,
          rdPos + 1,
        )}.${getByte(buff, rdPos)}`;
        break;
      case 5:
        lifecycle.msgNr = getByte(buff, rdPos);
        lifecycle.cmd0 = getByte(buff, rdPos + 1);
        lifecycle.cmd1 = getByte(buff, rdPos + 2);
        lifecycle.cmd2 = getByte(buff, rdPos + 3);
        lifecycle.cmd3 = getByte(buff, rdPos + 4);
        lifecycle.cmd4 = getByte(buff, rdPos + 5);
        lifecycle.cmd5 = getByte(buff, rdPos + 6);
        lifecycle.cmd6 = getByte(buff, rdPos + 7);
        lifecycle.cmd7 = getByte(buff, rdPos + 8);
        break;
      case 6:
        switch (getByte(buff, rdPos)) {
          case 1:
            lifecycle.msgCycleTime1 = getWord(buff, rdPos + 1);
            break;
          case 2:
            lifecycle.msgCycleTime2 = getWord(buff, rdPos + 1);
            break;
          case 3:
            lifecycle.msgCycleTime3 = getWord(buff, rdPos + 1);
            break;
          case 4:
            lifecycle.msgCycleTime4 = getWord(buff, rdPos + 1);
            break;
          case 5:
            lifecycle.msgCycleTime5 = getWord(buff, rdPos + 1);
            break;
          case 6:
            lifecycle.msgCycleTime6 = getWord(buff, rdPos + 1);
            break;
          case 7:
            lifecycle.msgCycleTime7 = getWord(buff, rdPos + 1);
            break;
          case 8:
            lifecycle.msgCycleTime8 = getWord(buff, rdPos + 1);
            break;
          default:
            break;
        }
        break;
      case 9:
        data.temperature = getWord(buff, rdPos) / 100;
        data.temperatureF = cToF(data.temperature);
        break;
      case 10:
        data.humidity = getWord(buff, rdPos) / 10;
        break;
      case 11:
        data.voc = getWord(buff, rdPos);
        break;
      case 12:
        data.co2 = getWord(buff, rdPos);
        break;
      case 13:
        data.eco2 = getWord(buff, rdPos);
        break;
      case 14:
        lifecycle.iaqStateInt = getByte(buff, rdPos);
        break;
      case 15:
        lifecycle.iaqStateExt = getByte(buff, rdPos);
        break;
      case 16:
        data.pm1_0 = getFloat(buff, rdPos);
        break;
      case 17:
        data.pm2_5 = getFloat(buff, rdPos);
        break;
      case 18:
        data.pm4_0 = getFloat(buff, rdPos);
        break;
      case 19:
        data.pm10 = getFloat(buff, rdPos);
        break;
      case 20:
        lifecycle.iaqParticelTypSize = getFloat(buff, rdPos);
        break;
      case 21:
        lifecycle.iaqThresholdCo2Good = getWord(buff, rdPos);
        lifecycle.iaqThresholdVocGood = getWord(buff, rdPos + 2);
        break;
      case 22:
        lifecycle.iaqThresholdCo2StillOk = getWord(buff, rdPos);
        lifecycle.iaqThresholdVocStillOk = getWord(buff, rdPos + 2);
        break;
      case 23:
        lifecycle.iaqThresholdCo2Bad = getWord(buff, rdPos);
        lifecycle.iaqThresholdVocBad = getWord(buff, rdPos + 2);
        break;
      case 24:
        lifecycle.iaqFilterTime = getByte(buff, rdPos);
        lifecycle.iaqHysteresisCo2 = getByte(buff, rdPos + 1);
        lifecycle.iaqHysteresisVoc = getByte(buff, rdPos + 2);
        break;
      case 25:
        lifecycle.iaqRgbwGoodRed = getByte(buff, rdPos);
        lifecycle.iaqRgbwGoodGreen = getByte(buff, rdPos + 1);
        lifecycle.iaqRgbwGoodBlue = getByte(buff, rdPos + 2);
        break;
      case 26:
        lifecycle.iaqRgbwStillOkRed = getByte(buff, rdPos);
        lifecycle.iaqRgbwStillOkGreen = getByte(buff, rdPos + 1);
        lifecycle.iaqRgbwStillOkBlue = getByte(buff, rdPos + 2);
        break;
      case 27:
        lifecycle.iaqRgbwBadRed = getByte(buff, rdPos);
        lifecycle.iaqRgbwBadGreen = getByte(buff, rdPos + 1);
        lifecycle.iaqRgbwBadBlue = getByte(buff, rdPos + 2);
        break;
      case 28:
        lifecycle.iaqRgbwDeadlyRed = getByte(buff, rdPos);
        lifecycle.iaqRgbwDeadlyGreen = getByte(buff, rdPos + 1);
        lifecycle.iaqRgbwDeadlyBlue = getByte(buff, rdPos + 2);
        break;
      case 29:
        lifecycle.iaqRgbwWarmupRed = getByte(buff, rdPos);
        lifecycle.iaqRgbwWarmupGreen = getByte(buff, rdPos + 1);
        lifecycle.iaqRgbwWarmupBlue = getByte(buff, rdPos + 2);
        break;
      case 30:
        lifecycle.iaqRgbwDimming = getByte(buff, rdPos);
        break;
      case 31:
        lifecycle.iaqVisualisation = getByte(buff, rdPos);
        break;
      case 32:
        data.altitude = getWord(buff, rdPos);
        break;
      case 33:
        data.latitude = getFloat(buff, rdPos);
        break;
      case 34:
        data.longitude = getFloat(buff, rdPos);
        break;
      case 35:
        data.lightState = getByte(buff, rdPos);
        break;
      case 37:
        lifecycle.lightSetCct = getWord(buff, rdPos);
        break;
      case 38:
        lifecycle.lightSetLux = getWord(buff, rdPos);
        break;
      case 39:
        lifecycle.lightLightLevel = getWord(buff, rdPos);
        break;
      case 40:
        lifecycle.deviceTemperature = getByte(buff, rdPos);
        lifecycle.deviceTemperatureF = cToF(lifecycle.deviceTemperature);
        break;
      case 41:
        lifecycle.error = getLong(buff, rdPos);
        break;
      case 42:
        lifecycle.actPwr = getFloat(buff, rdPos);
        break;
      case 43:
        lifecycle.energy = getFloat(buff, rdPos);
        break;
      case 44:
        lifecycle.sensorAmbientLight = getWord(buff, rdPos);
        break;
      case 45:
        lifecycle.sensorCct = getWord(buff, rdPos);
        break;
      case 48:
        lifecycle.iaqTempatureCompOff = getWord(buff, rdPos);
        lifecycle.iaqTempatureCompOn = getWord(buff, rdPos + 2);
        break;
      case 50:
        lifecycle.nbOfGroups = getByte(buff, rdPos);
        break;
      case 46:
        lifecycle.paramAddr = getWord(buff, rdPos + 5);
        lifecycle.paramDat = getLong(buff, rdPos + 7);
        break;
      case 51:
        lifecycle.iaqRgbRed = getByte(buff, rdPos);
        lifecycle.iaqRgbGreen = getByte(buff, rdPos + 1);
        lifecycle.iaqRgbBlue = getByte(buff, rdPos + 2);
        break;
      case 52:
        lifecycle.iaqAsc = getByte(buff, rdPos);
        break;
      case 53:
        lifecycle.rawPwr = getFloat(buff, rdPos);
        break;
      case 54:
        lifecycle.rawEnergy = getFloat(buff, rdPos);
        break;
      default:
        lifecycle.unkown = getLong(buff, rdPos);
        break;
    }
    rdPos += paraSize;
  } while (rdPos < dataSize);

  if (lifecycle !== {}) {
    emit("sample", { data: lifecycle, topic: "lifecycle" });
  }

  if (data !== {}) {
    emit("sample", { data, topic: "default" });
  }
}
