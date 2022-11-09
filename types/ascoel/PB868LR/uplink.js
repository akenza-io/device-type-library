function hex2ascii(hexx) {
  const hex = hexx.toString(); // force conversion
  let str = "";
  for (let i = 0; i < hex.length; i += 2) {
    str += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
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
      data.downlinkNr = Bits.bitsToUnsigned(bits.substr(0, 32));
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
    case 7:
      data.firmwareVersion = `${Bits.bitsToUnsigned(
        bits.substr(0, 8),
      )}.${Bits.bitsToUnsigned(bits.substr(8, 8))}.${Bits.bitsToUnsigned(
        bits.substr(16, 16),
      )}`;
      data.loraVersion = `${Bits.bitsToUnsigned(
        bits.substr(32, 8),
      )}.${Bits.bitsToUnsigned(bits.substr(40, 8))}.${Bits.bitsToUnsigned(
        bits.substr(48, 8),
      )}`;
      data.hardwareRevision = hex2ascii(payload.substr(14, 2));
      topic = "debug";
      break;
    case 8:
      data.batteryLevel = Bits.bitsToUnsigned(bits.substr(0, 8));
      topic = "lifecycle";
      break;
    case 9:
      data.batteryLevel = Bits.bitsToUnsigned(bits.substr(0, 8));
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
      data.buttonPushed = !!Bits.bitsToUnsigned(bits.substr(7, 1));
      data.count = Bits.bitsToUnsigned(bits.substr(8, 16));
      break;
    default:
      break;
  }

  emit("sample", { data, topic });
}
