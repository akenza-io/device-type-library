const decentlabDecoder = {
  PROTOCOL_VERSION: 2,
  SENSORS: [
    {
      length: 1,
      values: [
        {
          name: "battery_voltage",
          displayName: "Battery voltage",
          convert(x) {
            return Math.round((x[0] / 1000) * 100) / 100;
          },
          unit: "V",
        },
      ],
    },
    {
      length: 2,
      values: [
        {
          name: "air_temperature",
          displayName: "Air temperature",
          convert(x) {
            return Math.round(((175 * x[0]) / 65535 - 45) * 100) / 100;
          },
          unit: "°C",
        },
        {
          name: "air_humidity",
          displayName: "Air humidity",
          convert(x) {
            return Math.round(((100 * x[1]) / 65535) * 100) / 100;
          },
          unit: "%",
        },
      ],
    },
    {
      length: 1,
      values: [
        {
          name: "barometric_pressure",
          displayName: "Barometric pressure",
          convert(x) {
            return x[0] * 2;
          },
          unit: "Pa",
        },
      ],
    },
    {
      length: 2,
      values: [
        {
          name: "ambient_light_visible_infrared",
          displayName: "Ambient light (visible + infrared)",
          convert(x) {
            return x[0];
          },
        },
        {
          name: "ambient_light_infrared",
          displayName: "Ambient light (infrared)",
          convert(x) {
            return x[1];
          },
        },
        {
          name: "illuminance",
          displayName: "Illuminance",
          convert(x) {
            return (
              Math.round(
                Math.max(
                  Math.max(1.0 * x[0] - 1.64 * x[1], 0.59 * x[0] - 0.86 * x[1]),
                  0,
                ) *
                1.5504 *
                100,
              ) / 100
            );
          },
          unit: "lx",
        },
      ],
    },
    {
      length: 3,
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
          name: "co2_sensor_status",
          displayName: "CO2 sensor status",
          convert(x) {
            return x[1];
          },
        },
        {
          name: "raw_ir_reading",
          displayName: "Raw IR reading",
          convert(x) {
            return x[2];
          },
        },
      ],
    },
    {
      length: 1,
      values: [
        {
          name: "activity_counter",
          displayName: "Activity counter",
          convert(x) {
            return x[0];
          },
        },
      ],
    },
    {
      length: 1,
      values: [
        {
          name: "total_voc",
          displayName: "Total VOC",
          convert(x) {
            return x[0];
          },
          unit: "ppb",
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

function checkForCustomFields(device, target, norm) {
  if (device !== undefined && device.customFields !== undefined && device.customFields[target] !== undefined) {
    return device.customFields[target];
  }
  return norm;
}

function calculateRecentOccupancy(device, state, occupancy) {
  state = state || {};
  // Occupancy status
  if (occupancy.occupied) {
    occupancy.occupancyStatus = "OCCUPIED";
    occupancy.occupiedOrRecentlyUsed = true;
  } else {
    occupancy.occupancyStatus = "UNOCCUPIED";
    occupancy.occupiedOrRecentlyUsed = false;
  }

  const time = new Date().getTime();
  occupancy.minutesSinceLastOccupied = 0;
  occupancy.minutesOccupiedSinceStart = 0;

  if (occupancy.occupied) {
    // Set state to first occupancy occurence so occupied time can be calulcated
    if (state.firstOccupancyTimestamp == undefined) {
      state.firstOccupancyTimestamp = time;
    }
    // Give out how long there has been occupancy
    occupancy.minutesOccupiedSinceStart = Math.round((time - state.firstOccupancyTimestamp) / 1000 / 60);
    delete state.lastOccupancyTimestamp; // Reset cycle
    delete state.minutesOccupiedSinceStart;
  } else {
    // Give out how long there has been no occupancy
    if (state.lastOccupancyTimestamp !== undefined) {
      occupancy.minutesSinceLastOccupied = Math.round((time - state.lastOccupancyTimestamp) / 1000 / 60);
    } else {
      state.lastOccupancyTimestamp = time;

      // Only save the timestamp on first leave and save how long the occupancy has gone on for
      state.minutesOccupiedSinceStart = Math.round((time - state.firstOccupancyTimestamp) / 1000 / 60);
      delete state.firstOccupancyTimestamp; // Reset cycle
    }
  }

  // Allow customFields to change this
  const minimalOccupiedTime = checkForCustomFields(device, "minimalOccupiedTime", 2.5);
  const recentUsageDuration = checkForCustomFields(device, "recentUsageDuration", 90)

  if (occupancy.minutesSinceLastOccupied < recentUsageDuration && !occupancy.occupied && state.minutesOccupiedSinceStart >= minimalOccupiedTime) {
    occupancy.recentlyUsed = true;
    occupancy.occupiedOrRecentlyUsed = true;
    occupancy.occupancyStatus = "WARM";
  } else {
    occupancy.recentlyUsed = false;
    occupancy.occupiedOrRecentlyUsed = occupancy.occupied;
  }
  return { state, occupancy }
}

function consume(event) {
  const payload = event.data.payloadHex;
  const sample = decentlabDecoder.decode(payload);
  const data = {};
  const lifecycle = {};
  const occupancy = {};

  data.temperature = sample.air_temperature;
  data.humidity = sample.air_humidity;
  data.pressure = sample.barometric_pressure * 0.01;
  data.co2 = sample.co2_concentration;
  data.voc = sample.total_voc;
  data.light = sample.illuminance;
  data.pir = sample.activity_counter;
  data.rawPir = sample.raw_ir_reading;

  // Lifecycle values
  // Voltage drops of at 2V (0%) max voltage is 3V (100%)
  lifecycle.batteryVoltage = Math.round(sample.battery_voltage * 100) / 100;
  // ((Max voltage - voltage now) * voltage to percent - inverting) getting rid of the -
  let batteryLevel = Math.round(
    ((3 - lifecycle.batteryVoltage) * 100 - 100) * -1,
  );

  if (batteryLevel > 100) {
    batteryLevel = 100;
  } else if (batteryLevel < 0) {
    batteryLevel = 0;
  }
  lifecycle.batteryLevel = batteryLevel;

  lifecycle.protocolVersion = sample.protocol_version;
  lifecycle.deviceID = sample.device_id;
  lifecycle.co2SensorStatus = sample.co2_sensor_status;

  if (deleteUnusedKeys(data)) {
    emit("sample", { data, topic: "default" });
  }

  if (deleteUnusedKeys(lifecycle)) {
    emit("sample", { data: lifecycle, topic: "lifecycle" });
  }

  if (data.pir !== 0) {
    occupancy.occupancy = 1;
    occupancy.occupied = true;
  } else {
    occupancy.occupancy = 0;
    occupancy.occupied = false;
  }

  let recentOccupancyResult = calculateRecentOccupancy(event.device, event.state, occupancy);
  occupancy = recentOccupancyResult.occupancy;

  emit("state", recentOccupancyResult.state);
  emit("sample", { data: occupancy, topic: "occupancy" });
}
