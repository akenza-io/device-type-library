
/* https://www.decentlab.com/products/wind-speed-wind-direction-and-temperature-sensor-for-lorawan */

const decentlab_decoder = {
  PROTOCOL_VERSION: 2,
  SENSORS: [
    {length: 8,
     values: [{name: 'wind_speed',
               displayName: 'Wind speed',
               convert: function (x) { return (x[0] - 32768) / 100; },
               unit: 'm⋅s⁻¹'},
              {name: 'wind_direction',
               displayName: 'Wind direction',
               convert: function (x) { return (x[1] - 32768) / 10; },
               unit: '°'},
              {name: 'maximum_wind_speed',
               displayName: 'Maximum wind speed',
               convert: function (x) { return (x[2] - 32768) / 100; },
               unit: 'm⋅s⁻¹'},
              {name: 'air_temperature',
               displayName: 'Air temperature',
               convert: function (x) { return (x[3] - 32768) / 10; },
               unit: '°C'},
              {name: 'x_orientation_angle',
               displayName: 'X orientation angle',
               convert: function (x) { return (x[4] - 32768) / 10; },
               unit: '°'},
              {name: 'y_orientation_angle',
               displayName: 'Y orientation angle',
               convert: function (x) { return (x[5] - 32768) / 10; },
               unit: '°'},
              {name: 'north_wind_speed',
               displayName: 'North wind speed',
               convert: function (x) { return (x[6] - 32768) / 100; },
               unit: 'm⋅s⁻¹'},
              {name: 'east_wind_speed',
               displayName: 'East wind speed',
               convert: function (x) { return (x[7] - 32768) / 100; },
               unit: 'm⋅s⁻¹'}]},
    {length: 1,
     values: [{name: 'battery_voltage',
               displayName: 'Battery voltage',
               convert: function (x) { return x[0] / 1000; },
               unit: 'V'}]}
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
      return {error: "protocol version " + version + " doesn't match v2"};
    }

    var deviceId = this.read_int(bytes, 1);
    var flags = this.read_int(bytes, 3);
    var result = {'protocol_version': version, 'device_id': deviceId};
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
          result[value.name] = {displayName: value.displayName,
                                value: value.convert.bind(this)(x)};
          if ('unit' in value)
            result[value.name]['unit'] = value.unit;
        }
      }
    }
    return result;
  }
};

function deleteUnusedKeys(data) {
  let keysRetained = false;
  Object.keys(data).forEach((key) => {
    if (data[key] === undefined) {
      delete data[key];
    } else {
      keysRetained = true;
    }
  });
  return keysRetained;
}

function calcBatteryPercent(number, max, min) {
  const percent = (number - min) / (max - min) * 100;
  return Math.round(Math.max(0, Math.min(100, percent)));
}

function consume(event) {
  const payload = event.data.payloadHex;
  const sample = decentlab_decoder.decode(payload);

  const data = {};
  data.windSpeed = sample.wind_speed.value;
  data.windDirection = sample.wind_direction.value;
  data.maximumWindSpeed = sample.maximum_wind_speed.value;
  data.temperature = sample.air_temperature.value;
  data.xOrientationAngle = sample.x_orientation_angle.value;
  data.yOrientationAngle = sample.y_orientation_angle.value;
  data.northWindSpeed = sample.north_wind_speed.value;
  data.eastWindSpeed = sample.east_wind_speed.value;

  const lifecycle = {};
  lifecycle.batteryVoltage = sample.battery_voltage.value;
  lifecycle.batteryLevel = calcBatteryPercent(sample.battery_voltage.value, 3, 2);
  lifecycle.protocolVersion = sample.protocol_version;
  lifecycle.deviceId = sample.device_id;

  if (deleteUnusedKeys(data)) {
    emit("sample", { data: data, topic: "default" });
  }

  if (deleteUnusedKeys(lifecycle)) {
    emit("sample", { data: lifecycle, topic: "lifecycle" });
  }
}