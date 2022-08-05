function pad(n) {
  return String(n).padStart(2, "0");
}

function consume(event) {
  const payload = event.data.payloadHex;
  const bits = Bits.hexToBits(payload);
  let data = {};
  let topic = "default";
  const uplinkId = payload.substring(0, 2);

  switch (uplinkId.toUpperCase()) {
    case "01": {
      data.syncID = payload.substring(2, 10);
      data.syncVersion = `${payload.substring(10, 12)}.${payload.substring(
        12,
        14,
      )}.${payload.substring(14, 16)}`;
      data.applicationType = payload.substring(16, 20);
      data.rfu = payload.substring(20);
      emit("sample", { data, topic: "time_sync" });
      break;
    }
    case "0A":
      content = parseTER(payload.trim());
      topic = "IO";
      break;

    case "0E": {
      const { length } = payload;
      let hexpPointer = 2;

      while (length - hexpPointer > 32) {
        data = {};
        let bitPointer = hexpPointer * 4;

        const y = 2000 + Bits.bitsToUnsigned(bits.substr(bitPointer, 7));
        const mo = pad(Bits.bitsToUnsigned(bits.substr((bitPointer += 7), 4)));
        const d = pad(Bits.bitsToUnsigned(bits.substr((bitPointer += 4), 5)));
        const h = pad(Bits.bitsToUnsigned(bits.substr((bitPointer += 5), 5)));
        const m = pad(Bits.bitsToUnsigned(bits.substr((bitPointer += 5), 6)));
        const s = pad(Bits.bitsToUnsigned(bits.substr((bitPointer += 6), 5)));
        const timestamp = new Date(`${y}-${mo}-${d}T${h}:${m}:${s}`);
        hexpPointer += 6;

        data.temperature = Hex.hexLittleEndianToBigEndian(
          payload.substr(hexpPointer, 4),
          true,
        );
        hexpPointer += 4;
        data.humidity = Bits.bitsToUnsigned(bits.substr(hexpPointer * 4, 8));
        hexpPointer += 2;
        data.pressure = Hex.hexLittleEndianToBigEndian(
          payload.substr(hexpPointer, 6),
          false,
        );
        hexpPointer += 6;
        data.lux = Hex.hexLittleEndianToBigEndian(
          payload.substr(hexpPointer, 4),
          false,
        );
        hexpPointer += 4;
        data.voc = Hex.hexLittleEndianToBigEndian(
          payload.substr(hexpPointer, 4),
          false,
        );
        hexpPointer += 4;
        data.co2 = Hex.hexLittleEndianToBigEndian(
          payload.substr(hexpPointer, 4),
          false,
        );
        hexpPointer += 4;

        data.batteryLevel = Number(
          parseInt(payload.substr(66, 68), 16).toFixed(),
        );
        data.rfu = payload.substr(68);

        emit("sample", { data, topic: "climate", timestamp });
      }

      break;
    }
    default:
      content = null;
      break;
  }
}
