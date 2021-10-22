function parseHexString(str) {
  const result = [];
  while (str.length >= 2) {
    result.push(parseInt(str.substring(0, 2), 16));

    str = str.substring(2, str.length);
  }

  return result;
}

function decodeFrame(bytes, type, target, pos) {
  switch (type & 0x7f) {
    case 0:
      target.emptyFrame = {};
      break;
    case 1: // Battery 1byte 0-100%
      target.batteryLevel = bytes[pos++];
      break;
    case 2: // TempReport 2bytes 0.1degree C
      // celcius 0.1 precision
      target.temperature =
        ((bytes[pos] & 0x80 ? 0xffff << 16 : 0) |
          (bytes[pos++] << 8) |
          bytes[pos++]) /
        10;
      break;
    case 3:
      // Temp alarm
      // sends alarm after >x<
      target.highAlarm = !!(bytes[pos] & 0x01); // boolean
      target.lowAlarm = !!(bytes[pos] & 0x02); // boolean
      pos++;
      break;
    case 4: // AvgTempReport 2bytes 0.1degree C
      target.averageTemperature =
        ((bytes[pos] & 0x80 ? 0xffff << 16 : 0) |
          (bytes[pos++] << 8) |
          bytes[pos++]) /
        10;
      break;
    case 5:
      // AvgTemp alarm
      // sends alarm after >x<
      target.highAlarm = !!(bytes[pos] & 0x01); // boolean
      target.lowAlarm = !!(bytes[pos] & 0x02); // boolean
      pos++;
      break;
    case 6: // Humidity 1byte 0-100% in 0.5%
      target.humidity = bytes[pos++] / 2; // relativeHumidity percent 0,5
      break;
    case 7: // Lux 2bytes 0-65535lux
      target.light = (bytes[pos++] << 8) | bytes[pos++]; // you can  the lux range between two sets (lux1 and 2)
      break;
    case 8: // Lux 2bytes 0-65535lux
      target.light2 = (bytes[pos++] << 8) | bytes[pos++];
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
      target.userSwitchAlarm = !!bytes[pos++];
      break;
    case 17: // DoorCountReport, 2 byte analog
      target.doorCount = (bytes[pos++] << 8) | bytes[pos++];
      break;
    case 18: // PresenceReport, 1 byte digital
      target.presence = !!bytes[pos++];
      break;
    case 19: // IRProximityReport
      target.irProximity = (bytes[pos++] << 8) | bytes[pos++];
      break;
    case 20: // IRCloseProximityReport, low power
      target.irCloseProximity = (bytes[pos++] << 8) | bytes[pos++];
      break;
    case 21: // CloseProximityAlarm, something very close to presence sensor
      target.closeProximityAlarm = !!bytes[pos++];
      break;
    case 22: // DisinfectAlarm
      target.disinfectAlarm = bytes[pos++];
      if (target.disinfectAlarm === 0) target.disinfectAlarm = "DIRTY";
      if (target.disinfectAlarm === 1) target.disinfectAlarm = "OCCUPIED";
      if (target.disinfectAlarm === 2) target.disinfectAlarm = "CLEANING";
      if (target.disinfectAlarm === 3) target.disinfectAlarm = "CLEAN";
      break;
    case 80:
      target.humidity = bytes[pos++] / 2;
      target.temperature =
        ((bytes[pos] & 0x80 ? 0xffff << 16 : 0) |
          (bytes[pos++] << 8) |
          bytes[pos++]) /
        10;
      break;
    case 81:
      target.humidity = bytes[pos++] / 2;
      target.averageTemperature =
        ((bytes[pos] & 0x80 ? 0xffff << 16 : 0) |
          (bytes[pos++] << 8) |
          bytes[pos++]) /
        10;
      break;
    case 82:
      target.open = !!bytes[pos++]; // true = door open, false = door closed
      target.temperature =
        ((bytes[pos] & 0x80 ? 0xffff << 16 : 0) |
          (bytes[pos++] << 8) |
          bytes[pos++]) /
        10;
      break;
    case 112: // Capacitance Raw Sensor Value 2bytes 0-65535
      target.capacitanceFlood = (bytes[pos++] << 8) | bytes[pos++]; // should never trigger anymore
      break;
    case 113: // Capacitance Raw Sensor Value 2bytes 0-65535
      target.capacitancePad = (bytes[pos++] << 8) | bytes[pos++]; // should never trigger anymore
      break;
    case 110:
      pos += 8;
      break;
    case 114: // Capacitance Raw Sensor Value 2bytes 0-65535
      target.capacitanceEnd = (bytes[pos++] << 8) | bytes[pos++]; // should never trigger anymore
      break;
    default:
      break;
  }
}

function deleteUnusedKeys(data) {
  let keysRetained = false;
  Object.keys(data).forEach((key) => {
    if (data[key] === undefined) {
      delete data[key];
    } else {
      keysRetained = true;
    }
  });
  return keysRetained;
}

function consume(event) {
  const payload = event.data.payloadHex;
  const { port } = event.data;
  const bytes = parseHexString(payload);

  const decoded = {};
  let pos = 0;
  let type;

  switch (port) {
    case 1:
      if (bytes.length < 2) {
        emit("log", { error: "Wrong length of RX package" });
        break;
      }
      decoded.historySeqNr = (bytes[pos++] << 8) | bytes[pos++];
      decoded.prevHistSeqNr = decoded.historySeqNr;
      while (pos < bytes.length) {
        type = bytes[pos++];
        if (type & 0x80) decoded.prevHistSeqNr--;
        decodeFrame(bytes, type, decoded, pos);
      }
      break;

    case 2:
      var now = new Date();
      decoded.history = {};
      if (bytes.length < 2) {
        decoded.history.error = "Wrong length of RX package";
        break;
      }
      var seqNr = (bytes[pos++] << 8) | bytes[pos++];
      while (pos < bytes.length) {
        decoded.history[seqNr] = {};
        decoded.history.now = now.toUTCString();
        secondsAgo =
          (bytes[pos++] << 24) |
          (bytes[pos++] << 16) |
          (bytes[pos++] << 8) |
          bytes[pos++];
        decoded.history[seqNr].timeStamp = new Date(
          now.getTime() - secondsAgo * 1000,
        ).toUTCString();
        type = bytes[pos++];
        decodeFrame(bytes, type, decoded.history[seqNr], pos);
        seqNr++;
      }
      break;

    default:
      break;
  }

  const def = {};
  def.temperature = decoded.temperature;
  def.averageTemperature = decoded.averageTemperature;
  def.humidity = decoded.humidity;
  def.light = decoded.light;
  def.light2 = decoded.light2;
  def.open = decoded.open;
  def.tamperReport = decoded.tamperReport;
  def.doorCount = decoded.doorCount;
  def.presence = decoded.presence;
  def.irProximity = decoded.irProximity;
  def.irCloseProximity = decoded.irCloseProximity;

  const alarm = {};
  alarm.highAlarm = decoded.highAlarm;
  alarm.lowAlarm = decoded.lowAlarm;
  alarm.doorAlarm = decoded.doorAlarm;
  alarm.tamperAlarm = decoded.tamperAlarm;
  alarm.floodAlarm = decoded.floodAlarm;
  alarm.foilAlarm = decoded.foilAlarm;
  alarm.userSwitchAlarm = decoded.userSwitchAlarm;
  alarm.closeProximityAlarm = decoded.closeProximityAlarm;
  alarm.disinfectAlarm = decoded.disinfectAlarm;

  const lifecycle = {};
  lifecycle.batteryLevel = decoded.batteryLevel;
  lifecycle.historySeqNr = decoded.historySeqNr;
  lifecycle.prevHistSeqNr = decoded.prevHistSeqNr;

  if (deleteUnusedKeys(lifecycle)) {
    emit("sample", { data: lifecycle, topic: "lifecycle" });
  }

  if (deleteUnusedKeys(alarm)) {
    emit("sample", { data: alarm, topic: "alarm" });
  }

  if (deleteUnusedKeys(def)) {
    emit("sample", { data: def, topic: "default" });
  }

  if (decoded.presence !== undefined) {
    if (decoded.presence === true) {
      emit("sample", { data: { occupancy: 1 }, topic: "occupancy" });
    } else {
      emit("sample", { data: { occupancy: 0 }, topic: "occupancy" });
    }
  }
}
