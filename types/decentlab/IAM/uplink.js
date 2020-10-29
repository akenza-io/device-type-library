var INDOOR_AMBIANCE_MONITOR = [
  [{
    name: 'battery-voltage',
    conversion: function (x) { return x / 1000; },
    unit: 'V'
  }],
  [{
    name: 'air-temperature',
    conversion: function (x) { return 175 * x / 65535 - 45; },
    unit: '°C'
  },
  {
    name: 'air-humidity',
    conversion: function (x) { return 100 * x / 65535; },
    unit: '%'
  }],
  [{
    name: 'barometric-pressure',
    conversion: function (x) { return x * 2 / 100; },
    unit: 'hPa'
  }],
  [{
    name: 'ambient-light-visible-infrared',
    conversion: function (x) { return x; }
  },
  {
    name: 'ambient-light-infrared',
    conversion: function (x) { return x; }
  }],
  [{
    name: 'co2-concentration',
    conversion: function (x) { return x - 32768; },
    unit: 'ppm'
  },
  {
    name: 'co2-sensor-status',
    conversion: function (x) { return x; }
  },
  {
    name: 'co2-raw-reading',
    conversion: function (x) { return x; }
  }],
  [{
    name: 'pir-activity-counter',
    conversion: function (x) { return x; }
  }],
  [{
    name: 'total-voc',
    conversion: function (x) { return x; },
    unit: 'ppb'
  }]
];

function parseHexString(str) {
  var result = [];
  while (str.length >= 2) {
    result.push(parseInt(str.substring(0, 2), 16));
    str = str.substring(2, str.length);
  }
  return result;
}

function consume(event) {
  var payload = event.data.payload_hex;
  var bytes = parseHexString(payload);
  var decoded = {};
  var offset = 0;

  if (bytes[0] != 2)
    return { error: "protocol version " + bytes[0] + " doesn't match v2" };

  var deviceId = (bytes[1] << 8) + bytes[2];
  var sensors = INDOOR_AMBIANCE_MONITOR;
  var flags = ((bytes[3] << 8) + bytes[4]);

  var i, j, k;
  var x = [];
  // convert data to 16-bit integers
  for (i = 5; i < bytes.length; i += 2) {
    x.push((bytes[i] << 8) + bytes[i + 1]);
  }

  var decoded = { device: deviceId };
  // decode payload
  for (i = 0, k = 0; i < sensors.length; i++, flags >>= 1) {
    if ((flags & 1) !== 1)
      continue;

    var sensor = sensors[i];
    // decode sensor values
    for (j = 0; j < sensor.length; j++, k++) {
      if ('conversion' in sensor[j]) {
        if (sensor[j]['name'] == 'co2-concentration') {
          decoded.co2 = sensor[j]['conversion'](x[k]);
        }
        if (sensor[j]['name'] == 'pir-activity-counter') {
          decoded.pir = sensor[j]['conversion'](x[k]);
        }
        if (sensor[j]['name'] == 'air-temperature') {
          decoded.temperature = sensor[j]['conversion'](x[k]);
        }
        if (sensor[j]['name'] == 'air-humidity') {
          decoded.humidity = sensor[j]['conversion'](x[k]);
        }
        if (sensor[j]['name'] == 'barometric-pressure') {
          decoded.pressure = sensor[j]['conversion'](x[k]);
        }
        if (sensor[j]['name'] == 'ambient-light-visible-infrared') {
          decoded.light = sensor[j]['conversion'](x[k]);
        }
        if (sensor[j]['name'] == 'total-voc') {
          decoded.voc = sensor[j]['conversion'](x[k]);
        }
        if (sensor[j]['name'] == 'battery-voltage') {
          decoded.battery = sensor[j]['conversion'](x[k]);
        }
      }
    }
  }
  decoded.sf_meta = event.data.sf_meta;
  decoded.rssi_meta = event.data.rssi_meta;

  if (decoded.pir !== 0) {
    emit("sample", { data: { "occupied": true }, topic: "occupied" });
  } else {
    emit("sample", { data: { "occupied": false }, topic: "occupied" });
  }

  emit('sample', { data: decoded, topic: "default" });
}