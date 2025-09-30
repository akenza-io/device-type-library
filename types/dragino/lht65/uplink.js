function cToF(celsius) {
  return Math.round(((celsius * 9) / 5 + 32) * 10) / 10;
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

function strPad(byte) {
  const zero = "00";
  const hex = byte.toString(16);
  const tmp = 2 - hex.length;
  return `${zero.substr(0, tmp) + hex} `;
}

function datalog(i, bytes) {
  const ext = bytes[6] & 0x0f;
  let bb;
  if (ext === 1 || ext === 9) {
    bb = parseFloat(
      ((((bytes[0 + i] << 24) >> 16) | bytes[1 + i]) / 100).toFixed(2),
    );
  } else if (ext === 4) {
    const extiPinLevel = bytes[0 + i] ? "HIGH" : "LOW";
    const extiStatus = !!bytes[1 + i];
    bb = extiPinLevel + extiStatus;
  } else if (ext === 5) {
    bb = (bytes[0 + i] << 8) | bytes[1 + i];
  } else if (ext === 6) {
    bb = ((bytes[0 + i] << 8) | bytes[1 + i]) / 1000;
  } else if (ext === 7) {
    bb = (bytes[0 + i] << 8) | bytes[1 + i];
  } else if (ext === 8) {
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
  const string = `[${bb},${cc},${dd},${ee}],`;

  return string;
}

function decoder(bytes) {
  const ext = bytes[6] & 0x0f;
  const pollMessageStatus = (bytes[6] & 0x40) >> 6;
  const connect = (bytes[6] & 0x80) >> 7;
  const response = {};
  response.decoded = {};
  response.external = {};
  response.datalog = {};
  response.lifecycle = {};

  switch (pollMessageStatus) {
    case 0:
      if (ext === 0x09) {
        response.decoded.temperature = parseFloat(
          ((((bytes[0] << 24) >> 16) | bytes[1]) / 100).toFixed(2),
        );
        response.decoded.temperatureF = cToF(response.decoded.temperature);
        if (((bytes[0] << 8) | bytes[1]) === 0xffff) {
          response.decoded.temperature = null;
          response.decoded.temperatureF = null;
        }
        response.lifecycle.batteryStatus = bytes[4] >> 6;
      } else {
        response.lifecycle.batteryVoltage =
          (((bytes[0] << 8) | bytes[1]) & 0x3fff) / 1000;
        let batteryLevel =
          Math.round((response.lifecycle.batteryVoltage - 2.5) / 0.005 / 10) *
          10;

        if (batteryLevel > 100) {
          batteryLevel = 100;
        } else if (batteryLevel < 0) {
          batteryLevel = 0;
        }
        response.lifecycle.batteryLevel = batteryLevel;

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

        response.lifecycle.batteryStatus = batteryStatus;
      }

      if (ext !== 0x0f) {
        response.decoded.temperature = parseFloat(
          ((((bytes[2] << 24) >> 16) | bytes[3]) / 100).toFixed(2),
        );
        response.decoded.temperatureF = cToF(response.decoded.temperature);
        if (((bytes[2] << 8) | bytes[3]) === 0xffff) {
          response.decoded.temperature = null;
          response.decoded.temperatureF = null;
        }
        response.decoded.humidity = parseFloat(
          ((((bytes[4] << 8) | bytes[5]) & 0xfff) / 10).toFixed(1),
        );
      }

      if (connect === 1) {
        response.lifecycle.connectionStatus = "NO_CONNECTION";
      } else {
        response.lifecycle.connectionStatus = "CONNECTED";
      }

      response.lifecycle.externalSensor = !!ext;

      if (ext === 1) {
        response.external.externalTemperature = parseFloat(
          ((((bytes[7] << 24) >> 16) | bytes[8]) / 100).toFixed(2),
        );
        response.external.externalTemperatureF = cToF(
          response.external.externalTemperature,
        );
        if (((bytes[7] << 8) | bytes[8]) === 0xffff) {
          response.external.externalTemperature = null;
          response.external.externalTemperatureF = null;
        }
      } else if (ext === 4) {
        response.external.extPinLevel = bytes[7] ? "HIGH" : "LOW";
        response.external.extStatus = !!bytes[8];
      } else if (ext === 5) {
        response.external.light = (bytes[7] << 8) | bytes[8];
      } else if (ext === 6) {
        response.external.adc = ((bytes[7] << 8) | bytes[8]) / 1000;
      } else if (ext === 7) {
        response.external.count = (bytes[7] << 8) | bytes[8];
      } else if (ext === 8) {
        response.external.count =
          (bytes[7] << 24) | (bytes[8] << 16) | (bytes[9] << 8) | bytes[10];
      } else if (ext === 9) {
        response.external.sysTimestamp =
          (bytes[7] << 24) | (bytes[8] << 16) | (bytes[9] << 8) | bytes[10];
      } else if (ext === 15) {
        response.external.id =
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
        return response;
      }
      break;

    case 1:
      for (let i = 0; i < bytes.length; i += 11) {
        const da = datalog(i, bytes);
        if (i === 0) {
          response.datalog = da;
        } else {
          response.datalog += da;
        }
      }

      return response;

    default:
      return {
        errors: ["unknown"],
      };
  }
}

function hexToBytes(hex) {
  for (var bytes = [], c = 0; c < hex.length; c += 2) {
    bytes.push(parseInt(hex.substr(c, 2), 16));
  }
  return bytes;
}

function consume(event) {
  const payload = event.data.payloadHex;
  const bytes = hexToBytes(payload);

  const decoded = decoder(bytes);

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
