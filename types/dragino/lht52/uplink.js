function strPad(byte) {
  const zero = "0";
  const hex = byte.toString(16);
  const tmp = 2 - hex.length;
  return zero.substr(0, tmp) + hex;
}

function consume(event) {
  const payload = event.data.payloadHex;
  const { port } = event.data;
  const bytes = Hex.hexToBytes(payload);
  const data = {};
  const lifecycle = {};

  if (port === 2) {
    if (bytes.length === 11) {
      data.temperature = parseFloat(
        ((((bytes[0] << 24) >> 16) | bytes[1]) / 100).toFixed(2),
      );
      data.humidity = parseFloat(
        ((((bytes[2] << 24) >> 16) | bytes[3]) / 10).toFixed(1),
      );
      data.extTemperature = parseFloat(
        ((((bytes[4] << 24) >> 16) | bytes[5]) / 100).toFixed(2),
      );

      if (data.temperature === 32767.5) {
        data.temperature = null;
      }

      if (data.extTemperature === 32767.5) {
        data.extTemperature = null;
      }

      emit("sample", { data, topic: "default" });
    }
  } else if (port === 4) {
    data.id =
      strPad(bytes[0]) +
      strPad(bytes[1]) +
      strPad(bytes[2]) +
      strPad(bytes[3]) +
      strPad(bytes[4]) +
      strPad(bytes[5]) +
      strPad(bytes[6]) +
      strPad(bytes[7]);

    emit("sample", { data, topic: "external" });
  } else if (port === 5) {
    lifecycle.sensorModel = bytes[0];
    lifecycle.firmwareVersion = strPad((bytes[1] << 8) | bytes[2]);
    lifecycle.batteryVoltage = ((bytes[5] << 8) | bytes[6]) / 1000;

    emit("sample", { data: lifecycle, topic: "lifecycle" });
  }
}
