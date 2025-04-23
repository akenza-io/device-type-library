function getzf(c_num){ 
	if(parseInt(c_num) < 10)
		c_num = '0' + c_num; 
	return c_num; 
}

function getMyDate(str){ 
	var c_Date;
	if (str > 9999999999)
		c_Date = new Date(parseInt(str));
	else 
		c_Date = new Date(parseInt(str) * 1000);
		
	var c_Year = c_Date.getFullYear(), 
	c_Month = c_Date.getMonth()+1, 
	c_Day = c_Date.getDate(),
	c_Hour = c_Date.getHours(), 
	c_Min = c_Date.getMinutes(), 
	c_Sen = c_Date.getSeconds();
	var c_Time = c_Year + '-' + getzf(c_Month) + '-' + getzf(c_Day) + ' ' + getzf(c_Hour) + ':' + getzf(c_Min) + ':' + getzf(c_Sen); 
	
	return c_Time;
}

function datalog(i,bytes){
	var aa = parseFloat(((bytes[4+i]<<24>>16 | bytes[5+i])/100).toFixed(2));
	var bb = getMyDate((bytes[7+i]<<24 | bytes[8+i]<<16 | bytes[9+i]<<8 | bytes[10+i]).toString(10));
	var string = '['+aa+','+bb+']'+',';  

	return string;
}

/**
* The consume(event) function is the entry point for the script and will be invoked upon execution.
* An error will be returned if the script doesn't implement a consume(event) function.
* @param {ConsumeEvent} event
*/ 
function consume(event) {
	
	const data = {};
	const lifecycle = {};

    const payload = event.data.payloadHex;
    const bytes = Hex.hexToBytes(payload);
    const port = event.data.port;

	var is_datalog = false;

	switch (port) {
		case 2: // Real-Time Temperature data
			lifecycle.batteryVoltage = (bytes[0]<<8 | bytes[1])/1000;
			data.temperature = parseFloat(((bytes[2]<<24>>16 | bytes[3])/100).toFixed(2));
			data.tempHFlag = (bytes[4] &0x01)? true : false;
			data.tempLFlag = (bytes[4] &0x02)? true : false;
			data.time = getMyDate((bytes[5]<<24 | bytes[6]<<16 | bytes[7]<<8 | bytes[8]).toString(10));         
			if (Object.keys(data).length > 0) {
				emit('sample', { data: data, topic: "default" });
			}
			if (Object.keys(lifecycle).length > 0) {
				emit("sample", { data: lifecycle, topic: "lifecycle" });
			}
			break;
		case 5: // Device Status
			if(bytes[0] == 0x34) data.sensorModel = "T68DL";
			if(bytes[4]==0xff) data.subBand = "NULL";
			else data.subBand = bytes[4];
			
			if(bytes[3] == 0x01) data.frequencyBand = "EU868";
			else if(bytes[3] == 0x02) data.frequencyBand = "US915";
			else if(bytes[3] == 0x03) data.frequencyBand = "IN865";
			else if(bytes[3] == 0x04) data.frequencyBand = "AU915";
			else if(bytes[3] == 0x05) data.frequencyBand = "KZ865";
			else if(bytes[3] == 0x06) data.frequencyBand = "RU864";
			else if(bytes[3] == 0x07) data.frequencyBand = "AS923";
			else if(bytes[3] == 0x08) data.frequencyBand = "AS923_1";
			else if(bytes[3] == 0x09) data.frequencyBand = "AS923_2";
			else if(bytes[3] == 0x0A) data.frequencyBand = "AS923_3";
			else if(bytes[3] == 0x0B) data.frequencyBand = "CN470";
			else if(bytes[3] == 0x0C) data.frequencyBand = "EU433";
			else if(bytes[3] == 0x0D) data.frequencyBand = "KR920";
			else if(bytes[3] == 0x0E) data.frequencyBand = "MA869";

			data.firmwareVersion = (bytes[1] & 0x0f) + '.' + (bytes[2]>>4 & 0x0f) + '.' + (bytes[2] & 0x0f);
			data.batteryVoltage = (bytes[5]<<8 | bytes[6]) / 1000;
			if (Object.keys(data).length > 0) {
				emit('sample', { data: data, topic: "status" });
			}
			break;
		case 3: // Datalog
			var pnack = ((bytes[6]>>7)&0x01) ? true : false;
			for(var i = 0; i<bytes.length; i = i + 11)
			{
			  var data1 = datalog(i,bytes);
			  if(i == '0')
				data.datalog = data1;
			  else
				data.datalog += data1;
			}
			data.pnackFlag = pnack;
			emit("sample", { data: data, topic: "datalog" });
			break;
  
		default:
    		emit('sample', { data: { errors: ["unknown FPort"] }, topic: "default" });
	}
}