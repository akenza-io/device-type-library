const chai = require("chai");
const { validate } = require("jsonschema");
const rewire = require("rewire");
const utils = require("test-utils");

const { assert } = chai;

describe("Alevel V2 Uplink", () => {
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
    it("should decode the Alevel V2 payload", () => {
      const data = {
        data: {
          port: 3,
          payloadHex: "81AFFBD1E158",
        },
      };

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "lifecycle");
        assert.equal(value.data.batteryStatus, "HEALTHY");
        assert.equal(value.data.currentProfile, "IMR_LORA_SIGFOX");

        validate(value.data, lifecycleSchema, { throwError: true });
      });

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "default");
        assert.equal(value.data.sequenceNumber, 175);
        assert.equal(value.data.temperature, -5);
        assert.equal(value.data.buttonLatched, false);
        assert.equal(value.data.isButtonPressed, true);
        assert.equal(value.data.currentLevel, 90.1);
        assert.equal(value.data.removedFromDial, false);
        assert.equal(value.data.isRefilling, true);
        assert.equal(value.data.highLPG, true);
        assert.equal(value.data.lowLPG, false);
        assert.equal(value.data.outOfRange, false);
        assert.equal(value.data.notValidReadout, false);

        validate(value.data, defaultSchema, { throwError: true });
      });

      consume(data);
    });
  });
});
