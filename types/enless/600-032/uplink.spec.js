
import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectSample } from "test-utils";






describe("Transmitter 600-032", () => {
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
    it("should decode the 600-031 standard payload", () => {
      const data = {
        data: {
          port: 1,
          payloadHex: "0000DC0F0A1200D0000000000000",
        },
      };

      // --- Lifecycle
      expectSample("lifecycle", lifecycleSchema, (data) => {
        assert.equal(data.id, 220);
        assert.equal(data.type, 15);
        assert.equal(data.seqCounter, 10);
        assert.equal(data.fwVersion, 18);
        assert.equal(data.batteryLevel, 100);
      });

      // --- Default (temperature value)
      expectSample("default", defaultSchema, (data) => {
        assert.closeTo(data.temperature, 20.8, 0.1);
        assert.equal(data.msgType, "NORMAL");
      });

      // --- Alarm (none triggered)
      expectSample("alarm", alarmSchema, (data) => {
        assert.equal(data.temperatureLow, false);
        assert.equal(data.temperatureHigh, false);
      });

      consume(data);
    });
  });
});
