import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectSample } from "test-utils";

describe("Seeed SenseCAP A1101 Vision Sensor Uplink", () => {
  let defaultSchema = null;
  let consume = null;
  let lifecycleSchema = null;

  before(() => {
    consume = init(rewire(`${import.meta.dirname}/uplink.js`));
    defaultSchema = loadSchema(`${import.meta.dirname}/default.schema.json`);
    lifecycleSchema = loadSchema(`${import.meta.dirname}/lifecycle.schema.json`);
  });

  describe("consume()", () => {
    it("should decode Seeed SenseCAP Vision Sensor payload", () => {
      const data = {
        data: {
          port: 1,
          payloadHex: "014f10fe010000f59a",
        },
      };

      expectSample("default", defaultSchema, (data) => {
        assert.equal(data.objectDetected1, 0.51);
      });

      consume(data);
    });

    it("should decode Seeed SenseCAP Vision Sensor payload", () => {
      const data = {
        data: {
          port: 1,
          payloadHex:
            "0000000701020100070064001e0001090000001100014f10000000004019",
        },
      };

      expectSample("lifecycle", lifecycleSchema, (data) => {
        assert.equal(data.batteryLevel, 100);
        assert.equal(data.sendInterval, 1800);
        assert.equal(data.hardwareVersion, "1.2");
        assert.equal(data.softwareVersion, "1.7");
      });

      expectSample("default", defaultSchema, (data) => {
        assert.equal(data.objectDetected1, 0);
      });

      consume(data);
    });
  });
});
