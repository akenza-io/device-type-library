
import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectSample } from "test-utils";






describe("Transmitter 600-232", () => {
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
    it("should decode the 600-232 standard payload", () => {
      const data = {
        data: {
          port: 1,
          payloadHex: "0000BD0C0A1200CE00CA00000000",
        },
      };

      // --- Lifecycle
      expectSample("lifecycle", lifecycleSchema, (data) => {
        assert.equal(data.id, 189);
        assert.equal(data.type, 12);
        assert.equal(data.seqCounter, 10);
        assert.equal(data.fwVersion, 18);
        assert.equal(data.batteryLevel, 100);
      });

      // --- Default (temperatures values)
      expectSample("default", defaultSchema, (data) => {
        assert.closeTo(data.temperature1, 20.6, 0.1);
        assert.closeTo(data.temperature2, 20.2, 0.1);
        assert.equal(data.msgType, "NORMAL");
      });

      // --- Alarm (Temp1 High triggered)
      expectSample("alarm", alarmSchema, (data) => {
        assert.equal(data.temperature1Low, false);
        assert.equal(data.temperature1High, false);
        assert.equal(data.temperature2Low, false);
        assert.equal(data.temperature2High, false);
      });

      consume(data);
    });
  });
});
