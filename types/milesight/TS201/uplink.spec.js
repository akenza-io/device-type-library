const chai = require("chai");

const rewire = require("rewire");
const utils = require("test-utils");

const { assert } = chai;

describe("Milesight TS201 Uplink", () => {
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
    it("should decode should decode the Milesight TS201 payload", () => {
      const data = {
        data: {
          port: 1,
          payloadHex: "93673401640002",
        },
      };

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "default");
        assert.equal(value.data.temperature, 30.8);
        assert.equal(value.data.temperatureMutation, 10);
        assert.equal(value.data.temperatureAlarm, "MUTATION");

        utils.validateSchema(value.data, defaultSchema, { throwError: true });
      });

      consume(data);
    });

    it("should decode should decode the Milesight TS201 history payload", () => {
      const data = {
        data: {
          port: 1,
          payloadHex: "20CEC79AFA6402BDFF",
        },
      };

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "default");
        assert.equal(value.data.temperature, -6.7);
        assert.equal(value.data.eventType, "ALARM");
        assert.equal(value.data.readStatus, "SUCCESS");

        utils.validateSchema(value.data, defaultSchema, { throwError: true });
      });

      consume(data);
    });
  });
});
