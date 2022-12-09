const chai = require("chai");
const { validate } = require("jsonschema");
const rewire = require("rewire");
const utils = require("test-utils");

const { assert } = chai;

describe("WS52X Uplink", () => {
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
    it("should decode should decode the WS52X payload", () => {
      const data = {
        data: {
          port: 1,
          payloadHex: "0374ED0806835604000008700105815207C9A400048001000000",
        },
      };

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.data.current, 164);
        assert.equal(value.data.factor, 82);
        assert.equal(value.data.power, 1);
        assert.equal(value.data.powerConsumption, 1110);
        assert.equal(value.data.state, "OPEN");
        assert.equal(value.data.voltage, 228.5);

        validate(value.data, defaultSchema, { throwError: true });
      });

      consume(data);
    });
  });
});
