function decoder(bytes, port) {
  const decoded = { lifecycle: {}, default: {}, datalog: {} };
  if (port == 0x02) {
    decoded.lifecycle.batteryVoltage = (bytes[0] << 8 | bytes[1]) / 1000;
    var mode = (bytes[2] >> 2) & 0x07;
    if (mode == 1) {
      decoded.default.vibrationCount = (bytes[3] << 8 | bytes[4] << 8 | bytes[5] << 8 | bytes[6]) >>> 0;
      decoded.default.runtime = (bytes[7] << 8 | bytes[8] << 8 | bytes[9] << 8 | bytes[10]) >>> 0;
    } else if (mode == 2) {
      decoded.default.vibrationCount = (bytes[3] << 8 | bytes[4] << 8 | bytes[5] << 8 | bytes[6]) >>> 0;
      decoded.default.temperature = parseFloat(((bytes[7] << 24 >> 16 | bytes[8]) / 100).toFixed(2));
      decoded.default.humidity = parseFloat((((bytes[9] << 8 | bytes[10]) & 0xFFF) / 10).toFixed(1));
    } else if (mode == 3) {
      decoded.default.temperature = parseFloat(((bytes[3] << 24 >> 16 | bytes[4]) / 100).toFixed(2));
      decoded.default.humidity = parseFloat((((bytes[5] << 8 | bytes[6]) & 0xFFF) / 10).toFixed(1));
      decoded.default.runtime = (bytes[7] << 8 | bytes[8] << 8 | bytes[9] << 8 | bytes[10]) >>> 0;
    }

    decoded.default.alarm = (bytes[2] & 0x01) ? true : false;
    decoded.default.tdc = (bytes[2] & 0x02) ? true : false;
  } else if (port == 7) {
    decoded.lifecycle.batteryVoltage = (bytes[0] << 8 | bytes[1]) / 1000;
    const logEntries = [];
    for (let i = 2; i < bytes.length; i += 6) {
      if (i + 5 < bytes.length) {
        let x_raw = (bytes[i] << 8) | bytes[i + 1];
        let x = ((x_raw << 16) >> 16) / 1000;

        let y_raw = (bytes[i + 2] << 8) | bytes[i + 3];
        let y = ((y_raw << 16) >> 16) / 1000;

        let z_raw = (bytes[i + 4] << 8) | bytes[i + 5];
        let z = ((z_raw << 16) >> 16) / 1000;

        logEntries.push([x, y, z]);
      }
    }
    decoded.datalog.logEntries = logEntries;
  } else if (port == 5) {
    decoded.lifecycle.firmwareVersion = (bytes[1] & 0x0f) + '.' + (bytes[2] >> 4 & 0x0f) + '.' + (bytes[2] & 0x0f);
    decoded.lifecycle.batteryVoltage = (bytes[5] << 8 | bytes[6]) / 1000;
  }
  return decoded;
}

function consume(event) {
  const payload = event.data.payloadHex;
  const { port } = event.data;
  const bytes = Hex.hexToBytes(payload);

  const decoded = decoder(bytes, port);

  if (Object.keys(decoded.default).length > 0) {
    emit("sample", { data: decoded.default, topic: "default" });
  }

  if (Object.keys(decoded.lifecycle).length > 0) {
    emit("sample", { data: decoded.lifecycle, topic: "lifecycle" });
  }

  if (Object.keys(decoded.datalog).length > 0) {
    emit("sample", { data: decoded.datalog, topic: "datalog" });
  }
}
