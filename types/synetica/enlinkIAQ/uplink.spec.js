const chai = require("chai");

const rewire = require("rewire");
const utils = require("test-utils");

const { assert } = chai;

describe("Synetica Status T Uplink", () => {
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
    it("should decode the Synetica Status IAQ report uplink", () => {
      const data = {
        data: {
          payloadHex: "0100e702330403c1050048123f5397b03f44346af9080271573f21e8a4583f4fa87c593f6db6085a3f7c90dd5b407fcbd25c409c48315d40a0dc0d5e40a1b8b25f40a1eb6f603f1e68fe420d02",
        },
      };

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "default");

        assert.equal(value.data.temperature, 23.1);
        assert.equal(value.data.pressure, 961);
        assert.equal(value.data.humidity, 51);
        assert.equal(value.data.co2, 625);
        assert.equal(value.data.co2e, 721.67);
        assert.equal(value.data.bVoc, 0.827);
        assert.equal(value.data.iaq, 72);

        assert.equal(value.data.pm1, 0.63);
        assert.equal(value.data.pm2_5, 0.81);
        assert.equal(value.data.pm4, 0.93);
        assert.equal(value.data.pm10, 0.99);
        assert.equal(value.data.ncPm0_5, 4);
        assert.equal(value.data.ncPm1, 4.88);
        assert.equal(value.data.ncPm2_5, 5.03);
        assert.equal(value.data.ncPm4, 5.05);
        assert.equal(value.data.ncPm10, 5.06);
        assert.equal(value.data.pmTps, 0.62);

        utils.validateSchema(value.data, defaultSchema, { throwError: true });
      });

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "lifecycle");
        assert.equal(value.data.batteryVoltage, 3.33);

        utils.validateSchema(value.data, lifecycleSchema, { throwError: true });
      });

      consume(data);
    });
  });
});
