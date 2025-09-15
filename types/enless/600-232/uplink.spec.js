const chai = require("chai");
const rewire = require("rewire");
const utils = require("test-utils");

const { assert } = chai;

describe("Transmitter 600-232", () => {
  let defaultSchema = null;
  let lifecycleSchema = null;
  let alarmSchema = null;
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

  before((done) => {
    utils
      .loadSchema(`${__dirname}/lifecycle.schema.json`)
      .then((parsedSchema) => {
        lifecycleSchema = parsedSchema;
        done();
      });
  });

  before((done) => {
    utils
      .loadSchema(`${__dirname}/alarm.schema.json`)
      .then((parsedSchema) => {
        alarmSchema = parsedSchema;
        done();
      });
  });

  describe("consume()", () => {
    it("should decode the 600-232 standard payload", () => {
      const data = {
        data: {
          port: 1,
          payloadHex: "0000BD0C0A1200CE00CA00010000",
        },
      };

      // --- Lifecycle
      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "lifecycle");
        assert.equal(value.data.id, 189);
        assert.equal(value.data.type, 12);
        assert.equal(value.data.seqCounter, 10);
        assert.equal(value.data.fwVersion, 18);
        assert.equal(value.data.batteryLevel, 100);

        utils.validateSchema(value.data, lifecycleSchema, { throwError: true });
      });

      // --- Default (temperatures values)
      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "default");
        assert.closeTo(value.data.temperature1, 20.6, 0.1);
        assert.closeTo(value.data.temperature2, 20.2, 0.1);
        assert.equal(value.data.msgType, "NORMAL");

        utils.validateSchema(value.data, defaultSchema, { throwError: true });
      });

      // --- Alarm (Temp1 High triggered)
      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "alarm");
        assert.equal(value.data.temperature1Low, false);
        assert.equal(value.data.temperature1High, false);
        assert.equal(value.data.temperature2Low, false);
        assert.equal(value.data.temperature2High, false);

        utils.validateSchema(value.data, alarmSchema, { throwError: true });
      });

      consume(data);
    });
  });
});
