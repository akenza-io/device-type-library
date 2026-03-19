function cToF(celsius) {
  return Math.round(((celsius * 9) / 5 + 32) * 10) / 10;
}

const decentlab_decoder = {
  PROTOCOL_VERSION: 2,
  SENSORS: [
    {
      length: 17,
      values: [
        {
          name: "solar_radiation",
          displayName: "Solar radiation",
          convert(x) {
            return x[0] - 32768;
          },
          unit: "W⋅m⁻²",
        },
        {
          name: "precipitation",
          displayName: "Precipitation",
          convert(x) {
            return (x[1] - 32768) / 1000;
          },
          unit: "mm",
        },
        {
          name: "lightning_strike_count",
          displayName: "Lightning strike count",
          convert(x) {
            return x[2] - 32768;
          },
        },
        {
          name: "lightning_average_distance",
          displayName: "Lightning average distance",
          convert(x) {
            return x[3] - 32768;
          },
          unit: "km",
        },
        {
          name: "wind_speed",
          displayName: "Wind speed",
          convert(x) {
            return (x[4] - 32768) / 100;
          },
          unit: "m⋅s⁻¹",
        },
        {
          name: "wind_direction",
          displayName: "Wind direction",
          convert(x) {
            return (x[5] - 32768) / 10;
          },
          unit: "°",
        },
        {
          name: "maximum_wind_speed",
          displayName: "Maximum wind speed",
          convert(x) {
            return (x[6] - 32768) / 100;
          },
          unit: "m⋅s⁻¹",
        },
        {
          name: "air_temperature",
          displayName: "Air temperature",
          convert(x) {
            return (x[7] - 32768) / 10;
          },
          unit: "°C",
        },
        {
          name: "vapor_pressure",
          displayName: "Vapor pressure",
          convert(x) {
            return (x[8] - 32768) / 100;
          },
          unit: "kPa",
        },
        {
          name: "atmospheric_pressure",
          displayName: "Atmospheric pressure",
          convert(x) {
            return (x[9] - 32768) / 100;
          },
          unit: "kPa",
        },
        {
          name: "relative_humidity",
          displayName: "Relative humidity",
          convert(x) {
            return (x[10] - 32768) / 10;
          },
          unit: "%",
        },
        {
          name: "sensor_temperature_internal",
          displayName: "Sensor temperature (internal)",
          convert(x) {
            return (x[11] - 32768) / 10;
          },
          unit: "°C",
        },
        {
          name: "x_orientation_angle",
          displayName: "X orientation angle",
          convert(x) {
            return (x[12] - 32768) / 10;
          },
          unit: "°",
        },
        {
          name: "y_orientation_angle",
          displayName: "Y orientation angle",
          convert(x) {
            return (x[13] - 32768) / 10;
          },
          unit: "°",
        },
        {
          name: "compass_heading",
          displayName: "Compass heading",
          convert(x) {
            return x[14] - 32768;
          },
          unit: "°",
        },
        {
          name: "north_wind_speed",
          displayName: "North wind speed",
          convert(x) {
            return (x[15] - 32768) / 100;
          },
          unit: "m⋅s⁻¹",
        },
        {
          name: "east_wind_speed",
          displayName: "East wind speed",
          convert(x) {
            return (x[16] - 32768) / 100;
          },
          unit: "m⋅s⁻¹",
        },
      ],
    },
    {
      length: 1,
      values: [
        {
          name: "batteryVoltage",
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
    if (version != this.PROTOCOL_VERSION) {
      return { error: `protocol version ${version} doesn't match v2` };
    }

    const deviceId = this.read_int(bytes, 1);
    let flags = this.read_int(bytes, 3);
    const result = { protocol_version: version, device_id: deviceId };
    // decode payload
    let pos = 5;
    for (i = 0; i < this.SENSORS.length; i++, flags >>= 1) {
      if ((flags & 1) !== 1) continue;

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

function consume(event) {
  const payload = event.data.payloadHex;
  const sample = decentlab_decoder.decode(payload);
  const data = {};
  const lifecycle = {};

  // Default values
  data.solarRadiation = sample.solar_radiation;
  data.precipitation = sample.precipitation;
  data.lightningStrikeCount = sample.lightning_strike_count;
  data.lightningAverageDistance = sample.lightning_average_distance;
  data.windSpeed = sample.wind_speed;
  data.windDirection = sample.wind_direction;
  data.maximumWindSpeed = sample.maximum_wind_speed;
  data.temperature = sample.air_temperature;
  data.temperatureF = cToF(data.temperature);
  data.vaporPressure = sample.vapor_pressure;
  data.atmosphericPressure = sample.atmospheric_pressure;
  data.humidity = sample.relative_humidity;
  data.eastWindSpeed = sample.east_wind_speed;
  data.northWindSpeed = sample.north_wind_speed;

  // Lifecycle values
  lifecycle.batteryVoltage = sample.batteryVoltage;
  lifecycle.protocolVersion = sample.protocol_version;
  lifecycle.deviceID = sample.device_id;
  lifecycle.sensorTemperatureInternal = sample.sensor_temperature_internal;
  lifecycle.sensorTemperatureInternalF = cToF(
    lifecycle.sensorTemperatureInternal,
  );
  lifecycle.xOrientationAngle = sample.x_orientation_angle;
  lifecycle.yOrientationAngle = sample.y_orientation_angle;
  lifecycle.compassHeading = sample.compass_heading;

  if (deleteUnusedKeys(data)) {
    emit("sample", { data, topic: "default" });
  }

  if (deleteUnusedKeys(lifecycle)) {
    emit("sample", { data: lifecycle, topic: "lifecycle" });
  }
}
