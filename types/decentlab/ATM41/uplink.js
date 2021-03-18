var decentlab_decoder = {
  PROTOCOL_VERSION: 2,
  SENSORS: [
    {
      length: 17,
      values: [{
        name: 'solar_radiation',
        displayName: 'Solar radiation',
        convert: function (x) { return x[0] - 32768; },
        unit: 'W⋅m⁻²'
      },
      {
        name: 'precipitation',
        displayName: 'Precipitation',
        convert: function (x) { return (x[1] - 32768) / 1000; },
        unit: 'mm'
      },
      {
        name: 'lightning_strike_count',
        displayName: 'Lightning strike count',
        convert: function (x) { return x[2] - 32768; }
      },
      {
        name: 'lightning_average_distance',
        displayName: 'Lightning average distance',
        convert: function (x) { return x[3] - 32768; },
        unit: 'km'
      },
      {
        name: 'wind_speed',
        displayName: 'Wind speed',
        convert: function (x) { return (x[4] - 32768) / 100; },
        unit: 'm⋅s⁻¹'
      },
      {
        name: 'wind_direction',
        displayName: 'Wind direction',
        convert: function (x) { return (x[5] - 32768) / 10; },
        unit: '°'
      },
      {
        name: 'maximum_wind_speed',
        displayName: 'Maximum wind speed',
        convert: function (x) { return (x[6] - 32768) / 100; },
        unit: 'm⋅s⁻¹'
      },
      {
        name: 'air_temperature',
        displayName: 'Air temperature',
        convert: function (x) { return (x[7] - 32768) / 10; },
        unit: '°C'
      },
      {
        name: 'vapor_pressure',
        displayName: 'Vapor pressure',
        convert: function (x) { return (x[8] - 32768) / 100; },
        unit: 'kPa'
      },
      {
        name: 'atmospheric_pressure',
        displayName: 'Atmospheric pressure',
        convert: function (x) { return (x[9] - 32768) / 100; },
        unit: 'kPa'
      },
      {
        name: 'relative_humidity',
        displayName: 'Relative humidity',
        convert: function (x) { return (x[10] - 32768) / 10; },
        unit: '%'
      },
      {
        name: 'sensor_temperature_internal',
        displayName: 'Sensor temperature (internal)',
        convert: function (x) { return (x[11] - 32768) / 10; },
        unit: '°C'
      },
      {
        name: 'x_orientation_angle',
        displayName: 'X orientation angle',
        convert: function (x) { return (x[12] - 32768) / 10; },
        unit: '°'
      },
      {
        name: 'y_orientation_angle',
        displayName: 'Y orientation angle',
        convert: function (x) { return (x[13] - 32768) / 10; },
        unit: '°'
      },
      {
        name: 'compass_heading',
        displayName: 'Compass heading',
        convert: function (x) { return x[14] - 32768; },
        unit: '°'
      },
      {
        name: 'north_wind_speed',
        displayName: 'North wind speed',
        convert: function (x) { return (x[15] - 32768) / 100; },
        unit: 'm⋅s⁻¹'
      },
      {
        name: 'east_wind_speed',
        displayName: 'East wind speed',
        convert: function (x) { return (x[16] - 32768) / 100; },
        unit: 'm⋅s⁻¹'
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
  data.solar_radiation = sample["solar_radiation"];
  data.precipitation = sample["precipitation"];
  data.lightning_strike_count = sample["lightning_strike_count"];
  data.lightning_average_distance = sample["lightning_average_distance"];
  data.wind_speed = sample["wind_speed"];
  data.wind_direction = sample["wind_direction"];
  data.maximum_wind_speed = sample["maximum_wind_speed"];
  data.temperature = sample["air_temperature"];
  data.vapor_pressure = sample["vapor_pressure"];
  data.atmospheric_pressure = sample["atmospheric_pressure"];
  data.humidity = sample["relative_humidity"];
  data.east_wind_speed = sample["east_wind_speed"];
  data.north_wind_speed = sample["north_wind_speed"];

  // Lifecycle values
  lifecycle.voltage = sample["voltage"];
  lifecycle.protocolVersion = sample["protocol_version"];
  lifecycle.deviceID = sample["device_id"];
  lifecycle.sensor_temperature_internal = sample["sensor_temperature_internal"];
  lifecycle.x_orientation_angle = sample["x_orientation_angle"];
  lifecycle.y_orientation_angle = sample["y_orientation_angle"];
  lifecycle.compass_heading = sample["compass_heading"];

  if (deleteUnusedKeys(data)) {
    emit('sample', { "data": data, "topic": "default" });
  }

  if (deleteUnusedKeys(lifecycle)) {
    emit('sample', { "data": lifecycle, "topic": "lifecycle" });
  }
}