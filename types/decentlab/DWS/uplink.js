const decentlab_decoder = {
  PROTOCOL_VERSION: 2,
  /* device-specific parameters */
  PARAMETERS: {
    f02: 232263168,
    s: 0.000302459,
    m0: 1370,
  },
  SENSORS: [
    {
      length: 3,
      values: [
        {
          name: "frequency",
          displayName: "Frequency",
          convert(x) {
            return (x[0] / x[1]) * 32768;
          },
          unit: "Hz",
        },
        {
          name: "weight",
          displayName: "Weight",
          convert(x) {
            return (
              (Math.pow((x[0] / x[1]) * 32768, 2) - this.PARAMETERS.f02) *
                this.PARAMETERS.s +
              this.PARAMETERS.m0
            );
          },
          unit: "g",
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
  let customFieldsUsed = false;
  let tare = 0;

  if (event.device !== undefined) {
    if (event.device.customFields !== undefined) {
      const { customFields } = event.device;

      if (
        customFields.force !== undefined &&
        customFields.underLoad !== undefined &&
        customFields.strain !== undefined
      ) {
        const { force } = customFields; // F = m · 9.8067 [N]
        const { underLoad } = customFields; // l = F · 1.5 [μm]
        const { strain } = customFields; // s = l / 0.066 [μm/m
        decentlab_decoder.PARAMETERS.f02 = force;
        decentlab_decoder.PARAMETERS.s = underLoad;
        decentlab_decoder.PARAMETERS.m0 = strain;

        if (customFields.tare !== undefined) {
          tare = customFields.tare;
        }
        customFieldsUsed = true;
      }
    }
  }

  const sample = decentlab_decoder.decode(payload);
  const data = {};
  const lifecycle = {};

  // Default values
  data.frequency = Math.round(sample.frequency * 100) / 100;
  data.weight = Math.round(sample.weight * 100) / 100 - tare;
  data.weightKg = Math.round(data.weight * 10) / 10000;

  // Init state
  if (
    event.state.lastWeighting === undefined ||
    event.state.lastWeighting > data.weight
  ) {
    event.state.lastWeighting = data.weight;
  }

  // Calculate increment
  data.relativeWeightGram = data.weight - event.state.lastWeighting;
  data.relativeWeightKilogramm =
    Math.round(data.relativeWeightGram * 10) / 10000;

  // Zero negative weight
  if (data.weightGram <= 0) {
    data.relativeWeightGram = 0;
    data.relativeWeightKilogramm = 0;
  }
  event.state.lastWeighting = data.weight;

  // Lifecycle values
  lifecycle.batteryVoltage = sample.battery_voltage;
  lifecycle.protocolVersion = sample.protocol_version;
  lifecycle.deviceId = sample.device_id;

  if (deleteUnusedKeys(data) && customFieldsUsed) {
    emit("sample", { data, topic: "default" });
  }

  if (!customFieldsUsed) {
    emit("sample", {
      data: {
        error:
          "Please define customfields: force, underLoad & strain. They should be defined on the sensor.",
      },
      topic: "error",
    });
  }

  if (deleteUnusedKeys(lifecycle)) {
    emit("sample", { data: lifecycle, topic: "lifecycle" });
  }
  emit("state", event.state);
}
