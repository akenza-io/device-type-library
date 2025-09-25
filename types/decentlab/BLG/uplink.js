function cToF(celsius) {
  return Math.round(((celsius * 9) / 5 + 32) * 10) / 10;
}


/* https://www.decentlab.com/products/black-globe-temperature-sensor-for-lorawan */

const decentlab_decoder = {
  PROTOCOL_VERSION: 2,
  SENSORS: [
    {
      length: 2,
      values: [{
        name: 'voltage_ratio',
        displayName: 'Voltage ratio',
        convert(x) { return ((x[0] + x[1] * 65536) / 8388608 - 1) / 2; }
      },
      {
        name: 'thermistor_resistance',
        displayName: 'Thermistor resistance',
        convert(x) { return 1000 / (((x[0] + x[1] * 65536) / 8388608 - 1) / 2) - 41000; },
        unit: 'Ω'
      },
      {
        name: 'temperature',
        displayName: 'Temperature',
        convert(x) { return (1 / (0.0008271111 + 0.000208802 * Math.log(1000 / (((x[0] + x[1] * 65536) / 8388608 - 1) / 2) - 41000) + 0.000000080592 * Math.pow(Math.log(1000 / (((x[0] + x[1] * 65536) / 8388608 - 1) / 2) - 41000), 3))) - 273.15; },
        unit: '°C'
      }]
    },
    {
      length: 1,
      values: [{
        name: 'battery_voltage',
        displayName: 'Battery voltage',
        convert(x) { return x[0] / 1000; },
        unit: 'V'
      }]
    }
  ],

  read_int(bytes, pos) {
    return (bytes[pos] << 8) + bytes[pos + 1];
  },

  decode(msg) {
    let bytes = msg;
    let i; let j;
    if (typeof msg === 'string') {
      bytes = [];
      for (i = 0; i < msg.length; i += 2) {
        bytes.push(parseInt(msg.substring(i, i + 2), 16));
      }
    }

    const version = bytes[0];
    if (version != this.PROTOCOL_VERSION) {
      return { error: `protocol version ${version} doesn't match v2` };
    }

    const deviceId = this.read_int(bytes, 1);
    let flags = this.read_int(bytes, 3);
    const result = { 'protocol_version': version, 'device_id': deviceId };
    // decode payload
    let pos = 5;
    for (i = 0; i < this.SENSORS.length; i++, flags >>= 1) {
      if ((flags & 1) !== 1) { continue; }

      const sensor = this.SENSORS[i];
      const x = [];
      // convert data to 16-bit integer array
      for (j = 0; j < sensor.length; j++) {
        x.push(this.read_int(bytes, pos));
        pos += 2;
      }

      // decode sensor values
      for (j = 0; j < sensor.values.length; j++) {
        const value = sensor.values[j];
        if ('convert' in value) {
          result[value.name] = {
            displayName: value.displayName,
            value: value.convert.bind(this)(x)
          };
          if ('unit' in value) { result[value.name].unit = value.unit; }
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
  data.voltageRatio = sample.voltage_ratio.value;
  data.thermistorResistance = sample.thermistor_resistance.value;
  data.temperature = sample.temperature.value;
  data.temperatureF = cToF(data.temperature);

  const lifecycle = {};
  lifecycle.batteryVoltage = sample.battery_voltage.value;
  lifecycle.batteryLevel = calcBatteryPercent(sample.battery_voltage.value, 3, 2);
  lifecycle.protocolVersion = sample.protocol_version;
  lifecycle.deviceId = sample.device_id;

  if (deleteUnusedKeys(data)) {
    emit("sample", { data, topic: "default" });
  }

  if (deleteUnusedKeys(lifecycle)) {
    emit("sample", { data: lifecycle, topic: "lifecycle" });
  }
}