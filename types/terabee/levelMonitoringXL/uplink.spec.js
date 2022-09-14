const chai = require("chai");
const { validate } = require("jsonschema");
const rewire = require("rewire");
const utils = require("test-utils");

const { assert } = chai;

describe("Terabee Level monitoring XL Uplink", () => {
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

  describe("consume()", () => {
    it("should decode Terabee Level monitoring XL payload", () => {
      const data = {
        data: {
          port: "6",
          payloadHex: "1F8B0000",
        },
      };

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "default");
        assert.equal(value.data.distance, 8075);
        assert.equal(value.data.fillPercentage, 0);
        assert.equal(value.data.voltage, 0);

        validate(value.data, defaultSchema, { throwError: true });
      });

      consume(data);
    });
  });
});
