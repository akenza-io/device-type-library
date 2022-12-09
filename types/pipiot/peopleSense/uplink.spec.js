const chai = require("chai");

const rewire = require("rewire");
const utils = require("test-utils");

const { assert } = chai;

describe("Pipiot peopleSense uplink", () => {
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
    it("should decode Pipiot peopleSense payload", () => {
      const data = {
        data: {
          payloadHex: "008d00090000400801008001",
        },
      };

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.data.peopleCount, 9);
        assert.equal(value.data.peopleCountBin1, 0);
        assert.equal(value.data.peopleCountBin2, 4);
        assert.equal(value.data.peopleCountBin3, 2);
        assert.equal(value.data.peopleCountBin4, 1);
        assert.equal(value.data.peopleCountBin5, 2);
        assert.equal(value.data.peopleCountBin6, 0);

        utils.validateSchema(value.data, defaultSchema, { throwError: true });
      });

      consume(data);
    });
  });
});
