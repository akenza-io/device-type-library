
import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectSample } from "test-utils";






describe("Transmitter 600-034", () => {
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
    it("should decode the 600-034 standard payload", () => {
      const data = {
        data: {
          port: 1,
          payloadHex: "0000D10E0A1200CA018200000000",
        },
      };

      // --- Lifecycle
      expectSample("lifecycle", lifecycleSchema, (data) => {
        assert.equal(data.id, 209);
        assert.equal(data.type, 14);
        assert.equal(data.seqCounter, 10);
        assert.equal(data.fwVersion, 18);
        assert.equal(data.batteryLevel, 100);
      });

      // --- Default (temperature + humidity)
      expectSample("default", defaultSchema, (data) => {
        assert.closeTo(data.temperature, 20.2, 0.1);
        assert.closeTo(data.humidity, 38.6, 0.1);
        assert.equal(data.msgType, "NORMAL");
      });

      // --- Alarm
      expectSample("alarm", alarmSchema, (data) => {
        assert.equal(data.temperatureHigh, false);
        assert.equal(data.temperatureLow, false);
        assert.equal(data.humidityHigh, false);
        assert.equal(data.humidityLow, false);
      });

      consume(data);
    });
  });
});
