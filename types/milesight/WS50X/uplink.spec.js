const chai = require("chai");
const { validate } = require("jsonschema");
const rewire = require("rewire");
const utils = require("test-utils");

const { assert } = chai;

describe("WS50X Uplink", () => {
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
    it("should decode should decode the WS50X payload", () => {
      const data = {
        data: {
          port: 1,
          payloadHex: "FF2931",
        },
      };

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.data.switch1, "OPEN");
        assert.equal(value.data.switch2, "CLOSE");
        assert.equal(value.data.switch3, "CLOSE");
        assert.equal(value.data.switch1change, true);
        assert.equal(value.data.switch2change, true);
        assert.equal(value.data.switch3change, false);

        validate(value.data, defaultSchema, { throwError: true });
      });

      consume(data);
    });
  });
});
