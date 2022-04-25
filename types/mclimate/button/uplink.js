function decoder(data) {
  function decbin(byte) {
    return parseInt(byte, 16).toString(2).padStart(8, "0");
  }
  const batteryTmp = `0${`${data[2] + data[3]}`.toString(16)}`.substr(-2)[0];
  const batteryVoltageCalculated = 2 + parseInt(`0x${batteryTmp}`, 16) * 0.1;
  const thermistorProperlyConnected = decbin(data[5])[5] === 0;
  const extT1 = `0${data[5].toString(16)}`.substr(-2)[1];
  const extT2 = `0${`${data[6] + data[7]}`.toString(16)}`.substr(-2);
  const temperature = thermistorProperlyConnected
    ? parseInt(`0x${extT1}${extT2}`, 16) * 0.1
    : 0;
  const pressEvent = `${data[8] + data[9]}`;
  if (data[1] === 1) {
    return {
      pressEvent,
      batteryVoltage: batteryVoltageCalculated,
      thermistorProperlyConnected,
      temperature,
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
