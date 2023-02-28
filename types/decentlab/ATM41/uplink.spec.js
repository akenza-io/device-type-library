const chai = require("chai");

const rewire = require("rewire");
const utils = require("test-utils");

const { assert } = chai;

describe("Decentlab ATM41 Uplink", () => {
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
    it("should decode Decentlab ATM41 payload", () => {
      const data = {
        data: {
          payloadHex:
            "02035a0003800a8000800080008009812b8014810880b4a57c820c810980027fe88056800880040bf5",
        },
      };

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "default");
        assert.equal(value.data.precipitation, 0);
        assert.equal(value.data.lightningStrikeCount, 0);
        assert.equal(value.data.lightningAverageDistance, 0);
        assert.equal(value.data.windSpeed, 0.09);
        assert.equal(value.data.windDirection, 29.9);
        assert.equal(value.data.maximumWindSpeed, 0.2);
        assert.equal(value.data.temperature, 26.4);
        assert.equal(value.data.vaporPressure, 1.8);
        assert.equal(value.data.atmosphericPressure, 95.96);
        assert.equal(value.data.northWindSpeed, 0.08);
        assert.equal(value.data.eastWindSpeed, 0.04);

        utils.validateSchema(value.data, defaultSchema, { throwError: true });
      });

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "lifecycle");
        assert.equal(value.data.protocolVersion, 2);
        assert.equal(value.data.batteryVoltage, 3.061);
        assert.equal(value.data.deviceID, 858);

        assert.equal(value.data.sensorTemperatureInternal, 26.5);
        assert.equal(value.data.xOrientationAngle, 0.2);
        assert.equal(value.data.yOrientationAngle, -2.4);
        assert.equal(value.data.compassHeading, 86);

        utils.validateSchema(value.data, lifecycleSchema, { throwError: true });
      });

      consume(data);
    });
  });
});
