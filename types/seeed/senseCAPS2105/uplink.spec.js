const chai = require("chai");

const rewire = require("rewire");
const utils = require("test-utils");

const { assert } = chai;

describe("Seeed SenseCAP 2105 Soil Moisture, Temperature and EC Sensor Uplink", () => {
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

  let errorSchema = null;
  before((done) => {
    utils.loadSchema(`${__dirname}/error.schema.json`).then((parsedSchema) => {
      errorSchema = parsedSchema;
      done();
    });
  });

  describe("consume()", () => {
    it("should decode Seeed SenseCAP2105 Soil Moisture, Temperature and EC Sensor payload", () => {
      const data = {
        data: {
          port: 1,
          payloadHex: "0106105C5D000001071048A30000010C10B4000000DD0A",
        },
      };

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "default");
        assert.equal(value.data.soilConductivity, 0.18);
        assert.equal(value.data.soilHumidity, 41.8);
        assert.equal(value.data.soilTemperature, 23.9);

        utils.validateSchema(value.data, defaultSchema, { throwError: true });
      });

      consume(data);
    });

    it("should decode Seeed SenseCAP2105 Soil Moisture, Temperature and EC Sensor payload + invalid value", () => {
      const data = {
        data: {
          port: 1,
          payloadHex: "010610E897357701071048A30000010C10B4000000DD0A",
        },
      };

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "error");
        assert.equal(value.data.errorCode, "NO_SENSOR_RESPONSE");

        utils.validateSchema(value.data, errorSchema, { throwError: true });
      });

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "default");
        assert.equal(value.data.soilConductivity, 0.18);
        assert.equal(value.data.soilHumidity, 41.8);
        assert.equal(value.data.soilTemperature, null);

        utils.validateSchema(value.data, defaultSchema, { throwError: true });
      });

      consume(data);
    });
  });
});
