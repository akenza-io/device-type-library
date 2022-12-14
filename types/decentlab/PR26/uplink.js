const decentlab_decoder = {
  PROTOCOL_VERSION: 2,
  SENSORS: [
    {
      length: 2,
      values: [
        {
          name: "pressure",
          convert(x) {
            return ((x[0] - 16384) / 32768) * (1.0 - 0.0) + 0.0;
          },
          unit: "bar",
        },
        {
          name: "temperature",
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
          convert(x) {
            return x[0] / 1000;
          },
          unit: "V",
        },
      ],
    },
  ],

  read_int(bytes) {
    return (bytes.shift() << 8) + bytes.shift();
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

    const version = bytes.shift();
    if (version != this.PROTOCOL_VERSION) {
      return { error: `protocolVersion${version} doesn't match v2` };
    }

    const deviceId = this.read_int(bytes);
    let flags = this.read_int(bytes);
    const result = { protocolVersion: version, deviceID: deviceId };
    // decode payload
    for (i = 0; i < this.SENSORS.length; i++, flags >>= 1) {
      if ((flags & 1) !== 1) continue;

      const sensor = this.SENSORS[i];
      const x = [];
      // convert data to 16-bit integer array
      for (j = 0; j < sensor.length; j++) {
        x.push(this.read_int(bytes));
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
  // water level is calculated from pressure
  data.level = (sample.pressure * 100000) / (1000 * 9.807);

  // Lifecycle values
  lifecycle.batteryVoltage = sample.battery_voltage;
  lifecycle.protocolVersion = sample.protocolVersion;
  lifecycle.deviceID = sample.deviceID;

  if (deleteUnusedKeys(data)) {
    emit("sample", { data, topic: "default" });
  }

  if (deleteUnusedKeys(lifecycle)) {
    emit("sample", { data: lifecycle, topic: "lifecycle" });
  }
}
