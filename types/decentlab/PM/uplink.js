
/* https://www.decentlab.com/products/particulate-matter-temperature-humidity-and-barometric-pressure-sensor-for-lorawan */

const decentlab_decoder = {
  PROTOCOL_VERSION: 2,
  SENSORS: [
    {length: 1,
     values: [{name: 'battery_voltage',
               displayName: 'Battery voltage',
               convert: function (x) { return x[0] / 1000; },
               unit: 'V'}]},
    {length: 10,
     values: [{name: 'pm1_0_mass_concentration',
               displayName: 'PM1.0 mass concentration',
               convert: function (x) { return x[0] / 10; },
               unit: 'µg⋅m⁻³'},
              {name: 'pm2_5_mass_concentration',
               displayName: 'PM2.5 mass concentration',
               convert: function (x) { return x[1] / 10; },
               unit: 'µg⋅m⁻³'},
              {name: 'pm4_mass_concentration',
               displayName: 'PM4 mass concentration',
               convert: function (x) { return x[2] / 10; },
               unit: 'µg⋅m⁻³'},
              {name: 'pm10_mass_concentration',
               displayName: 'PM10 mass concentration',
               convert: function (x) { return x[3] / 10; },
               unit: 'µg⋅m⁻³'},
              {name: 'typical_particle_size',
               displayName: 'Typical particle size',
               convert: function (x) { return x[4]; },
               unit: 'nm'},
              {name: 'pm0_5_number_concentration',
               displayName: 'PM0.5 number concentration',
               convert: function (x) { return x[5] / 10; },
               unit: '1⋅cm⁻³'},
              {name: 'pm1_0_number_concentration',
               displayName: 'PM1.0 number concentration',
               convert: function (x) { return x[6] / 10; },
               unit: '1⋅cm⁻³'},
              {name: 'pm2_5_number_concentration',
               displayName: 'PM2.5 number concentration',
               convert: function (x) { return x[7] / 10; },
               unit: '1⋅cm⁻³'},
              {name: 'pm4_number_concentration',
               displayName: 'PM4 number concentration',
               convert: function (x) { return x[8] / 10; },
               unit: '1⋅cm⁻³'},
              {name: 'pm10_number_concentration',
               displayName: 'PM10 number concentration',
               convert: function (x) { return x[9] / 10; },
               unit: '1⋅cm⁻³'}]},
    {length: 2,
     values: [{name: 'air_temperature',
               displayName: 'Air temperature',
               convert: function (x) { return 175.72 * x[0] / 65536 - 46.85; },
               unit: '°C'},
              {name: 'air_humidity',
               displayName: 'Air humidity',
               convert: function (x) { return 125 * x[1] / 65536 - 6; },
               unit: '%'}]},
    {length: 1,
     values: [{name: 'barometric_pressure',
               displayName: 'Barometric pressure',
               convert: function (x) { return x[0] * 2; },
               unit: 'Pa'}]}
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
  data.pm1_0MassConcentration = sample.pm1_0_mass_concentration.value;
  data.pm2_5MassConcentration = sample.pm2_5_mass_concentration.value;
  data.pm4MassConcentration = sample.pm4_mass_concentration.value;
  data.pm10MassConcentration = sample.pm10_mass_concentration.value;
  data.typicalParticleSize = sample.typical_particle_size.value;
  data.pm0_5NumberConcentration = sample.pm0_5_number_concentration.value;
  data.pm1_0NumberConcentration = sample.pm1_0_number_concentration.value;
  data.pm2_5NumberConcentration = sample.pm2_5_number_concentration.value;
  data.pm4NumberConcentration = sample.pm4_number_concentration.value;
  data.pm10NumberConcentration = sample.pm10_number_concentration.value;
  data.temperature = sample.air_temperature.value;
  data.humidity = sample.air_humidity.value;
  data.pressure = sample.barometric_pressure.value;

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