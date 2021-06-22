function hexSwap(str) {
  let res = "";
  for (let i = 0; i < str.length; i++) {
    if (i % 2 === 0) {
      res = str.charAt(i) + str.charAt(i + 1) + res;
    }
  }
  return res;
}

function consume(event) {
  const payload = event.data.payloadHex.toUpperCase();
  const bits = Bits.hexToBits(payload);
  const data = {};
  const lifecycle = {};

  // Header 00
  const header = Bits.bitsToUnsigned(bits.substr(0, 8));

  // Data
  if (header === 0) {
    lifecycle.header = "STANDARD";

    /* Information for the length and data decoding. */
    const difVifEnergie = payload.substr(2, 4);
    const difVifVolume = payload.substr(14, 4);
    const difVifPower = payload.substr(26, 4);
    const difVifFlow = payload.substr(36, 4);
    const difVifFlowTemp = payload.substr(46, 4);
    const difVifBackFlowTemp = payload.substr(54, 4);
    const difVifSID = payload.substr(62, 4);
    const difVifErrorFlags = payload.substr(74, 4);
    let unit;

    // Energy MWH,kWh,MJ,GJ
    let energy = Number(hexSwap(payload.substr(6, 8)));

    if (payload.substr(2, 6) === "0CFB01") {
      unit = "MWH";
    } else if (payload.substr(2, 6) === "0CFB09") {
      unit = "GJ";
    } else {
      switch (difVifEnergie) {
        case "0C06":
          unit = "KWH";
          break;
        case "0C07":
          unit = "MWH";
          energy /= 100;
          break;
        case "0C07":
          unit = "MWH";
          energy /= 10;
          break;
        case "0C0E":
          unit = "MJ";
          break;
        case "0C0F":
          unit = "GJ";
          energy /= 100;
          break;
        case "0C0F":
          unit = "GJ";
          energy /= 10;
          break;
        default:
          break;
      }
    }
    data.energyUnit = unit;
    data.energy = energy;

    // Volume m3
    let volume = hexSwap(payload.substr(18, 8));
    switch (difVifVolume) {
      case "0C14":
        volume /= 100;
        break;
      case "0C15":
        volume /= 10;
        break;
      default:
        break;
    }
    data.volume = volume;

    // Power kWh
    let power = hexSwap(payload.substr(30, 6));
    switch (difVifPower) {
      case "0B2B":
        power /= 1000;
        break;
      case "0B2C":
        power /= 100;
        break;
      case "0B2D":
        power /= 10;
        break;
      default:
        break;
    }
    data.power = power;

    // Flow m3/h
    let flow = hexSwap(payload.substr(40, 6));
    switch (difVifFlow) {
      case "0B3B":
        flow /= 1000;
        break;
      case "0B3C":
        flow /= 100;
        break;
      case "0B3D":
        flow /= 10;
        break;
      default:
        break;
    }
    data.flow = flow;

    // Flow temperature
    const vlt = hexSwap(payload.substr(50, 4));
    if (difVifFlowTemp === "0A5A") {
      data.flowTemp = vlt / 10;
    }

    // Back flow temperature
    const rlt = hexSwap(payload.substr(58, 4));
    if (difVifBackFlowTemp === "0A5E") {
      data.backFlowTemp = rlt / 10;
    }

    // Serial ID
    lifecycle.serialID = Number(hexSwap(payload.substr(66, 8)));

    // Error flags
    lifecycle.errFlags = hexSwap(payload.substr(78, 6));
  } else if (header === 1) {
    lifecycle.header = "COMPACT";
  } else if (header === 2) {
    lifecycle.header = "JSON";
  } else if (header === 3) {
    lifecycle.header = "SCHEDULED";
  }

  emit("sample", { data, topic: "default" });
  emit("sample", { data: lifecycle, topic: "lifecycle" });
}
