function cToF(celsius) { 
 return Math.round(((celsius * 9) / 5 + 32) * 10) / 10; 
 } 

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

const decentlabDecoder = {
  PROTOCOL_VERSION: 2,
  SENSORS: [
    {
      length: 2,
      values: [
        {
          name: "air_temperature",
          displayName: "Air temperature",
          convert(x) {
            return Math.round(((175.72 * x[0]) / 65536 - 46.85) * 100) / 100;
          },
          unit: "°C",
        },
        {
          name: "air_humidity",
          displayName: "Air humidity",
          convert(x) {
            return Math.round(((125 * x[1]) / 65536 - 6) * 100) / 100;
          },
          unit: "%",
        },
      ],
    },
    {
      length: 2,
      values: [
        {
          name: "barometer_temperature",
          displayName: "Barometer temperature",
          convert(x) {
            return (x[0] - 5000) / 100;
          },
          unit: "°C",
        },
        {
          name: "barometric_pressure",
          displayName: "Barometric pressure",
          convert(x) {
            return (x[1] * 2) / 100;
          },
          unit: "hPa",
        },
      ],
    },
    {
      length: 8,
      values: [
        {
          name: "co2_concentration",
          displayName: "CO2 concentration",
          convert(x) {
            return x[0] - 32768;
          },
          unit: "ppm",
        },
        {
          name: "co2_concentration_lpf",
          displayName: "CO2 concentration LPF",
          convert(x) {
            return x[1] - 32768;
          },
          unit: "ppm",
        },
        {
          name: "co2_sensor_temperature",
          displayName: "CO2 sensor temperature",
          convert(x) {
            return (x[2] - 32768) / 100;
          },
          unit: "°C",
        },
        {
          name: "capacitor_voltage_1",
          displayName: "Capacitor voltage 1",
          convert(x) {
            return x[3] / 1000;
          },
          unit: "V",
        },
        {
          name: "capacitor_voltage_2",
          displayName: "Capacitor voltage 2",
          convert(x) {
            return x[4] / 1000;
          },
          unit: "V",
        },
        {
          name: "co2_sensor_status",
          displayName: "CO2 sensor status",
          convert(x) {
            return x[5];
          },
        },
        {
          name: "raw_ir_reading",
          displayName: "Raw IR reading",
          convert(x) {
            return x[6];
          },
        },
        {
          name: "raw_ir_reading_lpf",
          displayName: "Raw IR reading LPF",
          convert(x) {
            return x[7];
          },
        },
      ],
    },
    {
      length: 1,
      values: [
        {
          name: "battery_voltage",
          displayName: "Battery voltage",
          convert(x) {
            return x[0] / 1000;
          },
          unit: "V",
        },
      ],
    },
  ],

  read_int(bytes, pos) {
    return (bytes[pos] << 8) + bytes[pos + 1];
  },

  decode(msg) {
    let bytes = msg;
    let i;
    let j;
    if (typeof msg === "string") {
      bytes = [];
      for (i = 0; i < msg.length; i += 2) {
        bytes.push(parseInt(msg.substring(i, i + 2), 16));
      }
    }

    const version = bytes[0];
    if (version !== this.PROTOCOL_VERSION) {
      return { error: `protocol version ${version} doesn't match v2` };
    }

    const deviceId = this.read_int(bytes, 1);
    let flags = this.read_int(bytes, 3);
    const result = { protocol_version: version, device_id: deviceId };
    // decode payload
    let pos = 5;
    for (i = 0; i < this.SENSORS.length; i++, flags >>= 1) {
      if ((flags & 1) !== 1) {
        continue;
      }

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
        if ("convert" in value) {
          result[value.name] = value.convert.bind(this)(x);
        }
      }
    }
    return result;
  },
};

function consume(event) {
  const sample = decentlabDecoder.decode(event.data.payloadHex);
  const data = {};
  const lifecycle = {};

  data.temperature = sample.air_temperature;
 data.temperatureF = cToF(data.temperature);
  data.humidity = sample.air_humidity;
  data.barometricTemperature = sample.barometer_temperature;
 data.barometricTemperatureF = cToF(data.barometricTemperature);
  data.pressure = sample.barometric_pressure;
  data.co2 = sample.co2_concentration;
  data.co2LPF = sample.co2_concentration_lpf;
  data.co2Temperature = sample.co2_sensor_temperature;
 data.co2TemperatureF = cToF(data.co2Temperature);
  data.capacitorVoltage1 = sample.capacitor_voltage_1;
  data.capacitorVoltage2 = sample.capacitor_voltage_2;
  data.rawIr = sample.raw_ir_reading;
  data.rawIrLPF = sample.raw_ir_reading_lpf;

  // Lifecycle values
  lifecycle.batteryVoltage = Math.round(sample.battery_voltage * 100) / 100;
  lifecycle.protocolVersion = sample.protocol_version;
  lifecycle.deviceID = sample.device_id;
  lifecycle.co2SensorStatus = sample.co2_sensor_status;

  // Voltage drops of at 2V (0%) max voltage is 3.7V (100%)
  // ((Max voltage - voltage now) * voltage to percent - inverting) getting rid of the -
  let batteryLevel = Math.round(((lifecycle.batteryVoltage - 2) / 1.1) * 100);

  if (batteryLevel > 100) {
    batteryLevel = 100;
  } else if (batteryLevel < 0) {
    batteryLevel = 0;
  }
  lifecycle.batteryLevel = batteryLevel;

  if (deleteUnusedKeys(data)) {
    emit("sample", { data, topic: "default" });
  }

  if (deleteUnusedKeys(lifecycle)) {
    emit("sample", { data: lifecycle, topic: "lifecycle" });
  }
}
