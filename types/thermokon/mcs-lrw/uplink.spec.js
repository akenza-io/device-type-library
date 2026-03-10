
import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectEmits, validateSchema } from "test-utils";

import { dirname } from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

describe("Thermokon MCS-LRW Uplink", () => {
  let defaultSchema = null;
  let lifecycleSchema = null;
  let statusSchema = null;
  let consume = null;

  before(async () => {
    const script = rewire(`${__dirname}/uplink.js`);
    consume = init(script);
    [defaultSchema, lifecycleSchema, statusSchema] = await Promise.all([
      loadSchema(`${__dirname}/default.schema.json`),
      loadSchema(`${__dirname}/lifecycle.schema.json`),
      loadSchema(`${__dirname}/status.schema.json`),
    ]);
  });

  describe("consume()", () => {
    it("should decode a combined sensor and lifecycle payload", () => {
      const data = {
        data: {
          payloadHex: "10010a", // Temp
          port: 2,
        },
      };

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.equal(value.topic, "default");
        assert.deepEqual(value.data, {
          temperature: 26.6,
        });
        validateSchema(value.data, defaultSchema, { throwError: true });
      });

      consume(data);
    });

    it("should decode a combined sensor and status payload", () => {
      const data = {
        data: {
          payloadHex: "4112", // Device Key, Occupancy
          port: 2,
        },
      };

      // Expect the 'default' topic first
      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.equal(value.topic, "default");
        assert.deepEqual(value.data, {
          occupied: false,
          motionCount: 9,
        });
        validateSchema(value.data, defaultSchema, { throwError: true });
      });

      consume(data);
    });

    it("should decode a full payload with all topics", () => {
      const data = {
        data: {
          payloadHex: "54481000fc112d400000", // Temp, Humidity, Light, VBat
          port: 2,
        },
      };

      // 1. Default
      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.equal(value.topic, "default");
        assert.deepEqual(value.data, {
          temperature: 25.2,
          humidity: 45,
          light: 0,
        });
        validateSchema(value.data, defaultSchema, { throwError: true });
      });

      // 2. Lifecycle
      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.equal(value.topic, "lifecycle");
        assert.deepEqual(value.data, {
          batteryVoltage: 1.44,
        });
        validateSchema(value.data, lifecycleSchema, {
          throwError: true,
        });
      });

      consume(data);
    });

    it("should decode various sensor types correctly", () => {
      const data = {
        data: {
          payloadHex: "c00040014100", // occupancy, motionCount, deviceKey
          port: 2,
        },
      };

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.equal(value.topic, "default");
        assert.deepEqual(value.data, {
          occupied: false,
          motionCount: 0,
        });
        validateSchema(value.data, defaultSchema, { throwError: true });
      });

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.equal(value.topic, "status");
        assert.deepEqual(value.data, {
          deviceKey: 16385,
        });
        validateSchema(value.data, statusSchema, {
          throwError: true,
        });
      });

      consume(data);
    });
  });
});
