import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectSample } from "test-utils";

describe("Sensative presence Uplink", () => {
  let lifecycleSchema = null;
  let alarmSchema = null;
  let consume = null;

  before(() => {
    consume = init(rewire(`${import.meta.dirname}/uplink.js`));
    lifecycleSchema = loadSchema(`${import.meta.dirname}/lifecycle.schema.json`);
    alarmSchema = loadSchema(`${import.meta.dirname}/alarm.schema.json`);
  });

  describe("consume()", () => {
    it("should decode the sensative presence lifecycle payload", () => {
      const data = {
        data: {
          port: 1,
          payloadHex: "ffff6e02378c8448000000",
        },
      };

      expectSample("lifecycle", lifecycleSchema, (data) => {
        assert.equal(data.badConditionsCounter, 0);
        assert.equal(data.stackTxFailRebootCount, 0);
        assert.equal(data.startUpCount, 72);
        assert.equal(data.softwareVersion, "2378c84");
        assert.equal(data.watchdogCount, 0);
      });

      consume(data);
    });
  });

  describe("consume()", () => {
    it("should decode the sensative presence payload", () => {
      const data = {
        data: {
          port: 1,
          payloadHex: "ffff015b0a00",
        },
      };

      expectSample("lifecycle", lifecycleSchema, (data) => {
        assert.equal(data.batteryLevel, 91);
      });

      expectSample("alarm", alarmSchema, (data) => {
        assert.equal(data.doorAlarm, false);
      });

      consume(data);
    });
  });

  describe("consume()", () => {
    it("should decode the sensative presence payload", () => {
      const data = {
        data: {
          port: 1,
          payloadHex: "ffff015b0a01",
        },
      };

      expectSample("lifecycle", lifecycleSchema, (data) => {
        assert.equal(data.batteryLevel, 91);
      });

      expectSample("alarm", alarmSchema, (data) => {
        assert.equal(data.doorAlarm, true);
      });

      consume(data);
    });
  });
});
