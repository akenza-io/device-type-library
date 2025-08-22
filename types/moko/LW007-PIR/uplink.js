var payloadTypeArray = ["Heartbeat", "Information", "Shut Down"];

// Decode uplink function.
//
// Input is an object with the following fields:
// - bytes = Byte array containing the uplink payload, e.g. [255, 230, 255, 0]
// - fPort = Uplink fPort.
// - variables = Object containing the configured device variables.
//
// Output must be an object with the following fields:
// - data = Object representing the decoded payload.

function consume(event) {
    var bytes = hexStringToBytes(event.data.payloadHex);
    var fPort = event.data.port;

    var data = {};
    if (fPort == 0) {
        return;
    }
    data.port = fPort;
    data.hex_format_payload = bytesToHexString(bytes, 0, bytes.length);
    data.payload_type = payloadTypeArray[fPort - 5];
    if (command_format_check(bytes, fPort) == false) {
        data.result = "Format wrong";
        emit('sample', { data: data, topic: "format_error" });
        return;
    }
    var timestamp = bytesToInt(bytes, 0, 4);
    data.time = parse_time(timestamp, bytes[4] * 0.5);
    data.timestamp = timestamp;
    data.timezone = timezone_decode(bytes[4]);

    var temp_value;
    switch (fPort) {
        case 5:
            emit('sample', { data: data, topic: "heartbeat" });
        case 6:
            temp_value = (bytes[5] >> 6) & 0x03;
            if (temp_value == 0x00) {
                data.pir_state = "PIR motion not detected";
            } else if (temp_value == 0x01) {
                data.pir_state = "PIR motion detected";
            } else {
                data.pir_state = "Occupancy detection function is disable";
            }
            data.pir_state_code = temp_value;

            temp_value = (bytes[5] >> 4) & 0x03;
            if (temp_value == 0x00) {
                data.door_state = "Door/window is close";
            } else if (temp_value == 0x01) {
                data.door_state = "Door/window is open";
            } else {
                data.door_state = "Door/window status detection function is disable";
            }
            data.door_state_code = temp_value;

            temp_value = (bytes[5] >> 2) & 0x03;
            if (temp_value == 0x00) {
                data.temperature_state = "Current environment temperature is lower than minimum temperature alarm threshold value";
            } else if (temp_value == 0x01) {
                data.temperature_state = "Current environment temperature is higher than maximum temperature alarm threshold value";
            } else if (temp_value == 0x02) {
                data.temperature_state = 'Current environment temperature is normal';
            } else {
                data.temperature_state = "Temperature threshold alarm function is disable";
            }
            data.temperature_state_code = temp_value;

            temp_value = bytes[5] & 0x03;
            if (temp_value == 0x00) {
                data.humidity_state = "Current environment humidity is lower than minimum humidity alarm threshold value";
            } else if (temp_value == 0x01) {
                data.humidity_state = "Current environment humidity is higher than maximum humidity alarm threshold value";
            } else if (temp_value == 0x02) {
                data.humidity_state = 'Current environment humidity is normal';
            } else {
                data.humidity_state = "Humidity threshold alarm function is disable";
            }
            data.humidity_state_code = temp_value;

            temp_value = (bytesToInt(bytes, 6, 3) >> 14) & 0x03ff;
            if (temp_value == 0x03ff) {
                data.temperature = "Temperature monitoring function is disable";
            } else {
                temp_value = temp_value / 10 - 30;
                data.temperature = temp_value.toFixed(1) + "°";
            }

            temp_value = (bytesToInt(bytes, 6, 3) >> 4) & 0x03ff;
            if (temp_value == 0x03ff) {
                data.humidity = "Humidity monitoring function is disable";
            } else {
                temp_value = temp_value / 10;
                data.humidity = temp_value.toFixed(1) + "%";
            }

            temp_value = (bytesToInt(bytes, 6, 3) >> 2) & 0x03;
            if (temp_value == 0x00) {
                data.temperature_change_state = "Current environment temperature rises faster than temperature change alarm condition";
            } else if (temp_value == 0x01) {
                data.temperature_change_state = "Current environment temperature drops faster than temperature change alarm condition";
            } else if (temp_value == 0x02) {
                data.temperature_change_state = 'Current environment temperature change is normal';
            } else {
                data.temperature_change_state = "Temperature change alarm function is disable";
            }
            data.temperature_change_state_code = temp_value;

            temp_value = bytesToInt(bytes, 6, 3) & 0x03;
            if (temp_value == 0x00) {
                data.humidity_change_state = "Current environment humidity rises faster than humidity change alarm condition";
            } else if (temp_value == 0x01) {
                data.humidity_change_state = "Current environment humidity drops faster than humidity change alarm condition";
            } else if (temp_value == 0x02) {
                data.humidity_change_state = 'Current environment humidity change is normal';
            } else {
                data.humidity_change_state = "Humidity change alarm function is disable";
            }
            data.humidity_change_state_code = temp_value;

            data.low_battery_status = (bytesToInt(bytes, 9, 2) >> 15) == 1 ? "Battery level is low" : "Battery level is normal";
            temp_value = bytesToInt(bytes, 9, 2) & 0x7FFF;
            data.door_trigger_times = temp_value == 0x7FFF ? "Door/window status detection function is disable" : temp_value + "times";
            emit('sample', { data: data, topic: "device_information" });
            break;
        case 7:
            temp_value = bytes[5];
            if (temp_value == 0x00) {
                data.low_battery_status = "Battery level is normal";
                data.low_battery_alarm = "low power alarm function is disabled";
            }
            else if (temp_value == 0x01) {
                data.low_battery_status = "Battery is low";
                data.low_battery_alarm = "low power alarm function is disabled";
            }
            else if (temp_value == 0x02) {
                data.low_battery_status = "Battery is normal";
                data.low_battery_alarm = "low power alarm function is disabled";
            }
            else if (temp_value == 0x03) {
                data.low_battery_status = "Battery is low";
                data.low_battery_alarm = "low power alarm function is disabled";
            }
            emit('sample', { data: data, topic: "power_off" });
            break;
        default:
            break;
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


function command_format_check(bytes, port) {
    switch (port) {
        case 5:
            if (bytes.length === 11)
                return true;
            break;

        case 6:
            if (bytes.length === 11)
                return true;
            break;

        case 7:
            if (bytes.length >= 6)
                return true;
            break;

        default:
            break;
    }

    return false;
}

function parse_time(timestamp, timezone) {
    timezone = timezone > 64 ? timezone - 128 : timezone;
    timestamp = timestamp + timezone * 3600;
    if (timestamp < 0) {
        timestamp = 0;
    }

    var d = new Date(timestamp * 1000);

    var time_str = "";
    time_str += d.getUTCFullYear();
    time_str += "-";
    time_str += formatNumber(d.getUTCMonth() + 1);
    time_str += "-";
    time_str += formatNumber(d.getUTCDate());
    time_str += " ";

    time_str += formatNumber(d.getUTCHours());
    time_str += ":";
    time_str += formatNumber(d.getUTCMinutes());
    time_str += ":";
    time_str += formatNumber(d.getUTCSeconds());

    return time_str;
}

function formatNumber(number) {
    return number < 10 ? "0" + number : number;
}

function timezone_decode(tz) {
    var tz_str = "UTC";
    tz = tz > 128 ? tz - 256 : tz;
    if (tz < 0) {
        tz_str += "-";
        tz = -tz;
    } else {
        tz_str += "+";
    }

    if (tz < 20) {
        tz_str += "0";
    }

    tz_str += String(parseInt(tz / 2));
    tz_str += ":"

    if (tz % 2) {
        tz_str += "30"
    } else {
        tz_str += "00"
    }

    return tz_str;
}

function bytesToInt(bytes, start, len) {
    var value = 0;
    for (var i = 0; i < len; i++) {
        var m = ((len - 1) - i) * 8;
        value = value | bytes[start + i] << m;
    }
    return value;
}

