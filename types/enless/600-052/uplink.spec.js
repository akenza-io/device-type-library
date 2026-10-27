
import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectEmits, expectSample, validateSchema } from "test-utils";






describe("Transmitter 600-052", () => {
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
    it("should decode the 600-052 periodic payload", () => {
      const data = {
        data: {
          port: 1,
          payloadHex:
            "00200420001200fe00000208000000000000000000000000000000000000",
        },
      };

      // --- Lifecycle ---
      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.equal(value.topic, "lifecycle");
        assert.equal(value.data.id, 8196);
        assert.equal(value.data.type, 32);
        assert.equal(value.data.seqCounter, 0);
        assert.equal(value.data.fwVersion, 18);
        assert.equal(value.data.batteryLevel, 100); // bits 3-2 → 00 (512 >> 2)

        validateSchema(value.data, lifecycleSchema, { throwError: true });
      });

      // --- Default ---
      expectSample("default", defaultSchema, (data) => {
        assert.closeTo(data.temperature, 25.4, 0.1);
        assert.equal(data.humidity, 52, 0.1);
        assert.equal(data.msgType, "NORMAL");
        assert.equal(data.rbe, false);
      });

      // --- Alarm ---
      expectSample("alarm", alarmSchema, (data) => {
        assert.equal(data.temperatureHigh, false);
        assert.equal(data.temperatureLow, false);
        assert.equal(data.humidityHigh, false);
        assert.equal(data.humidityLow, false);
        assert.equal(data.motionGuard, false);
      });

      consume(data);
    });
  });
});
