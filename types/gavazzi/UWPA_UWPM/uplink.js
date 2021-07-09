// INT32 - Little Endian
function INT32LE(hex, signed) {
  const data = hex.match(/../g);
  const buf = new ArrayBuffer(4);
  const view = new DataView(buf);
  let num = 0;

  if (signed) {
    data.forEach((b, i) => {
      view.setInt8(i, parseInt(b, 16));
    });
    num = view.getInt32(0, 1);
  } else {
    data.forEach((b, i) => {
      view.setUint8(i, parseInt(b, 16));
    });
    num = view.getUint32(0, 1);
  }

  return num;
}

function consume(event) {
  const payload = event.data.payloadHex;
  const bits = Bits.hexToBits(payload);
  const data = {};

  const appContext = Bits.bitsToUnsigned(bits.substr(0, 8));
  let pointer = 2;

  if (appContext === 1) {
    while (pointer < payload.length) {
      const header = Bits.bitsToUnsigned(bits.substr(pointer * 4, 8));

      pointer += 2;
      if (header === 60) {
        data.totalKWh = parseFloat(
          (INT32LE(payload.substr(pointer, 8), false) * 0.1).toFixed(4),
        );
        pointer += 16;
      } else if (header === 145) {
        data.l2V = parseFloat(
          (INT32LE(payload.substr(pointer, 8), false) * 0.1).toFixed(4),
        );
        pointer += 8;
      } else if (header === 146) {
        data.l2A = parseFloat(
          (INT32LE(payload.substr(pointer, 8), false) * 0.001).toFixed(4),
        );
        pointer += 8;
      } else if (header === 147) {
        data.l2KW = parseFloat(
          (INT32LE(payload.substr(pointer, 8), true) * 0.000001).toFixed(4),
        );
        pointer += 8;
      } else if (header === 255) {
        // Date
        break;
      } else {
        break;
      }
    }
  }

  emit("sample", { data, topic: "default" });
}
