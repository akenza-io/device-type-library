function decodeFrame(bytes, type, pos) {
  const data = {};
  let pointer = pos;

  switch (type & 0x7f) {
    case 0:
      data.emptyFrame = {};
      break;
    case 1: // Battery 1byte 0-100%
      data.batteryLevel = bytes[pointer++];
      break;
    case 2: // TempReport 2bytes 0.1degree C
      // celcius 0.1 precision
      data.temperature =
        ((bytes[pointer] & 0x80 ? 0xffff << 16 : 0) |
          (bytes[pointer++] << 8) |
          bytes[pointer++]) /
        10;
      break;
    case 3:
      // Temp alarm
      // sends alarm after >x<
      data.highAlarm = !!(bytes[pointer] & 0x01); // boolean
      data.lowAlarm = !!(bytes[pointer] & 0x02); // boolean
      pointer++;
      break;
    case 4: // AvgTempReport 2bytes 0.1degree C
      data.averageTemperature =
        ((bytes[pointer] & 0x80 ? 0xffff << 16 : 0) |
          (bytes[pointer++] << 8) |
          bytes[pointer++]) /
        10;
      break;
    case 5:
      // AvgTemp alarm
      // sends alarm after >x<
      data.highAlarm = !!(bytes[pointer] & 0x01); // boolean
      data.lowAlarm = !!(bytes[pointer] & 0x02); // boolean
      pointer++;
      break;
    case 6: // Humidity 1byte 0-100% in 0.5%
      data.humidity = bytes[pointer] / 2; // relativeHumidity percent 0,5
      break;
    case 7: // Lux 2bytes 0-65535lux
      data.light = (bytes[pointer++] << 8) | bytes[pointer++]; // you can  the lux range between two sets (lux1 and 2)
      break;
    case 8: // Lux 2bytes 0-65535lux
      data.light2 = (bytes[pointer++] << 8) | bytes[pointer++];
      break;
    case 9: // DoorSwitch 1bytes binary
      data.closed = !!bytes[pointer++]; // true = door closed, false = door open
      break;
    case 10: // DoorAlarm 1bytes binary
      data.doorAlarm = !!bytes[pointer++]; // boolean true = alarm
      break;
    case 11: // TamperReport 1bytes binary (was previously TamperSwitch)
      data.tamperReport = !!bytes[pointer++];
      break;
    case 12: // TamperAlarm 1bytes binary
      data.tamperAlarm = !!bytes[pointer++];
      break;
    case 13: // Flood 1byte 0-100%
      data.flood = bytes[pointer++]; // percentage, relative wetness
      break;
    case 14: // FloodAlarm 1bytes binary
      data.floodAlarm = !!bytes[pointer++]; // boolean, after >x<
      break;
    case 15: // FoilAlarm 1bytes binary
      data.oilAlarm = !!bytes[pointer];
      data.foilAlarm = !!bytes[pointer++];
      break;
    case 16: // UserSwitch1Alarm, 1 byte digital
      data.userSwitchAlarm = !!bytes[pointer++];
      break;
    case 17: // DoorCountReport, 2 byte analog
      data.doorCount = (bytes[pointer++] << 8) | bytes[pointer++];
      break;
    case 18: // PresenceReport, 1 byte digital
      data.presence = !!bytes[pointer++];
      break;
    case 19: // IRProximityReport
      data.irProximity = (bytes[pointer++] << 8) | bytes[pointer++];
      break;
    case 20: // IRCloseProximityReport, low power
      data.irCloseProximity = (bytes[pointer++] << 8) | bytes[pointer++];
      break;
    case 21: // CloseProximityAlarm, something very close to presence sensor
      data.closeProximityAlarm = !!bytes[pointer++];
      break;
    case 22: // DisinfectAlarm
      data.disinfectAlarm = bytes[pointer++];
      if (data.disinfectAlarm === 0) data.disinfectAlarm = "DIRTY";
      if (data.disinfectAlarm === 1) data.disinfectAlarm = "OCCUPIED";
      if (data.disinfectAlarm === 2) data.disinfectAlarm = "CLEANING";
      if (data.disinfectAlarm === 3) data.disinfectAlarm = "CLEAN";
      break;
    case 80:
      data.humidity = bytes[pointer++] / 2;
      data.temperature =
        ((bytes[pointer] & 0x80 ? 0xffff << 16 : 0) |
          (bytes[pointer++] << 8) |
          bytes[pointer++]) /
        10;
      break;
    case 81:
      data.humidity = bytes[pointer++] / 2;
      data.averageTemperature =
        ((bytes[pointer] & 0x80 ? 0xffff << 16 : 0) |
          (bytes[pointer++] << 8) |
          bytes[pointer++]) /
        10;
      break;
    case 82:
      data.closed = !!bytes[pointer++]; // true = door open, false = door closed // Inverted in example decoder
      data.temperature =
        ((bytes[pointer] & 0x80 ? 0xffff << 16 : 0) |
          (bytes[pointer++] << 8) |
          bytes[pointer++]) /
        10;
      break;
    case 112: // Capacitance Raw Sensor Value 2bytes 0-65535
      data.capacitanceFlood = (bytes[pointer++] << 8) | bytes[pointer++]; // should never trigger anymore
      break;
    case 113: // Capacitance Raw Sensor Value 2bytes 0-65535
      data.capacitancePad = (bytes[pointer++] << 8) | bytes[pointer++]; // should never trigger anymore
      break;
    case 110: {
      const number =
        ((bytes[pointer++] << 24) |
          (bytes[pointer++] << 16) |
          (bytes[pointer++] << 8) |
          bytes[pointer++]) >>>
        0;
      data.softwareVersion = number.toString(16);
      data.startupCount = bytes[pointer++];
      data.watchdogCount = bytes[pointer++];
      data.stackTxFailRebootCount = bytes[pointer++];
      data.badConditionsCounter = bytes[pointer++];
      break;
    }
    case 114: // Capacitance Raw Sensor Value 2bytes 0-65535
      data.capacitanceEnd = (bytes[pointer++] << 8) | bytes[pointer++]; // should never trigger anymore
      break;
    default:
      break;
  }
  return { data, pointer };
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
  const bytes = Hex.hexToBytes(payload);

  const decoded = {};
  let pos = 2;
  let type;

  switch (port) {
    case 1:
      if (bytes.length < 2) {
        emit("log", { error: "Wrong length of RX package" });
        break;
      }
      while (pos < bytes.length) {
        type = bytes[pos++];
        const decodedFrame = decodeFrame(bytes, type, pos);
        pos = decodedFrame.pointer;
        Object.assign(decoded, decodedFrame.data);
      }
      break;

    case 2: {
      const now = new Date();
      decoded.history = {};
      if (bytes.length < 2) {
        decoded.history.error = "Wrong length of RX package";
        break;
      }
      let seqNr = (bytes[pos++] << 8) | bytes[pos++];
      while (pos < bytes.length) {
        decoded.history[seqNr] = {};
        decoded.history.now = now.toUTCString();
        const secondsAgo =
          (bytes[pos++] << 24) |
          (bytes[pos++] << 16) |
          (bytes[pos++] << 8) |
          bytes[pos++];
        decoded.history[seqNr].timeStamp = new Date(
          now.getTime() - secondsAgo * 1000,
        ).toUTCString();
        type = bytes[pos++];
        const decodedFrame = decodeFrame(bytes, type, pos);
        pos = decodedFrame.pointer;
        Object.assign(decoded, decodedFrame.data);
        seqNr++;
      }
      break;
    }
    default:
      break;
  }

  const def = {};
  def.temperature = decoded.temperature;
  def.averageTemperature = decoded.averageTemperature;
  def.humidity = decoded.humidity;
  def.light = decoded.light;
  def.light2 = decoded.light2;
  def.closed = decoded.closed;
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
  alarm.oilAlarm = decoded.oilAlarm;
  alarm.foilAlarm = decoded.foilAlarm;
  alarm.userSwitchAlarm = decoded.userSwitchAlarm;
  alarm.closeProximityAlarm = decoded.closeProximityAlarm;
  alarm.disinfectAlarm = decoded.disinfectAlarm;

  const lifecycle = {};
  if (decoded.batteryLevel !== 0) {
    lifecycle.batteryLevel = decoded.batteryLevel;
  }
  lifecycle.error = decoded.error;
  lifecycle.softwareVersion = decoded.softwareVersion;
  lifecycle.startupCount = decoded.startupCount;
  lifecycle.watchdogCount = decoded.watchdogCount;
  lifecycle.stackTxFailRebootCount = decoded.stackTxFailRebootCount;
  lifecycle.badConditionsCounter = decoded.badConditionsCounter;

  if (deleteUnusedKeys(lifecycle)) {
    emit("sample", { data: lifecycle, topic: "lifecycle" });
  }

  if (deleteUnusedKeys(alarm)) {
    emit("sample", { data: alarm, topic: "alarm" });
  }

  if (deleteUnusedKeys(def)) {
    def.open = !decoded.closed;
    emit("sample", { data: def, topic: "default" });
  }

  if (decoded.presence !== undefined) {
    if (decoded.presence === true) {
      emit("sample", {
        data: { occupancy: 1, occupied: true },
        topic: "occupancy",
      });
    } else {
      emit("sample", {
        data: { occupancy: 0, occupied: false },
        topic: "occupancy",
      });
    }
  }
}
