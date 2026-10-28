
import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectSample } from "test-utils";

describe("Thermokon MCS-LRW Uplink", () => {
  let defaultSchema = null;
  let lifecycleSchema = null;
  let statusSchema = null;
  let consume = null;

  before(() => {
    consume = init(rewire(`${import.meta.dirname}/uplink.js`));
    defaultSchema = loadSchema(`${import.meta.dirname}/default.schema.json`);
    lifecycleSchema = loadSchema(`${import.meta.dirname}/lifecycle.schema.json`);
    statusSchema = loadSchema(`${import.meta.dirname}/status.schema.json`);
  });

  describe("consume()", () => {
    it("should decode a combined sensor and lifecycle payload", () => {
      const data = {
        data: {
          payloadHex: "10010a", // Temp
          port: 2,
        },
      };

      expectSample("default", defaultSchema, (data) => {
        assert.deepEqual(data, {
          temperature: 26.6,
        });
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
      expectSample("default", defaultSchema, (data) => {
        assert.deepEqual(data, {
          occupied: false,
          motionCount: 9,
        });
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
      expectSample("default", defaultSchema, (data) => {
        assert.deepEqual(data, {
          temperature: 25.2,
          humidity: 45,
          light: 0,
        });
      });

      // 2. Lifecycle
      expectSample("lifecycle", lifecycleSchema, (data) => {
        assert.deepEqual(data, {
          batteryVoltage: 1.44,
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

      expectSample("default", defaultSchema, (data) => {
        assert.deepEqual(data, {
          occupied: false,
          motionCount: 0,
        });
      });

      expectSample("status", statusSchema, (data) => {
        assert.deepEqual(data, {
          deviceKey: 16385,
        });
      });

      consume(data);
    });
  });
});
