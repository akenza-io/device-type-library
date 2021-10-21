const chai = require("chai");
const { validate } = require("jsonschema");
const rewire = require("rewire");
const utils = require("test-utils");

const { assert } = chai;

describe("Swisscom Multisense Uplink", () => {
  let ambianceSchema = null;
  let consume = null;
  before((done) => {
    const script = rewire("./uplink.js");
    consume = utils.init(script);
    utils
      .loadSchema(`${__dirname}/ambiance.schema.json`)
      .then((parsedSchema) => {
        ambianceSchema = parsedSchema;
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
    it("should decode the Swisscom Multisense ambiance payload", () => {
      const data = {
        data: {
          port: 3,
          payloadHex: "010080a3010945026e",
        },
      };

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "ambiance");
        assert.equal(value.data.temperature, 23.73);
        assert.equal(value.data.humidity, 55);

        validate(value.data, ambianceSchema, { throwError: true });
      });

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "lifecycle");
        assert.equal(value.data.payloadVersion, 1);
        assert.equal(value.data.mode, 0);
        assert.equal(value.data.voltage, 2.978);
        assert.equal(value.data.batteryLevel, 64);

        validate(value.data, lifecycleSchema, { throwError: true });
      });

      consume(data);
    });
  });
});
