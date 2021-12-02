const chai = require("chai");
const { validate } = require("jsonschema");
const rewire = require("rewire");
const utils = require("test-utils");

const { assert } = chai;

describe("Swisscom Multisense Workplace Uplink", () => {
  let buttonEventSchema = null;
  let consume = null;
  before((done) => {
    const script = rewire("./uplink.js");
    consume = utils.init(script);
    utils
      .loadSchema(`${__dirname}/button_event.schema.json`)
      .then((parsedSchema) => {
        buttonEventSchema = parsedSchema;
        done();
      });
  });

  describe("consume()", () => {
    it("Swisscom Multisense Workplace Uplink", () => {
      const data = {
        data: {
          port: 3,
          payloadHex: "020040b5",
        },
      };

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "button_event");
        assert.equal(value.data.payloadVersion, 2);
        assert.equal(value.data.mode, 0);
        assert.equal(value.data.voltage, 3.086);
        assert.equal(value.data.batteryLevel, 71);

        validate(value.data, buttonEventSchema, { throwError: true });
      });

      consume(data);
    });
  });
});
