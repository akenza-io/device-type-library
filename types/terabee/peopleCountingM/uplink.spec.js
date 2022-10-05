const chai = require("chai");
const { validate } = require("jsonschema");
const rewire = require("rewire");
const utils = require("test-utils");

const { assert } = chai;

describe("Terabee people counting M Uplink", () => {
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
    it("should decode Terabee people counting M payload", () => {
      const data = {
        count_in: 23,
        count_out: 12,
        timestamp: "165776767",
        device_id: "FA21415EAEB7",
        username: "user",
        password: "password",
      };

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "default");
        assert.equal(value.data.fw, 8075);
        assert.equal(value.data.bw, 0);

        validate(value.data, defaultSchema, { throwError: true });
      });

      consume(data);
    });
  });
});
