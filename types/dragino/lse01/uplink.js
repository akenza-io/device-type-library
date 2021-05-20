function hexToBytes(hex) {
  for (var bytes = [], c = 0; c < hex.length; c += 2) {
    bytes.push(parseInt(hex.substr(c, 2), 16));
  }
  return bytes;
}

function consume(event) {
  const payload = event.data.payload_hex;
  const bytes = hexToBytes(payload);
  const data = {};
  const lifecycle = {};

  let value = ((bytes[0] << 8) | bytes[1]) & 0x3fff;
  lifecycle.voltage = value / 1000;

  value = (bytes[2] << 8) | bytes[3];
  if (bytes[2] & 0x80) {
    value |= 0xffff0000;
  }
  data.tempDS18B20 = Number((value / 10).toFixed(2));

  value = (bytes[4] << 8) | bytes[5];
  data.waterSoil = Number((value / 100).toFixed(2));

  value = (bytes[6] << 8) | bytes[7];
  let tempSoil;
  if ((value & 0x8000) >> 15 === 0) {
    tempSoil = (value / 100).toFixed(2);
  } else if ((value & 0x8000) >> 15 === 1) {
    tempSoil = ((value - 0xffff) / 100).toFixed(2);
  }
  data.tempSoil = Number(tempSoil);

  value = (bytes[8] << 8) | bytes[9];
  data.conductSoil = value;

  emit("sample", { data, topic: "default" });
  emit("sample", { data: lifecycle, topic: "lifecycle" });
}
