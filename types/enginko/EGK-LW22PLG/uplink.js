function reverseBytes(bytes) {
  let reversed = bytes;
  if (bytes.length % 2 === 0) {
    reversed = "";
    for (let starting = 0; starting + 2 <= bytes.length; starting += 2) {
      reversed = bytes.substring(starting, starting + 2) + reversed;
    }
  }
  return reversed;
}

function hexStringToByteArray(s) {
  for (var bytes = [], c = 0; c < s.length; c += 2) {
    bytes.push(parseInt(s.substr(c, 2), 16));
  }
  return bytes;
}

function parseSignedInt(bytes) {
  bytes = reverseBytes(bytes);
  const rno = hexStringToByteArray(bytes);
  let n = 0;
  if (rno.length === 4) {
    n =
      ((rno[0] << 24) & 0xff000000) |
      ((rno[1] << 16) & 0x00ff0000) |
      ((rno[2] << 8) & 0x0000ff00) |
      ((rno[3] << 0) & 0x000000ff);
  }
  return n;
}

function parseUnsignedInt(bytes) {
  bytes = reverseBytes(bytes);
  const n = parseInt(bytes, 16);
  return n;
}

function parseSignedShort(bytes) {
  bytes = reverseBytes(bytes);
  const rno = hexStringToByteArray(bytes);
  var n = 0;
  if (rno.length === 2) {
    var n = (((rno[0] << 8) | rno[1]) << 16) >> 16;
  }
  return n;
}

function parseUnsignedShort(bytes) {
  bytes = reverseBytes(bytes);
  const rno = hexStringToByteArray(bytes);
  let n = 0;
  if (rno.length === 2) {
    n = ((rno[0] << 8) & 0x0000ff00) | ((rno[1] << 0) & 0x000000ff);
  }
  return n;
}

function consume(event) {
  const payload = event.data.payloadHex;
  const uplinkId = payload.substring(0, 2);
  const data = {};
  let topic = "default";

  if (uplinkId.toUpperCase() === "01") {
    topic = "time_sync";
    data.syncID = payload.substring(2, 10);
    data.syncVersion = `${payload.substring(10, 12)}.${payload.substring(
      12,
      14,
    )}.${payload.substring(14, 16)}`;
    data.applicationType = payload.substring(16, 20);
    data.rfu = payload.substring(20);
  }
  if (uplinkId.toUpperCase() === "09") {
    data.activeEnergy = Number(parseSignedInt(payload.substring(10, 18)));
    data.reactiveEnergy = Number(parseSignedInt(payload.substring(18, 26)));
    data.apparentEnergy = Number(parseSignedInt(payload.substring(26, 34)));

    if (payload.length > 42) {
      data.activePower = Number(parseSignedShort(payload.substring(34, 38)));
      data.reactivePower = Number(parseSignedShort(payload.substring(38, 42)));
      data.apparentPower = Number(parseSignedShort(payload.substring(42, 46)));
      data.voltage = Number(parseUnsignedShort(payload.substring(46, 50)));
      data.current = Number(parseUnsignedShort(payload.substring(50, 54)));
      data.period = Number(parseUnsignedShort(payload.substring(54, 58)));
      data.frequency = Number(
        1 / (parseUnsignedShort(payload.substring(54, 58)) / 1000000),
      );
      data.activation = Number(parseUnsignedInt(payload.substring(58, 66)));
    } else {
      data.activation = Number(parseUnsignedInt(payload.substring(34, 42)));
    }
  }
  if (uplinkId.toUpperCase() === "0A") {
    topic = "io";
    const firstByte = [];
    const secondByte = [];
    const thirdByte = [];
    const fourthByte = [];

    let k = 0;
    for (let i = 0; i < 3; i++) {
      firstByte[i] = parseInt(payload.substring(k + 10, k + 10 + 2), 16);
      secondByte[i] = parseInt(payload.substring(k + 10 + 2, k + 10 + 4), 16);
      thirdByte[i] = parseInt(payload.substring(k + 10 + 4, k + 10 + 6), 16);
      fourthByte[i] = parseInt(payload.substring(k + 10 + 6, k + 10 + 8), 16);

      k += 8;
    }

    data.inputStatus1_8 = firstByte[0].toString(2);
    data.inputStatus9_16 = secondByte[0].toString(2);
    data.inputStatus17_24 = thirdByte[0].toString(2);
    data.inputStatus25_32 = fourthByte[0].toString(2);

    data.outputStatus1_8 = firstByte[1].toString(2);
    data.outputStatus9_16 = secondByte[1].toString(2);
    data.outputStatus17_24 = thirdByte[1].toString(2);
    data.outputStatus25_32 = fourthByte[1].toString(2);

    data.inputTrigger1_8 = firstByte[2].toString(2);
    data.inputTrigger9_16 = secondByte[2].toString(2);
    data.inputTrigger17_24 = thirdByte[2].toString(2);
    data.inputTrigger25_32 = fourthByte[2].toString(2);
  }

  emit("sample", { data, topic });
}
