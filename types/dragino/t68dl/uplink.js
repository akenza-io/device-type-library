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
  const cTime = `${cYear}-${getzf(cMonth)}-${getzf(cDay)} ${getzf(cHour)}:${getzf(cMin)}:${getzf(cSen)}`;

  return cTime;
}

function datalog(i, bytes) {
  const aa = parseFloat(
    ((((bytes[4 + i] << 24) >> 16) | bytes[5 + i]) / 100).toFixed(2),
  );
  const bb = getMyDate(
    (
      (bytes[7 + i] << 24) |
      (bytes[8 + i] << 16) |
      (bytes[9 + i] << 8) |
      bytes[10 + i]
    ).toString(10),
  );
  const string = `[${aa},${bb}]` + `,`;

  return string;
}

/**
 * The consume(event) function is the entry point for the script and will be invoked upon execution.
 * An error will be returned if the script doesn't implement a consume(event) function.
 * @param {ConsumeEvent} event
 */
function consume(event) {
  const data = {};
  const lifecycle = {};

  const payload = event.data.payloadHex;
  const bytes = Hex.hexToBytes(payload);
  const { port } = event.data;

  switch (port) {
    case 2: // Real-Time Temperature data
      lifecycle.batteryVoltage = ((bytes[0] << 8) | bytes[1]) / 1000;
      data.temperature = parseFloat(
        ((((bytes[2] << 24) >> 16) | bytes[3]) / 100).toFixed(2),
      );
      data.temperatureF = cToF(data.temperature);
      data.tempHFlag = !!(bytes[4] & 0x01);
      data.tempLFlag = !!(bytes[4] & 0x02);
      data.time = getMyDate(
        (
          (bytes[5] << 24) |
          (bytes[6] << 16) |
          (bytes[7] << 8) |
          bytes[8]
        ).toString(10),
      );
      if (Object.keys(data).length > 0) {
        emit("sample", { data, topic: "default" });
      }
      if (Object.keys(lifecycle).length > 0) {
        emit("sample", { data: lifecycle, topic: "lifecycle" });
      }
      break;
    case 5: // Device Status
      if (bytes[0] === 0x34) data.sensorModel = "T68DL";
      if (bytes[4] === 0xff) data.subBand = "NULL";
      else data.subBand = bytes[4];

      if (bytes[3] === 0x01) data.frequencyBand = "EU868";
      else if (bytes[3] === 0x02) data.frequencyBand = "US915";
      else if (bytes[3] === 0x03) data.frequencyBand = "IN865";
      else if (bytes[3] === 0x04) data.frequencyBand = "AU915";
      else if (bytes[3] === 0x05) data.frequencyBand = "KZ865";
      else if (bytes[3] === 0x06) data.frequencyBand = "RU864";
      else if (bytes[3] === 0x07) data.frequencyBand = "AS923";
      else if (bytes[3] === 0x08) data.frequencyBand = "AS923_1";
      else if (bytes[3] === 0x09) data.frequencyBand = "AS923_2";
      else if (bytes[3] === 0x0a) data.frequencyBand = "AS923_3";
      else if (bytes[3] === 0x0b) data.frequencyBand = "CN470";
      else if (bytes[3] === 0x0c) data.frequencyBand = "EU433";
      else if (bytes[3] === 0x0d) data.frequencyBand = "KR920";
      else if (bytes[3] === 0x0e) data.frequencyBand = "MA869";

      data.firmwareVersion = `${bytes[1] & 0x0f}.${(bytes[2] >> 4) & 0x0f}.${bytes[2] & 0x0f}`;
      data.batteryVoltage = ((bytes[5] << 8) | bytes[6]) / 1000;
      if (Object.keys(data).length > 0) {
        emit("sample", { data, topic: "status" });
      }
      break;
    case 3: // Datalog
      var pnack = !!((bytes[6] >> 7) & 0x01);
      for (let i = 0; i < bytes.length; i += 11) {
        const data1 = datalog(i, bytes);
        if (i === "0") {
          data.datalog = data1;
        } else {
          data.datalog += data1;
        }
      }
      data.pnackFlag = pnack;
      emit("sample", { data, topic: "datalog" });
      break;

    default:
      emit("sample", { data: { errors: ["unknown FPort"] }, topic: "error" });
  }
}
