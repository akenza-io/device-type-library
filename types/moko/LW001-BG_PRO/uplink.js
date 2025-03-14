/**
* The consume(event) function is the entry point for the script and will be invoked upon execution.
* An error will be returned if the script doesn't implement a consume(event) function.
* @param {ConsumeEvent} event
*/

var payloadTypeArray = ["Heartbeat", "Location Fixed", "Location Failure", "Shutdown", "Shock", "Man Down detection", "Tamper Alarm", "Event Message", "Battery Consumption", "", "", "GPS Limit"];
var operationModeArray = ["Standby mode", "Periodic mode", "Timing mode", "Motion mode"];
var rebootReasonArray = ["Restart after power failure", "Bluetooth command request", "LoRaWAN command request", "Power on after normal power off"];
var positionTypeArray = ["WIFI positioning success", "Bluetooth positioning success", "GPS positioning success"];
var posFailedReasonArray = [
    "WIFI positioning time is not enough (The location payload reporting interval is set too short, please increase the report interval of the current working mode via MKLoRa app)"
    , "WIFI positioning strategies timeout (Please increase the WIFI positioning timeout via MKLoRa app)"
    , "WIFI module is not detected, the WIFI module itself works abnormally"
    , "Bluetooth positioning time is not enough (The location payload reporting interval is set too short, please increase the report interval of the current working mode via MKLoRa app)"
    , "Bluetooth positioning strategies timeout (Please increase the Bluetooth positioning timeout via MKLoRa app)"
    , "Bluetooth broadcasting in progress (Please reduce the Bluetooth broadcast timeout or avoid Bluetooth positioning when Bluetooth broadcasting in process via MKLoRa app)"
    , "GPS position time budget over (Pls increase the GPS budget via MKLoRa app)"
    , "GPS coarse positioning timeout (Pls increase coarse positioning timeout or increase coarse accuracy target via MKLoRa app)"
    , "GPS fine positioning timeout (Pls increase fine positioning timeout or increase fine accuracy target via MKLoRa app)"
    , "GPS positioning time is not enough (The location payload reporting interval is set too short, please increase the report interval of the current working mode via MKLoRa app)"
    , "GPS aiding positioning timeout (Please adjust GPS autonomous latitude and autonomous longitude)"
    , "GPS cold start positioning timeout (The gps signal current environment isn’t very good, please leave the device in a more open area)"
    , "Interrupted by Downlink for Position"
    , "Interrupted positioning at start of movement(the movement ends too quickly, resulting in not enough time to complete the positioning)"
    , "Interrupted positioning at end of movement(the movement restarted too quickly, resulting in not enough time to complete the positioning)"
];
var shutdownTypeArray = ["Bluetooth command to turn off the device", "LoRaWAN command to turn off the device", "Magnetic to turn off the device"];
var eventTypeArray = [
    "Start of movement"
    , "In movement"
    , "End of movement"
    , "Uplink Payload triggered by downlink message"
];

function consume(event) {
    var port = event.data.port;
    var bytes = hexStringToBytes(event.data.payloadHex);
    var data = {};
    data.port = port;
    data.hexFormatPayload = bytesToHexString(bytes, 0, bytes.length);
    data.payloadType = payloadTypeArray[port - 1];

    //common frame head
    if (port <= 10) {
        var batteryLevelCode = bytes[0] & 0x04;
        var batteryLevel = batteryLevelCode == 0 ? "Normal" : "Low battery";

        emit('sample', { data: batteryLevel, topic: "lifecycle" });

        var operationModeCode = bytes[0] & 0x03;
        data.operationMode = operationModeArray[operationModeCode];

        var tamperAlarmCode = bytes[0] & 0x08;
        data.tamperAlarm = tamperAlarmCode == 0 ? "Not triggered" : "Triggered";

        var manDownStatusCode = bytes[0] & 0x10;
        data.mandownStatus = manDownStatusCode == 0 ? "Not in idle" : "In idle";

        var motionStateSinceLastPaylaodCode = bytes[0] & 0x20;
        data.motionStateSinceLastPaylaod = motionStateSinceLastPaylaodCode == 0 ? "No" : "Yes";

        if (port == 2 || port == 3) {
            var positioningTypeCode = bytes[0] & 0x40;
            data.positioningType = positioningTypeCode == 0 ? "Normal" : "Downlink for position";
        }

        var temperature = signedHexToInt(bytesToHexString(bytes, 1, 1)) + '°C';
        data.temperature = temperature;

        data.ack = bytes[2] & 0x0f;
        data.batteryVoltage = (22 + ((bytes[2] >> 4) & 0x0f)) / 10 + "V";
    }
    if (port == 1) {
        var rebootReasonCode = bytesToInt(bytes, 3, 1);
        data.rebootReason = rebootReasonArray[rebootReasonCode];

        var majorVersion = (bytes[4] >> 6) & 0x03;
        var minorVersion = (bytes[4] >> 4) & 0x03;
        var patchVersion = bytes[4] & 0x0f;
        var firmwareVersion = 'V' + majorVersion + '.' + minorVersion + '.' + patchVersion;
        data.firmwareVersion = firmwareVersion;

        var activityCount = bytesToInt(bytes, 5, 4);
        data.activityCount = activityCount;
        emit('sample', { data: data, topic: "Heartbeat" });
    } else if (port == 2) {
        var parseLen = 3; // common head is 3 byte
        var datas = [];
        var positionTypeCode = bytes[parseLen++];
        data.positionSuccessType = positionTypeArray[positionTypeCode];
        data.positionSuccessTypeCode = positionTypeCode;

        var year = bytes[parseLen] * 256 + bytes[parseLen + 1];
        parseLen += 2;
        var mon = bytes[parseLen++];
        var days = bytes[parseLen++];
        var hour = bytes[parseLen++];
        var minute = bytes[parseLen++];
        var sec = bytes[parseLen++];
        var timezone = bytes[parseLen++];

        if (timezone > 0x80) {
            data.timestamp = year + "-" + mon + "-" + days + " " + hour + ":" + minute + ":" + sec + "  TZ:" + (timezone - 0x100);
        }
        else {
            data.timestamp = year + "-" + mon + "-" + days + " " + hour + ":" + minute + ":" + sec + "  TZ:" + timezone;
        }
        var datalen = bytes[parseLen++];

        if (positionTypeCode == 0 || positionTypeCode == 1) {
            for (var i = 0; i < (datalen / 7); i++) {
                var tempData = {};
                tempData.mac = substringBytes(bytes, parseLen, 6);
                parseLen += 6;
                tempData.rssi = bytes[parseLen++] - 256 + "dBm";
                datas.push(tempData);
            }
            data.macData = datas;
        } else {
            var lat = bytesToInt(bytes, parseLen, 4);
            parseLen += 4;
            var lon = bytesToInt(bytes, parseLen, 4);
            parseLen += 4;

            if (lat > 0x80000000)
                lat = lat - 0x100000000;
            if (lon > 0x80000000)
                lon = lon - 0x100000000;

            data.latitude = lat / 10000000;
            data.longitude = lon / 10000000;
            data.pdop = bytes[parseLen] / 10;
        }
        emit('sample', { data: data, topic: "Location" });
    } else if (port == 3) {
        var parseLen = 3;
        var datas = [];
        var failedTypeCode = bytesToInt(bytes, parseLen++, 1);
        data.reasonsForPositioningFailure = posFailedReasonArray[failedTypeCode];
        var datalen = bytes[parseLen++];
        if (failedTypeCode <= 5) //wifi and ble reason
        {
            if (datalen) {
                for (var i = 0; i < (datalen / 7); i++) {
                    var item = {};
                    item.mac = substringBytes(bytes, parseLen, 6);
                    parseLen += 6;
                    item.rssi = bytes[parseLen++] - 256 + "dBm";
                    datas.push(item);
                }
                data.macData = datas;
            }
        } else if (failedTypeCode <= 11) //gps reason
        {
            var pdop = bytes[parseLen++];
            if (pdop != 0xff)
                data.pdop = pdop / 10
            else
                data.pdop = "unknow";
            data.gpsSatelliteCn = bytes[parseLen] + "-" + bytes[parseLen + 1] + "-" + bytes[parseLen + 2] + "-" + bytes[parseLen + 3];
        }
        emit('sample', { data: data, topic: "LocationFail" });
    } else if (port == 4) {
        var shutdownTypeCode = bytesToInt(bytes, 3, 1);
        data.shutdownType = shutdownTypeArray[shutdownTypeCode];
        emit('sample', { data: data, topic: "Shutdown" });
    } else if (port == 5) {
        data.numberOfShocks = bytesToInt(bytes, 3, 2);
        emit('sample', { data: data, topic: "Vibration" });
    } else if (port == 6) {
        data.totalIdleTime = bytesToInt(bytes, 3, 2);
        emit('sample', { data: data, topic: "Mandown" });
    } else if (port == 7) {
        var parseLen = 3; // common head is 3 byte
        var year = bytesToInt(bytes, parseLen, 2);
        parseLen += 2;
        var mon = bytes[parseLen++];
        var days = bytes[parseLen++];
        var hour = bytes[parseLen++];
        var minute = bytes[parseLen++];
        var sec = bytes[parseLen++];
        var timezone = bytes[parseLen++];

        if (timezone > 0x80) {
            data.timestamp = year + "-" + mon + "-" + days + " " + hour + ":" + minute + ":" + sec + "  TZ:" + (timezone - 0x100);
        }
        else {
            data.timestamp = year + "-" + mon + "-" + days + " " + hour + ":" + minute + ":" + sec + "  TZ:" + timezone;
        }
        emit('sample', { data: data, topic: "Tamper" });
    } else if (port == 8) {
        var eventTypeCode = bytesToInt(bytes, 3, 1);
        data.eventType = eventTypeArray[eventTypeCode];
        emit('sample', { data: data, topic: "Event" });
    } else if (port == 9) {
        var parseLen = 3;
        data.gpsWorkTime = bytesToInt(bytes, parseLen, 4);
        parseLen += 4;
        data.wifiWorkTime = bytesToInt(bytes, parseLen, 4);
        parseLen += 4;
        data.bleScanWorkTime = bytesToInt(bytes, parseLen, 4);
        parseLen += 4;
        data.bleAdvWorkTime = bytesToInt(bytes, parseLen, 4);
        parseLen += 4;
        data.loraWorkTime = bytesToInt(bytes, parseLen, 4);
        parseLen += 4;
        emit('sample', { data: data, topic: "Battery" });
    } else if (port == 11) {
        var tempIndex = 2;
        var currentTime = (bytes[tempIndex++] * 256 + bytes[tempIndex++]) + '/' + bytes[tempIndex++] + '/' + bytes[tempIndex++] + ' ' + bytes[tempIndex++] + ':' + bytes[tempIndex++] + ':' + bytes[tempIndex++];
        var timezone = signedHexToInt(bytesToHexString(bytes, tempIndex, 1));
        tempIndex += 1;

        data.currentTime = currentTime;
        data.timezone = timezone;

        port = bytesToInt(bytes, tempIndex, 1);
        tempIndex += 1;

        bytes = bytes.slice(tempIndex);
        emit('sample', { data: data, topic: "Localdata" });
    } else if (port == 12) {

        var operationModeCode = bytes[0] & 0x03;
        data.operationMode = operationModeArray[operationModeCode];

        var batteryLevelCode = bytes[0] & 0x04;
        data.batteryLevel = batteryLevelCode == 0 ? "Normal" : "Low battery";

        var tamperAlarmCode = bytes[0] & 0x08;
        data.tamperAlarm = tamperAlarmCode == 0 ? "Not triggered" : "Triggered";

        var manDownStatusCode = bytes[0] & 0x10;
        data.mandownStatus = manDownStatusCode == 0 ? "Not in idle" : "In idle";

        var motionStateSinceLastPaylaodCode = bytes[0] & 0x20;
        data.motionStateSinceLastPaylaod = motionStateSinceLastPaylaodCode == 0 ? "No" : "Yes";

        var positioningTypeCode = bytes[0] & 0x40;
        data.positioningType = positioningTypeCode == 0 ? "Normal" : "Downlink for position";


        data.lorawanDownlinkCount = bytes[1] & 0x0f;
        data.batteryVoltage = (22 + ((bytes[1] >> 4) & 0x0f)) / 10 + "V";

        var parseLen = 2;
        var lat = bytesToInt(bytes, parseLen, 4);
        parseLen += 4;
        var lon = bytesToInt(bytes, parseLen, 4);
        parseLen += 4;

        if (lat > 0x80000000)
            lat = lat - 0x100000000;
        if (lon > 0x80000000)
            lon = lon - 0x100000000;

        data.latitude = lat / 10000000;
        data.longitude = lon / 10000000;
        data.pdop = bytes[parseLen] / 10;
        emit('sample', { data: data, topic: "ExtremeGPS" });
    }
}


function bytesToHexString(bytes, start, len) {
    var char = [];
    for (var i = 0; i < len; i++) {
        var data = bytes[start + i].toString(16);
        var dataHexStr = ("0x" + data) < 0x10 ? ("0" + data) : data;
        char.push(dataHexStr);
    }
    return char.join("");
}

function bytesToString(bytes, start, len) {
    var char = [];
    for (var i = 0; i < len; i++) {
        char.push(String.fromCharCode(bytes[start + i]));
    }
    return char.join("");
}

function bytesToInt(bytes, start, len) {
    var value = 0;
    for (var i = 0; i < len; i++) {
        var m = ((len - 1) - i) * 8;
        value = value | bytes[start + i] << m;
    }
    // var value = ((bytes[start] << 24) | (bytes[start + 1] << 16) | (bytes[start + 2] << 8) | (bytes[start + 3]));
    return value;
}

function substringBytes(bytes, start, len) {
    var char = [];
    for (var i = 0; i < len; i++) {
        char.push("0x" + bytes[start + i].toString(16) < 0X10 ? ("0" + bytes[start + i].toString(16)) : bytes[start + i].toString(16));
    }
    return char.join("");
}

function signedHexToInt(hexStr) {
    var twoStr = parseInt(hexStr, 16).toString(2); // 将十六转十进制，再转2进制
    var bitNum = hexStr.length * 4; // 1个字节 = 8bit ，0xff 一个 "f"就是4位
    if (twoStr.length < bitNum) {
        while (twoStr.length < bitNum) {
            twoStr = "0" + twoStr;
        }
    }
    if (twoStr.substring(0, 1) == "0") {
        // 正数
        twoStr = parseInt(twoStr, 2); // 二进制转十进制
        return twoStr;
    }
    // 负数
    var twoStrUnsign = "";
    twoStr = parseInt(twoStr, 2) - 1; // 补码：(负数)反码+1，符号位不变；相对十进制来说也是 +1，但这里是负数，+1就是绝对值数据-1
    twoStr = twoStr.toString(2);
    twoStrUnsign = twoStr.substring(1, bitNum); // 舍弃首位(符号位)
    // 去除首字符，将0转为1，将1转为0   反码
    twoStrUnsign = twoStrUnsign.replace(/0/g, "z");
    twoStrUnsign = twoStrUnsign.replace(/1/g, "0");
    twoStrUnsign = twoStrUnsign.replace(/z/g, "1");
    twoStr = parseInt(-twoStrUnsign, 2);
    return twoStr;
}

function hexStringToBytes(hexString) {
    // 移除可能存在的空格或其他分隔符
    hexString = hexString.replace(/\s/g, '');

    // 检查字符串长度是否为偶数
    if (hexString.length % 2 !== 0) {
        throw new Error('Hex string must have an even length');
    }

    // 创建一个Uint8Array来存储字节
    const bytes = new Uint8Array(hexString.length / 2);

    // 将每两个字符转换为一个字节
    for (let i = 0; i < hexString.length; i += 2) {
        bytes[i / 2] = parseInt(hexString.substr(i, 2), 16);
    }

    return bytes;
}