function consume(event) {
  const bytes = Hex.hexToBytes(event.data.payloadHex);
  const moisture = {};
  const temperature = {};
  const lifecycle = {};

  const tem = [
    "temperature1",
    "temperature2",
    "temperature3",
    "temperature4",
    "temperature5",
    "temperature6",
    "temperature7",

    "temperature8",
    "temperature9",
    "temperature10",
    "temperature11",
    "temperature12",
    "temperature13",
  ];

  const hum = [
    "soilMoisture1",
    "soilMoisture2",
    "soilMoisture3",
    "soilMoisture4",
    "soilMoisture5",
    "soilMoisture6",
    "soilMoisture7",
    "soilMoisture8",
  ];

  const temLen = [0, 0, 4, 6, 7, 9, 11, 12, 13];

  const humLen = [0, 0, 2, 3, 4, 5, 6, 7, 8];

  const value = ((bytes[0] << 8) | bytes[1]) & 0x0fff;

  lifecycle.batteryVoltage = value / 1000; // Battery,units:V

  const senType = bytes[2] - 0x30;

  lifecycle.sensorType = senType;

  let isTemFlag = false;

  if (
    bytes[3 + temLen[senType] * 2] === 0x7f &&
    bytes[4 + temLen[senType] * 2] === 0xff
  ) {
    humLen[senType] = 1;
  }

  if (bytes.length - 3 - humLen[senType] * 2 === temLen[senType] * 2) {
    isTemFlag = true;
  }

  let startBytes = 3;

  if (isTemFlag === true) {
    for (let i = 0; i < temLen[senType]; i++) {
      if (bytes[startBytes] & 0x80) {
        temperature[tem[i]] =
          (((bytes[startBytes] << 8) | bytes[startBytes + 1]) - 0xffff) / 10.0;
      } // <0
      else {
        temperature[tem[i]] =
          ((bytes[startBytes] << 8) | bytes[startBytes + 1]) / 10.0;
      }

      startBytes += 2;
    }
  }

  for (let i = 0; i < humLen[senType]; i++) {
    if (bytes[startBytes] !== 0x7f && bytes[startBytes + 1] !== 0xff) {
      moisture[hum[i]] =
        ((bytes[startBytes] << 8) | bytes[startBytes + 1]) / 10.0;
      startBytes += 2;
    }
  }

  if (Object.keys(moisture).length > 0) {
    emit("sample", { data: moisture, topic: "soil_moisture" });
  }

  if (Object.keys(temperature).length > 0) {
    emit("sample", { data: temperature, topic: "temperature" });
  }

  emit("sample", { data: lifecycle, topic: "lifecycle" });
}
