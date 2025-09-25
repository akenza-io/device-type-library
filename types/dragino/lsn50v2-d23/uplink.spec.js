const chai = require("chai");

const rewire = require("rewire");
const utils = require("test-utils");

const { assert } = chai;

describe("LSN50 V2 D23 Uplink", () => {
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

  let dsSchema = null;
  before((done) => {
    utils.loadSchema(`${__dirname}/ds.schema.json`).then((parsedSchema) => {
      dsSchema = parsedSchema;
      done();
    });
  });

  describe("consume()", () => {
    it("should decode the LSN50 V2 D23 report uplink", () => {
      const data = {
        data: {
          port: 2,
          payloadHex: "0e41008200000c0034fffd",
        },
      };

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "default");

        assert.equal(value.data.c0adc, 0);
        assert.equal(value.data.digitalStatus, "LOW");
        assert.equal(value.data.extTrigger, false);
        assert.equal(value.data.open, false);
        assert.equal(value.data.temperature, 13);
        assert.equal(value.data.temperatureF, 55.4);

        utils.validateSchema(value.data, defaultSchema, { throwError: true });
      });

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "ds");

        assert.equal(value.data.c2temperature, 5.2);
        assert.equal(value.data.c2temperatureF, 41.4);
        assert.equal(value.data.c3temperature, -0.3);
        assert.equal(value.data.c3temperatureF, 31.5);

        utils.validateSchema(value.data, dsSchema, { throwError: true });
      });

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "lifecycle");
        assert.equal(value.data.batteryVoltage, 3.649);
        assert.equal(value.data.batteryLevel, 100);

        utils.validateSchema(value.data, lifecycleSchema, { throwError: true });
      });

      consume(data);
    });
  });
});
