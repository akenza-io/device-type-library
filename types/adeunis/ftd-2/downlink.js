function asciiToHexString(input){
  var output = '';
  
  for ( var i = 0; i < input.length; i ++)
  	output += input.charCodeAt(i).toString(16);
  
  return output;
}

function consume(event) {
	var payload = asciiToHexString(event.payload.message);
	var port = event.port ? event.port : 1;
	var confirmed = event.confirmed ? event.confirmed : false;
	
  	emit("downlink", { payload_hex: payload, port: port, confirmed: confirmed });
}
