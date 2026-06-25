function consume(event) {
  const payload = event.data.payloadHex;
  const bytes = Hex.hexToBytes(payload);

  // Payload layout (7 bytes), per the official Pressac decoder
  // (pressac-communications/SensorDecoders) — note the channel order:
  //   0-1  channel 3 current (little-endian, signed)
  //   2-3  channel 1 current (little-endian, signed)
  //   4-5  channel 2 current (little-endian, signed)
  //   6    counter - number of 30 second readings taken
  if (bytes.length < 7) {
    return;
  }

  function parse16Bit(low, high) {
    const val = (high << 8) | low;
    return (val & 0x8000) ? val - 0x10000 : val;
  }

  const raw1 = parse16Bit(bytes[0], bytes[1]);
  const raw2 = parse16Bit(bytes[2], bytes[3]);
  const raw3 = parse16Bit(bytes[4], bytes[5]);

  const data = {
    ch1Current: parseFloat((Math.abs(raw2) / 100).toFixed(2)),
    ch2Current: parseFloat((Math.abs(raw3) / 100).toFixed(2)),
    ch3Current: parseFloat((Math.abs(raw1) / 100).toFixed(2)),
    counter: bytes[6],
  };

  emit("sample", { data, topic: "default" });
}
