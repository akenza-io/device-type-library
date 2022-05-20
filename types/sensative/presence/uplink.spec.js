const chai = require("chai");
const { validate } = require("jsonschema");
const rewire = require("rewire");
const utils = require("test-utils");

const { assert } = chai;

describe("Sensative presence Uplink", () => {
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
      });
    utils
      .loadSchema(`${__dirname}/lifecycle.schema.json`)
      .then((parsedSchema) => {
        lifecycleSchema = parsedSchema;
        done();
      });
    utils.loadSchema(`${__dirname}/alarm.schema.json`).then((parsedSchema) => {
      alarmSchema = parsedSchema;
    });
  });

  describe("consume()", () => {
    it("should decode the sensative presence lifecycle payload", () => {
      const data = {
        data: {
          port: 1,
          payloadHex: "ffff6e02378c8448000000",
        },
      };

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "lifecycle");
        assert.equal(value.data.badConditionsCounter, 0);
        assert.equal(value.data.stackTxFailRebootCount, 0);
        assert.equal(value.data.startUpCount, 72);
        assert.equal(value.data.softwareVersion, "2378c84");
        assert.equal(value.data.watchdogCount, 0);

        validate(value.data, lifecycleSchema, { throwError: true });
      });

      consume(data);
    });
  });

  describe("consume()", () => {
    it("should decode the sensative presence payload", () => {
      const data = {
        data: {
          port: 1,
          payloadHex: "ffff015b0a00",
        },
      };

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "lifecycle");
        assert.equal(value.data.batteryLevel, 91);

        validate(value.data, lifecycleSchema, { throwError: true });
      });

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "alarm");
        assert.equal(value.data.doorAlarm, false);

        validate(value.data, alarmSchema, { throwError: true });
      });

      consume(data);
    });
  });

  describe("consume()", () => {
    it("should decode the sensative presence payload", () => {
      const data = {
        data: {
          port: 1,
          payloadHex: "ffff015b0a01",
        },
      };

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "lifecycle");
        assert.equal(value.data.batteryLevel, 91);

        validate(value.data, lifecycleSchema, { throwError: true });
      });

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "alarm");
        assert.equal(value.data.doorAlarm, true);

        validate(value.data, alarmSchema, { throwError: true });
      });

      consume(data);
    });
  });
});
