import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectEmits, expectSample } from "test-utils";

describe("Dragino LDS03A Uplink", () => {
  let defaultSchema = null;
  let consume = null;
  let infoSchema = null;
  let lifecycleSchema = null;
  let datalogSchema = null;
  let doorCountSchema = null;

  before(() => {
    consume = init(rewire(`${import.meta.dirname}/uplink.js`));
    defaultSchema = loadSchema(`${import.meta.dirname}/default.schema.json`);
    infoSchema = loadSchema(`${import.meta.dirname}/info.schema.json`);
    lifecycleSchema = loadSchema(`${import.meta.dirname}/lifecycle.schema.json`);
    datalogSchema = loadSchema(`${import.meta.dirname}/datalog.schema.json`);
    doorCountSchema = loadSchema(`${import.meta.dirname}/door_count.schema.json`);
  });

  describe("consume()", () => {
    it("should decode the Dragino LDS03A open uplink", () => {
      const data = {
        data: {
          port: 2,
          payloadHex: "0100000500000063bfe921",
        },
      };


      expectEmits((type, value) => {
        assert.equal(type, "state");
        assert.isNotNull(value.lastCount, 0);
        assert.isNotNull(value.partialUsage, 5);
      });

      expectSample("default", defaultSchema, (data) => {
        assert.equal(data.alarm, false);
        assert.equal(data.open, true);
        assert.equal(data.openDuration, 0);
        assert.equal(data.openCounts, 5);
      });

      expectSample("door_count", doorCountSchema, (data) => {
        assert.equal(data.doorClosings, 0);
        assert.equal(data.usageCount, 0);
      });

      consume(data);
    });

    it("should decode the Dragino LDS03A closed uplink", () => {
      const data = {
        data: {
          port: 5,
          payloadHex: "0a011001ff0e65",
        },
      };

      expectSample("lifecycle", lifecycleSchema, (data) => {
        assert.equal(data.batteryVoltage, 3.685);
        assert.equal(data.batteryLevel, 100);
        assert.equal(data.firmwareVersion, "1.1.0");
      });

      consume(data);
    });
  });
});
