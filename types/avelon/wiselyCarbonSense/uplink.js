var Bits = require('bits');

function consume(event) {
  var payload = event.data.payload_hex;
  var bits = Bits.hexToBits(payload);
  var data = {};
  var date = new Date();

  emit('sample', { data: { "statusPercent": 100.0 * Bits.bitsToUnsigned(bits.substr(0, 8)) / 254.0 }, topic: "lifecycle" });

  var pointer = 8;
  for (var i = 0; pointer < bits.length - 8; i++) {
    var a = Bits.bitsToUnsigned(bits.substr(pointer, 8)) << 8; pointer += 8;
    var b = Bits.bitsToUnsigned(bits.substr(pointer, 8)); pointer += 8;
    data.pressure = (a | b) / 10.0;

    var c = Bits.bitsToUnsigned(bits.substr(pointer, 8)) << 8; pointer += 8;
    var d = Bits.bitsToUnsigned(bits.substr(pointer, 8)); pointer += 8;
    data.temperature = (c | d) / 10.0;

    data.humidity = (Bits.bitsToUnsigned(bits.substr(pointer, 8)) / 2); pointer += 8;

    var e = Bits.bitsToUnsigned(bits.substr(pointer, 8)) << 8; pointer += 8;
    var f = Bits.bitsToUnsigned(bits.substr(pointer, 8)); pointer += 8;

    data.co2 = (e | f);

    if (i == 0) {
      emit('sample', { data: data });
    } else {
      var outTime = new Date(date.setMinutes(date.getMinutes() - 10));
      emit('sample', { data: data, time: outTime });
    }
    data = {};
  }
}