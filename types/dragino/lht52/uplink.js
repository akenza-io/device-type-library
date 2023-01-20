function strPad(byte) {
  const zero = "0";
  const hex = byte.toString(16);
  const tmp = 2 - hex.length;
  return zero.substr(0, tmp) + hex;
}

function consume(event) {
  const payload = event.data.payloadHex;
  const bytes = Hex.hexToBytes(payload);
  const data = {};
  const lifecycle = {};

  lifecycle.batteryVoltage = (((bytes[0] << 8) | bytes[1]) & 0x3fff) / 1000;

  let batteryLevel =
    Math.round((data.batteryVoltage - 2.45) / 0.0115 / 10) * 10;

  if (batteryLevel > 100) {
    batteryLevel = 100;
  } else if (batteryLevel < 0) {
    batteryLevel = 0;
  }
  lifecycle.batteryLevel = batteryLevel;

  let temperature = (bytes[2] << 8) | bytes[3];
  if (bytes[2] & 0x80) {
    temperature |= 0xffff0000;
  }
  data.temperature = (temperature / 10).toFixed(2);

  const leafMoisture = (bytes[4] << 8) | bytes[5];
  data.leafMoisture = (leafMoisture / 10).toFixed(2);

  const leafTemperature = (bytes[6] << 8) | bytes[7];
  if ((leafTemperature & 0x8000) >> 15 === 0) {
    data.leafTemperature = (leafTemperature / 10).toFixed(2);
  } else if ((leafTemperature & 0x8000) >> 15 === 1) {
    data.leafTemperature = ((leafTemperature - 0xffff) / 10).toFixed(2);
  }

  emit("sample", { data, topic: "default" });
  emit("sample", { data: lifecycle, topic: "lifecycle" });
}

function Decoder(bytes, port) {
  const decode = {};
  if (port == 2) {
    if (bytes.length == 11) {
      decode.TempC_SHT = parseFloat(
        ((((bytes[0] << 24) >> 16) | bytes[1]) / 100).toFixed(2),
      );
      decode.Hum_SHT = parseFloat(
        ((((bytes[2] << 24) >> 16) | bytes[3]) / 10).toFixed(1),
      );
      decode.TempC_DS = parseFloat(
        ((((bytes[4] << 24) >> 16) | bytes[5]) / 100).toFixed(2),
      );

      decode.Ext = bytes[6];
      decode.Systimestamp =
        (bytes[7] << 24) | (bytes[8] << 16) | (bytes[9] << 8) | bytes[10];

      return decode;
    }

    decode.Status = "RPL data or sensor reset";

    return decode;
  }

  if (port == 3) {
    decode.Status =
      "Data retrieved, your need to parse it by the application server";

    return decode;
  }

  if (port == 4) {
    decode.DS18B20_ID =
      strPad(bytes[0]) +
      strPad(bytes[1]) +
      strPad(bytes[2]) +
      strPad(bytes[3]) +
      strPad(bytes[4]) +
      strPad(bytes[5]) +
      strPad(bytes[6]) +
      strPad(bytes[7]);

    return decode;
  }

  if (port == 5) {
    decode.Sensor_Model = bytes[0];
    decode.Firmware_Version = strPad((bytes[1] << 8) | bytes[2]);
    decode.Freq_Band = bytes[3];
    decode.Sub_Band = bytes[4];
    decode.Bat_mV = (bytes[5] << 8) | bytes[6];

    return decode;
  }
}
