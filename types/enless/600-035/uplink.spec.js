
import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectSample } from "test-utils";






describe("Transmitter 600-035", () => {
  let defaultSchema = null;
  let lifecycleSchema = null;
  let alarmSchema = null;
  let consume = null;

  before(() => {
    consume = init(rewire(`${import.meta.dirname}/uplink.js`));
    defaultSchema = loadSchema(`${import.meta.dirname}/default.schema.json`);
    lifecycleSchema = loadSchema(`${import.meta.dirname}/lifecycle.schema.json`);
    alarmSchema = loadSchema(`${import.meta.dirname}/alarm.schema.json`);
  });

  describe("consume()", () => {
    it("should decode the 600-035 standard payload", () => {
      const data = {
        data: {
          port: 1,
          payloadHex: "0000C70D0A12000200000000",
        },
      };

      // --- Lifecycle ---
      expectSample("lifecycle", lifecycleSchema, (data) => {
        assert.equal(data.id, 199);
        assert.equal(data.type, 13);
        assert.equal(data.seqCounter, 10);
        assert.equal(data.fwVersion, 18);
        assert.equal(data.batteryLevel, 100);
      });

      // --- Default (current value) ---
      expectSample("default", defaultSchema, (data) => {
        assert.closeTo(data.current, 0.002, 0.001);
        assert.equal(data.msgType, "NORMAL");
      });

      // --- Alarm (Current Low triggered) ---
      expectSample("alarm", alarmSchema, (data) => {
        assert.equal(data.currentLow, false);
        assert.equal(data.currentHigh, false);
      });

      consume(data);
    });
  });
});
