const chai = require("chai");

const rewire = require("rewire");
const utils = require("test-utils");

const { assert } = chai;

describe("Dragino NSE01 Uplink", () => {
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
    it("should decode the Dragino NSE01 report uplink", () => {
      const data = {
        data: {
          port: 2,
          payloadHex:
            "f86778705021331700840cfd1b010000000ae80000000a6315537b0110034306f7004663185f19",
        },
      };

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "default");
        assert.equal(value.data.soilConductivity, 0);
        assert.equal(value.data.soilDialecticConstant, 10);
        assert.equal(value.data.soilMoisture, 0);
        assert.equal(value.data.soilTemperature, 27.92);

        utils.validateSchema(value.data, defaultSchema, { throwError: true });
      });

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "default");
        assert.equal(value.data.soilConductivity, 3566);
        assert.equal(value.data.soilDialecticConstant, 140);
        assert.equal(value.data.soilMoisture, 0);
        assert.equal(value.data.soilTemperature, 16.7);

        utils.validateSchema(value.data, defaultSchema, { throwError: true });
      });

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "lifecycle");
        assert.equal(value.data.deviceId, "f867787050213317");
        assert.equal(value.data.interrupt, 0);
        assert.equal(value.data.mod, 1);
        assert.equal(value.data.signalStrength, 27);
        assert.equal(value.data.version, 132);
        assert.equal(value.data.batteryVoltage, 3.325);
        assert.equal(value.data.batteryLevel, 80);

        utils.validateSchema(value.data, lifecycleSchema, { throwError: true });
      });

      consume(data);
    });
  });
});
