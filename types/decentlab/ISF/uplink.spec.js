const chai = require("chai");

const rewire = require("rewire");
const utils = require("test-utils");

const { assert } = chai;

describe("Decentlab ISF Uplink", () => {
  let defaultSchema = null;
  let lifecycleSchema = null;
  let consume = null;
  before((done) => {
    const script = rewire("./uplink.js");
    consume = utils.init(script);
    done();
  });

  before((done) => {
    utils
      .loadSchema(`${__dirname}/default.schema.json`)
      .then((parsedSchema) => {
        defaultSchema = parsedSchema;
        done();
      });
  });

  before((done) => {
    utils
      .loadSchema(`${__dirname}/lifecycle.schema.json`)
      .then((parsedSchema) => {
        lifecycleSchema = parsedSchema;
        done();
      });
  });

  describe("consume()", () => {
    it("should decode the Decentlab ISF payload", () => {
      const data = {
        data: {
          payloadHex:
            "023d0100030c290bab0c3e79707a1d78437991490845997e4cacdeaa6e00000000457e415a0b59",
        },
      };

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "default");
        assert.equal(value.data.alphaInner, 0.00352);
        assert.equal(value.data.alphaOuter, -0.05184);
        assert.equal(value.data.betaInner, -0.04128);
        assert.equal(value.data.betaOuter, -0.14816);
        assert.equal(value.data.heatVelocityInner, 0.144);
        assert.equal(value.data.heatVelocityOuter, -2.208);
        assert.equal(value.data.maxVoltage, 11.486);
        assert.equal(value.data.minVoltage, 10.862);
        assert.equal(value.data.sapFlow, -0.192);
        assert.equal(value.data.temperatureOuter, -4.36);
        assert.equal(value.data.tmaxInner, 35.634);
        assert.equal(value.data.tmaxOuter, 37.392);
        assert.equal(value.data.upstreamTmaxInner, 33.46);
        assert.equal(value.data.upstreamTmaxOuter, 35.58);

        utils.validateSchema(value.data, defaultSchema, { throwError: true });
      });

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "lifecycle");
        assert.equal(value.data.batteryVoltage, 2.905);
        assert.equal(value.data.deviceId, 15617);
        assert.equal(value.data.diagnostic, 0);
        assert.equal(value.data.protocolVersion, 2);

        utils.validateSchema(value.data, lifecycleSchema, { throwError: true });
      });

      consume(data);
    });
  });
});