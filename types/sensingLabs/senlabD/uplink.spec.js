const chai = require("chai");
const { validate } = require("jsonschema");
const rewire = require("rewire");
const utils = require("test-utils");

const { assert } = chai;

describe("Senlab SenlabD uplink", () => {
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

  let startupSchema = null;
  before((done) => {
    utils
      .loadSchema(`${__dirname}/startup.schema.json`)
      .then((parsedSchema) => {
        startupSchema = parsedSchema;
        done();
      });
  });

  describe("consume()", () => {
    it("Should decode Senlab SenlabD payload", () => {
      const data = {
        data: {
          port: 4,
          payloadHex: "0067f110a080d5b37044020002030406030000000102",
        },
      };

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "startup");
        assert.equal(value.data.version, "2.0.2");
        assert.equal(value.data.openDuration, 0);
        assert.equal(value.data.closeDuration, 1);

        validate(value.data, startupSchema, { throwError: true });
      });

      consume(data);
    });

    it("Should decode Senlab SenlabD payload", () => {
      const data = {
        data: {
          port: 3,
          payloadHex: "05f503030317cfd115",
        },
      };

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "default");
        assert.equal(value.data.open, false);
        assert.equal(value.data.batteryLevel, 96);

        validate(value.data, defaultSchema, { throwError: true });
      });

      consume(data);
    });
  });
});
