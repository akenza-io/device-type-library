function cToF(celsius) {
  return Math.round(((celsius * 9) / 5 + 32) * 10) / 10;
}

function toBool(value) {
  return value === 1;
}

function decoder(bytes) {
  const byteArray = bytes
    .match(/.{1,2}/g)
    .map((byte) => parseInt(byte, 16).toString(2).padStart(8, "0"));
  const messageTypes = [
    "KEEPALIVE",
    "TEST_BUTTON_PRESSED",
    "FLOOD_DETECTED",
    "FRAUD_DETECTED",
    "FRAUD_DETECTED",
  ];

  const shortPackage = (byteArray) => ({
    messageType: messageTypes[parseInt(byteArray[0].slice(0, 3), 2)],
    boxTamper: toBool(byteArray[0][4]),
    flood: toBool(byteArray[0][6]),
    batteryVoltage: (parseInt(byteArray[1], 2) * 16) / 1000,
  });
  const longPackage = (byteArray) => ({
    messageType: messageTypes[parseInt(byteArray[0].slice(0, 3), 2)],
    boxTamper: toBool(byteArray[0][4]),
    flood: toBool(byteArray[0][6]),
    batteryVoltage: (parseInt(byteArray[1], 2) * 16) / 1000,
    temperature: parseInt(byteArray[2], 2),
  });
  if (byteArray.length > 2) {
    return longPackage(byteArray);
  }
  return shortPackage(byteArray);
}

function consume(event) {
  const payload = event.data.payloadHex;
  const decoded = decoder(payload);

  emit("sample", { data: decoded, topic: "default" });
}
