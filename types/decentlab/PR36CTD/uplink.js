function cToF(celsius) { 
 return Math.round(((celsius * 9) / 5 + 32) * 10) / 10; 
 } 


/* https://www.decentlab.com/products/high-precision-pressure-/-liquid-level-temperature-and-electrical-conductivity-sensor-for-lorawan */

const decentlab_decoder = {
  PROTOCOL_VERSION: 2,
  /* device-specific parameters */
  PARAMETERS: {
    kp: 8192,
    kec: 1024
  },
  SENSORS: [
    {length: 4,
     values: [{name: 'pressure',
               displayName: 'Pressure',
               convert: function (x) { return (x[0] - 32768) / this.PARAMETERS.kp; },
               unit: 'bar'},
              {name: 'temperature_electronics',
               displayName: 'Temperature (electronics)',
               convert: function (x) { return (x[1] - 32768) / 256; },
               unit: '°C'},
              {name: 'temperature_pt1000',
               displayName: 'Temperature (PT1000)',
               convert: function (x) { return (x[2] - 32768) / 256; },
               unit: '°C'},
              {name: 'electrical_conductivity',
               displayName: 'Electrical conductivity',
               convert: function (x) { return (x[3] - 32768) / this.PARAMETERS.kec; },
               unit: 'mS⋅cm⁻¹'}]},
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

  if (event.device !== undefined) {
    if (event.device.customFields !== undefined) {
      const { customFields } = event.device;

      if (customFields.kp_pressureMultiplier !== undefined) {
        decentlab_decoder.PARAMETER.kp = customFields.kp_pressureMultiplier;
      }
      if (customFields.kec_electricalConductivityMultiplier !== undefined) {
        decentlab_decoder.PARAMETER.kec = customFields.kec_electricalConductivityMultiplier;
      }
    }
  }

  const sample = decentlab_decoder.decode(payload);

  const data = {};
  data.pressure = sample.pressure.value;
  data.temperatureElectronics = sample.temperature_electronics.value;
 data.temperatureElectronicsF = cToF(data.temperatureElectronics);
  data.temperaturePT1000 = sample.temperature_pt1000.value;
 data.temperaturePT1000F = cToF(data.temperaturePT1000);
  data.electricalConductivity = sample.electrical_conductivity.value;

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