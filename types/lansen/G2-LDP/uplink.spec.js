const chai = require("chai");

const rewire = require("rewire");
const utils = require("test-utils");

const { assert } = chai;

describe("G2-LDP Uplink", () => {
  let defaultSchema = null;
  let consume = null;
  before((done) => {
    const script = rewire("./uplink.js");
    consume = utils.init(script);
    utils.loadSchema(`${__dirname}/default.schema.json`).then((parsedSchema) => {
      defaultSchema = parsedSchema;
      done();
    });
  });

  let lifecycleSchema = null;
  before((done) => {
    utils
      .loadSchema(`${__dirname}/lifecycle.schema.json`)
      .then((parsedSchema) => {
        lifecycleSchema = parsedSchema;
        done();
      });
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

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "default");
        assert.equal(value.data.alarmReset, 0);
        assert.equal(value.data.alarmTrigger, 0);
        assert.equal(value.data.daysSinceLastLeakage, 0);
        assert.equal(value.data.durationLastAlarm, 0);
        assert.equal(value.data.durationLastAlarm_2, 0);
        assert.equal(value.data.leakage, 47);
        assert.equal(value.data.leakage_2, 203);
        assert.equal(value.data.leakageDetected, 1);
        assert.equal(value.data.leakageDetected_2, 0);
        assert.equal(value.data.leakageDetectedLast24, 1);
        assert.equal(value.data.leakageDetectedLast24_2, 0);

        utils.validateSchema(value.data, defaultSchema, { throwError: true });
      });

      utils.expectEmits((type, value) => {
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

        utils.validateSchema(value.data, lifecycleSchema, { throwError: true });
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

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "default");
        assert.equal(value.data.alarmReset, 0);
        assert.equal(value.data.alarmTrigger, 0);
        assert.equal(value.data.daysSinceLastLeakage, 0);
        assert.equal(value.data.durationLastAlarm, 0);
        assert.equal(value.data.durationLastAlarm_2, 0);
        assert.equal(value.data.leakage, 204);
        assert.equal(value.data.leakage_2, 204);
        assert.equal(value.data.leakageDetected, 0);
        assert.equal(value.data.leakageDetected_2, 0);
        assert.equal(value.data.leakageDetectedLast24, 1);
        assert.equal(value.data.leakageDetectedLast24_2, 0);

        // utils.validateSchema(value.data, defaultSchema, { throwError: true });
      });

      utils.expectEmits((type, value) => {
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
