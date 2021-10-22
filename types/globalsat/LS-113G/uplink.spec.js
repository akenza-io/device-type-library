const chai = require("chai");
const { validate } = require("jsonschema");
const rewire = require("rewire");
const utils = require("test-utils");

const { assert } = chai;

describe("Globalsat LS-113G uplink", () => {
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
    it("should decode Globalsat LS-113G payload", () => {
      const data = {
        data: {
          payloadHex: "01096113950292",
        },
      };

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.data.co2, 658);
        assert.equal(value.data.humidity, 50.13);
        assert.equal(value.data.temperature, 24.01);

        validate(value.data, defaultSchema, { throwError: true });
      });

      consume(data);
    });
  });
});
