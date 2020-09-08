function asciiToHexString(input) {
  var output = "";

  for (var i = 0; i < input.length; i++) {
    output += input.charCodeAt(i).toString(16);
  }

  return output;
}

function consume(event) {
  var payload = asciiToHexString(event.payload);
  emit("downlink", { payload_hex: payload, port: 1 });
}
