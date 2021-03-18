function decoder(bytes, port) {
  // Decode an uplink message from a buffer
  // (array) of bytes to an object of fields.

  function decodeFrame(type, target) {
    switch (type & 0x7f) {
      case 0:
        target.emptyFrame = {};
        break;
      case 1: // Battery 1byte 0-100%
        target.statusPercent = bytes[pos++];
        break;
      case 2: // TempReport 2bytes 0.1degree C
        // celcius 0.1 precision
        target.temperature = ((bytes[pos] & 0x80 ? 0xFFFF << 16 : 0) | (bytes[pos++] << 8) | bytes[pos++]) / 10;
        break;
      case 3:
        // Temp alarm
        // sends alarm after >x<
        target.highAlarm = !!(bytes[pos] & 0x01); // boolean
        target.lowAlarm = !!(bytes[pos] & 0x02);  // boolean
        pos++;
        break;
      case 4: // AvgTempReport 2bytes 0.1degree C
        target.averageTemperature = ((bytes[pos] & 0x80 ? 0xFFFF << 16 : 0) | (bytes[pos++] << 8) | bytes[pos++]) / 10;
        break;
      case 5:
        // AvgTemp alarm
        // sends alarm after >x<
        target.highAlarm = !!(bytes[pos] & 0x01); // boolean
        target.lowAlarm = !!(bytes[pos] & 0x02);  // boolean
        pos++;
        break;
      case 6: // Humidity 1byte 0-100% in 0.5%
        target.humidity = bytes[pos++] / 2; // relativeHumidity percent 0,5
        break;
      case 7: // Lux 2bytes 0-65535lux
        target.lux = ((bytes[pos++] << 8) | bytes[pos++]); // you can  the lux range between two sets (lux1 and 2)
        break;
      case 8: // Lux 2bytes 0-65535lux
        target.lux2 = ((bytes[pos++] << 8) | bytes[pos++]);
        break;
      case 9: // DoorSwitch 1bytes binary
        target.open = !!bytes[pos++]; // true = door open, false = door closed
        break;
      case 10: // DoorAlarm 1bytes binary
        target.doorAlarm = !!bytes[pos++]; // boolean true = alarm
        break;
      case 11: // TamperReport 1bytes binary (was previously TamperSwitch)
        target.tamperReport = !!bytes[pos++];
        break;
      case 12: // TamperAlarm 1bytes binary
        target.tamperAlarm = !!bytes[pos++];
        break;
      case 13: // Flood 1byte 0-100%
        target.flood = bytes[pos++]; // percentage, relative wetness
        break;
      case 14: // FloodAlarm 1bytes binary
        target.floodAlarm = !!bytes[pos++]; // boolean, after >x<
        break;
      case 15: // FoilAlarm 1bytes binary
        target.foilAlarm = !!bytes[pos++];
        break;
      case 16: // UserSwitch1Alarm, 1 byte digital
        target.userSwitch1Alarm = !!bytes[pos++];
        break;
      case 17: // DoorCountReport, 2 byte analog
        target.doorCount = ((bytes[pos++] << 8) | bytes[pos++]);
        break;
      case 18: // PresenceReport, 1 byte digital
        target.presence = !!bytes[pos++];
        break;
      case 19: // IRProximityReport
        target.irProximity = ((bytes[pos++] << 8) | bytes[pos++]);
        break;
      case 20: // IRCloseProximityReport, low power
        target.irCloseproximity = ((bytes[pos++] << 8) | bytes[pos++]);
        break;
      case 21: // CloseProximityAlarm, something very close to presence sensor
        target.closeProximityAlarm = !!bytes[pos++];
        break;
      case 22: // DisinfectAlarm
        target.disinfectAlarm = bytes[pos++];
        if (target.disinfectAlarm == 0) target.disinfectAlarm = 'dirty';
        if (target.disinfectAlarm == 1) target.disinfectAlarm = 'occupied';
        if (target.disinfectAlarm == 2) target.disinfectAlarm = 'cleaning';
        if (target.disinfectAlarm == 3) target.disinfectAlarm = 'clean';
        break;
      case 80:
        target.humidity = bytes[pos++] / 2;
        target.temperature = ((bytes[pos] & 0x80 ? 0xFFFF << 16 : 0) | (bytes[pos++] << 8) | bytes[pos++]) / 10;
        break;
      case 81:
        target.humidity = bytes[pos++] / 2;
        target.averageTemperature = ((bytes[pos] & 0x80 ? 0xFFFF << 16 : 0) | (bytes[pos++] << 8) | bytes[pos++]) / 10;
        break;
      case 82:
        target.open = !!bytes[pos++]; // true = door open, false = door closed
        target.temperature = ((bytes[pos] & 0x80 ? 0xFFFF << 16 : 0) | (bytes[pos++] << 8) | bytes[pos++]) / 10;
        break;
      case 112: // Capacitance Raw Sensor Value 2bytes 0-65535
        target.capacitanceFlood = ((bytes[pos++] << 8) | bytes[pos++]); // should never trigger anymore
        break;
      case 113: // Capacitance Raw Sensor Value 2bytes 0-65535
        target.capacitancePad = ((bytes[pos++] << 8) | bytes[pos++]); // should never trigger anymore
        break;
      case 110:
        pos += 8;
        break;
      case 114: // Capacitance Raw Sensor Value 2bytes 0-65535
        target.capacitanceEnd = ((bytes[pos++] << 8) | bytes[pos++]); // should never trigger anymore
        break;
    }
  }

  var decoded = {};
  var pos = 0;
  var type;

  switch (port) {
    case 1:
      if (bytes.length < 2) {
        decoded.error = 'Wrong length of RX package';
        break;
      }
      decoded.historySeqNr = (bytes[pos++] << 8) | bytes[pos++];
      decoded.prevHistSeqNr = decoded.historySeqNr;
      while (pos < bytes.length) {
        type = bytes[pos++];
        if (type & 0x80)
          decoded.prevHistSeqNr--;
        decodeFrame(type, decoded);
      }
      break;

    case 2:
      var now = new Date();
      decoded.history = {};
      if (bytes.length < 2) {
        decoded.history.error = 'Wrong length of RX package';
        break;
      }
      var seqNr = (bytes[pos++] << 8) | bytes[pos++];
      while (pos < bytes.length) {
        decoded.history[seqNr] = {};
        decoded.history.now = now.toUTCString();
        secondsAgo = (bytes[pos++] << 24) | (bytes[pos++] << 16) | (bytes[pos++] << 8) | bytes[pos++];
        decoded.history[seqNr].timeStamp = new Date(now.getTime() - secondsAgo * 1000).toUTCString();
        type = bytes[pos++];
        decodeFrame(type, decoded.history[seqNr]);
        seqNr++;
      }
  }
  return decoded;
}

function parseHexString(str) {
  var result = [];
  while (str.length >= 2) {
    result.push(parseInt(str.substring(0, 2), 16));

    str = str.substring(2, str.length);
  }

  return result;
}

function consume(event) {
  var payload = event.data.payload_hex;
  var port = event.data.port;
  var data = decoder(parseHexString(payload), port);

  var lifecycle = {}; var alarm = {}; var def = {};
  var lifecycleOut = false; var alarmOut = false; var defOut = false;
  var defaultKeys = ["temperature", "averageTemperature", "humidity", "lux", "lux2", "open", "tamperReport", "flood", "doorCount", "presence", "irProximity", "irCloseproximity"];
  var alarmKeys = ["highAlarm", "lowAlarm", "doorAlarm", "tamperAlarm", "floodAlarm", "foilAlarm", "userSwitch1Alarm", "closeProximityAlarm", "disinfectAlarm"];
  var lifecycleKeys = ["statusPercent", "error", "historySeqNr", "prevHistSeqNr"];

  Object.keys(data).forEach(function (key) {
    if (lifecycleKeys.some(el => key.includes(el))) {
      lifecycle[key] = data[key];
      lifecycleOut = true;
    } else if (alarmKeys.some(el => key.includes(el))) {
      alarm[key] = data[key];
      alarmOut = true;
    } else if (defaultKeys.some(el => key.includes(el))) {
      def[key] = data[key];
      defOut = true;
    }
  });

  if (lifecycle != {}) {
    emit('sample', { "data": lifecycle, "topic": "lifecycle" });
  }

  if (alarm != {}) {
    emit('sample', { "data": alarm, "topic": "alarm" });
  }

  if (def != {}) {
    emit('sample', { "data": def, "topic": "default" });
  }

  if (data.presence != undefined) {
    if (data.presence == true) {
      emit('sample', { "data": { "occupancy": 1 }, "topic": "occupancy" });
    } else {
      emit('sample', { "data": { "occupancy": 0 }, "topic": "occupancy" });
    }
  }
}