const chai = require("chai");

const rewire = require("rewire");
const utils = require("test-utils");

const { assert } = chai;

describe("Milesight EM300-CL Uplink", () => {
  let defaultSchema = null;
  let lifecycleSchema = null;

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
    const script = rewire("./uplink.js");
    consume = utils.init(script);
    utils
      .loadSchema(`${__dirname}/lifecycle.schema.json`)
      .then((parsedSchema) => {
        lifecycleSchema = parsedSchema;
        done();
      });
  });

  describe("consume()", () => {
    it("should decode should decode the Milesight EM300-CL payload", () => {
      const data = {
        data: {
          port: 1,
          payloadHex: "01756403ED00",
        },
      };

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "default");
        assert.equal(value.data.liquid, "UNCALIBRATED");
        utils.validateSchema(value.data, defaultSchema, {
          throwError: true,
        });
      });

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "lifecycle");
        assert.equal(value.data.batteryLevel, 100);
        utils.validateSchema(value.data, lifecycleSchema, {
          throwError: true,
        });
      });

      consume(data);
    });

    it("should decode should decode the Milesight EM300-CL payload", () => {
      const data = {
        data: {
          port: 1,
          payloadHex: "83ED0201",
        },
      };

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "default");
        assert.equal(value.data.liquid, "EMPTY");
        assert.equal(value.data.liquidAlarm, "EMPTY_ALARM");
        utils.validateSchema(value.data, defaultSchema, {
          throwError: true,
        });
      });

      consume(data);
    });
  });
});
