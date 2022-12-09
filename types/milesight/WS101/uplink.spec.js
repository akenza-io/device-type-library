const chai = require("chai");

const rewire = require("rewire");
const utils = require("test-utils");

const { assert } = chai;

describe("WS101 Uplink", () => {
  let buttonPressedSchema = null;
  let lifecycleSchema = null;
  let consume = null;
  before((done) => {
    const script = rewire("./uplink.js");
    consume = utils.init(script);
    utils
      .loadSchema(`${__dirname}/button_pressed.schema.json`)
      .then((parsedSchema) => {
        buttonPressedSchema = parsedSchema;
        done();
      });
  });

  before((done) => {
    const script = rewire("./uplink.js");
    consume = utils.init(script);
    utils
      .loadSchema(`${__dirname}/lifecycle.schema.json`)
      .then((parsedSchema) => {
        lifecycleSchema = parsedSchema;
        done();
      });
  });

  describe("consume()", () => {
    it("should decode should decode the WS101 payload", () => {
      const data = {
        data: {
          port: 1,
          payloadHex: "017510FF2E01",
        },
      };

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.data.batteryLevel, 16);
        utils.validateSchema(value.data, lifecycleSchema, { throwError: true });
      });

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.data.press, "SHORT");

        utils.validateSchema(value.data, buttonPressedSchema, {
          throwError: true,
        });
      });

      consume(data);
    });
  });
});
