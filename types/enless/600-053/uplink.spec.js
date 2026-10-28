
import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectEmits, expectSample, validateSchema } from "test-utils";






describe("Transmitter 600-053", () => {
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
    it("should decode the 600-053 periodic payload", () => {
      const data = {
        data: {
          port: 1,
          payloadHex:
            "0000ea253611FF700000003203E800000000000000000000000000000000",
        },
      };

      // --- Lifecycle ---
      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.equal(value.topic, "lifecycle");
        assert.equal(value.data.id, 234);
        assert.equal(value.data.type, 37);
        assert.equal(value.data.seqCounter, 54);
        assert.equal(value.data.fwVersion, 17);
        assert.equal(value.data.batteryLevel, 100); // bits 3-2 → 00

        validateSchema(value.data, lifecycleSchema, { throwError: true });
      });

      // --- Default ---
      expectSample("default", defaultSchema, (data) => {
        assert.closeTo(data.temperature, -14.4, 0.1);
        assert.equal(data.humidity, 5);
        assert.equal(data.co2, 1000);
        assert.equal(data.msgType, "NORMAL");
        assert.equal(data.co2Sampled, false);
        assert.equal(data.ledOn, false);
      });

      // --- Alarm ---
      expectSample("alarm", alarmSchema, (data) => {
        assert.equal(data.temperatureHigh, false);
        assert.equal(data.temperatureLow, false);
        assert.equal(data.humidityHigh, false);
        assert.equal(data.humidityLow, false);
        assert.equal(data.co2High, false);
        assert.equal(data.co2Low, false);
        assert.equal(data.motionGuard, false);
      });

      consume(data);
    });
  });
});
