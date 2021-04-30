function toLittleEndian(hex) {
  var data = hex.match(/../g);
  // Create a buffer
  var buf = new ArrayBuffer(4);
  // Create a data view of it
  var view = new DataView(buf);
  // set bytes
  data.forEach(function (b, i) {
    view.setUint8(i, parseInt(b, 16));
  });
  // get an int32 with little endian
  var num = view.getInt32(0, 1);
  return num;
}

function consume(event) {
  var payload = event.data.payload_hex;
  var bits = Bits.hexToBits(payload);
  var data = {};
  var protocolVersion = Bits.bitsToUnsigned(bits.substr(0, 8));
  var commandID = Bits.bitsToUnsigned(bits.substr(8, 8));

  data.longitude = (toLittleEndian(payload.substr(4, 6)) * 215) / 10 * 0.000001;
  data.latitude = (toLittleEndian(payload.substr(10, 6)) * 215) / 10 * 0.000001;

  var reportType = Math.round(Bits.bitsToUnsigned(bits.substr(64, 8)) / 32);
  var gpsFix = Math.round(Bits.bitsToUnsigned(bits.substr(64, 8)) / 32);

  if (gpsFix == 0) {
    data.gpsFix = "Not fix";
  } else if (gpsFix == 1) {
    data.gpsFix = "2D fix";
  } else if (gpsFix == 2) {
    data.gpsFix = "3D fix";
  }

  if (reportType == 2) {
    data.reportType = "Periodic mode report";
  } else if (reportType == 4) {
    data.reportType = "Motion mode static report";
  } else if (reportType == 5) {
    data.reportType = "Motion mode moving report";
  } else if (reportType == 6) {
    data.reportType = "Motion mode static to moving report";
  } else if (reportType == 7) {
    data.reportType = "Motion mode moving to static report";
  } else if (reportType == 15) {
    data.reportType = "Low battery alarm report";
  }
  var batteryPercent = Bits.bitsToUnsigned(bits.substr(72, 8));

  emit('sample', { "data": { "batteryPercent": batteryPercent }, "topic": "lifecycle" });
  emit('sample', { "data": data, "topic": "default" });
}