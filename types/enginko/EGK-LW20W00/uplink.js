function hexStringToByteArray(s) {
  for (var bytes = [], c = 0; c < s.length; c += 2) {
    bytes.push(parseInt(s.substr(c, 2), 16));
  }

  return bytes;
}

function getPressure(lo, mi, hi) {
  let pressure = String(
    (lo & 0xff) + ((mi << 8) & 0xff00) + ((hi << 16) & 0xff0000),
  ).padStart(3);
  pressure = `${pressure.substring(
    0,
    pressure.length - 2,
  )}.${pressure.substring(pressure.length - 2)}`;
  return Number(pressure).toFixed(2);
}

function parseDateByte(payload) {
  let date = new Date();
  let binary =
    (payload[0] & 0xff) +
    ((payload[1] << 8) & 0xff00) +
    ((payload[2] << 16) & 0xff0000) +
    ((payload[3] << 24) & 0xff000000);
  let second = binary & 0x1f;
  second *= 2;
  binary >>= 5;
  const minute = binary & 0x3f;
  binary >>= 6;
  const hour = binary & 0x1f;
  binary >>= 5;
  const day = binary & 0x1f;
  binary >>= 5;
  const month = binary & 0x0f;
  binary >>= 4;
  let year = binary & 0x7f;
  year += 2000;
  date = new Date(
    year,
    month - 1,
    day,
    hour,
    minute,
    second,
    0,
  ).toLocaleString();
  return date;
}

function getTemperature(lo, hi) {
  let temperature = String(
    (((lo & 0xff) + ((hi << 8) & 0xff00)) << 16) >> 16,
  ).padStart(3);
  temperature = `${temperature.substring(
    0,
    temperature.length - 2,
  )}.${temperature.substring(temperature.length - 2)}`;
  return Number(temperature).toFixed(2);
}

function getHumidity(lo) {
  const humidity = (((((0 & 0xff) << 8) | (lo & 0xff)) << 16) >> 16) / 2;
  return Number(humidity).toFixed(2);
}

function parseTimeSync(payload) {
  const uplinkId = payload.substring(0, 2);
  if (uplinkId.toUpperCase() === "01") {
    const syncID = {
      variable: "syncID",
      value: payload.substring(2, 10),
    };
    const syncVersion = {
      variable: "syncVersion",
      value: `${payload.substring(10, 12)}.${payload.substring(
        12,
        14,
      )}.${payload.substring(14, 16)}`,
    };
    const applicationType = {
      variable: "applicationType",
      value: payload.substring(16, 20),
    };
    const rfu = {
      variable: "rfu",
      value: payload.substring(20),
    };

    return [syncID, syncVersion, applicationType, rfu];
  }
  return null;
}

function parseLevel(payload) {
  const r = [];

  const payloadToByteArray = hexStringToByteArray(payload);
  const typeNumber = ((0x00 << 8) & 0xff00) | (payloadToByteArray[1] & 0xff);
  const type = {
    variable: "type",
    value: typeNumber,
  };
  r.push(type);

  let date;
  let adc;
  let distance;
  let batteryLevel;
  let error;

  let startData = 2;
  switch (typeNumber) {
    case 0x00: {
      startData = 6;
      date = {
        variable: "date",
        value: parseDateByte(payloadToByteArray.slice(2, startData)),
      };
      r.push(date);

      adc = {
        variable: "adc",
        value: Number(
          ((payloadToByteArray[startData + 1] << 8) & 0xff00) |
            (payloadToByteArray[startData] & 0xff),
        ).toFixed(),
        unit: "mV",
      };
      r.push(adc);
      startData += 2;
      startData += 2;

      if (startData + 2 <= payloadToByteArray.length) {
        const distanceNumber = Number(
          ((payloadToByteArray[startData + 1] << 8) & 0xff00) |
            (payloadToByteArray[startData] & 0xff),
        ).toFixed();
        if (distanceNumber <= 60000) {
          distance = {
            variable: "distance",
            value: distanceNumber,
            unit: "mm",
          };
          r.push(distance);
        } else {
          error = {
            variable: "distance",
            value: `distance error [${distanceNumber}]`,
          };
          r.push(error);
        }
      }
      startData += 2;

      if (startData + 1 === payloadToByteArray.length) {
        batteryLevel = {
          variable: "batteryLevel",
          value: Number(parseInt(payloadToByteArray[startData])).toFixed(),
          unit: "%",
        };
        r.push(batteryLevel);
      }

      return r;
    }
    case 0x01: {
      startData = 6;
      date = {
        variable: "date",
        value: parseDateByte(payloadToByteArray.slice(2, startData)),
      };
      r.push(date);

      adc = {
        variable: "adc",
        value: Number(
          ((payloadToByteArray[startData + 1] << 8) & 0xff00) |
            (payloadToByteArray[startData] & 0xff),
        ).toFixed(),
        unit: "mV",
      };
      r.push(adc);
      startData += 2;
      startData += 2;

      if (startData + 2 <= payloadToByteArray.length) {
        const distanceNumber = Number(
          ((payloadToByteArray[startData + 1] << 8) & 0xff00) |
            (payloadToByteArray[startData] & 0xff),
        ).toFixed();
        if (distanceNumber <= 60000) {
          distance = {
            variable: "distance",
            value: distanceNumber,
            unit: "mm",
          };
          r.push(distance);
        } else {
          error = {
            variable: "distance",
            value: `distance error [${distanceNumber}]`,
          };
          r.push(error);
        }
      }
      startData += 2;

      const fillLevel = {
        variable: "fillLevel",
        value: Number(parseInt(payloadToByteArray[startData])).toFixed(),
        unit: "%",
      };
      r.push(fillLevel);
      startData += 1;

      const temperature = {
        variable: "temperature",
        value: getTemperature(
          payloadToByteArray[startData],
          payloadToByteArray[startData + 1],
        ),
        unit: "C",
      };
      r.push(temperature);
      startData += 2;

      if (startData + 1 === payloadToByteArray.length) {
        batteryLevel = {
          variable: "batteryLevel",
          value: Number(parseInt(payloadToByteArray[startData])).toFixed(),
          unit: "%",
        };
        r.push(batteryLevel);
      }

      return r;
    }
    case 0x02: {
      startData = 6;
      date = {
        variable: "date",
        value: parseDateByte(payloadToByteArray.slice(2, startData)),
      };
      r.push(date);

      adc = {
        variable: "adc",
        value: Number(
          ((payloadToByteArray[startData + 1] << 8) & 0xff00) |
            (payloadToByteArray[startData] & 0xff),
        ).toFixed(),
        unit: "mV",
      };
      r.push(adc);
      startData += 2;
      startData += 2;

      if (startData + 2 <= payloadToByteArray.length) {
        const distanceNumber = Number(
          ((payloadToByteArray[startData + 1] << 8) & 0xff00) |
            (payloadToByteArray[startData] & 0xff),
        ).toFixed();
        if (distanceNumber <= 60000) {
          distance = {
            variable: "distance",
            value: distanceNumber,
            unit: "mm",
          };
          r.push(distance);
        } else {
          error = {
            variable: "distance",
            value: `distance error [${distanceNumber}]`,
          };
          r.push(error);
        }
      }
      startData += 2;

      const temperature = {
        variable: "temperature",
        value: getTemperature(
          payloadToByteArray[startData],
          payloadToByteArray[startData + 1],
        ),
        unit: "C",
      };
      r.push(temperature);
      startData += 2;

      const humidity = {
        variable: "humidity",
        value: getHumidity(parseInt(payloadToByteArray[startData])),
        unit: "%",
      };
      r.push(humidity);
      startData += 1;

      const pressure = {
        variable: "pressure",
        value: getPressure(
          payloadToByteArray[startData],
          payloadToByteArray[startData + 1],
          payloadToByteArray[startData + 2],
        ),
        unit: "hPa",
      };
      r.push(pressure);
      startData += 3;

      if (startData + 1 === payloadToByteArray.length) {
        batteryLevel = {
          variable: "batteryLevel",
          value: Number(parseInt(payloadToByteArray[startData])).toFixed(),
          unit: "%",
        };
        r.push(batteryLevel);
      }

      return r;
    }
    case 0x03: {
      startData = 6;
      date = {
        variable: "date",
        value: parseDateByte(payloadToByteArray.slice(2, startData)),
      };
      r.push(date);

      adc = {
        variable: "adc",
        value: Number(
          ((payloadToByteArray[startData + 1] << 8) & 0xff00) |
            (payloadToByteArray[startData] & 0xff),
        ).toFixed(),
        unit: "mV",
      };
      r.push(adc);
      startData += 2;
      startData += 2;

      if (startData + 2 <= payloadToByteArray.length) {
        const distanceNumber = Number(
          ((payloadToByteArray[startData + 1] << 8) & 0xff00) |
            (payloadToByteArray[startData] & 0xff),
        ).toFixed();
        if (distanceNumber <= 60000) {
          distance = {
            variable: "distance",
            value: distanceNumber,
            unit: "mm",
          };
          r.push(distance);
        } else {
          error = {
            variable: "distance",
            value: `distance error [${distanceNumber}]`,
          };
          r.push(error);
        }
      }
      startData += 2;

      const fillLevel = {
        variable: "fillLevel",
        value: Number(parseInt(payloadToByteArray[startData])).toFixed(),
        unit: "%",
      };
      r.push(fillLevel);
      startData += 1;

      const temperature = {
        variable: "temperature",
        value: getTemperature(
          payloadToByteArray[startData],
          payloadToByteArray[startData + 1],
        ),
        unit: "C",
      };
      r.push(temperature);
      startData += 2;

      const humidity = {
        variable: "humidity",
        value: getHumidity(parseInt(payloadToByteArray[startData])),
        unit: "%",
      };
      r.push(humidity);
      startData += 1;

      const pressure = {
        variable: "pressure",
        value: getPressure(
          payloadToByteArray[startData],
          payloadToByteArray[startData + 1],
          payloadToByteArray[startData + 2],
        ),
        unit: "hPa",
      };
      r.push(pressure);
      startData += 3;

      if (startData + 1 === payloadToByteArray.length) {
        batteryLevel = {
          variable: "batteryLevel",
          value: Number(parseInt(payloadToByteArray[startData])).toFixed(),
          unit: "%",
        };
        r.push(batteryLevel);
      }

      return r;
    }
    default:
      return null;
  }
}

function isNumeric(str) {
  return /^\-?[0-9]+(e[0-9]+)?(\.[0-9]+)?$/.test(str);
}

function consume(event) {
  const payload = event.data.payloadHex;
  const uplinkId = payload.substring(0, 2);
  let topic = "default";
  let content;

  switch (uplinkId.toUpperCase()) {
    case "01":
      content = parseTimeSync(payload.trim());
      topic = "time_sync";
      break;
    case "14":
      content = parseLevel(payload.trim());
      topic = "distance";
      break;
    default:
      content = null;
      break;
  }

  const currentSample = {};
  for (let i = 0; i < content.length; i++) {
    let { value } = content[i];
    const { variable } = content[i];
    if (isNumeric(value)) {
      value = Number(value);
    }

    currentSample[variable] = value;
  }
  delete currentSample.type;

  if (currentSample.date !== undefined) {
    const timestamp = new Date(currentSample.date);
    delete currentSample.date;
    emit("sample", { data: currentSample, topic, timestamp });
  } else {
    emit("sample", { data: currentSample, topic });
  }
}
