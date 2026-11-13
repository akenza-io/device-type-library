// Sensocon DataSling Series WS / WM downlink encoder
// Source: Sensocon document SD-0178, "LoRaWAN Downlink Command Format".
// Downlink: CMD (1 byte) + length (1 byte, 0x02) + data (2 bytes, big-endian).
// Offsets are sent in thousandths (1/1000) of the base unit.
// Send one command per downlink. The sensor is LoRaWAN Class A: it receives
// the downlink after its next uplink.

const COMMANDS = [
  { field: "setInterval", cmd: 0x00, multiplier: 1 }, // seconds
  { field: "pressureOffset", cmd: 0x02, multiplier: 1000 }, // in. WC
  { field: "temperatureOffset", cmd: 0x04, multiplier: 1000 }, // °F
  { field: "humidityOffset", cmd: 0x06, multiplier: 1000 }, // %
  { field: "voltageOffset", cmd: 0x08, multiplier: 1000 }, // V DC
  { field: "currentOffset", cmd: 0x0a, multiplier: 1000 }, // A DC
  { field: "humidityTempOffset", cmd: 0x0c, multiplier: 1000 }, // °F
  { field: "gaugeDiffPressureOffset", cmd: 0x10, multiplier: 1000 }, // PSI
];

// Minimum interval from the WS/WM user manual: 10 minutes
const MIN_INTERVAL = 600;
const MAX_INTERVAL = 65535;

function toHexByte(value) {
  const hex = (value & 0xff).toString(16);
  return hex.length === 1 ? `0${hex}` : hex;
}

function encode(command, value) {
  let raw = Math.round(Number(value) * command.multiplier);
  if (command.field === "setInterval") {
    if (raw < MIN_INTERVAL || raw > MAX_INTERVAL) {
      return null;
    }
  } else if (raw < -32768 || raw > 32767) {
    return null;
  }
  // Negative offsets: 16-bit two's complement
  raw &= 0xffff;
  return (
    toHexByte(command.cmd) +
    toHexByte(0x02) +
    toHexByte(raw >> 8) +
    toHexByte(raw)
  );
}

function consume(event) {
  const port = event.port !== undefined ? event.port : 1;
  const confirmed = event.confirmed !== undefined ? event.confirmed : false;

  if (typeof event.payloadHex === "string" && event.payloadHex.length > 1) {
    emit("downlink", { payloadHex: event.payloadHex, port, confirmed });
    return;
  }

  const payload = event.payload || event.data || {};
  const command = COMMANDS.find(
    (c) => payload[c.field] !== undefined && payload[c.field] !== null,
  );

  if (command === undefined) {
    emit("log", {
      error: `Provide one of: ${COMMANDS.map((c) => c.field).join(", ")}`,
    });
    return;
  }

  const payloadHex = encode(command, payload[command.field]);
  if (payloadHex === null) {
    emit("log", {
      error: `${command.field} value ${payload[command.field]} is out of range`,
    });
    return;
  }

  emit("downlink", { payloadHex, port, confirmed });
}
