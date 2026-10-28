
import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectSample } from "test-utils";






describe("Transmitter 600-031", () => {
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
          payloadHex: "00008A07071200CD000000000000",
        },
      };

      // --- Lifecycle
      expectSample("lifecycle", lifecycleSchema, (data) => {
        assert.equal(data.id, 138);
        assert.equal(data.type, 7);
        assert.equal(data.seqCounter, 7);
        assert.equal(data.fwVersion, 18);
        assert.equal(data.batteryLevel, 100);
      });

      // --- Default (temperature values)
      expectSample("default", defaultSchema, (data) => {
        assert.closeTo(data.temperature, 20.5, 0.1);
        assert.equal(data.msgType, "NORMAL");
      });

      // --- Alarm
      expectSample("alarm", alarmSchema, (data) => {
        assert.equal(data.temperatureLow, false);
        assert.equal(data.temperatureHigh, false);
      });

      consume(data);
    });
  });
});
