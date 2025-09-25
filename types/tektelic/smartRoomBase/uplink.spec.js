const chai = require("chai");

const rewire = require("rewire");
const utils = require("test-utils");

const { assert } = chai;

describe("Tektelic Smart Room Base Sensor Uplink", () => {
  let lifecycleSchema = null;
  let consume = null;
  before((done) => {
    const script = rewire("./uplink.js");
    consume = utils.init(script);
    utils
      .loadSchema(`${__dirname}/lifecycle.schema.json`)
      .then((parsedSchema) => {
        lifecycleSchema = parsedSchema;
        done();
      });
  });

  let defaultSchema = null;
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

  let reedSchema = null;
  before((done) => {
    const script = rewire("./uplink.js");
    consume = utils.init(script);
    utils.loadSchema(`${__dirname}/reed.schema.json`).then((parsedSchema) => {
      reedSchema = parsedSchema;
      done();
    });
  });

  describe("consume()", () => {
    it("should decode the Tektelic Smart Room Base Sensor standart payload", () => {
      const data = {
        data: {
          port: 10,
          payloadHex: "036700fb04683600ff013f",
        },
      };

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "lifecycle");
        assert.equal(value.data.batteryVoltage, 3.19);

        utils.validateSchema(value.data, lifecycleSchema, { throwError: true });
      });

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "default");
        assert.equal(value.data.temperature, 25.1);
        assert.equal(value.data.temperatureF, 77.2);
        assert.equal(value.data.humidity, 27);

        utils.validateSchema(value.data, defaultSchema, { throwError: true });
      });

      consume(data);
    });

    it("should decode the Tektelic Smart Room Base Sensor reed payload", () => {
      const data = {
        data: {
          port: 10,
          payloadHex: "01000008040001",
        },
      };

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "reed");
        assert.equal(value.data.reedCount, 1);
        assert.equal(value.data.open, false);

        utils.validateSchema(value.data, reedSchema, { throwError: true });
      });

      consume(data);
    });

    it("should decode the Tektelic Smart Room Base Sensor reed payload", () => {
      const data = {
        data: {
          port: 10,
          payloadHex: "0100ff08040001",
        },
      };

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "reed");
        assert.equal(value.data.reedCount, 1);
        assert.equal(value.data.open, true);

        utils.validateSchema(value.data, reedSchema, { throwError: true });
      });

      consume(data);
    });
  });
});
