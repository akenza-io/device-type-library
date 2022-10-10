const chai = require("chai");
const { validate } = require("jsonschema");
const rewire = require("rewire");
const utils = require("test-utils");

const { assert } = chai;

describe("Terabee people counting XL Uplink", () => {
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
    it("should decode Terabee people counting XL payload", () => {
      const data = {
        data: {
          at: 1665150406,
          type: "counters",
          value: {
            in: 18,
            out: 18,
            reset_period: "auto-3efdbbc0",
          },
        },
      };

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "default");
        assert.equal(value.data.fw, 18);
        assert.equal(value.data.bw, 18);

        validate(value.data, defaultSchema, { throwError: true });
      });

      consume(data);
    });
  });
});
