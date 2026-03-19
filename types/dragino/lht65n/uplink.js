function cToF(celsius) {
  return Math.round(((celsius * 9) / 5 + 32) * 10) / 10;
}

function Str1(str2) {
  let str3 = "";
  for (let i = 0; i < str2.length; i++) {
    if (str2[i] <= 0x0f) {
      str2[i] = `0${str2[i].toString(16)}`;
    }
    str3 += `${str2[i].toString(16)}`;
  }
  return str3;
}

function strPad(byte) {
  const zero = "00";
  const hex = byte.toString(16);
  const tmp = 2 - hex.length;
  return `${zero.substr(0, tmp) + hex} `;
}

function getzf(cNum) {
  if (parseInt(cNum) < 10) {
    cNum = `0${cNum}`;
  }

  return cNum;
}

function getMyDate(str) {
  let cDate;
  if (str > 9999999999) {
    cDate = new Date(parseInt(str));
  } else {
    cDate = new Date(parseInt(str) * 1000);
  }

  const cYear = cDate.getFullYear();
  const cMonth = cDate.getMonth() + 1;
  const cDay = cDate.getDate();
  const cHour = cDate.getHours();
  const cMin = cDate.getMinutes();
  const cSen = cDate.getSeconds();
  const cTime = `${cYear}-${getzf(cMonth)}-${getzf(cDay)} ${getzf(
    cHour,
  )}:${getzf(cMin)}:${getzf(cSen)}`;

  return cTime;
}

function datalog(i, bytes) {
  const Ext = bytes[6] & 0x0f;
  let bb;
  if (Ext === 1 || Ext === 9) {
    bb = parseFloat(
      ((((bytes[0 + i] << 24) >> 16) | bytes[1 + i]) / 100).toFixed(2),
    );
  } else if (Ext === 2) {
    bb = parseFloat(
      ((((bytes[0 + i] << 24) >> 16) | bytes[1 + i]) / 100).toFixed(2),
    );
  } else if (Ext === 4) {
    const extiPinLevel = bytes[0 + i] ? "HIGH" : "LOW";
    const extiStatus = !!bytes[1 + i];
    bb = extiPinLevel + extiStatus;
  } else if (Ext === 5) {
    bb = (bytes[0 + i] << 8) | bytes[1 + i];
  } else if (Ext === 6) {
    bb = ((bytes[0 + i] << 8) | bytes[1 + i]) / 1000;
  } else if (Ext === 7) {
    bb = (bytes[0 + i] << 8) | bytes[1 + i];
  } else if (Ext === 8) {
    bb = (bytes[0 + i] << 8) | bytes[1 + i];
  }
  const cc = parseFloat(
    ((((bytes[2 + i] << 24) >> 16) | bytes[3 + i]) / 100).toFixed(2),
  );
  const dd = parseFloat(
    ((((bytes[4 + i] << 8) | bytes[5 + i]) & 0xfff) / 10).toFixed(1),
  );
  const ee = getMyDate(
    (
      (bytes[7 + i] << 24) |
      (bytes[8 + i] << 16) |
      (bytes[9 + i] << 8) |
      bytes[10 + i]
    ).toString(10),
  );
  const string = `[${bb},${cc},${dd},${ee}]` + `,`;

  return string;
}

function decoder(bytes, port) {
  const ext = bytes[6] & 0x0f;
  const pollMessageStatus = (bytes[6] >> 7) & 0x01;
  const connect = (bytes[6] & 0x80) >> 7;
  let decode = { lifecycle: {}, decoded: {}, external: {}, datalog: {} };
  if (
    port === 3 &&
    (bytes[2] === 0x01 ||
      bytes[2] === 0x02 ||
      bytes[2] === 0x03 ||
      bytes[2] === 0x04)
  ) {
    const array1 = [];
    const bytes1 = "0x";
    const str1 = Str1(bytes);
    const str2 = str1.substring(0, 6);
    const str3 = str1.substring(6);
    const reg = /.{4}/g;
    const rs = str3.match(reg);
    rs.push(str3.substring(rs.join("").length));
    rs.pop();
    const newSet = new Set(rs);
    const newArr = [...newSet];
    const data1 = newArr;
    decode.lifecycle.batteryVoltage = parseInt(
      (bytes1 + str2.substring(0, 4)) & 0x3fff,
    );
    let batteryLevel =
      Math.round((decode.lifecycle.batteryVoltage - 2.5) / 0.005 / 10) * 10;

    if (batteryLevel > 100) {
      batteryLevel = 100;
    } else if (batteryLevel < 0) {
      batteryLevel = 0;
    }

    decode.lifecycle.batteryLevel = batteryLevel;

    if (parseInt(bytes1 + str2.substring(4)) === 1) {
      decode.lifecycle.sensor = "DS18B20";
    } else {
      decode.lifecycle.sensor = "TMP117";
    }
    for (let i = 0; i < data1.length; i++) {
      const temp = parseInt(bytes1 + data1[i].substring(0, 4)) / 100;
      array1[i] = temp;
    }
    decode.decoded.temperature = array1;
    return decode;
  }
  switch (pollMessageStatus) {
    case 0:
      if (ext === 0x09 || ext === 0x0a) {
        decode.decoded.temperature = parseFloat(
          ((((bytes[0] << 24) >> 16) | bytes[1]) / 100).toFixed(2),
        );
        decode.decoded.temperatureF = cToF(decode.decoded.temperature);
        if (((bytes[0] << 8) | bytes[1]) === 0xffff) {
          decode.decoded.temperature = null;
          decode.decoded.temperatureF = null;
        }
        decode.lifecycle.batteryStatus = bytes[4] >> 6;
      } else {
        decode.lifecycle.batteryVoltage =
          (((bytes[0] << 8) | bytes[1]) & 0x3fff) / 1000;
        let batteryLevel =
          Math.round((decode.lifecycle.batteryVoltage - 2.5) / 0.005 / 10) * 10;

        if (batteryLevel > 100) {
          batteryLevel = 100;
        } else if (batteryLevel < 0) {
          batteryLevel = 0;
        }

        decode.lifecycle.batteryLevel = batteryLevel;

        let batteryStatus = bytes[0] >> 6;
        switch (batteryStatus) {
          case 0:
            batteryStatus = "ULTRA_LOW";
            break;
          case 1:
            batteryStatus = "LOW";
            break;
          case 2:
            batteryStatus = "OK";
            break;
          case 3:
            batteryStatus = "GOOD";
            break;

          default:
            break;
        }

        decode.lifecycle.batteryStatus = batteryStatus;
      }

      if (ext !== 0x0f) {
        decode.decoded.temperature = parseFloat(
          ((((bytes[2] << 24) >> 16) | bytes[3]) / 100).toFixed(2),
        );
        decode.decoded.temperatureF = cToF(decode.decoded.temperature);
        if (((bytes[2] << 8) | bytes[3]) === 0xffff) {
          decode.decoded.temperature = null;
          decode.decoded.temperatureF = null;
        }
        decode.decoded.humidity = parseFloat(
          ((((bytes[4] << 8) | bytes[5]) & 0xfff) / 10).toFixed(1),
        );
      }
      if (connect === 1) {
        decode.lifecycle.sensor = "SENSOR_NO_CONNECTION";
      }

      if (ext === 0) {
        decode.lifecycle.extSensor = "NO_EXTERNAL_SENSOR";
      } else if (ext === 1) {
        decode.lifecycle.extSensor = "TEMPERATURE_SENSOR";
        decode.external.tempDS = parseFloat(
          ((((bytes[7] << 24) >> 16) | bytes[8]) / 100).toFixed(2),
        );
        decode.external.tempDSF = cToF(decode.external.tempDS);
        if (((bytes[7] << 8) | bytes[8]) === 0xffff) {
          decode.external.tempDS = null;
          decode.external.tempDSF = null;
        }
      } else if (ext === 2) {
        decode.lifecycle.extSensor = "TEMPERATURE_SENSOR";
        decode.external.tempTMP117 = parseFloat(
          ((((bytes[7] << 24) >> 16) | bytes[8]) / 100).toFixed(2),
        );
        decode.external.tempTMP117F = cToF(decode.external.tempTMP117);
        if (((bytes[7] << 8) | bytes[8]) === 0xffff) {
          decode.external.tempTMP117 = null;
          decode.external.tempTMP117F = null;
        }
      } else if (ext === 4) {
        decode.lifecycle.workMode = "INTERRUPT_SENSOR";
        decode.external.extPinLevel = bytes[7] ? "HIGH" : "LOW";
        decode.external.extStatus = bytes[8] ? "TRUE" : "FALSE";
      } else if (ext === 5) {
        decode.lifecycle.workMode = "ILLUMINATION_SENSOR";
        decode.external.light = (bytes[7] << 8) | bytes[8];
      } else if (ext === 6) {
        decode.lifecycle.workMode = "ADC_SENSOR";
        decode.external.adc = ((bytes[7] << 8) | bytes[8]) / 1000;
      } else if (ext === 7) {
        decode.lifecycle.workMode = "INTERRUPT_SENSOR_COUNT";
        decode.external.count = (bytes[7] << 8) | bytes[8];
      } else if (ext === 8) {
        decode.lifecycle.workMode = "INTERRUPT_SENSOR_COUNT";
        decode.external.count =
          (bytes[7] << 24) | (bytes[8] << 16) | (bytes[9] << 8) | bytes[10];
      } else if (ext === 9) {
        decode.lifecycle.workMode = "DS18B20_TIMESTAMP";
        decode.lifecycle.systemTimestamp =
          (bytes[7] << 24) | (bytes[8] << 16) | (bytes[9] << 8) | bytes[10];
      } else if (ext === 15) {
        decode.lifecycle.workMode = "DS18B20ID";
        decode.external.id =
          strPad(bytes[2]) +
          strPad(bytes[3]) +
          strPad(bytes[4]) +
          strPad(bytes[5]) +
          strPad(bytes[7]) +
          strPad(bytes[8]) +
          strPad(bytes[9]) +
          strPad(bytes[10]);
      }
      if (bytes.length === 11) {
        return decode;
        // Illegal payload
      }
      if (bytes.length === 8) {
        decode = { lifecycle: {}, decoded: {}, external: {}, datalog: {} };
        return decode;
      }
      break;

    case 1:
      for (let i = 0; i < bytes.length; i += 11) {
        const da = datalog(i, bytes);
        if (i === 0) {
          decode.datalog.datalog = da;
        } else {
          decode.datalog.datalog += da;
        }
      }

      return decode;
    default:
      return {
        errors: ["UNKOWN"],
      };
  }
}

function consume(event) {
  const payload = event.data.payloadHex;
  const { port } = event.data;
  const bytes = Hex.hexToBytes(payload);

  const decoded = decoder(bytes, port);

  if (Object.keys(decoded.decoded).length > 0) {
    emit("sample", { data: decoded.lifecycle, topic: "lifecycle" });
    emit("sample", { data: decoded.decoded, topic: "default" });
  }

  if (Object.keys(decoded.external).length > 0) {
    emit("sample", { data: decoded.external, topic: "external" });
  }

  if (Object.keys(decoded.datalog).length > 0) {
    emit("sample", { data: decoded.datalog, topic: "datalog" });
  }
}
