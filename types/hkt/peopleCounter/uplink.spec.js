import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectSample } from "test-utils";

describe("Should decode the HKT People Counter Sensor uplinks", () => {
  let defaultSchema = null;
  let consume = null;
  let systemSchema = null;
  let lifecycleSchema = null;

  before(() => {
    consume = init(rewire(`${import.meta.dirname}/uplink.js`));
    defaultSchema = loadSchema(`${import.meta.dirname}/default.schema.json`);
    systemSchema = loadSchema(`${import.meta.dirname}/system.schema.json`);
    lifecycleSchema = loadSchema(`${import.meta.dirname}/lifecycle.schema.json`);
  });

  describe("consume()", () => {
    it("Should decode the HKT People Counter Sensor Version uplinks", () => {
      const data = {
        data: {
          payloadHex: "686b74000001010203648601e1040105001e0600648300",
        },
      };

      expectSample("lifecycle", lifecycleSchema, (data) => {
        assert.equal(data.batteryLevel, 100);
      });

      expectSample("system", systemSchema, (data) => {
        assert.equal(data.hwVersion, 1);
        assert.equal(data.swVersion, 2);
        assert.equal(data.reportingPattern, "TIME_INTERVAL");
        assert.equal(data.infraredError, false);
        assert.equal(data.threshold, 100);
      });

      consume(data);
    });

    it("Should decode the HKT People Counter Sensor counter uplinks", () => {
      const data = {
        data: {
          payloadHex: "686B7400070700780096000000C8000000C8",
        },
      };

      expectSample("default", defaultSchema, (data) => {
        assert.equal(data.counterA, 120);
        assert.equal(data.counterB, 150);
        assert.equal(data.absCountA, 200);
        assert.equal(data.absCountB, 200);
      });
      consume(data);
    });

    it("Should decode the HKT People Counter Sensor installed uplinks", () => {
      const data = {
        data: {
          payloadHex: "686B7400098400",
        },
      };

      expectSample("system", systemSchema, (data) => {
        assert.equal(data.installed, false);
      });
      consume(data);
    });
  });
});
