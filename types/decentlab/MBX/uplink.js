var decentlab_decoder = {
  PROTOCOL_VERSION: 2,
  SENSORS: [
    {
      length: 2,
      values: [{
        name: 'distance',
        displayName: 'Distance',
        convert: function (x) { return x[0]; },
        unit: 'mm'
      },
      {
        name: 'number_of_valid_samples',
        displayName: 'Number of valid samples',
        convert: function (x) { return x[1]; }
      }]
    },
    {
      length: 1,
      values: [{
        name: 'voltage',
        displayName: 'Battery voltage',
        convert: function (x) { return x[0] / 1000; },
        unit: 'V'
      }]
    }
  ],

  read_int: function (bytes, pos) {
    return (bytes[pos] << 8) + bytes[pos + 1];
  },

  decode: function (msg) {
    var bytes = msg;
    var i, j;
    if (typeof msg === 'string') {
      bytes = [];
      for (i = 0; i < msg.length; i += 2) {
        bytes.push(parseInt(msg.substring(i, i + 2), 16));
      }
    }

    var version = bytes[0];
    if (version != this.PROTOCOL_VERSION) {
      return { error: "protocol version " + version + " doesn't match v2" };
    }

    var deviceId = this.read_int(bytes, 1);
    var flags = this.read_int(bytes, 3);
    var result = { 'protocol_version': version, 'device_id': deviceId };
    // decode payload
    var pos = 5;
    for (i = 0; i < this.SENSORS.length; i++, flags >>= 1) {
      if ((flags & 1) !== 1)
        continue;

      var sensor = this.SENSORS[i];
      var x = [];
      // convert data to 16-bit integer array
      for (j = 0; j < sensor.length; j++) {
        x.push(this.read_int(bytes, pos));
        pos += 2;
      }

      // decode sensor values
      for (j = 0; j < sensor.values.length; j++) {
        var value = sensor.values[j];
        if ('convert' in value) {
          result[value.name] = value.convert.bind(this)(x);
        }
      }
    }
    return result;
  }
};

function deleteUnusedKeys(data) {
  var keysRetained = false;
  Object.keys(data).forEach(key => {
    if (data[key] === undefined) {
      delete data[key];
    } else {
      keysRetained = true;
    }
  });
  return keysRetained;
}

function consume(event) {
  var payload = event.data.payload_hex;
  var sample = decentlab_decoder.decode(payload);
  var data = {};
  var lifecycle = {};

  // Default values
  data.distance = sample["distance"];

  // Lifecycle values
  lifecycle.voltage = sample["voltage"];
  lifecycle.protocolVersion = sample["protocol_version"];
  lifecycle.deviceID = sample["device_id"];
  lifecycle.numberOfValidSamples = sample["number_of_valid_samples"];

  if (deleteUnusedKeys(data)) {
    emit('sample', { "data": data, "topic": "default" });
  }

  if (deleteUnusedKeys(lifecycle)) {
    emit('sample', { "data": lifecycle, "topic": "lifecycle" });
  }
}
/*
function main() {
  console.log(decentlab_decoder.decode("02012f000304d200010bb1"));
  console.log(decentlab_decoder.decode("02012f00020bb1"));
}
*/