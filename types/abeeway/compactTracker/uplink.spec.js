const chai = require("chai");
const { validate } = require("jsonschema");
const rewire = require("rewire");
const utils = require("test-utils");

const { assert } = chai;

describe("Abeeway companct tracker uplink", () => {
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
    it("should decode Globalsat LT-20 payload", (done) => {
      const data = {
        data: {
          port: 1,
          payloadHex: "03025c83a0051c5730054ff90b",
        },
      };

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.data.batteryPercent, 100);
        validate(value.data, lifecycleSchema, { throwError: true });
      });

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.data.longitude, 115.8162);
        assert.equal(value.data.latitude, -31.8965256);
        assert.equal(value.data.gpsFix, "Not fix");
        assert.equal(value.data.reportType, "Motion mode static report");
        validate(value.data, defaultSchema, { throwError: true });
      });

      consume(data);
      done();
    });
  });
});
