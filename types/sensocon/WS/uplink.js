// Sensocon DataSling Series WS / WM uplink decoder
// Source: Sensocon document SD-0178 "LoRaWAN Payload Decoder for Series WS/WM Wireless Sensors".
// Payload: 1 header byte (version), then up to 10 blocks of 5 bytes:
// 1 type byte + 1 IEEE 754 float32 value (little-endian).
// The sensor always sends the full data set for the model. All measurements
// are emitted on the "default" topic. Battery voltage is emitted on "lifecycle".
// Temperatures are sent natively in °F. The decoder converts them to °C as
// the primary field and also keeps the original °F value.

// SD-0178 type byte -> data key.
// Types 5 and 9 to 18 are in the SD-0178 type map, but no unit is specified
// and no current WS/WM model reports them. They are ignored, as SD-0178 does
// for unknown types.
const TYPES = {
  0: "pressure",
  1: "humidityTemperature",
  2: "humidity",
  3: "batteryVoltage",
  4: "contact",
  6: "voltage",
  7: "current",
  8: "probeTemperature",
  19: "gaugeDiffPressure",
};

const DEFAULT_KEYS = [
  "pressure",
  "gaugeDiffPressure",
  "humidity",
  "temperature",
  "temperatureF",
  "probeTemperature",
  "probeTemperatureF",
  "voltage",
  "current",
  "contact",
];

function getPayloadHex(event) {
  const data = event.data || {};
  return typeof data.payloadHex === "string" ? data.payloadHex : "";
}

function hexToBytes(hex) {
  const clean = String(hex).replace(/[^0-9a-fA-F]/g, "");
  const bytes = [];
  for (let i = 0; i + 1 < clean.length; i += 2) {
    bytes.push(parseInt(clean.substr(i, 2), 16));
  }
  return bytes;
}

function float32LE(bytes, offset) {
  const view = new DataView(new ArrayBuffer(4));
  for (let i = 0; i < 4; i++) {
    view.setUint8(i, bytes[offset + i]);
  }
  return view.getFloat32(0, true);
}

function round(value) {
  return Math.round(value * 100) / 100;
}

function toCelsius(fahrenheit) {
  return round(((fahrenheit - 32) * 5) / 9);
}

function consume(event) {
  const bytes = hexToBytes(getPayloadHex(event));
  if (bytes.length < 1) {
    return;
  }

  const values = {};
  let index = 1;
  const end = Math.min(bytes.length, 1 + 10 * 5);
  while (index + 5 <= end) {
    const type = TYPES[bytes[index]];
    const value = float32LE(bytes, index + 1);
    index += 5;
    if (type === undefined || !Number.isFinite(value)) {
      continue;
    }

    if (type === "contact") {
      // 0 = open, 1 = closed. A closed contact triggers a transmission.
      values.contact = round(value) === 0 ? "OPEN" : "CLOSED";
    } else if (type === "humidityTemperature") {
      values.temperatureF = round(value);
      values.temperature = toCelsius(values.temperatureF);
    } else if (type === "probeTemperature") {
      values.probeTemperatureF = round(value);
      values.probeTemperature = toCelsius(values.probeTemperatureF);
    } else {
      values[type] = round(value);
    }
  }

  const data = {};
  DEFAULT_KEYS.forEach((key) => {
    if (values[key] !== undefined) {
      data[key] = values[key];
    }
  });
  if (Object.keys(data).length > 0) {
    emit("sample", { data, topic: "default" });
  }

  if (values.batteryVoltage !== undefined) {
    emit("sample", {
      data: {
        batteryVoltage: values.batteryVoltage,
        payloadVersion: bytes[0],
      },
      topic: "lifecycle",
    });
  }
}
