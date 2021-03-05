function consume(event) {

  var payload = event.data.payload_hex;
  var port = event.data.port;
  var data = {};
  var topic = "occupancy";

  if (port == 1 || port == 2) {
    data.occupancy = parseInt("0x" + payload, 16) & 0x01;
  }

  if (port == 3) {
    var reset_dict = {
      0x01: "Watchdog reset",
      0x02: "Power On Reset",
      0x03: "System Request Reset",
      0x04: "Other Resets"
    };
    data.debug = "0x" + payload.substring(0, 24).toUpperCase();
    data.fw_version =
      parseInt("0x" + payload.substring(24, 26), 16) +
      "." +
      parseInt("0x" + payload.substring(26, 28), 16) +
      "." +
      parseInt("0x" + payload.substring(28, 30), 16);
    var reset_cause = parseInt("0x" + payload.substring(30, 32), 16);
    var occupancy = parseInt("0x" + payload.substring(32, 34), 16);

    data.reset_cause = reset_dict[reset_cause];
    data.occupancy = occupancy & 0x01;

    topic = "lifecycle";
  }

  emit('sample', { data: data, topic: topic });
}