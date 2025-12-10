import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectEmits, validateSchema } from "test-utils";

import { dirname } from "path";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

describe("Milesight AM102 Uplink", () => {
  let defaultSchema = null;
  let lifecycleSchema = null;
  let systemSchema = null;
  let consume = null;

  before(async () => {
    const script = rewire(`${__dirname}/uplink.js`);
    consume = init(script);
    [defaultSchema, lifecycleSchema, systemSchema] = await Promise.all([
      loadSchema(`${__dirname}/default.schema.json`),
      loadSchema(`${__dirname}/lifecycle.schema.json`),
      loadSchema(`${__dirname}/system.schema.json`),
    ]);
  });

  describe("consume()", () => {
    it("should decode the basic information payload from the user guide", () => {
      const data = {
        data: {
          payloadHex: "ff0bffff166710b32620711912ff090100ff0a0101ff180013",
          port: 85,
        },
      };

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.equal(value.topic, "system");
        assert.deepEqual(value.data, {
          deviceStatus: "ON",
          sn: "6710b32620711912",
          hardwareVersion: "v1.0",
          firmwareVersion: "v1.1",
          temperatureEnabled: true,
          humidityEnabled: true,
        });
        validateSchema(value.data, systemSchema, { throwError: true });
      });

      consume(data);
    });

    it("should decode the periodic sensor data payload from the user guide", () => {
      const data = {
        data: {
          payloadHex: "0175640367ff0004684f",
          port: 85,
        },
      };

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.equal(value.topic, "default");
        assert.deepEqual(value.data, {
          temperature: 25.5,
          temperatureF: 77.9,
          humidity: 39.5,
        });
        validateSchema(value.data, defaultSchema, { throwError: true });
      });

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.equal(value.topic, "lifecycle");
        assert.deepEqual(value.data, {
          batteryLevel: 100,
        });
        validateSchema(value.data, lifecycleSchema, {
          throwError: true,
        });
      });

      consume(data);
    });

    it("should decode the historical data payload from the user guide", () => {
      const data = {
        data: {
          payloadHex: "20ce5c44ec63d30059",
          port: 85,
        },
      };

      // Historical data is emitted on the 'default' topic with a specific timestamp
      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.equal(value.topic, "default");
        assert.deepEqual(value.data, {
          temperature: 21.1,
          humidity: 44.5,
        });
        assert.equal(value.timestamp.toISOString(), "2023-02-15T02:33:00.000Z");
        validateSchema(value.data, defaultSchema, { throwError: true });
      });

      consume(data);
    });
  });
});
