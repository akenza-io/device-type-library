function toLittleEndianSigned(hex) {
  // Creating little endian hex DCBA
  const hexArray = [];
  let tempHex = hex;
  while (tempHex.length >= 2) {
    hexArray.push(tempHex.substring(0, 2));
    tempHex = tempHex.substring(2, tempHex.length);
  }
  hexArray.reverse();
  // To signed
  return Bits.bitsToSigned(Bits.hexToBits(hexArray.join("")));
}

function consume(event) {
  const payload = event.data.payloadHex;
  const bits = Bits.hexToBits(payload);
  const data = {};

  data.longitude =
    ((toLittleEndianSigned(payload.substr(4, 6)) * 215) / 10) * 0.000001;
  data.latitude =
    ((toLittleEndianSigned(payload.substr(10, 6)) * 108) / 10) * 0.000001;

  const reportType = Math.round(Bits.bitsToUnsigned(bits.substr(64, 8)) % 32);
  const gpsFix = Math.round(Bits.bitsToUnsigned(bits.substr(64, 8)) / 32);

  if (gpsFix === 0) {
    data.gpsFix = "Not fix";
  } else if (gpsFix === 1) {
    data.gpsFix = "2D fix";
  } else if (gpsFix === 2) {
    data.gpsFix = "3D fix";
  }

  if (reportType === 2) {
    data.reportType = "Periodic mode report";
  } else if (reportType === 4) {
    data.reportType = "Motion mode static report";
  } else if (reportType === 5) {
    data.reportType = "Motion mode moving report";
  } else if (reportType === 6) {
    data.reportType = "Motion mode static to moving report";
  } else if (reportType === 7) {
    data.reportType = "Motion mode moving to static report";
  } else if (reportType === 15) {
    data.reportType = "Low battery alarm report";
  }
  const batteryPercent = Bits.bitsToUnsigned(bits.substr(72, 8));

  emit("sample", {
    data: { batteryPercent },
    topic: "lifecycle",
  });
  emit("sample", { data, topic: "default" });
}
