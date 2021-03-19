var decentlab_decoder = {
  PROTOCOL_VERSION: 2,
  SENSORS: [
    {
      length: 16,
      values: [{
        name: 'soil_moisture_at_depth_0',
        displayName: 'Soil moisture at depth 0',
        convert: function (x) { return (x[0] - 2500) / 500; }
      },
      {
        name: 'soil_temperature_at_depth_0',
        displayName: 'Soil temperature at depth 0',
        convert: function (x) { return (x[1] - 32768) / 100; },
        unit: '°C'
      },
      {
        name: 'soil_moisture_at_depth_1',
        displayName: 'Soil moisture at depth 1',
        convert: function (x) { return (x[2] - 2500) / 500; }
      },
      {
        name: 'soil_temperature_at_depth_1',
        displayName: 'Soil temperature at depth 1',
        convert: function (x) { return (x[3] - 32768) / 100; },
        unit: '°C'
      },
      {
        name: 'soil_moisture_at_depth_2',
        displayName: 'Soil moisture at depth 2',
        convert: function (x) { return (x[4] - 2500) / 500; }
      },
      {
        name: 'soil_temperature_at_depth_2',
        displayName: 'Soil temperature at depth 2',
        convert: function (x) { return (x[5] - 32768) / 100; },
        unit: '°C'
      },
      {
        name: 'soil_moisture_at_depth_3',
        displayName: 'Soil moisture at depth 3',
        convert: function (x) { return (x[6] - 2500) / 500; }
      },
      {
        name: 'soil_temperature_at_depth_3',
        displayName: 'Soil temperature at depth 3',
        convert: function (x) { return (x[7] - 32768) / 100; },
        unit: '°C'
      },
      {
        name: 'soil_moisture_at_depth_4',
        displayName: 'Soil moisture at depth 4',
        convert: function (x) { return (x[8] - 2500) / 500; }
      },
      {
        name: 'soil_temperature_at_depth_4',
        displayName: 'Soil temperature at depth 4',
        convert: function (x) { return (x[9] - 32768) / 100; },
        unit: '°C'
      },
      {
        name: 'soil_moisture_at_depth_5',
        displayName: 'Soil moisture at depth 5',
        convert: function (x) { return (x[10] - 2500) / 500; }
      },
      {
        name: 'soil_temperature_at_depth_5',
        displayName: 'Soil temperature at depth 5',
        convert: function (x) { return (x[11] - 32768) / 100; },
        unit: '°C'
      },
      {
        name: 'soil_moisture_at_depth_6',
        displayName: 'Soil moisture at depth 6',
        convert: function (x) { return (x[12] - 2500) / 500; }
      },
      {
        name: 'soil_temperature_at_depth_6',
        displayName: 'Soil temperature at depth 6',
        convert: function (x) { return (x[13] - 32768) / 100; },
        unit: '°C'
      },
      {
        name: 'soil_moisture_at_depth_7',
        displayName: 'Soil moisture at depth 7',
        convert: function (x) { return (x[14] - 2500) / 500; }
      },
      {
        name: 'soil_temperature_at_depth_7',
        displayName: 'Soil temperature at depth 7',
        convert: function (x) { return (x[15] - 32768) / 100; },
        unit: '°C'
      }]
    },
    {
      length: 1,
      values: [{
        name: 'battery_voltage',
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
  data.soilMoistureAtDepth0 = sample["soil_moisture_at_depth_0"];
  data.soilTemperatureAtDepth0 = sample["soil_temperature_at_depth_0"];
  data.soilMoistureAtDepth1 = sample["soil_moisture_at_depth_1"];
  data.soilTemperatureAtDepth1 = sample["soil_temperature_at_depth_1"];
  data.soilMoistureAtDepth2 = sample["soil_moisture_at_depth_2"];
  data.soilTemperatureAtDepth2 = sample["soil_temperature_at_depth_2"];
  data.soilMoistureAtDepth3 = sample["soil_moisture_at_depth_3"];
  data.soilTemperatureAtDepth3 = sample["soil_temperature_at_depth_3"];
  data.soilMoistureAtDepth4 = sample["soil_moisture_at_depth_4"];
  data.soilTemperatureAtDepth4 = sample["soil_temperature_at_depth_4"];
  data.soilMoistureAtDepth5 = sample["soil_moisture_at_depth_5"];
  data.soilTemperatureAtDepth5 = sample["soil_temperature_at_depth_5"];
  data.soilMoistureAtDepth6 = sample["soil_moisture_at_depth_6"];
  data.soilTemperatureAtDepth6 = sample["soil_temperature_at_depth_6"];
  data.soilMoistureAtDepth7 = sample["soil_moisture_at_depth_7"];
  data.soilTemperatureAtDepth7 = sample["soil_temperature_at_depth_7"];

  // Lifecycle values
  lifecycle.voltage = sample["battery_voltage"];
  lifecycle.protocolVersion = sample["protocol_version"];
  lifecycle.deviceID = sample["device_id"];

  if (deleteUnusedKeys(data)) {
    emit('sample', { "data": data, "topic": "default" });
  }

  if (deleteUnusedKeys(lifecycle)) {
    emit('sample', { "data": lifecycle, "topic": "lifecycle" });
  }
}
