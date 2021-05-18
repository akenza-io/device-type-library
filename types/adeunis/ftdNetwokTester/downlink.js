function asciiToHexString(input) {
  let output = "";

  for (let i = 0; i < input.length; i += 1) {
    output += input.charCodeAt(i).toString(16);
  }

  return output;
}

function consume(event) {
  const payload = asciiToHexString(event.payload.message);
  const port = event.port ? event.port : 1;
  const confirmed = event.confirmed ? event.confirmed : false;

  emit("downlink", { payloadHex: payload, port, confirmed });
}
