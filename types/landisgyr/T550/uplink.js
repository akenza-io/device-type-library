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
    lifecycle.header = "STANDART";

    /* Informationen zu Länge und Codierung der Daten. */
    const difVifEnergie = payload.substr(2, 4);
    const difVifVolumen = payload.substr(14, 4);
    const difVifLeistung = payload.substr(26, 4);
    const difVifDurchfluss = payload.substr(36, 4);
    const difVifVorlauftemp = payload.substr(46, 4);
    const difVifRuecklauftemp = payload.substr(54, 4);
    const difVifSID = payload.substr(62, 4);
    const difVifErrorFlags = payload.substr(74, 4);
    let unit;

    // Energie MWH,kWh,MJ,GJ
    let en = Number(hexSwap(payload.substr(6, 8)));

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
          en /= 100;
          break;
        case "0C07":
          unit = "MWH";
          en /= 10;
          break;
        case "0C0E":
          unit = "MJ";
          break;
        case "0C0F":
          unit = "GJ";
          en /= 100;
          break;
        case "0C0F":
          unit = "GJ";
          en /= 10;
          break;
        default:
          break;
      }
    }
    data.energyUnit = unit;
    data.energy = en;

    // Volumen m3
    let vol = hexSwap(payload.substr(18, 8));
    switch (difVifVolumen) {
      case "0C14":
        vol /= 100;
        break;
      case "0C15":
        vol /= 10;
        break;
      default:
        break;
    }
    data.volume = vol;

    // Leistung kW
    let kw = hexSwap(payload.substr(30, 6));
    switch (difVifLeistung) {
      case "0B2B":
        kw /= 1000;
        break;
      case "0B2C":
        kw /= 100;
        break;
      case "0B2D":
        kw /= 10;
        break;
      default:
        break;
    }
    data.power = kw;

    // Durchfluss m3/h
    let df = hexSwap(payload.substr(40, 6));
    switch (difVifDurchfluss) {
      case "0B3B":
        df /= 1000;
        break;
      case "0B3C":
        df /= 100;
        break;
      case "0B3D":
        df /= 10;
        break;
      default:
        break;
    }
    data.flow = df;

    // Vorlauftemp
    const vlt = hexSwap(payload.substr(50, 4));
    if (difVifVorlauftemp === "0A5A") {
      data.flowTemp = vlt / 10;
    }

    // Rücklauftemperatur
    const rlt = hexSwap(payload.substr(58, 4));
    if (difVifRuecklauftemp === "0A5E") {
      data.backFlowTemp = rlt / 10;
    }

    // Seriennummer des Zählers
    lifecycle.serialID = Number(hexSwap(payload.substr(66, 8)));

    // Fehler Flags
    lifecycle.errFlags = hexSwap(payload.substr(78, 6));
  } else if (header === 1) {
    data.header = "COMPACT";
  } else if (header === 2) {
    data.header = "JSON";
  } else if (header === 3) {
    data.header = "SCHEDULED";
  }

  emit("sample", { data, topic: "default" });
  emit("sample", { data: lifecycle, topic: "lifecycle" });
}
