const chai = require("chai");

const rewire = require("rewire");
const utils = require("test-utils");

const { assert } = chai;

describe("Decentlab PR21 Uplink", () => {
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

  let lifecycleSchema = null;
  before((done) => {
    utils
      .loadSchema(`${__dirname}/lifecycle.schema.json`)
      .then((parsedSchema) => {
        lifecycleSchema = parsedSchema;
        done();
      });
  });

  describe("consume()", () => {
    it("should decode Decentlab PR21 payload", () => {
      const data = {
        data: {
          payloadHex: "02016700034e8060170c7f",
        },
      };

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "default");
        assert.equal(value.data.pressure, 0.24609375);
        assert.equal(value.data.temperature, 25.671875);
         assert.equal(value.data.temperatureF, 78.2);

        utils.validateSchema(value.data, defaultSchema, { throwError: true });
      });

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "lifecycle");
        assert.equal(value.data.batteryVoltage, 3.199);
        assert.equal(value.data.protocolVersion, 2);
        assert.equal(value.data.deviceId, 359);

        utils.validateSchema(value.data, lifecycleSchema, { throwError: true });
      });

      consume(data);
    });
  });
});
