function cToF(celsius) {
  return Math.round(((celsius * 9) / 5 + 32) * 10) / 10;
}

/* https://www.decentlab.com/products/temperature-profile-for-lorawan */

const decentlab_decoder = {
  PROTOCOL_VERSION: 2,
  SENSORS: [
    {
      length: 16,
      values: [
        {
          name: "temperature_at_level_0",
          displayName: "Temperature at level 0",
          convert: function (x) {
            return (x[0] - 32768) / 100;
          },
          unit: "°C",
        },
        {
          name: "temperature_at_level_1",
          displayName: "Temperature at level 1",
          convert: function (x) {
            return (x[1] - 32768) / 100;
          },
          unit: "°C",
        },
        {
          name: "temperature_at_level_2",
          displayName: "Temperature at level 2",
          convert: function (x) {
            return (x[2] - 32768) / 100;
          },
          unit: "°C",
        },
        {
          name: "temperature_at_level_3",
          displayName: "Temperature at level 3",
          convert: function (x) {
            return (x[3] - 32768) / 100;
          },
          unit: "°C",
        },
        {
          name: "temperature_at_level_4",
          displayName: "Temperature at level 4",
          convert: function (x) {
            return (x[4] - 32768) / 100;
          },
          unit: "°C",
        },
        {
          name: "temperature_at_level_5",
          displayName: "Temperature at level 5",
          convert: function (x) {
            return (x[5] - 32768) / 100;
          },
          unit: "°C",
        },
        {
          name: "temperature_at_level_6",
          displayName: "Temperature at level 6",
          convert: function (x) {
            return (x[6] - 32768) / 100;
          },
          unit: "°C",
        },
        {
          name: "temperature_at_level_7",
          displayName: "Temperature at level 7",
          convert: function (x) {
            return (x[7] - 32768) / 100;
          },
          unit: "°C",
        },
        {
          name: "temperature_at_level_8",
          displayName: "Temperature at level 8",
          convert: function (x) {
            return (x[8] - 32768) / 100;
          },
          unit: "°C",
        },
        {
          name: "temperature_at_level_9",
          displayName: "Temperature at level 9",
          convert: function (x) {
            return (x[9] - 32768) / 100;
          },
          unit: "°C",
        },
        {
          name: "temperature_at_level_10",
          displayName: "Temperature at level 10",
          convert: function (x) {
            return (x[10] - 32768) / 100;
          },
          unit: "°C",
        },
        {
          name: "temperature_at_level_11",
          displayName: "Temperature at level 11",
          convert: function (x) {
            return (x[11] - 32768) / 100;
          },
          unit: "°C",
        },
        {
          name: "temperature_at_level_12",
          displayName: "Temperature at level 12",
          convert: function (x) {
            return (x[12] - 32768) / 100;
          },
          unit: "°C",
        },
        {
          name: "temperature_at_level_13",
          displayName: "Temperature at level 13",
          convert: function (x) {
            return (x[13] - 32768) / 100;
          },
          unit: "°C",
        },
        {
          name: "temperature_at_level_14",
          displayName: "Temperature at level 14",
          convert: function (x) {
            return (x[14] - 32768) / 100;
          },
          unit: "°C",
        },
        {
          name: "temperature_at_level_15",
          displayName: "Temperature at level 15",
          convert: function (x) {
            return (x[15] - 32768) / 100;
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
          convert: function (x) {
            return x[0] / 1000;
          },
          unit: "V",
        },
      ],
    },
  ],

  read_int: function (bytes, pos) {
    return (bytes[pos] << 8) + bytes[pos + 1];
  },

  decode: function (msg) {
    var bytes = msg;
    var i, j;
    if (typeof msg === "string") {
      bytes = [];
      for (i = 0; i < msg.length; i += 2) {
        bytes.push(parseInt(msg.substring(i, i + 2), 16));
      }
    }

    var version = bytes[0];
    if (version != this.PROTOCOL_VERSION) {
      return { error: "protocol version " + version + " doesn't match v2" };
    }

    var deviceId = this.read_int(bytes, 1);
    var flags = this.read_int(bytes, 3);
    var result = { protocol_version: version, device_id: deviceId };
    // decode payload
    var pos = 5;
    for (i = 0; i < this.SENSORS.length; i++, flags >>= 1) {
      if ((flags & 1) !== 1) continue;

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
        if ("convert" in value) {
          result[value.name] = {
            displayName: value.displayName,
            value: value.convert.bind(this)(x),
          };
          if ("unit" in value) result[value.name]["unit"] = value.unit;
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

function calcBatteryPercent(number, max, min) {
  const percent = ((number - min) / (max - min)) * 100;
  return Math.round(Math.max(0, Math.min(100, percent)));
}

function consume(event) {
  const payload = event.data.payloadHex;
  const sample = decentlab_decoder.decode(payload);

  const data = {};
  data.temperatureAtLevel0 = sample.temperature_at_level_0.value;
  data.temperatureAtLevel0F = cToF(data.temperatureAtLevel0);
  data.temperatureAtLevel1 = sample.temperature_at_level_1.value;
  data.temperatureAtLevel1F = cToF(data.temperatureAtLevel1);
  data.temperatureAtLevel2 = sample.temperature_at_level_2.value;
  data.temperatureAtLevel2F = cToF(data.temperatureAtLevel2);
  data.temperatureAtLevel3 = sample.temperature_at_level_3.value;
  data.temperatureAtLevel3F = cToF(data.temperatureAtLevel3);
  data.temperatureAtLevel4 = sample.temperature_at_level_4.value;
  data.temperatureAtLevel4F = cToF(data.temperatureAtLevel4);
  data.temperatureAtLevel5 = sample.temperature_at_level_5.value;
  data.temperatureAtLevel5F = cToF(data.temperatureAtLevel5);
  data.temperatureAtLevel6 = sample.temperature_at_level_6.value;
  data.temperatureAtLevel6F = cToF(data.temperatureAtLevel6);
  data.temperatureAtLevel7 = sample.temperature_at_level_7.value;
  data.temperatureAtLevel7F = cToF(data.temperatureAtLevel7);
  data.temperatureAtLevel8 = sample.temperature_at_level_8.value;
  data.temperatureAtLevel8F = cToF(data.temperatureAtLevel8);
  data.temperatureAtLevel9 = sample.temperature_at_level_9.value;
  data.temperatureAtLevel9F = cToF(data.temperatureAtLevel9);
  data.temperatureAtLevel10 = sample.temperature_at_level_10.value;
  data.temperatureAtLevel10F = cToF(data.temperatureAtLevel10);
  data.temperatureAtLevel11 = sample.temperature_at_level_11.value;
  data.temperatureAtLevel11F = cToF(data.temperatureAtLevel11);
  data.temperatureAtLevel12 = sample.temperature_at_level_12.value;
  data.temperatureAtLevel12F = cToF(data.temperatureAtLevel12);
  data.temperatureAtLevel13 = sample.temperature_at_level_13.value;
  data.temperatureAtLevel13F = cToF(data.temperatureAtLevel13);
  data.temperatureAtLevel14 = sample.temperature_at_level_14.value;
  data.temperatureAtLevel14F = cToF(data.temperatureAtLevel14);
  data.temperatureAtLevel15 = sample.temperature_at_level_15.value;
  data.temperatureAtLevel15F = cToF(data.temperatureAtLevel15);

  const lifecycle = {};
  lifecycle.batteryVoltage = sample.battery_voltage.value;
  lifecycle.batteryLevel = calcBatteryPercent(
    sample.battery_voltage.value,
    3,
    2,
  );
  lifecycle.protocolVersion = sample.protocol_version;
  lifecycle.deviceId = sample.device_id;

  if (deleteUnusedKeys(data)) {
    emit("sample", { data: data, topic: "default" });
  }

  if (deleteUnusedKeys(lifecycle)) {
    emit("sample", { data: lifecycle, topic: "lifecycle" });
  }
}
