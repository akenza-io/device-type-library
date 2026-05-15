# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm install          # Install dependencies
npm test             # Run all tests (mocha, *.spec.js)
npm run integration-test  # Run integration tests against the Akenza API
```

To run tests for a single device type, use mocha directly:

```bash
npx mocha types/manufacturer/MODEL/uplink.spec.js
```

CI runs tests on Node.js 20, 22, and 24. The `TEST_MODE` environment variable controls test behavior: `LOCAL` (default) runs purely in-process; `INTEGRATION` calls the live script runner API.

## Architecture

This is a library of **IoT device type definitions** for the Akenza platform. Each device type provides a payload decoder that transforms raw binary/JSON payloads into structured, topic-keyed JSON measurements.

### Directory Layout

- `types/<manufacturer>/<MODEL>/` — one folder per device type (407+)
- `data-models/<category>/schema.json` — shared JSON Schema definitions for common measurement types (environment, motion, location, spaces, device, electricity, distance, flow, ios)
- `lib/` — shared test utilities, bit/hex helpers, and meta/schema validation specs

### Device Type Files

Each device folder contains:

| File | Required | Purpose |
|------|----------|---------|
| `meta.json` | Yes | Metadata: name, manufacturer, sensors, topics, connectivity |
| `uplink.js` | Yes | Decoder: `function consume(event)` that calls `emit()` |
| `uplink.spec.js` | Yes | Mocha tests using `expectEmits()` |
| `*.schema.json` | Yes (one per topic) | JSON Schema (Draft-7) for each output topic |
| `downlink.js` | No | Encoder for device commands |
| `downlink.schema.json` | No | Schema for downlink payloads |
| `<MODEL>.png` | No | Device image |

### Decoder Pattern (`uplink.js`)

```javascript
function consume(event) {
  const payload = event.data.payloadHex;  // or event.data.payload for JSON devices
  const bits = Bits.hexToBits(payload);

  emit("sample", {
    data: { temperature: Bits.bitsToSigned(bits.substr(72, 16)) / 100 },
    topic: "default",
  });

  emit("sample", {
    data: { batteryVoltage: Bits.bitsToUnsigned(bits.substr(56, 16)) / 1000 },
    topic: "lifecycle",
  });
}
```

- `Bits` and `Hex` are global utilities injected at runtime (no import needed)
- `emit(type, value)` is the only output mechanism — no return values
- Topic names must match the schema files and `meta.json` output topics

### Test Pattern (`uplink.spec.js`)

```javascript
const { init, loadSchema, expectEmits, validateSchema } = require("../../lib/test/utils.js");
const rewire = require("rewire");

const script = rewire("./uplink.js");
let consume;

describe("Device Uplink", () => {
  before(() => {
    loadSchema(`${__dirname}/default.schema.json`);
    consume = init(script);
  });

  it("should decode the payload", () => {
    const event = { data: { payloadHex: "..." } };

    expectEmits((type, value) => {
      assert.equal(value.topic, "default");
      validateSchema(value.data, schema, { throwError: true });
    });

    consume(event);
  });
});
```

`expectEmits()` queues one callback per expected `emit()` call in order. `validateSchema()` checks both JSON Schema conformance and warns on missing keys.

### Schema Files

Each schema file targets one output topic:

```json
{
  "$schema": "http://json-schema.org/draft-07/schema",
  "type": "object",
  "title": "Device Default",
  "topic": "default",
  "processingType": "uplink_decoder",
  "properties": {
    "temperature": {
      "$ref": "https://raw.githubusercontent.com/akenza-io/device-type-library/main/data-models/environment/schema.json#/$defs/temperature/celsius"
    }
  },
  "required": ["temperature"]
}
```

Reuse `$ref` pointers to `data-models/` wherever a property matches a common measurement type.

### Global Utilities

- `Bits.hexToBits(hex)` — convert hex string to bit string
- `Bits.bitsToUnsigned(bits)` / `Bits.bitsToSigned(bits)` — parse bit substrings
- `Bits.bytesToHex(bytes)`, `Bits.base64ToBits(b64)`
- `Hex.hexToBytes(hex)`, `Hex.hexLittleEndianToBigEndian(hex)`

## Conventions

- **Topics**: `default` for primary measurements, `lifecycle` for device state (battery, config, uptime), plus custom topics matching the device's output categories.
- **Null values**: Emit `null` for unknown/unavailable fields rather than omitting them.
- **CHANGELOG.md**: Every PR must include a CHANGELOG entry — enforced by GitHub Actions.
- **Code style**: Prettier with double quotes, 2-space indentation, trailing commas. ESLint allows `Bits`, `Hex`, and `emit` as globals.

## Adding a New Device Type

1. Create `types/<manufacturer>/<MODEL>/`
2. Add `meta.json`, `uplink.js`, `uplink.spec.js`, and one `*.schema.json` per output topic
3. Update `CHANGELOG.md`
4. Submit PR — requires CODEOWNERS approval
