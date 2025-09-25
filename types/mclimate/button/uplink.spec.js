const chai = require("chai");

const rewire = require("rewire");
const utils = require("test-utils");

const { assert } = chai;

describe("MClimate Button uplink", () => {
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
    it("should decode MClimate Button payload", () => {
      const data = {
        data: {
          payloadHex: "01db011a01",
        },
      };

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "default");
        assert.equal(value.data.batteryVoltage, 3.352);
        assert.equal(value.data.buttonPressed, "SINGLE_PRESS");
        assert.equal(value.data.temperature, 28.2);
         assert.equal(value.data.temperatureF, 82.8);
        assert.equal(value.data.thermistorOperational, true);

        utils.validateSchema(value.data, defaultSchema, { throwError: true });
      });

      consume(data);
    });
  });
});
