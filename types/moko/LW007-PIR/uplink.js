function cToF(celsius) { 
 return Math.round(((celsius * 9) / 5 + 32) * 10) / 10; 
 } 

function bytesToInt(bytes, start, len) {
  let value = 0;
  for (let i = 0; i < len; i++) {
    const m = ((len - 1) - i) * 8;
    value |= bytes[start + i] << m;
  }
  return value;
}

function consume(event) {
  const { port } = event.data;
  const { payloadHex } = event.data;
  const bytes = Hex.hexToBytes(payloadHex);
  const data = {};
  let topic = "default";

  switch (port) {
    case 5:
    case 6: {
      const pir = (bytes[5] >> 6) & 0x03;
      if (pir === 0x00) {
        data.pirState = "NO_MOTION";
        data.pir = 0;
      } else if (pir === 0x01) {
        data.pirState = "MOTION_DETECTED";
        data.pir = 1;
      } else if (pir === 0x11) {
        data.pirState = "DISABLED";
      }

      const reed = (bytes[5] >> 4) & 0x03;
      if (reed === 0x00) {
        data.reedState = "CLOSED";
        data.reed = true;
      } else if (reed === 0x01) {
        data.reedState = "OPEN";
        data.reed = false;
      } else if (reed === 0x11) {
        data.reedState = "DISABLED";
      }

      const temperatureThreshold = (bytes[5] >> 2) & 0x03;
      if (temperatureThreshold === 0x00) {
        data.temperatureThreshold = "THRESHOLD_LOW";
 data.temperatureF = cToF(data.temperature);
      } else if (temperatureThreshold === 0x01) {
        data.temperatureThreshold = "THRESHOLD_HIGH";
 data.temperatureF = cToF(data.temperature);
      } else if (temperatureThreshold === 0x02) {
        data.temperatureThreshold = "THRESHOLD_NOT_REACHED";
 data.temperatureF = cToF(data.temperature);
      } else if (temperatureThreshold === 0x11) {
        data.temperatureThreshold = "THRESHOLD_DISABLED";
 data.temperatureF = cToF(data.temperature);
      }

      const humidityThreshold = bytes[5] & 0x03;
      if (humidityThreshold === 0x00) {
        data.humidityThreshold = "THRESHOLD_LOW";
      } else if (humidityThreshold === 0x01) {
        data.humidityThreshold = "THRESHOLD_HIGH";
      } else if (humidityThreshold === 0x02) {
        data.humidityThreshold = "THRESHOLD_NOT_REACHED";
      } else if (humidityThreshold === 0x11) {
        data.humidityThreshold = "THRESHOLD_DISABLED";
      }

      let temperature = (bytesToInt(bytes, 6, 3) >> 14) & 0x03ff;
      if (temperature === 0x03ff) {
        data.temperatureState = "DISABLED";
 data.temperatureF = cToF(data.temperature);
      } else {
        temperature = temperature / 10 - 30;
        data.temperature = Math.round(temperature * 10) / 10;
 data.temperatureF = cToF(data.temperature);
        data.temperatureState = "ENABLED";
 data.temperatureF = cToF(data.temperature);
      }

      let humidity = (bytesToInt(bytes, 6, 3) >> 4) & 0x03ff;
      if (humidity === 0x03ff) {
        data.humidityState = "DISABLED";
      } else {
        humidity /= 10;
        data.humidity = Math.round(humidity * 10) / 10;
        data.humidityState = "ENABLED";
      }

      const temperatureChange = (bytesToInt(bytes, 6, 3) >> 2) & 0x03;
      if (temperatureChange === 0x00) {
        data.temperatureChangeState = "FAST_RISE";
 data.temperatureF = cToF(data.temperature);
      } else if (temperatureChange === 0x01) {
        data.temperatureChangeState = "FAST_DROP";
 data.temperatureF = cToF(data.temperature);
      } else if (temperatureChange === 0x02) {
        data.temperatureChangeState = 'NOMINAL_CHANGE';
 data.temperatureF = cToF(data.temperature);
      } else if (temperatureChange === 0x11) {
        data.temperatureChangeState = "FAST_CHANGE_DISABLED";
 data.temperatureF = cToF(data.temperature);
      }

      const humidityChange = bytesToInt(bytes, 6, 3) & 0x03;
      if (humidityChange === 0x00) {
        data.humidityChangeState = "FAST_RISE";
      } else if (humidityChange === 0x01) {
        data.humidityChangeState = "FAST_DROP";
      } else if (humidityChange === 0x02) {
        data.humidityChangeState = 'NOMINAL_CHANGE';
      } else if (humidityChange === 0x11) {
        data.humidityChangeState = "FAST_CHANGE_DISABLED";
      }
      data.lowBattery = (bytesToInt(bytes, 9, 2) >> 15) === 1;

      const count = bytesToInt(bytes, 9, 2) & 0x7FFF;
      if (count === 0x7FFF) {
        data.reedStatus = "DISABLED";
      } else {
        data.count = count;
        data.reedStatus = "ENABLED";
      }

      break;
    } case 7: {
      topic = "shutdown";
      const battery = bytes[5];
      if (battery === 0x00 || battery === 0x02) {
        data.lowBattery = false;
      } else if (battery === 0x01 || battery === 0x03) {
        data.lowBattery = true;
      }
      break;
    } default:
      break;
  }

  emit("sample", { data, topic });
}