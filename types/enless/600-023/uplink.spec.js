
import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectSample } from "test-utils";






describe("Transmitter 600-023", () => {
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
    it("should decode the 600-023 standard payload", () => {
      const data = {
        data: {
          port: 1,
          payloadHex: "00007706111200E3011F0014013200000000",
        },
      };

      // --- Lifecycle
      expectSample("lifecycle", lifecycleSchema, (data) => {
        assert.equal(data.batteryLevel, 100);
        assert.equal(data.id, 119);
        assert.equal(data.type, 6);
        assert.equal(data.seqCounter, 17);
        assert.equal(data.fwVersion, 18);
      });

      // --- Default (environmental values)
      expectSample("default", defaultSchema, (data) => {
        assert.closeTo(data.temperature, 22.7, 0.1);
        assert.closeTo(data.humidity, 28.7, 0.1);
        assert.equal(data.voc, 20);
        assert.equal(data.co2, 306);
        assert.equal(data.msgType, "NORMAL");
      });

      // --- Alarm
      expectSample("alarm", alarmSchema, (data) => {
        assert.equal(data.vocLow, false);
        assert.equal(data.vocHigh, false);
        assert.equal(data.humidityLow, false);
        assert.equal(data.humidityHigh, false);
        assert.equal(data.temperatureLow, false);
        assert.equal(data.temperatureHigh, false);
        assert.equal(data.co2Low, false);
        assert.equal(data.co2High, false);
      });

      consume(data);
    });
  });
});
