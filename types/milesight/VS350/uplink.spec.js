const chai = require("chai");

const rewire = require("rewire");
const utils = require("test-utils");

const { assert } = chai;

describe("Milesight VS350 Uplink", () => {
  let counterSchema = null;
  let consume = null;

  before((done) => {
    const script = rewire("./uplink.js");
    consume = utils.init(script);
    utils
      .loadSchema(`${__dirname}/counter.schema.json`)
      .then((parsedSchema) => {
        counterSchema = parsedSchema;
        done();
      });
  });

  let climateSchema = null;
  before((done) => {
    utils
      .loadSchema(`${__dirname}/climate.schema.json`)
      .then((parsedSchema) => {
        climateSchema = parsedSchema;
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
    it("should decode should decode the Milesight VS350 payload", () => {
      const data = {
        data: {
          port: 1,
          payloadHex: "84CC011108110185CCE803E90301",
        },
      };

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "counter");
        assert.equal(value.data.periodicCountAlarm, "THRESHOLD_ALARM");
        assert.equal(value.data.periodicCountIn, 1000);
        assert.equal(value.data.periodicCountOut, 1001);
        assert.equal(value.data.totalCountAlarm, "THRESHOLD_ALARM");
        assert.equal(value.data.totalCountIn, 4353);
        assert.equal(value.data.totalCountOut, 4360);

        utils.validateSchema(value.data, counterSchema, { throwError: true });
      });

      consume(data);
    });

    it("should decode should decode the Milesight VS350 payload", () => {
      const data = {
        data: {
          port: 1,
          payloadHex: "8367360101",
        },
      };

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "climate");
        assert.equal(value.data.temperatureAlarm, "THRESHOLD_ALARM");
        assert.equal(value.data.temperature, 31);

        utils.validateSchema(value.data, climateSchema, { throwError: true });
      });

      consume(data);
    });
  });
});
