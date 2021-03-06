function swap16(val) {
  return ((val & 0xff) << 8) | ((val >> 8) & 0xff);
}

function consume(event) {
  var payload = event.data.payloadHex;
  var bits = Bits.hexToBits(payload);
  var data = {};
  var lifecycle = {};
  var topic = "default";

  data.open = !!Bits.bitsToUnsigned(bits.substr(0, 8));

  lifecycle.voltage = Bits.bitsToUnsigned(bits.substr(8, 4));
  lifecycle.voltage = (25 + lifecycle.voltage) / 10;
  lifecycle.voltage = Math.round(lifecycle.voltage * 10) / 10;

  lifecycle.batteryLevel = Bits.bitsToUnsigned(bits.substr(12, 4));
  lifecycle.batteryLevel = 100 * (lifecycle.batteryLevel / 15);
  lifecycle.batteryLevel = Math.round(lifecycle.batteryLevel);

  data.temperature = Bits.bitsToUnsigned(bits.substr(17, 7));
  data.temperature = data.temperature - 32;

  data.soundAvg = Bits.bitsToUnsigned(bits.substr(24, 8));

  emit("sample", { data: lifecycle, topic: "lifecycle" });
  emit("sample", { data: data, topic: topic });
}
