import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectEmits, expectSample } from "test-utils";

describe("G2-LDP Uplink", () => {
  let defaultSchema = null;
  let consume = null;
  let lifecycleSchema = null;

  before(() => {
    consume = init(rewire(`${import.meta.dirname}/uplink.js`));
    defaultSchema = loadSchema(`${import.meta.dirname}/default.schema.json`);
    lifecycleSchema = loadSchema(`${import.meta.dirname}/lifecycle.schema.json`);
  });

  describe("consume()", () => {
    it("should decode G2-LDP leakage payload", () => {
      const data = {
        data: {
          port: 1,
          payloadHex:
            "2FCB2800000000000069",
        },
      };

      expectSample("default", defaultSchema, (data) => {
        assert.equal(data.alarmReset, 0);
        assert.equal(data.alarmTrigger, 0);
        assert.equal(data.daysSinceLastLeakage, 0);
        assert.equal(data.durationLastAlarm, 0);
        assert.equal(data.durationLastAlarm2, 0);
        assert.equal(data.leakage, 47);
        assert.equal(data.leakage2, 203);
        assert.equal(data.leakageDetected, 1);
        assert.equal(data.leakageDetected2, 0);
        assert.equal(data.leakageDetectedLast24, 1);
        assert.equal(data.leakageDetected2Last24, 0);
      });

      expectSample("lifecycle", lifecycleSchema, (data) => {
        assert.equal(data.asyncMessage, 1);
        assert.equal(data.batteryVoltage, 1.3);
        assert.equal(data.deviceActivated, 0);
        assert.equal(data.lowBattery, 0);
        assert.equal(data.runtime, 0);
        assert.equal(data.totalRuntime, 0);
      });

      consume(data);
    });

    it("should decode G2-LDP standard payload", () => {
      const data = {
        data: {
          port: 1,
          payloadHex:
            "CCCC0800000000000069",
        },
      };

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "default");
        assert.equal(value.data.alarmReset, 0);
        assert.equal(value.data.alarmTrigger, 0);
        assert.equal(value.data.daysSinceLastLeakage, 0);
        assert.equal(value.data.durationLastAlarm, 0);
        assert.equal(value.data.durationLastAlarm2, 0);
        assert.equal(value.data.leakage, 204);
        assert.equal(value.data.leakage2, 204);
        assert.equal(value.data.leakageDetected, 0);
        assert.equal(value.data.leakageDetected2, 0);
        assert.equal(value.data.leakageDetectedLast24, 1);
        assert.equal(value.data.leakageDetected2Last24, 0);

        // utils.validateSchema(value.data, defaultSchema, { throwError: true });
      });

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "lifecycle");
        assert.equal(value.data.asyncMessage, 1);
        assert.equal(value.data.batteryVoltage, 1.3);
        assert.equal(value.data.deviceActivated, 0);
        assert.equal(value.data.lowBattery, 0);
        assert.equal(value.data.runtime, 0);
        assert.equal(value.data.totalRuntime, 0);

        // utils.validateSchema(value.data, lifecycleSchema, { throwError: true });
      });

      consume(data);
    });
  });
});
