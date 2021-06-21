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
  const payload = event.data.payload_hex;
  const bits = Bits.hexToBits(payload);
  const data = {};

  // Header 00
  const header = Bits.bitsToUnsigned(bits.substr(0, 8));

  // Data
  if (header === 0) {
    data.header = "Standard";

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
    let en = hexSwap(payload.substr(6, 8));

    if (payload.substr(2, 6) === "0CFB01") {
      unit = "MWH";
    } else if (payload.substr(2, 6) === "0CFB09") {
      unit = "GJ";
    } else {
      switch (difVifEnergie) {
        case "0c07":
          unit = "MWH";
          en /= 10;
          break;
        case "0c07":
          unit = "MWH";
          en /= 100;
          break;
        case "0c06":
          unit = "MWH";
          en /= 1000;
          break;
        // case '0C06': unit = 'kWh';break;
        case "0c0f":
          unit = "GJ";
          en /= 10;
          break;
        case "0c0e":
          unit = "GJ";
          en /= 100;
          break;
        case "0c0e":
          unit = "GJ";
          en /= 1000;
          break;
        default:
          break;
        // case '0C0E': unit = 'MJ';break;
      }
    }
    data.energyUnit = unit;
    data.energy = en;

    // Volumen m3
    let vol = hexSwap(payload.substr(18, 8));
    switch (difVifVolumen) {
      case "0c14":
        vol /= 100;
        break;
      case "0c15":
        vol /= 10;
        break;
      default:
        break;
    }
    data.volume = vol;

    // Leistung kW
    let kw = hexSwap(payload.substr(30, 6));
    switch (difVifLeistung) {
      case "0b2b":
        kw /= 1000;
        break;
      case "0b2c":
        kw /= 100;
        break;
      case "0b2d":
        kw /= 10;
        break;
      default:
        break;
    }
    data.power = kw;

    // Durchfluss m3/h
    let df = hexSwap(payload.substr(40, 6));
    switch (difVifDurchfluss) {
      case "0b3b":
        df /= 1000;
        break;
      case "0b3c":
        df /= 100;
        break;
      case "0b3d":
        df /= 10;
        break;
      default:
        break;
    }
    data.flow = df;

    // Vorlauftemp
    var vlt = hexSwap(payload.substr(50, 4));
    switch (difVifVorlauftemp) {
      case "0a5a":
        vlt /= 10;
        break;
      default:
        break;
    }
    data.flowTemp = vlt;

    // Rücklauftemperatur
    var vlt = hexSwap(payload.substr(58, 4));
    switch (difVifRuecklauftemp) {
      case "0a5e":
        vlt /= 10;
        break;
      default:
        break;
    }
    data.backFlowTemp = vlt;

    // Seriennummer des Zählers
    data.sID = hexSwap(payload.substr(66, 8));

    // Fehler Flags
    data.errFlags = hexSwap(payload.substr(78, 6));
  } else if (header === 1) {
    data.header = "Compact";
  } else if (header === 2) {
    data.header = "JSON";
  } else if (header === 3) {
    data.header = "Scheduled";
  }

  const sample = { data };

  emit("sample", sample);
}
