const decentlab_decoder = {
  PROTOCOL_VERSION: 2,
  SENSORS: [
    {
      length: 2,
      values: [
        {
          name: "distance",
          displayName: "Distance",
          convert(x) {
            return x[0];
          },
          unit: "mm",
        },
        {
          name: "number_of_valid_samples",
          displayName: "Number of valid samples",
          convert(x) {
            return x[1];
          },
        },
      ],
    },
    {
      length: 1,
      values: [
        {
          name: "voltage",
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
  data.distance = sample.distance;

  // Lifecycle values
  lifecycle.voltage = sample.voltage;
  lifecycle.protocolVersion = sample.protocol_version;
  lifecycle.deviceId = sample.device_id;
  lifecycle.numberOfValidSamples = sample.number_of_valid_samples;

  if (deleteUnusedKeys(data)) {
    emit("sample", { data, topic: "default" });
  }

  if (deleteUnusedKeys(lifecycle)) {
    emit("sample", { data: lifecycle, topic: "lifecycle" });
  }
}
