function parseHexString(str) {
  let param = str;
  const result = [];
  while (param.length >= 2) {
    result.push(parseInt(param.substring(0, 2), 16));
    param = param.substring(2, param.length);
  }
  return result;
}

function parseStatusByte(statusByte) {
  let status = {};
  status.numSensors = statusByte & 0x10 ? 2 : 1;
  status.frameCounter = (statusByte & 0xe0) >> 5;
  status.hasTimestamp = !!(statusByte & 0x04);

  status.lowBattery = !!(statusByte & 0x02);
  status.configurationDone = !!(statusByte & 0x01);
  status.configurationInconsistency = !!(statusByte & 0x08);

  return status;
}

function alarmStatus(alarmByte) {
  switch (alarmByte) {
    case 0: return "NONE";
    case 1: return "HIGH_THRESHOLD";
    case 2: return "LOW_THRESHOLD";
    default: return "UNKNOWN"
  }
}

function consume(event) {
  const payload = event.data.payloadHex;
  const bytes = parseHexString(payload);
  const bits = Bits.hexToBits(payload);
  const decoded = {};
  const alert = {};
  const lifecycle = parseStatusByte(bytes[1]);
  let topic = "default";
  const frameCode = bytes[0];

  switch (frameCode) {
    case 0x00:
      lifecycle.configurationInconsistency = Boolean(bytes[1] & 0x08);
      lifecycle.configuration2ChannelsActivated = Boolean(bytes[1] & 0x10);
      break;
    case 0x10: {
      decoded.transmissionPeriodKeepAlive = Bits.bitsToUnsigned(bits.substr(0, 16)) * 10 / 60;
      const numberOfHistorization = Bits.bitsToUnsigned(bits.substr(16, 16));
      const numberOfSampling = Bits.bitsToUnsigned(bits.substr(32, 16));
      decoded.samplingPeriod = Bits.bitsToUnsigned(bits.substr(48, 16)) * 2 / 60;
      decoded.redundantSamples = Bits.bitsToUnsigned(bits.substr(64, 8));
      decoded.calculatedPeriodRecording = decoded.samplingPeriod * numberOfSampling * 2; // s
      decoded.calculatedSendingPeriod = decoded.samplingPeriod * numberOfSampling * numberOfHistorization * 2;
      topic = "configuration";
      break;
    }
    case 0x30:
    case 0x57: {
      decoded.temperature1 = Bits.bitsToSigned(bits.substr(16, 16)) / 10;
      decoded.temperature2 = Bits.bitsToSigned(bits.substr(32, 16)) / 10;
      topic = "default";
      break;
    }
    case 0x58:
      alert.prope1Alert = alarmStatus(payload[2]);
      decoded.temperature1 = Bits.bitsToSigned(bits.substr(24, 16)) / 10;
      alert.prope2Alert = alarmStatus(payload[5]);
      decoded.temperature2 = Bits.bitsToSigned(bits.substr(48, 16)) / 10;
      topic = "alert";
      break;
    default:
      break;
  }

  if (Object.keys(alert).length > 0) {
    emit("sample", { data: alert, topic: "alert" });
  }

  if (Object.keys(decoded).length > 0) {
    emit("sample", { data: decoded, topic: topic });
  }

  emit("sample", { data: lifecycle, topic: "lifecycle" });
}
