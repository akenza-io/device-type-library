function parseStatusByte(statusByte) {
	parseStatusByte.numSensors = statusByte & 0x10 ? 2 : 1;
	parseStatusByte.frameCounter = (statusByte & 0xe0) >> 5;
	parseStatusByte.hasTimestamp = !!(statusByte & 0x04);

	parseStatusByte.lowBattery = !!(statusByte & 0x02);
	parseStatusByte.configurationDone = !!(statusByte & 0x01);
	parseStatusByte.configurationInconsistency = !!(statusByte & 0x08);
	
	return parseStatusByte;
}

function getMyTimestamp(str) {
	const bytes = Hex.hexToBytes(str);
	return new Date(((bytes[0]<<24 | bytes[1]<<16 | bytes[2]<<8 | bytes[3])+1356998400)*1000);
}

function alarmStatus(alarmByte) {
	switch (alarmByte) {
		case 0: return "No alarm"; // "none"
		case 1: return "High threshold"; // "highThreshold"
		case 2: return "Low threshold"; // "lowThreshold"
		default: return "UNKNOWN"
	}
}

/**
* The consume(event) function is the entry point for the script and will be invoked upon execution.
* An error will be returned if the script doesn't implement a consume(event) function.
* @param {ConsumeEvent} event
*/ 
function consume(event) {
	// basic adeunis TEMP Uplink decoder
	
	const data = {};
	const lifecycle = {};

    const payload = event.data.payloadHex;
    const bytes = Hex.hexToBytes(payload);
	
	const frameCode = bytes[0];

	const statusByte = parseStatusByte(bytes[1]);

	const numSensors = statusByte.numSensors;
	const hasTimestamp = statusByte.hasTimestamp;

	lifecycle.lowBattery = statusByte.lowBattery;

	if (hasTimestamp) {
		data.time = getMyTimestamp(payload.slice(-8));
	}
	
	switch (frameCode) {
		case 0x57: // Periodic data frame
			// TODO: Parse multiple samples
			data.temperature1 = parseFloat(((bytes[2] << 24 >> 16 | bytes[3])/10).toFixed(2));
			if (numSensors == 2) {
				data.temperature2 = parseFloat(((bytes[4] << 24 >> 16 | bytes[5])/10).toFixed(2));
			}
			break;
		case 0x30: // Keep alive frame
			data.temperature1 = parseFloat(((bytes[2] << 24 >> 16 | bytes[3])/10).toFixed(2));
			if (numSensors == 2) {
				data.temperature2 = parseFloat(((bytes[4] << 24 >> 16 | bytes[5])/10).toFixed(2));
			}
			break;
		default:
    		emit('sample', { data: { errors: ["unknown Frame code"] }, topic: "default" });
	}

	if (Object.keys(data).length > 0) {
		emit('sample', { data: data, topic: "default" });
	}
	if (Object.keys(lifecycle).length > 0) {
		emit("sample", { data: lifecycle, topic: "lifecycle" });
	}
}