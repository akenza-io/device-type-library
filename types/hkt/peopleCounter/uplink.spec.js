const chai = require("chai");
const { validate } = require("jsonschema");
const rewire = require("rewire");
const utils = require("test-utils");

const { assert } = chai;

describe("Should decode the HKT Door Sensor uplinks", () => {
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

  let systemSchema = null;
  before((done) => {
    utils.loadSchema(`${__dirname}/system.schema.json`).then((parsedSchema) => {
      systemSchema = parsedSchema;
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
    it("Should decode the HKT Door Sensor Version uplinks", () => {
      const data = {
        data: {
          payloadHex: "686b74000001010203648601e1040105001e0600648300",
        },
      };

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "lifecycle");
        assert.equal(value.data.batteryLevel, 100);

        validate(value.data, lifecycleSchema, { throwError: true });
      });

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "system");
        assert.equal(value.data.hwVersion, 1);
        assert.equal(value.data.swVersion, 2);
        assert.equal(value.data.reportingPattern, "TIME_INTERVAL");
        assert.equal(value.data.infraredError, false);
        assert.equal(value.data.threshold, 100);

        validate(value.data, systemSchema, { throwError: true });
      });

      consume(data);
    });

    it("Should decode the HKT Door Sensor counter uplinks", () => {
      const data = {
        data: {
          payloadHex: "686B7400070700780096000000C8000000C8",
        },
      };

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "default");
        assert.equal(value.data.counterA, 120);
        assert.equal(value.data.counterB, 150);
        assert.equal(value.data.absCountA, 200);
        assert.equal(value.data.absCountB, 200);

        validate(value.data, defaultSchema, { throwError: true });
      });
      consume(data);
    });

    it("Should decode the HKT Door Sensor installed uplinks", () => {
      const data = {
        data: {
          payloadHex: "686B7400098400",
        },
      };

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "system");
        assert.equal(value.data.installed, false);

        validate(value.data, systemSchema, { throwError: true });
      });
      consume(data);
    });
  });
});
