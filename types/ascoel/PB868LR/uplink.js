function hex2ascii(hexx) {
  const hex = hexx.toString(); // force conversion
  let str = "";
  for (let i = 0; i < hex.length; i += 2) {
    str += String.fromCharCode(parseInt(hex.substring(i, i + 2), 16));
  }
  return str;
}

function consume(event) {
  const payload = event.data.payloadHex;
  const { port } = event.data;
  const bits = Bits.hexToBits(payload);
  const data = {};
  let topic = "default";

  switch (port) {
    case 2:
      data.downlinkNr = Bits.bitsToUnsigned(bits.substring(0, 32));
      topic = "debug";
      break;
    case 5:
      if (payload === "50423836384C5248") {
        data.sensor = "PB868LRH";
      } else {
        data.sensor = "PB868LRI";
      }
      topic = "boot";
      break;
    case 6:
      data.serialNumber = payload;
      topic = "debug";
      break;
    case 7: {
      const majorVersion = Bits.bitsToUnsigned(bits.substring(0, 8));
      const minorVersion = Bits.bitsToUnsigned(bits.substring(8, 16));
      const buildVersion = Bits.bitsToUnsigned(bits.substring(16, 32));
      data.firmwareVersion = `${majorVersion}.${minorVersion}.${buildVersion}`;

      const majorLora = Bits.bitsToUnsigned(bits.substring(32, 40));
      const minorLora = Bits.bitsToUnsigned(bits.substring(40, 48));
      const buildLora = Bits.bitsToUnsigned(bits.substring(48, 56));
      data.loraVersion = `${majorLora}.${minorLora}.${buildLora}`;
      data.hardwareRevision = hex2ascii(payload.substring(14, 16));
      topic = "debug";
      break;
    }
    case 8:
      data.batteryLevel = Bits.bitsToUnsigned(bits.substring(0, 8));
      topic = "lifecycle";
      break;
    case 9:
      data.batteryLevel = Bits.bitsToUnsigned(bits.substring(0, 8));
      topic = "lifecycle";
      break;
    case 10:
      if (payload.length > 8) {
        data.acknowledge = false;
      } else {
        data.acknowledge = true;
      }
      topic = "debug";
      break;
    case 40:
      data.buttonPushed = !!Bits.bitsToUnsigned(bits.substring(7, 8));
      data.buttonPushedNumeric = Number(data.buttonPushed);
      data.count = Bits.bitsToUnsigned(bits.substring(8, 24));
      break;
    default:
      break;
  }

  emit("sample", { data, topic });
}
