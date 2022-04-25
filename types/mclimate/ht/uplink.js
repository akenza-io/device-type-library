function calculateTemperature(rawData) {
  return (rawData - 400) / 10;
}

function calculateHumidity(rawData) {
  return (rawData * 100) / 256;
}

function decbin(number) {
  const nr = parseInt(number, 10).toString(2);
  return Array(9 - nr.length).join("0") + nr;
}

function decoder(bytes) {
  const data = bytes;
  const tempHex =
    `0${data[1].toString(16)}`.substr(-2) +
    `0${data[2].toString(16)}`.substr(-2);
  const tempDec = parseInt(tempHex, 16);
  const temperatureValue = calculateTemperature(tempDec);
  const humidityValue = calculateHumidity(data[3]);
  const batteryTmp = `0${data[4].toString(16)}`.substr(-2)[0];
  const batteryVoltageCalculated = 2 + parseInt(`0x${batteryTmp}`, 16) * 0.1;
  const reason = data[0];
  const temperature = temperatureValue;
  const humidity = humidityValue;
  const batteryVoltage = batteryVoltageCalculated;
  const thermistorProperlyConnected = decbin(data[5])[5] === 0;

  const extT1 = `0${data[5].toString(16)}`.substr(-2)[1];
  const extT2 = `0${data[6].toString(16)}`.substr(-2);
  const extThermistorTemperature = thermistorProperlyConnected
    ? parseInt(`0x${extT1}${extT2}`, 16) * 0.1
    : 0;

  // check if it is a keepalive
  if (reason === 1) {
    return {
      temperature,
      humidity,
      batteryVoltage,
      thermistorProperlyConnected,
      extThermistorTemperature,
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
  const decoded = decoder(hexToBytes(payload));

  emit("sample", { data: decoded, topic: "default" });
}
