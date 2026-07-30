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
  const header = Bits.bitsToUnsigned(bits.substring(0, 8));

  // Data
  if (header === 0) {
    lifecycle.header = "STANDARD";

    /* Information for the length and data decoding. */
    const difVifEnergie = payload.substring(2, 6);
    const difVifVolume = payload.substring(14, 18);
    const difVifPower = payload.substring(26, 30);
    const difVifFlow = payload.substring(36, 40);
    const difVifFlowTemp = payload.substring(46, 50);
    const difVifBackFlowTemp = payload.substring(54, 58);
    const difVifSID = payload.substring(62, 66);
    const difVifErrorFlags = payload.substring(74, 78);
    let unit;

    // Energy MWH,kWh,MJ,GJ
    let energy = Number(hexSwap(payload.substring(6, 14)));

    if (payload.substring(2, 8) === "0CFB01") {
      unit = "MWH";
    } else if (payload.substring(2, 8) === "0CFB09") {
      unit = "GJ";
    } else {
      switch (difVifEnergie) {
        case "0C06": // Value is in KWH
          unit = "KWH";
          break;
        case "0C07": // Value is in MWH and divided by 100
          unit = "MWH";
          energy /= 100;
          break;
        case "0C07": // Value is in MWH and divided by 10
          unit = "MWH";
          energy /= 10;
          break;
        case "0C0E": // Value is in MJ
          unit = "MJ";
          break;
        case "0C0F": // Value is in GJ and divided by 100
          unit = "GJ";
          energy /= 100;
          break;
        case "0C0F": // Value is in GJ and divided by 10
          unit = "GJ";
          energy /= 10;
          break;
        default:
          break;
      }
    }
    data.energyUnit = unit;
    data.energy = energy;

    // Volume m^3
    let volume = hexSwap(payload.substring(18, 26));
    switch (difVifVolume) {
      case "0C14": // Value is in m^3 and divided by 100
        volume /= 100;
        break;
      case "0C15": // Value is in m^3 and divided by 10
        volume /= 10;
        break;
      default:
        break;
    }
    data.volume = volume;

    // Power kWh
    let power = hexSwap(payload.substring(30, 36));
    switch (difVifPower) {
      case "0B2B": // Value is in kWh and divided by 1000
        power /= 1000;
        break;
      case "0B2C": // Value is in kWh and divided by 100
        power /= 100;
        break;
      case "0B2D": // Value is in kWh and divided by 10
        power /= 10;
        break;
      default:
        break;
    }
    data.power = power;

    // Flow m3/h
    let flow = hexSwap(payload.substring(40, 46));
    switch (difVifFlow) {
      case "0B3B": // Value is in m3/h and divided by 1000
        flow /= 1000;
        break;
      case "0B3C": // Value is in m3/h and divided by 100
        flow /= 100;
        break;
      case "0B3D": // Value is in m3/h and divided by 10
        flow /= 10;
        break;
      default:
        break;
    }
    data.flow = flow;

    // Flow temperature
    const vlt = hexSwap(payload.substring(50, 54));
    if (difVifFlowTemp === "0A5A") {
      // Value is in °C and divided by 10
      data.flowTemp = vlt / 10;
    }

    // Back flow temperature
    const rlt = hexSwap(payload.substring(58, 62));
    if (difVifBackFlowTemp === "0A5E") {
      // Value is in °C and divided by 10
      data.backFlowTemp = rlt / 10;
    }

    // Serial ID
    lifecycle.serialID = Number(hexSwap(payload.substring(66, 74)));

    // Error flags
    lifecycle.errFlags = hexSwap(payload.substring(78, 84));
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
