const chai = require("chai");

const rewire = require("rewire");
const utils = require("test-utils");

const { assert } = chai;

describe("Integra aquastream uplink", () => {
  let defaultSchema = null;
  let consume = null;
  before((done) => {
    const script = rewire("./uplink.js");
    consume = utils.init(script);
    utils
      .loadSchema(`${__dirname}/default.schema.json`)
      .then((parsedSchema) => {
        defaultSchema = parsedSchema;
        done();
      });
  });

  let alarmSchema = null;
  before((done) => {
    utils.loadSchema(`${__dirname}/alarm.schema.json`).then((parsedSchema) => {
      alarmSchema = parsedSchema;
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
    it("should decode Aquastream payload", () => {
      const data = {
        data: {
          payloadHex:
            "2D44B42509930310050E7221535104B4250107010000200413E02E00008410130000000002FD17000002FD74CB16",
        },
      };

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "default");
        assert.equal(value.data.backflow, 0);
        assert.equal(value.data.volume, 12000);
        assert.equal(value.data.volumeM3, 12);

        utils.validateSchema(value.data, defaultSchema, { throwError: true });
      });

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "alarm");

        assert.equal(value.data.batteryLow, false);
        assert.equal(value.data.burstAlarm, false);
        assert.equal(value.data.leak, false);
        assert.equal(value.data.noConsumption, false);
        assert.equal(value.data.overflow, false);
        assert.equal(value.data.reverseFlow, false);
        assert.equal(value.data.tamperAlarm, false);

        utils.validateSchema(value.data, alarmSchema, { throwError: true });
      });

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "lifecycle");

        assert.equal(value.data.batteryLifetime, 5835);
        assert.equal(value.data.configuration, 32);
        assert.equal(value.data.manufacturerCode, "25B4");
        assert.equal(value.data.meterAddress, "04515321");
        assert.equal(value.data.meterVersion, 1);
        assert.equal(value.data.moduleNumber, "10039309");
        assert.equal(value.data.statusField, 0);
        assert.equal(value.data.systemComponent, 14);
        assert.equal(value.data.transmitionCounter, 1);
        assert.equal(value.data.versionNumber, 5);
        assert.equal(value.data.waterType, 7);

        utils.validateSchema(value.data, lifecycleSchema, { throwError: true });
      });

      consume(data);
    });
  });
});
