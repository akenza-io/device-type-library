
import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectSample } from "test-utils";






describe("Transmitter 600-039", () => {
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
    it("should decode the 600-039 standard payload", () => {
      const data = {
        data: {
          port: 1,
          payloadHex: "0000B40B0E1200000018000000280000005600000000",
        },
      };

      // --- Lifecycle ---
      expectSample("lifecycle", lifecycleSchema, (data) => {
        assert.equal(data.id, 180);
        assert.equal(data.type, 11);
        assert.equal(data.seqCounter, 14);
        assert.equal(data.fwVersion, 18);
        assert.equal(data.batteryLevel, 100);
      });

      // --- Default (state counters & input states) ---
      expectSample("default", defaultSchema, (data) => {
        assert.equal(data.pulseCh1Counter, 24);
        assert.equal(data.pulseCh2Counter, 40);
        assert.equal(data.pulseOcCounter, 86);
        assert.equal(data.pulseCh1State, "OPEN");
        assert.equal(data.pulseCh2State, "OPEN");
        assert.equal(data.pulseOcState, "OPEN");
        assert.equal(data.msgType, "NORMAL");
      });

      // --- Alarm ---
      expectSample("alarm", alarmSchema, (data) => {
        assert.equal(data.ch1Alarm, false);
        assert.equal(data.ch2Alarm, false);
        assert.equal(data.ocAlarm, false);
      });

      consume(data);
    });
  });
});
