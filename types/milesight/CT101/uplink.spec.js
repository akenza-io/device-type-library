import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectSample } from "test-utils";

describe("CT101 Uplink", () => {
  let defaultSchema = null;
  let consume = null;
  let systemSchema = null;
  let alarmSchema = null;
  let totalCurrentSchema = null;

  before(() => {
    consume = init(rewire(`${import.meta.dirname}/uplink.js`));
    defaultSchema = loadSchema(`${import.meta.dirname}/default.schema.json`);
    systemSchema = loadSchema(`${import.meta.dirname}/system.schema.json`);
    alarmSchema = loadSchema(`${import.meta.dirname}/alarm.schema.json`);
    totalCurrentSchema = loadSchema(`${import.meta.dirname}/total_current.schema.json`);
  });

  describe("consume()", () => {
    it("should decode should decode the CT101 payload", () => {
      const data = {
        data: {
          port: 1,
          payloadHex: "FF0BFFFF0101FF166746D38802580000FF090100FF0A0101FF0F00",
        },
      };

      expectSample("system", systemSchema, (data) => {
        assert.equal(data.firmwareVersion, "1.1");
        assert.equal(data.hardwareVersion, "1.0");
        assert.equal(data.ipsoVersion, "0.1");
        assert.equal(data.powerOn, true);
        assert.equal(data.sn, "6746d38802580000");
      });

      consume(data);
    });

    it("should decode should decode the CT101 payload", () => {
      const data = {
        data: {
          port: 1,
          payloadHex: "039710270000",
        },
      };

      expectSample("total_current", totalCurrentSchema, (data) => {
        assert.equal(data.totalCurrent, 100);
      });

      consume(data);
    });

    it("should decode should decode the CT101 payload", () => {
      const data = {
        data: {
          port: 1,
          payloadHex: "8498B80BD007C40905",
        },
      };

      expectSample("default", defaultSchema, (data) => {
        assert.equal(data.current, 25);
        assert.equal(data.currentMin, 20);
        assert.equal(data.currentMax, 30);
      });

      expectSample("alarm", alarmSchema, (data) => {
        assert.equal(data.overRangeAlarm, true);
        assert.equal(data.overRangeAlarmRelease, false);
        assert.equal(data.thresholdAlarm, true);
        assert.equal(data.thresholdAlarmRelease, false);
      });

      consume(data);
    });
  });
});
