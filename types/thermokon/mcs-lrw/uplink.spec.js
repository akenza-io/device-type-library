const chai = require("chai");
const rewire = require("rewire");
const utils = require("test-utils");

const { assert } = chai;

describe("Thermokon MCS-LRW Uplink", () => {
  let defaultSchema = null;
  let lifecycleSchema = null;
  let statusSchema = null;
  let consume = null;

  before(async () => {
    const script = rewire("./uplink.js");
    consume = utils.init(script);
    [defaultSchema, lifecycleSchema, statusSchema] = await Promise.all([
      utils.loadSchema(`${__dirname}/default.schema.json`),
      utils.loadSchema(`${__dirname}/lifecycle.schema.json`),
      utils.loadSchema(`${__dirname}/status.schema.json`),
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

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.equal(value.topic, "default");
        assert.deepEqual(value.data, {
          temperature: 26.6,
          temperatureF: 79.9,
        });
        utils.validateSchema(value.data, defaultSchema, { throwError: true });
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
      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.equal(value.topic, "default");
        assert.deepEqual(value.data, {
          occupied: false,
          motionCount: 9,
        });
        utils.validateSchema(value.data, defaultSchema, { throwError: true });
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
      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.equal(value.topic, "default");
        assert.deepEqual(value.data, {
          temperature: 25.2,
          temperatureF: 77.4,
          humidity: 45,
          light: 0,
        });
        utils.validateSchema(value.data, defaultSchema, { throwError: true });
      });

      // 2. Lifecycle
      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.equal(value.topic, "lifecycle");
        assert.deepEqual(value.data, {
          batteryVoltage: 1.44,
        });
        utils.validateSchema(value.data, lifecycleSchema, {
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

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.equal(value.topic, "default");
        assert.deepEqual(value.data, {
          occupied: false,
          motionCount: 0,
        });
        utils.validateSchema(value.data, defaultSchema, { throwError: true });
      });

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.equal(value.topic, "status");
        assert.deepEqual(value.data, {
          deviceKey: 16385,
        });
        utils.validateSchema(value.data, statusSchema, {
          throwError: true,
        });
      });

      consume(data);
    });
  });
});
