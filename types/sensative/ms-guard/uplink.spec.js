import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectSample } from "test-utils";

describe("Sensative strip", () => {
  let defaultSchema = null;
  let consume = null;
  let lifecycleSchema = null;
  let alarmSchema = null;

  before(() => {
    consume = init(rewire(`${import.meta.dirname}/uplink.js`));
    defaultSchema = loadSchema(`${import.meta.dirname}/default.schema.json`);
    lifecycleSchema = loadSchema(`${import.meta.dirname}/lifecycle.schema.json`);
    alarmSchema = loadSchema(`${import.meta.dirname}/alarm.schema.json`);
  });

  describe("consume()", () => {
    it("should decode the sensative strip payload", () => {
      const data = {
        data: {
          port: 1,
          payloadHex: "ffff09010a0052010000",
        },
      };

      expectSample("lifecycle", lifecycleSchema, (data) => {
        assert.equal(data.historySeqNr, 65535);
        assert.equal(data.prevHistSeqNr, 65535);
      });

      expectSample("alarm", alarmSchema, (data) => {
        assert.equal(data.doorAlarm, true);
      });

      expectSample("default", defaultSchema, (data) => {
        assert.equal(data.temperature, 0);
        assert.equal(data.closed, false);
      });

      consume(data);
    });
  });
});
