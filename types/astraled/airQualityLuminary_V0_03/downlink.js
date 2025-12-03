function intToHex(number) {
  let base = Number(number).toString(16);
  if (base.length % 2) {
    base = `0${base}`;
  }

  let hex = "";
  for (let i = 0; i < base.length; i += 2) {
    hex = base.slice(i, i + 2) + hex;
  }

  return hex;
}

function decimalToLittleEndianHex(decimalNumber) {
  const buffer = new ArrayBuffer(2);
  const dataView = new DataView(buffer);

  dataView.setUint16(0, decimalNumber, true);
  let hex = '';
  for (let i = 0; i < buffer.byteLength; i++) {
    const byteValue = dataView.getUint8(i);
    const byteHex = byteValue.toString(16).padStart(2, '0');
    hex += byteHex;
  }

  return hex.toUpperCase();
}

// Chainable
function encodeDownlink(type, target, value = 0) {
  let hex = "";
  switch (type) {
    case "CYCLE":
      // buffer += "0000";
      break;
    case "WRITE": {
      // buffer += "0100";
      switch (target) {
        case "THRESHOLD_GOOD":
          // 0100 // As length is always 4
          hex = "4415";
          hex += decimalToLittleEndianHex(value.co2);
          hex += decimalToLittleEndianHex(value.voc);
          break;
        case "THRESHOLD_OK":
          // 0100 // As length is always 4
          hex = "4416";
          hex += decimalToLittleEndianHex(value.co2);
          hex += decimalToLittleEndianHex(value.voc);
          break;
        case "THRESHOLD_BAD":
          // 0100 // As length is always 4
          hex = "4417";
          hex += decimalToLittleEndianHex(value.co2);
          hex += decimalToLittleEndianHex(value.voc);
          break;
      }
      break;
    } case "READ": {
      // buffer += 1100
      // 00000 // As length is always 0
      switch (target) {
        case "THRESHOLD_GOOD":
          hex = "C015";
          break;
        case "THRESHOLD_OK":
          hex = "C016";
          break;
        case "THRESHOLD_BAD":
          hex = "C017";
          break;
        case "WEIGHTED_VALUE":
          hex = "C018";
          break;
        case "COLOR_GOOD":
          hex = "C019";
          break;
        case "COLOR_OK":
          hex = "C01A";
          break;
        case "COLOR_BAD":
          hex = "C01B";
          break;
        case "COLOR_DEATH":
          hex = "C01C";
          break;
        case "COLOR_WARMUP":
          hex = "C01D";
          break;
        default:
          hex = "0000";
          break;
      }
      break;
    }
    default:
      break;
  }
  return hex;
}

function consume(event) {
  const port = 1;
  const confirmed = true;
  let payloadHex = event.payloadHex || "";

  if (payloadHex.length > 1) {
    emit("downlink", { payloadHex, port, confirmed });
  } else if (event.payload.commands !== undefined) {
    const { commands } = event.payload;
    commands.forEach(command => {
      payloadHex += encodeDownlink(command.type, command.target, command.value);
    });

    emit("downlink", {
      payloadHex,
      port,
      confirmed: true,
    });
  }
}
