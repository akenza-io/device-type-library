
import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectSample } from "test-utils";






describe("Transmitter 600-021", () => {
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
    it("should decode the 600-021 standard payload", () => {
      const data = {
        data: {
          port: 1,
          payloadHex: "00006D04131200E501200000000000000000",
        },
      };

      // --- Lifecycle
      expectSample("lifecycle", lifecycleSchema, (data) => {
        assert.equal(data.id, 109);
        assert.equal(data.type, 4);
        assert.equal(data.seqCounter, 19);
        assert.equal(data.fwVersion, 18);
        assert.equal(data.batteryLevel, 100);
      });

      // --- Default (environmental values)
      expectSample("default", defaultSchema, (data) => {
        assert.closeTo(data.temperature, 22.9, 0.1);
        assert.closeTo(data.humidity, 28.8, 0.1);
        assert.equal(data.msgType, "NORMAL");
      });

      // --- Alarm
      expectSample("alarm", alarmSchema, (data) => {
        assert.equal(data.humidityLow, false);
        assert.equal(data.humidityHigh, false);
        assert.equal(data.temperatureLow, false);
        assert.equal(data.temperatureHigh, false);
      });

      consume(data);
    });
  });
});
