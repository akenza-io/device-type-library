const chai = require("chai");
const { validate } = require("jsonschema");
const rewire = require("rewire");
const utils = require("test-utils");

const { assert } = chai;

describe("EGK-LW12MET Uplink", () => {
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
  /*
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
*/
  describe("consume()", () => {
    it("should decode should decode the EGK-LW12MET payload", () => {
      const data = {
        data: {
          port: 1,
          payloadHex: "092f2725246be100003edefeff49d4010043772f00",
        },
      };

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "default");
        assert.equal(value.data.activation, 3110723);
        assert.equal(value.data.activeEnergy, 57707);
        assert.equal(value.data.apparentEnergy, 119881);
        assert.equal(value.data.reactiveEnergy, -74178);

        validate(value.data, defaultSchema, { throwError: true });
      });

      consume(data);
    });
  });
});
