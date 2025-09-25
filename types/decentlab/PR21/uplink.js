function cToF(celsius) { 
 return Math.round(((celsius * 9) / 5 + 32) * 10) / 10; 
 } 

const decentlab_decoder = {
  PROTOCOL_VERSION: 2,
  /* device-specific parameters */
  PARAMETERS: {
    Pmin: -1.0,
    Pmax: 10.0,
  },
  SENSORS: [
    {
      length: 2,
      values: [
        {
          name: "pressure",
          displayName: "Pressure",
          convert(x) {
            return (
              ((x[0] - 16384) / 32768) *
                (this.PARAMETERS.Pmax - this.PARAMETERS.Pmin) +
              this.PARAMETERS.Pmin
            );
          },
          unit: "bar",
        },
        {
          name: "temperature",
          displayName: "Temperature",
          convert(x) {
            return (x[1] - 384) * 0.003125 - 50;
          },
          unit: "°C",
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
  data.pressure = sample.pressure;
  data.temperature = sample.temperature;
 data.temperatureF = cToF(data.temperature);

  // Lifecycle values
  lifecycle.batteryVoltage = sample.battery_voltage;
  lifecycle.protocolVersion = sample.protocol_version;
  lifecycle.deviceId = sample.device_id;

  if (deleteUnusedKeys(data)) {
    emit("sample", { data, topic: "default" });
  }

  if (deleteUnusedKeys(lifecycle)) {
    emit("sample", { data: lifecycle, topic: "lifecycle" });
  }
}
