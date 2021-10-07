function intToHex(number) {
  let hex = Number(number).toString(16);
  if (hex.length === 1) {
    hex = `0${hex}`;
  }

  return hex;
}

function consume(event) {
  let payload = "";
  const data = event.payload;

  payload += intToHex(data.red);
  payload += intToHex(data.blue);
  payload += intToHex(data.green);
  payload += intToHex(data.onDuration);
  payload += intToHex(data.offDuration);

  emit("downlink", { payloadHex: payload, port: 15, confirmed: true });
}
