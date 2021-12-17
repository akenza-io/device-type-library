const chai = require("chai");
const { validate } = require("jsonschema");
const rewire = require("rewire");
const utils = require("test-utils");

const { assert } = chai;

describe("Comtac LPN CM-3 Uplink", () => {
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
    it("should decode the Comtac LPN CM-3 payload default", () => {
      const data = {
        data: {
          port: 3,
          payloadHex: "001104c8010211",
        },
      };

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "default");
        assert.equal(value.data.temperature, 5.29);
        validate(value.data, defaultSchema, { throwError: true });
      });

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "lifecycle");
        assert.equal(value.data.batLow, false);
        assert.equal(value.data.lastTempValid, true);
        assert.equal(value.data.extMEM, false);
        assert.equal(value.data.acc, false);
        assert.equal(value.data.tempI2C, false);
        assert.equal(value.data.tempPt100, true);
        assert.equal(value.data.infoReq, false);
        assert.equal(value.data.configRX, false);
        assert.equal(value.data.button, false);
        assert.equal(value.data.alarming, true);
        assert.equal(value.data.history, false);
        assert.equal(value.data.async, false);
        assert.equal(value.data.batteryLevel, 100);

        validate(value.data, lifecycleSchema, { throwError: true });
      });

      consume(data);
    });
  });
});
