// Sensocon DataSling Series WS / WM uplink decoder
// Source: Sensocon document SD-0178 "LoRaWAN Payload Decoder for Series WS/WM Wireless Sensors".
// Payload: 1 header byte (version), then up to 10 blocks of 5 bytes:
// 1 type byte + 1 IEEE 754 float32 value (little-endian).
// Each measurement group is emitted to its own topic. A topic is only emitted
// if the uplink contains at least one of its values.

// SD-0178 type byte -> data key and topic.
// Types 5 and 9 to 18 are in the SD-0178 type map, but no unit is specified
// and no current WS/WM model reports them. They are ignored, as SD-0178 does
// for unknown types.
const TYPES = {
  0: { key: "pressure", topic: "pressure" },
  1: { key: "humidityTemp", topic: "humidity" },
  2: { key: "humidity", topic: "humidity" },
  3: { key: "batteryVoltage", topic: "lifecycle" },
  4: { key: "contact", topic: "contact" },
  6: { key: "voltage", topic: "voltage" },
  7: { key: "current", topic: "current" },
  8: { key: "temperature", topic: "temperature" },
  19: { key: "gaugeDiffPressure", topic: "gauge_diff_pressure" },
};

// Emit order and the full key list of every topic
const TOPICS = [
  { topic: "pressure", keys: ["pressure"] },
  { topic: "gauge_diff_pressure", keys: ["gaugeDiffPressure"] },
  { topic: "humidity", keys: ["humidity", "humidityTemp"] },
  { topic: "temperature", keys: ["temperature"] },
  { topic: "voltage", keys: ["voltage"] },
  { topic: "current", keys: ["current"] },
  { topic: "contact", keys: ["contact"] },
];

const BASE64 =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

function base64ToHex(base64) {
  const clean = String(base64).replace(/[^A-Za-z0-9+/]/g, "");
  let bitBuffer = 0;
  let bitCount = 0;
  let hex = "";
  for (let i = 0; i < clean.length; i++) {
    bitBuffer = (bitBuffer << 6) | BASE64.indexOf(clean.charAt(i));
    bitCount += 6;
    if (bitCount >= 8) {
      bitCount -= 8;
      const byte = (bitBuffer >> bitCount) & 0xff;
      hex += (byte < 16 ? "0" : "") + byte.toString(16);
    }
  }
  return hex;
}

// The akenza LoRaWAN connectors give payloadHex. A raw ChirpStack v4 HTTP/MQTT
// event gives the payload as Base64 in the field "data".
function getPayloadHex(event) {
  const data = event.data || {};
  if (typeof data.payloadHex === "string") {
    return data.payloadHex;
  }
  if (typeof data.data === "string") {
    return base64ToHex(data.data);
  }
  return "";
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
  return Math.round(value * 1000) / 1000;
}

function consume(event) {
  const bytes = hexToBytes(getPayloadHex(event));
  if (bytes.length < 1) {
    return;
  }

  const values = {};
  let index = 1;
  for (let n = 0; n < 10 && index + 5 <= bytes.length; n++) {
    const type = TYPES[bytes[index]];
    const value = float32LE(bytes, index + 1);
    index += 5;
    if (type !== undefined && Number.isFinite(value)) {
      const rounded = round(value);
      // 0 = open, 1 = closed. A closed contact triggers a transmission.
      values[type.key] =
        type.key === "contact" ? (rounded === 0 ? "OPEN" : "CLOSED") : rounded;
    }
  }

  TOPICS.forEach((group) => {
    const present = group.keys.filter((key) => values[key] !== undefined);
    if (present.length > 0) {
      const data = {};
      group.keys.forEach((key) => {
        data[key] = values[key] !== undefined ? values[key] : null;
      });
      emit("sample", { data, topic: group.topic });
    }
  });

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
